import { ENV, RESOURCE_FOLDER } from './util.ts'
import type { paths } from './api/schema.ts'
import createClient from 'openapi-fetch'
import { exit } from 'node:process'
import z from 'zod'
import { writeFileSync } from 'node:fs'

const client = createClient<paths>({ baseUrl: ENV.GRAFANA_URL })

// Search for all dashboards
const dashboardSummaries = await client.GET('/search')
if (!dashboardSummaries.data) {
    console.error('Search dashboards failed', dashboardSummaries.error)
    exit(1)
}

// Fetch each dashboard by UID
const dashboards = []
for (const dashboardSummary of dashboardSummaries.data) {
    if (!dashboardSummary.uid) {
        console.warn('Dashboard summary without UID found, skipping:', dashboardSummary)
        continue
    }
    const dashboard = await client.GET('/dashboards/uid/{uid}', {
        params: {
            path: { uid: dashboardSummary.uid },
        },
    })
    if (!dashboard.data) {
        console.error(`Failed to fetch dashboard with UID ${dashboardSummary.uid}`, dashboard.error)
        continue
    }
    dashboards.push(dashboard.data)
}

const dashboardSchema = z.object({
    dashboard: z.object({
        title: z.string(),
    }),
})

// Write dashboards as json files
for (const dashboard of dashboards) {
    const validDashboard = dashboardSchema.parse(dashboard, { reportInput: true })
    writeFileSync(
        `${RESOURCE_FOLDER}/${validDashboard.dashboard.title}.json`,
        JSON.stringify(dashboard, null, 4),
    )
}
