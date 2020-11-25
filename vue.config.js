module.exports = {
    productionSourceMap: false,
    pwa: {
        workboxOptions: {
            skipWaiting: true,
            exclude: [/_redirects/],
        }
    },
    configureWebpack: {
        module: {
            noParse: /\.wasm$/,
            rules: [
                {
                    test: /\.wasm$/,
                    loaders: ['base64-loader'],
                    type: 'javascript/auto'
                }
            ]
        }
    }
}