import { describe, it, expect } from 'vitest'
import { readJsonFile } from '../src/util'
import { DashboardModifier } from '../src/replaceDatasource'
import path from 'node:path'

describe('replaceDatasource', () => {
    const dashboardModifier = new DashboardModifier()

    it('should replace datasource', () => {
        const input = readJsonFile(path.join(__dirname, './in.dashboard.json'))
        const expected = readJsonFile(path.join(__dirname, './out.dashboard.json'))
        const { output } = dashboardModifier.replaceDatasource(input, [
            {
                old: { uid: 'loki' },
                new: { type: 'loki', uid: 'grafanacloud-logs' },
            },
        ])
        expect(output).toStrictEqual(expected)
    })
})
