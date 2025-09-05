import { describe, expect, it } from 'vitest'
import { StatusCodes } from 'http-status-codes'

describe('handler', async () => {
    // biome-ignore lint/complexity/useLiteralKeys: <setting value>
    process.env['QUEUE_URL'] = 'string'
    const { handler } = await import('../src/index.mts')

    it('Should validate incorrect input', async () => {
        const result = await handler({} as never, undefined)
        expect(result).toStrictEqual({ status: StatusCodes.BAD_REQUEST })
    })

    const validEventbridgeEvent = {
        version: '0',
        id: 'abc-123-def-456',
        'detail-type': 'EC2 Instance State-change Notification',
        source: 'aws.ec2',
        account: '123456789012',
        time: '2025-09-06T05:00:00Z',
        region: 'us-east-1',
        resources: ['arn:aws:ec2:us-east-1:123456789012:instance/i-0abcdef1234567890'],
        detail: {
            'instance-id': 'i-0abcdef1234567890',
            state: 'running',
            'previous-state': 'pending',
        },
    }

    it('Should parse correct input', async () => {
        const result = await handler(validEventbridgeEvent as never, undefined)
        // Error expected as SQS cannot be reached
        expect(result).toStrictEqual({ status: StatusCodes.INTERNAL_SERVER_ERROR })
    })
})
