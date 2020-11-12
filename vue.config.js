module.exports = {
    productionSourceMap: false,
    pwa: {
        workboxOptions: {
            skipWaiting: true,
            exclude: [/_redirects/],
        }
    }
}