import { describe, bench } from 'vitest'
import { readJsonFile } from '../src/util'
import { DashboardModifier } from '../src/replaceDatasource'
import path from 'node:path'

describe('replaceDatasource', () => {
    const input = readJsonFile(path.join(__dirname, './in.dashboard.json'))
    const dashboardModifier = new DashboardModifier()

    bench('small dashboard performance', () => {
        dashboardModifier.replaceDatasource(input, [
            {
                old: { uid: 'loki' },
                new: { type: 'loki', uid: 'grafanacloud-logs' },
            },
        ])
    })
})
