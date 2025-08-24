import { readdirSync, readFileSync } from 'node:fs'
import { ENV, RESOURCE_FOLDER } from './util.ts'
import createClient from 'openapi-fetch'
import type { components, paths } from './api/schema'

const client = createClient<paths>({
    baseUrl: ENV.GRAFANA_API,
    headers: { Authorization: `Bearer ${ENV.GRAFANA_API_KEY}` },
})

/**
 * @description Import all folders from resource folder
 */
{
    // Keep track of folder uids to avoid duplicates
    const existingUids = new Set<string>()

    // Get all folders in the resource folder
    for (const folderFile of readdirSync(`${RESOURCE_FOLDER}/folders`)) {
        const folderPath = `${RESOURCE_FOLDER}/folders/${folderFile}`
        const folder: components['schemas']['Folder'] = JSON.parse(
            readFileSync(folderPath).toString(),
        )
        existingUids.add(folder.uid)

        // Try to update folder first
        const updateResult = await client.PUT('/folders/{folder_uid}', {
            params: { path: { folder_uid: folder.uid } },
            body: { overwrite: true, description: '', ...folder },
        })
        if (updateResult.data) {
            console.info(`Updated folder - ${folderFile}`)
            continue
        }

        // Create folder if it does not exist
        const importResult = await client.POST('/folders', {
            body: {
                description: '',
                ...folder,
            },
        })
        if (importResult.data) {
            console.info(`Created folder - ${folderFile}`)
            continue
        }
        console.error(`Failed to create folder - ${folderFile} -`, importResult.error)
    }

    // // Delete folders that are not in the resource folder
    // const folders = await client.GET('/folders')
    // if (!folders.data) {
    //     console.error('Get folders failed', folders.error)
    //     process.exit(1)
    // }
    // for (const folder of folders.data) {
    //     if (existingUids.has(folder.uid)) continue

    //     const deleteResult = await client.DELETE('/folders/{folder_uid}', {
    //         params: { path: { folder_uid: folder.uid } },
    //     })
    //     if (deleteResult.data) {
    //         console.info(`Deleted folder - ${folder.title} (${folder.uid})`)
    //         continue
    //     }
    //     console.error(
    //         `Failed to delete folder - ${folder.title} (${folder.uid}) -`,
    //         deleteResult.error,
    //     )
    // }
}

/**
 * @description Import all dashboards from resource folder
 */
{
    // Keep track of dashboard uids to avoid duplicates
    const existingUids = new Set<string>()

    // Get all dashboards in the resource folder
    for (const dashboardFile of readdirSync(`${RESOURCE_FOLDER}/dashboards`)) {
        const dashboardPath = `${RESOURCE_FOLDER}/dashboards/${dashboardFile}`
        const dashboard: {
            dashboard: Record<string, never>
            meta: components['schemas']['DashboardMeta']
        } = JSON.parse(readFileSync(dashboardPath).toString())

        // @ts-expect-error Type not defined in api schema
        existingUids.add(dashboard.dashboard['uid'])

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

    // // Delete dashboards that are not in the resource folder
    // const dashboardSummaries = await client.GET('/search', {
    //     params: { query: { type: 'dash-db' } },
    // })
    // if (!dashboardSummaries.data) {
    //     console.error('Search dashboards failed', dashboardSummaries.error)
    //     process.exit(1)
    // }
    // for (const { title, uid } of dashboardSummaries.data) {
    //     if (existingUids.has(uid)) continue

    //     const dashboard = await client.GET('/dashboards/uid/{uid}', {
    //         params: { path: { uid } },
    //     })
    //     if (!dashboard.data) {
    //         console.error(`Failed to fetch dashboard - ${title} (${uid})`, dashboard.error)
    //         continue
    //     }
    //     // Provisioned dashboards cannot be modified through API
    //     if (dashboard.data.meta.provisioned) continue

    //     const deleteResult = await client.DELETE('/dashboards/uid/{uid}', {
    //         params: { path: { uid } },
    //     })
    //     if (deleteResult.data) {
    //         console.info(`Deleted dashboard - ${title} (${uid})`)
    //         continue
    //     }
    //     console.error(`Failed to delete - ${title} (${uid}) -`, deleteResult.error)
    // }
}
