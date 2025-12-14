/// <reference path="../../.sst/platform/config.d.ts" />

import { Repository } from '../infra-common'

export const RoleBatchEcs = new aws.iam.Role('RoleBatchEcs', {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: ['ecs-tasks.amazonaws.com'],
    }),
    managedPolicyArns: ['arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy'],
    inlinePolicies: [
        {
            policy: aws.iam.getPolicyDocumentOutput({
                statements: [
                    {
                        actions: [
                            'ecr:GetAuthorizationToken',
                            'ecr:BatchCheckLayerAvailability',
                            'ecr:GetDownloadUrlForLayer',
                            'ecr:BatchGetImage',
                        ],
                        resources: [Repository.repository.arn],
                    },
                    {
                        actions: [
                            'ssmmessages:CreateControlChannel',
                            'ssmmessages:CreateDataChannel',
                            'ssmmessages:OpenControlChannel',
                            'ssmmessages:OpenDataChannel',
                        ],
                        resources: ['*'],
                    },
                    {
                        actions: ['logs:CreateLogStream'],
                        resources: ['*'],
                    },
                ],
            }).json,
        },
    ],
})
