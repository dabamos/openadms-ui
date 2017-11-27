const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: './src/openadms-ui.js',
    output: {
        path: path.join(__dirname, 'assets/js'),
        filename: 'bundle.js'
    },
    resolve: {
        alias: {
            'semantic-ui': path.resolve('./assets/js/semantic.min.js')
        }
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new UglifyJsPlugin()
    ],
    externals: ['window'],
    devtool: 'source-map'
};