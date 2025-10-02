new sst.aws.StaticSite("WebApp", {
    domain: "www.newhomie.org",
    build: {
        command: "npm run build",
        output: "dist"
    }
})
