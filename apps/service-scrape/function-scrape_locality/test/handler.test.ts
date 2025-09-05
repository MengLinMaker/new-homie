import { describe, expect, it } from 'vitest'
import { suiteNameFromFileName } from './util'
import { StatusCodes } from 'http-status-codes'

const testSuiteName = suiteNameFromFileName(import.meta.filename)

describe.skip(testSuiteName, async () => {
    // biome-ignore lint/complexity/useLiteralKeys: <setting value>
    process.env['CHROME_PUPPETEER_ASSET_URL'] = '../../asset/chromium-v138.0.2-pack.arm64.tar'
    const { handler } = await import('../src/index.mts')

    it('Should validate incorrect input', async () => {
        const result = await handler({} as never, undefined as never)
        expect(result).toStrictEqual({ status: StatusCodes.BAD_REQUEST })
    })

    const locality = {
        suburb: 'Test',
        state: 'VIC',
        postcode: '0000',
    }
    const validSqsEvent = {
        Records: [
            {
                messageId: '2e1424d4-f796-459a-8184-9c92662be6da',
                receiptHandle: 'AQEBzWwaftRI0KuVm4tP+/7q1rGgNqicHq...',
                body: JSON.stringify(locality),
                attributes: {
                    ApproximateReceiveCount: '1',
                    SentTimestamp: '1545082650636',
                    SenderId: 'AIDAIENQZJOLO23YVJ4VO',
                    ApproximateFirstReceiveTimestamp: '1545082650649',
                },
                messageAttributes: {},
                md5OfBody: 'e4e68fb7bd0e697a0ae8f1bb342846b3',
                eventSource: 'aws:sqs',
                eventSourceARN: 'arn:aws:sqs:us-east-2:123456789012:my-queue',
                awsRegion: 'us-east-2',
            },
        ],
    }

    it('Should parse correct input', async () => {
        const result = await handler(validSqsEvent as never, undefined as never)
        expect(result).toStrictEqual({ status: StatusCodes.ACCEPTED })
    })
})
