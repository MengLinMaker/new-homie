const Vpc = new aws.ec2.Vpc('ServiceScrapeVpc', {
    cidrBlock: '10.0.0.0/16',
    // Use IPv6 since public IPv4 isn't free
    assignGeneratedIpv6CidrBlock: true,
    enableDnsSupport: true,
    enableDnsHostnames: true,
})

const commonSubnetConfig = {
    vpcId: Vpc.id,
    enableResourceNameDnsAaaaRecordOnLaunch: true,
    assignIpv6AddressOnCreation: true,
    mapPublicIpOnLaunch: true,
}
const Subnet2a = new aws.ec2.Subnet('ServiceScrapeSubnet2a', {
    ...commonSubnetConfig,
    availabilityZone: 'ap-southeast-2a',
    ipv6CidrBlock: Vpc.ipv6CidrBlock.apply((ipv6) => ipv6.replace('0::/56', '0::/64')),
    cidrBlock: '10.0.0.0/24',
})
const Subnet2b = new aws.ec2.Subnet('ServiceScrapeSubnet2b', {
    ...commonSubnetConfig,
    availabilityZone: 'ap-southeast-2b',
    ipv6CidrBlock: Vpc.ipv6CidrBlock.apply((ipv6) => ipv6.replace('0::/56', '1::/64')),
    cidrBlock: '10.0.1.0/24',
})
const Subnet2c = new aws.ec2.Subnet('ServiceScrapeSubnet2c', {
    ...commonSubnetConfig,
    availabilityZone: 'ap-southeast-2c',
    ipv6CidrBlock: Vpc.ipv6CidrBlock.apply((ipv6) => ipv6.replace('0::/56', '2::/64')),
    cidrBlock: '10.0.2.0/24',
})
export const Subnets = [Subnet2a.id, Subnet2b.id, Subnet2c.id]

const InternetGateway = new aws.ec2.InternetGateway('ServiceScrapeInternetGateway', {
    vpcId: Vpc.id,
})
const commonRouteTableConfig = {
    vpcId: Vpc.id,
    routes: [
        {
            ipv6CidrBlock: '::/0',
            gatewayId: InternetGateway.id,
        },
        {
            cidrBlock: '0.0.0.0/0',
            gatewayId: InternetGateway.id,
        },
    ],
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

export const SecurityGroup = new aws.ec2.SecurityGroup('ServiceScrapeSecurityGroup', {
    vpcId: Vpc.id,
    description: 'Allow HTTPS for VPC endpoints over IPv4/IPv6',
    ingress: [
        {
            fromPort: 443,
            toPort: 443,
            protocol: 'tcp',
            cidrBlocks: ['0.0.0.0/0'],
            ipv6CidrBlocks: ['::/0'],
        },
    ],
})
