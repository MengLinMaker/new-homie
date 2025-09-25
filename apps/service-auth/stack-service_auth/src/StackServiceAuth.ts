import * as cdk from 'aws-cdk-lib'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as iam from 'aws-cdk-lib/aws-iam'
import type { Construct } from 'constructs'

export interface StackServiceAuthProps extends cdk.StackProps {
    production: boolean
}

export class StackServiceAuth extends cdk.Stack {
    public readonly userPool: cognito.UserPool
    public readonly userPoolClient: cognito.UserPoolClient
    public readonly identityPool: cognito.CfnIdentityPool

    constructor(scope: Construct, id: string, props: StackServiceAuthProps) {
        super(scope, id, props)

        this.userPool = new cognito.UserPool(this, 'UserPool', {
            selfSignUpEnabled: true, // Users can sign up themselves
            signInAliases: {
                // Only allow email login - with auto verify
                email: true,
                username: false,
            },
            standardAttributes: {
                email: {
                    required: true,
                    mutable: true,
                },
                givenName: {
                    required: true,
                    mutable: true,
                },
                familyName: {
                    required: true,
                    mutable: true,
                },
            },
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: false,
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
            removalPolicy: props.production ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
        })

        // Create Google Identity Provider
        const googleProvider = new cognito.UserPoolIdentityProviderGoogle(this, 'GoogleProvider', {
            userPool: this.userPool,
            clientId: cdk.Token.asString(
                new cdk.CfnParameter(this, 'GoogleClientId', {
                    type: 'String',
                    description: 'Google OAuth Client ID',
                    noEcho: true,
                }).valueAsString,
            ),
            clientSecretValue: cdk.SecretValue.cfnParameter(
                new cdk.CfnParameter(this, 'GoogleClientSecret', {
                    type: 'String',
                    description: 'Google OAuth Client Secret',
                    noEcho: true,
                }),
            ),
            scopes: ['profile', 'email', 'openid'],
            attributeMapping: {
                email: cognito.ProviderAttribute.GOOGLE_EMAIL,
            },
        })

        // Create User Pool Client
        this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
            userPool: this.userPool,
            userPoolClientName: `new-homie-client-${props.production ? 'prod' : 'dev'}`,
            generateSecret: false,
            authFlows: {
                userSrp: true,
                userPassword: false,
                adminUserPassword: false,
                custom: false,
            },
            oAuth: {
                flows: {
                    authorizationCodeGrant: true,
                    implicitCodeGrant: false,
                },
                scopes: [
                    cognito.OAuthScope.EMAIL,
                    cognito.OAuthScope.OPENID,
                    cognito.OAuthScope.PROFILE,
                ],
                callbackUrls: props.production
                    ? ['https://newhomie.com.au/auth/callback']
                    : ['http://localhost:3000/auth/callback'],
                logoutUrls: props.production
                    ? ['https://newhomie.com.au']
                    : ['http://localhost:3000'],
            },
            supportedIdentityProviders: [
                cognito.UserPoolClientIdentityProvider.COGNITO,
                cognito.UserPoolClientIdentityProvider.GOOGLE,
                cognito.UserPoolClientIdentityProvider.FACEBOOK,
            ],
            preventUserExistenceErrors: true,
        })

        // Ensure providers are created before client
        this.userPoolClient.node.addDependency(googleProvider)

        // Create Identity Pool for AWS credentials
        this.identityPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
            identityPoolName: `new_homie_identity_pool_${props.production ? 'prod' : 'dev'}`,
            allowUnauthenticatedIdentities: false,
            cognitoIdentityProviders: [
                {
                    clientId: this.userPoolClient.userPoolClientId,
                    providerName: this.userPool.userPoolProviderName,
                    serverSideTokenCheck: true,
                },
            ],
        })

        // Create IAM roles for authenticated users
        const authenticatedRole = new iam.Role(this, 'AuthenticatedRole', {
            assumedBy: new iam.FederatedPrincipal(
                'cognito-identity.amazonaws.com',
                {
                    StringEquals: {
                        'cognito-identity.amazonaws.com:aud': this.identityPool.ref,
                    },
                    'ForAnyValue:StringLike': {
                        'cognito-identity.amazonaws.com:amr': 'authenticated',
                    },
                },
                'sts:AssumeRoleWithWebIdentity',
            ),
            inlinePolicies: {
                AuthenticatedUserPolicy: new iam.PolicyDocument({
                    statements: [
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'mobileanalytics:PutEvents',
                                'cognito-sync:*',
                                'cognito-identity:*',
                            ],
                            resources: ['*'],
                        }),
                    ],
                }),
            },
        })

        // Attach roles to Identity Pool
        new cognito.CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoleAttachment', {
            identityPoolId: this.identityPool.ref,
            roles: {
                authenticated: authenticatedRole.roleArn,
            },
        })

        // Outputs
        new cdk.CfnOutput(this, 'UserPoolId', {
            value: this.userPool.userPoolId,
            description: 'Cognito User Pool ID',
        })

        new cdk.CfnOutput(this, 'UserPoolClientId', {
            value: this.userPoolClient.userPoolClientId,
            description: 'Cognito User Pool Client ID',
        })

        new cdk.CfnOutput(this, 'IdentityPoolId', {
            value: this.identityPool.ref,
            description: 'Cognito Identity Pool ID',
        })

        new cdk.CfnOutput(this, 'UserPoolDomain', {
            value: `https://${this.userPool.userPoolId}.auth.${this.region}.amazoncognito.com`,
            description: 'Cognito User Pool Domain',
        })
    }
}
