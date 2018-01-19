const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    context: path.resolve(__dirname, 'examples/src'),
    entry: {
        app: './app.js',
    },
    output: {
        path: path.resolve(__dirname, 'examples/dist'),
        filename: '[name].js',
        publicPath: '/',
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'examples/src'),
        port: 3000,
        historyApiFallback: true,
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.js$/,
                exclude: [/node_modules/],
                use: [{
                    loader: 'babel-loader',
                }],
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                    },
                ],
            },
        ],
    },
    resolve: {
        alias: {
            'react-preload-link': path.resolve(__dirname, 'src/index'),
        },
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            filename: 'common.js',
            minChunk: 2,
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            inject: false,
            template: path.resolve(__dirname, 'examples/src/index.html'),
        }),
        new ExtractTextPlugin('example.css'),
    ],
};
