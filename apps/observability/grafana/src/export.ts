import { ENV, RESOURCE_FOLDER } from './util.ts'
import type { paths } from './api/schema'
import createClient from 'openapi-fetch'
import { exit } from 'node:process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'

const client = createClient<paths>({
    baseUrl: ENV.GRAFANA_API,
    headers: { Authorization: `Bearer ${ENV.GRAFANA_API_KEY}` },
})

// Resource folder should be cleaned before export
mkdirSync(RESOURCE_FOLDER, { recursive: true })
rmSync(RESOURCE_FOLDER, { recursive: true })
mkdirSync(`${RESOURCE_FOLDER}/dashboards`, { recursive: true })
mkdirSync(`${RESOURCE_FOLDER}/folders`, { recursive: true })

/**
 * @description Exports all dashboards to resource folder
 */
{
    // Searching for all dashboards does not return full dashboard data
    const dashboardSummaries = await client.GET('/search', {
        params: { query: { type: 'dash-db' } },
    })
    if (!dashboardSummaries.data) {
        console.error('Search dashboards failed', dashboardSummaries.error)
        exit(1)
    }

    for (const { title, uid } of dashboardSummaries.data) {
        // Fetch full dashboard data
        const dashboard = await client.GET('/dashboards/uid/{uid}', {
            params: { path: { uid } },
        })
        if (!dashboard.data) {
            console.error(`Failed to fetch dashboard - ${title} (${uid})`, dashboard.error)
            continue
        }
        // Provisioned dashboards cannot be modified through API
        if (dashboard.data.meta.provisioned) continue

        // Defined id prevents import
        delete dashboard.data.dashboard['id']
        writeFileSync(
            `${RESOURCE_FOLDER}/dashboards/${title}.${uid}.json`,
            JSON.stringify(dashboard.data, null, 4),
        )
        console.info(`Wrote dashboard file - ${title} (${uid})`)
    }
}

/**
 * @description Exports all folders to resource folder
 */
{
    // Get all folders
    const folderSummaries = await client.GET('/search', {
        params: { query: { type: 'dash-folder' } },
    })
    if (!folderSummaries.data) {
        console.error('Failed to fetch folders', folderSummaries.error)
        exit(1)
    }

    // Write folders as json files
    for (const folder of folderSummaries.data) {
        // @ts-expect-error Delete schema for import to work
        delete folder.id
        const { title, uid } = folder
        writeFileSync(
            `${RESOURCE_FOLDER}/folders/${title}.${uid}.json`,
            JSON.stringify(folder, null, 4),
        )
        console.info(`Wrote folder file - ${title} (${uid})`)
    }
}
