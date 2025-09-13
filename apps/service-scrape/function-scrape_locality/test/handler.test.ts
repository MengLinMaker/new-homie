import { afterAll, describe, expect, it } from 'vitest'
import { StatusCodes } from 'http-status-codes'

const sqsEvent = (locality: {
    suburb_name: string
    state_abbreviation: string
    postcode: string
}) => ({
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
})

describe('handler', async () => {
    const { handler } = await import('../src')
    const { browserService } = await import('../src/global/setup')
    afterAll(async () => await browserService.close())

    it('Should invalidate incorrect input', async () => {
        const locality = {
            suburb_name: 'TEST',
            state_abbreviation: 'TEST',
            postcode: 'TEST',
        }
        const res = await handler(sqsEvent(locality) as never, undefined as never)
        expect(res.status).toStrictEqual(StatusCodes.BAD_REQUEST)
    })

    it('Should parse correct input', async () => {
        const locality = {
            suburb_name: 'Test',
            state_abbreviation: 'VIC',
            postcode: '0000',
        }
        const res = await handler(sqsEvent(locality) as never, undefined as never)
        expect(res.status).toStrictEqual(StatusCodes.ACCEPTED)
    })

    it(
        'Should scrape real data',
        async () => {
            const locality = {
                suburb_name: 'Dandenong',
                state_abbreviation: 'VIC',
                postcode: '3175',
            }
            const res = await handler(sqsEvent(locality) as never, undefined as never)
            expect(res.status).toStrictEqual(StatusCodes.OK)
        },
        900 * 1000,
    )
})
