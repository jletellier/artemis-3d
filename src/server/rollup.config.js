const path = require('path');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const typescript = require('rollup-plugin-typescript2');
const copy = require('rollup-plugin-copy-glob');

const rootPath = path.resolve(__dirname, '../../');

const clientBuild = {
    input: {
        'app.bundle': path.resolve(rootPath, './src/client/index.ts'),
    },
    // preserveModules: true,
    output: {
        dir: path.resolve(rootPath, './public/dist/'),
        format: 'es',
        sourcemap: true,
        paths: {
            'pouchdb': './pouchdb.min.js',
        },
    },
    external: [
        'pouchdb',
    ],
    plugins: [
        resolve({
            extensions: ['.ts', '.js'],
            browser: true,
        }),
        commonjs({
            sourceMap: false,
        }),
        typescript(),
        copy([
            { 
                files: 'node_modules/pouchdb/dist/pouchdb.min.js', 
                dest: path.resolve(rootPath, './public/dist/'), 
            },
            { 
                files: 'node_modules/feather-icons/dist/icons/{frown,file-plus,share,plus}.svg',
                dest: path.resolve(rootPath, './public/dist/icons/'), 
            },
        ]),
    ],
};

module.exports = [
    clientBuild,
];
