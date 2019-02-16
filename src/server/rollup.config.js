const path = require('path');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const typescript = require('rollup-plugin-typescript2');
const copy = require('rollup-plugin-copy-glob');

const rootPath = path.resolve(__dirname, '../../');

const clientBuild = {
    input: path.resolve(rootPath, './src/client/index.ts'),
    output: {
        dir: path.resolve(rootPath, './public/dist/'),
        format: 'es',
        sourcemap: true,
        paths: {
            'pouchdb': './pouchdb.min.js',
        },
    },
    external: ['pouchdb'],
    plugins: [
        resolve({
            extensions: ['.ts', '.js'],
            browser: true,
        }),
        commonjs({
            include: 'node_modules/**',
            sourceMap: false,
            namedExports: {
                'node_modules/babylonjs/babylon.js': [
                    'Scene', 'Mesh', 'StandardMaterial', 'Texture', 'TransformNode', 
                    'SceneSerializer', 'SceneLoader', 'AssetsManager', 'Observable', 'AbstractMesh', 
                    'TextFileAssetTask', 'Vector3', 'Quaternion', 'Matrix', 'Engine', 
                    'ArcRotateCamera', 'HemisphericLight', 'Color3', 'Color4', 'FreeCamera', 
                    'Camera', 'TargetCamera',
                ],
            },
        }),
        typescript(),
        copy([
            { 
                files: 'node_modules/pouchdb/dist/pouchdb.min.js', 
                dest: path.resolve(rootPath, './public/dist/'), 
            },
        ]),
    ],
};

module.exports = [
    clientBuild,
];
