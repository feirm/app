module.exports = {
    productionSourceMap: true,
    pwa: {
        workboxOptions: {
            skipWaiting: true
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