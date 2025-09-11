import { describe, bench } from 'vitest'
import { readJsonFile } from '../src/util'
import { replaceDatasource } from '../src/replaceDatasource'
import path from 'node:path'

describe('replaceDatasource', () => {
    const input = readJsonFile(path.join(__dirname, './in.dashboard.json'))

    bench('small dashboard performance', () => {
        replaceDatasource(input, [
            {
                old: { uid: 'loki' },
                new: { type: 'loki', uid: 'grafanacloud-logs' },
            },
        ])
    })
})
