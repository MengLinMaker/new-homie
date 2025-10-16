/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app(input) {
        return {
            name: 'new-homie',
            removal: input?.stage === 'production' ? 'retain' : 'remove',
            protect: ['production'].includes(input?.stage),
            home: 'aws',
            providers: {
                aws: {
                    region: 'ap-southeast-2',
                },
            },
        }
    },
    async run() {
        const { Router } = await import('./apps/infra-common')
        await import('./apps/service-scrape/infra-service_scrape_pipeline')
        await import('./apps/frontend/infra')
        return {
            'Router.distributionID': Router.distributionID,
        }
    },
})
