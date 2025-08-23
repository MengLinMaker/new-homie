import { readdirSync, readFileSync } from 'node:fs'
import { ENV, RESOURCE_FOLDER } from './util.ts'
import createClient from 'openapi-fetch'
import type { components, paths } from './api/schema'

const client = createClient<paths>({ baseUrl: ENV.GRAFANA_URL })

// Keep track of dashboard uids to avoid duplicates. AI?

// Get all dashboards in the resource folder
for (const dashboardFile of readdirSync(RESOURCE_FOLDER)) {
    const dashboardPath = `${RESOURCE_FOLDER}/${dashboardFile}`
    const dashboard: {
        dashboard: Record<string, never>
        meta: components['schemas']['DashboardMeta']
    } = JSON.parse(readFileSync(dashboardPath).toString())

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
        console.info(`Updated dashboard - ${dashboardFile}`)
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
        console.info(`Imported dashboard - ${dashboardFile}`)
        continue
    }
    console.error(`Failed to import - ${dashboardFile} -`, importResult.error)
}
