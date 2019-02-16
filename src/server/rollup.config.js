const path = require('path');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const typescript = require('rollup-plugin-typescript2');

const rootPath = path.resolve(__dirname, '../../');

const clientBuild = {
    input: path.resolve(rootPath, './src/client/index.ts'),
    output: {
        dir: path.resolve(rootPath, './public/dist/'),
        format: 'es',
        sourcemap: true,
    },
    plugins: [
        resolve({
            extensions: ['.ts', '.js'],
            browser: true,
        }),
        commonjs({
            include: path.resolve(rootPath, './node_modules/**'),
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
    ],
};

module.exports = [
    clientBuild,
];
