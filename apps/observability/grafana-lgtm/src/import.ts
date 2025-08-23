import { readdirSync, readFileSync } from 'node:fs'
import { dashboardSchema, ENV, RESOURCE_FOLDER } from './util.ts'
import createClient from 'openapi-fetch'
import type { components, paths } from './api/schema'

const client = createClient<paths>({ baseUrl: ENV.GRAFANA_URL })

// Keep track of dashboard uids to avoid duplicates
const existingUids = new Set<string>()

// Get all dashboards in the resource folder
for (const dashboardFile of readdirSync(RESOURCE_FOLDER)) {
    const dashboardPath = `${RESOURCE_FOLDER}/${dashboardFile}`
    const dashboard: {
        dashboard: Record<string, never>
        meta: components['schemas']['DashboardMeta']
    } = JSON.parse(readFileSync(dashboardPath).toString())

    const validDashboard = dashboardSchema.parse(dashboard, { reportInput: true })
    existingUids.add(validDashboard.dashboard.uid)

    const updateResult = await client.POST('/dashboards/db', {
        body: {
            UpdatedAt: new Date().toISOString(),
            dashboard: dashboard.dashboard,
            folderId: dashboard.meta.folderId,
            folderUid: dashboard.meta.folderUid,
            isFolder: dashboard.meta.isFolder,
            message: '',
            overwrite: true,
            userId: 0,
        },
    })
    if (updateResult.data) {
        console.info(`Updated dashboard - ${dashboardFile} (${validDashboard.dashboard.uid})`)
        continue
    }

    const importResult = await client.POST('/dashboards/import', {
        body: {
            dashboard: dashboard.dashboard,
            folderId: dashboard.meta.folderId,
            folderUid: dashboard.meta.folderUid,
            inputs: [],
            overwrite: true,
            path: '',
            pluginId: '',
        },
    })
    if (importResult.data) {
        console.info(`Imported dashboard - ${dashboardFile} (${validDashboard.dashboard.uid})`)
        continue
    }
    console.error(
        `Failed to import - ${dashboardFile} (${validDashboard.dashboard.uid}) -`,
        importResult.error,
    )
}

// Delete dashboards that are not in the resource folder
const dashboardSummaries = await client.GET('/search')
if (!dashboardSummaries.data) {
    console.error('Search dashboards failed', dashboardSummaries.error)
    process.exit(1)
}
for (const dashboardSummary of dashboardSummaries.data) {
    if (existingUids.has(dashboardSummary.uid)) continue

    const deleteResult = await client.DELETE('/dashboards/uid/{uid}', {
        params: { path: { uid: dashboardSummary.uid } },
    })
    if (deleteResult.data) {
        console.info(`Deleted dashboard - ${dashboardSummary.title} (${dashboardSummary.uid})`)
        continue
    }
    console.error(
        `Failed to delete - ${dashboardSummary.title} (${dashboardSummary.uid}) -`,
        deleteResult.error,
    )
}
