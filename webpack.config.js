const fs = require('fs');
const serverMiddleware = require('./src/server/middleware');

module.exports = {
    mode: 'development',

    entry: './src/client/index.ts',
    output: {
        filename: 'bundle.js',
        path: __dirname + '/dist',
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: 'source-map',

    devServer: {
        contentBase: [
            __dirname + '/public',
            __dirname + '/dist',
        ],
        https: {
            key: fs.readFileSync('./dev-cert/jl-l-01.local+4-key.pem'),
            cert: fs.readFileSync('./dev-cert/jl-l-01.local+4.pem'),
        },
        port: 8443,
        host: '0.0.0.0',
        disableHostCheck: true,
        historyApiFallback: true,
        before: serverMiddleware,
    },

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ['.ts', '.tsx', '.js', '.json'],
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: 'awesome-typescript-loader', exclude: '/node_modules/' },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
        ],
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        oimo: true,
        cannon: true,
        earcut: true,
    },
};
