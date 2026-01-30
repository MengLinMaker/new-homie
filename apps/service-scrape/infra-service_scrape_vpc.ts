const Vpc = new aws.ec2.Vpc('ServiceScrapeVpc', {
    cidrBlock: '10.0.0.0/16',
    enableDnsHostnames: true,
})

const Subnet2a = new aws.ec2.Subnet('ServiceScrapeSubnet2a', {
    vpcId: Vpc.id,
    mapPublicIpOnLaunch: true,
    availabilityZone: 'ap-southeast-2a',
    cidrBlock: '10.0.0.0/24',
})
const Subnet2b = new aws.ec2.Subnet('ServiceScrapeSubnet2b', {
    vpcId: Vpc.id,
    mapPublicIpOnLaunch: true,
    availabilityZone: 'ap-southeast-2b',
    cidrBlock: '10.0.1.0/24',
})
const Subnet2c = new aws.ec2.Subnet('ServiceScrapeSubnet2c', {
    vpcId: Vpc.id,
    mapPublicIpOnLaunch: true,
    availabilityZone: 'ap-southeast-2c',
    cidrBlock: '10.0.2.0/24',
})
export const Subnets = [Subnet2a.id, Subnet2b.id, Subnet2c.id]

const InternetGateway = new aws.ec2.InternetGateway('ServiceScrapeInternetGateway', {
    vpcId: Vpc.id,
})
const commonRouteTableConfig = {
    vpcId: Vpc.id,
    routes: [{ cidrBlock: '0.0.0.0/0', gatewayId: InternetGateway.id }],
}
const RouteTable2a = new aws.ec2.RouteTable('ServiceScrapeRouteTable2a', commonRouteTableConfig)
const RouteTable2b = new aws.ec2.RouteTable('ServiceScrapeRouteTable2b', commonRouteTableConfig)
const RouteTable2c = new aws.ec2.RouteTable('ServiceScrapeRouteTable2c', commonRouteTableConfig)

new aws.ec2.RouteTableAssociation('ServiceScrapeRouteTableAssociation2a', {
    subnetId: Subnet2a.id,
    routeTableId: RouteTable2a.id,
})
new aws.ec2.RouteTableAssociation('ServiceScrapeRouteTableAssociation2b', {
    subnetId: Subnet2b.id,
    routeTableId: RouteTable2b.id,
})
new aws.ec2.RouteTableAssociation('ServiceScrapeRouteTableAssociation2c', {
    subnetId: Subnet2c.id,
    routeTableId: RouteTable2c.id,
})

/**
 * 443 Allow HTTPS webscraping and access AWS ECR public endpoints
 * 4317 Allow OpenTelemetry OTLP grpc
 * 4318 Allow OpenTelemetry OTLP protobuf
 * 5432 Allow Postgres
 * 6543 Allow Postgres pooler
 */
export const SecurityGroup = new aws.ec2.SecurityGroup('ServiceScrapeSecurityGroup', {
    vpcId: Vpc.id,
    ingress: [443, 4318, 6543].map((port) => ({
        fromPort: port,
        toPort: port,
        protocol: 'tcp',
        cidrBlocks: ['0.0.0.0/0'],
    })),
    egress: [443, 4318, 6543].map((port) => ({
        fromPort: port,
        toPort: port,
        protocol: 'tcp',
        cidrBlocks: ['0.0.0.0/0'],
    })),
})
