import { ILoggable } from '@observability/lib-opentelemetry'
import type { australiaLocalities } from '@service-scrape/lib-australia_amenity'
import { sqsClient } from './global/setup'
import { SendMessageBatchCommand } from '@aws-sdk/client-sqs'
import { ENV } from './global/env'

export class SqsService extends ILoggable {
    async sendBatchSQS(localities: typeof australiaLocalities) {
        try {
            await sqsClient.send(
                new SendMessageBatchCommand({
                    QueueUrl: ENV.QUEUE_URL,
                    Entries: localities.map((locality, id) => ({
                        Id: id.toString(),
                        MessageGroupId: id.toString(),
                        MessageBody: JSON.stringify(locality),
                    })),
                }),
            )
            return true
        } catch (e) {
            this.logExceptionArgs('fatal', this.sendBatchSQS, localities, e)
            return false
        }
    }
}
