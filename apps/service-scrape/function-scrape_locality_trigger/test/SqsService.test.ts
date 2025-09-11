import { afterAll, describe, expect, it } from 'vitest'
import { LocalstackContainer } from '@testcontainers/localstack'
import { CreateQueueCommand, SQSClient } from '@aws-sdk/client-sqs'
import { LOGGER, suiteNameFromFileName } from './util'
import { australiaLocalities } from '@service-scrape/lib-australia_amenity'

const testSuiteName = suiteNameFromFileName(import.meta.filename)

describe(testSuiteName, async () => {
    // Setup localstack
    const localstack = await new LocalstackContainer('localstack/localstack:4.7.0').start()
    const awsClientConfig = {
        endpoint: localstack.getConnectionUri(),
        region: 'us-east-1',
        credentials: {
            secretAccessKey: 'test',
            accessKeyId: 'test',
        },
    }
    process.env['AWS_ENDPOINT_URL'] = awsClientConfig.endpoint
    process.env['AWS_REGION'] = awsClientConfig.region
    process.env['AWS_ACCESS_KEY_ID'] = awsClientConfig.credentials.accessKeyId
    process.env['AWS_SECRET_ACCESS_KEY'] = awsClientConfig.credentials.secretAccessKey

    // Setup mock infrastructure
    const sqsClient = new SQSClient()
    const queue = await sqsClient.send(new CreateQueueCommand({ QueueName: 'TestQueue' }))

    // biome-ignore lint/style/noNonNullAssertion: <assume successful setup>
    const queueUrl = new URL(queue.QueueUrl!)
    queueUrl.port = localstack.getPort().toString()
    queueUrl.host = localstack.getHost()
    process.env['QUEUE_URL'] = queueUrl.toString()

    const { SqsService } = await import('../src/SqsService')
    const sqsService = new SqsService(LOGGER)

    afterAll(async () => await localstack.stop())

    it('sendBatchSQS', async () => {
        const localities = australiaLocalities.slice(0, 10)
        const success = await sqsService.sendBatchSQS(localities)
        expect(success).toBe(true)
    })
})
