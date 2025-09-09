import { describe, expect, it } from 'vitest'
import { StatusCodes } from 'http-status-codes'
import { handler } from '../src/index.mts'

const sqsEvent = (locality: { suburb: string; state: string; postcode: string }) => ({
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
    it('Should validate incorrect input', async () => {
        const h = handler(
            sqsEvent({
                suburb: 'TEST',
                state: 'TEST',
                postcode: 'TEST',
            }) as never,
            undefined as never,
        )
        await expect(h).rejects.toThrow()
    })

    it('Should parse correct input', async () => {
        const locality = {
            suburb: 'Test',
            state: 'VIC',
            postcode: '0000',
        }
        const result = await handler(sqsEvent(locality) as never, undefined as never)
        expect(result).toStrictEqual({ status: StatusCodes.ACCEPTED })
    })

    it(
        'Should scrape real data',
        async () => {
            const locality = {
                suburb: 'Dandenong',
                state: 'VIC',
                postcode: '3175',
            }
            const result = await handler(sqsEvent(locality) as never, undefined as never)
            expect(result).toStrictEqual({ status: StatusCodes.OK })
        },
        900 * 1000,
    )
})
