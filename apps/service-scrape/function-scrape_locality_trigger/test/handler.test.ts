import { afterAll, describe, expect, it } from 'vitest'
import { LocalstackContainer } from '@testcontainers/localstack'
import { CreateQueueCommand } from '@aws-sdk/client-sqs'
import { StatusCodes } from 'http-status-codes'

describe('handler', async () => {
    // Setup localstack
    const localstack = await new LocalstackContainer('localstack/localstack:4.7.0').start()
    process.env['AWS_ENDPOINT_URL'] = localstack.getConnectionUri()
    process.env['AWS_REGION'] = 'us-east-1'

    // Setup mock infrastructure
    const { sqsClient } = await import('../src/global/setup')
    console.log(sqsClient.config.endpoint)
    const queue = await sqsClient.send(new CreateQueueCommand({ QueueName: 'TestQueue' }))
    process.env['QUEUE_URL'] = queue.QueueUrl

    // Load env variables into test handler
    const { handler } = await import('../src/index.mts')
    afterAll(async () => await localstack.stop())

    it('Should validate incorrect input', async () => {
        const f = handler({} as never, undefined as never)
        await expect(f).rejects.toThrow()
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
        const res = await handler(validEventbridgeEvent as never, undefined as never)
        expect(res).toStrictEqual({ status: StatusCodes.OK })
    })
})
