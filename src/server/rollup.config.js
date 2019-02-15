const path = require('path');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');

const rootPath = path.resolve(__dirname, '../../');

const babelPresets = [
    ['@babel/preset-env', {
        'targets': {
            'esmodules': true,
        },
    }],
    '@babel/preset-typescript',
];

const babelPlugins = [
    ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }],
    '@babel/plugin-proposal-class-properties',
];

const clientBuild = {
    input: path.resolve(rootPath, './src/client/index.ts'),
    output: {
        file: path.resolve(rootPath, './public/dist/bundle.js'),
        format: 'iife',
        sourcemap: true,
    },
    plugins: [
        resolve({
            extensions: ['.ts', '.js'],
        }),
        commonjs({
            include: path.resolve(rootPath, './node_modules/**'),
            sourceMap: false,
            namedExports: {
                'node_modules/uuid/index.js': ['v4'],
                'node_modules/babylonjs/babylon.js': [
                    'Scene', 'Mesh', 'StandardMaterial', 'Texture', 'TransformNode', 
                    'SceneSerializer', 'SceneLoader', 'AssetsManager', 'Observable', 'AbstractMesh', 
                    'TextFileAssetTask', 'Vector3', 'Quaternion', 'Matrix', 'Engine', 
                    'ArcRotateCamera', 'HemisphericLight', 'Color3', 'Color4', 'FreeCamera', 
                    'Camera', 'TargetCamera',
                ],
            },
        }),
        babel({
            presets: babelPresets,
            plugins: babelPlugins,
            exclude: path.resolve(rootPath, './node_modules/**'),
            extensions: ['.js', '.ts'],
        }),
    ],
    external: [],
};

module.exports = [
    clientBuild,
];
