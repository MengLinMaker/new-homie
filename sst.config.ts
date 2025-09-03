/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app: (input) => ({
        name: 'new-homie',
        region: 'ap-southeast-2',
        removal: input?.stage === 'production' ? 'retain' : 'remove',
        protect: ['production'].includes(input?.stage),
        home: 'aws',
    }),

    run: async () => {
        await import('./apps/service-scrape/sst')
    },
})
