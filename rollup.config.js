import * as path from 'path';
import * as fs from 'fs';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import styles from 'rollup-plugin-styles';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
const BABEL_ENV = process.env.BABEL_ENV || 'esm';

const entry = 'packages/index.ts';
const componentsDir = 'packages/components';
const componentsName = fs.readdirSync(path.resolve(componentsDir));
const componentsEntry = componentsName.map((name) => name.match(/\.(ts|tsx)$/) ? `${componentsDir}/${name}` : `${componentsDir}/${name}/index.ts`);

const hooksDir = 'packages/hooks';
const hooksName = fs.readdirSync(path.resolve(hooksDir));
const hooksEntry = hooksName.map((name) => name.match(/\.(ts|tsx)$/) ? `${hooksDir}/${name}` : `${hooksDir}/${name}/index.ts`);

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const globals = { react: 'React', 'react-dom': 'ReactDOM', antd: 'antd', ahooks: 'ahooks' };
const externalPkg = ['react', 'react-dom', 'antd', 'ahooks', 're-resizable', 'dayjs', 'classnames', '@ant-design', 'rc-util'];
BABEL_ENV !== 'umd' && externalPkg.push('@babel/runtime');
const external = id => externalPkg.some(e => id.indexOf(e) === 0);

const commonPlugins = [
  resolve({ extensions }),
  typescript({ useTsconfigDeclarationDir: true }),
  replace({
    exclude: 'node_modules/**',
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  }),
  babel({
    exclude: '**/node_modules/**',
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    babelHelpers: 'runtime',
    presets: [
      [
        "@babel/preset-env",
      ],
    ],
    plugins: [['@babel/plugin-transform-runtime']]
  }),
  commonjs(),
];


const stylePluginConfig = {
  mode: "extract",
  less: { javascriptEnabled: true },
  extensions: ['.less', '.css'],
  minimize: true,
  use: ['less'],
  url: {
    inline: true
  },
  sourceMap: false,
  autoModules: true,
};


const umdOutput = {
  format: 'umd',
  name: 'VisionLib',
  globals,
  assetFileNames: '[name].[ext]'
};

const esOutput = {
  globals,
  preserveModules: true,
  preserveModulesRoot: 'packages',
  exports: 'named',
  assetFileNames: ({ name }) => {
    const { ext, dir, base } = path.parse(name);
    if (ext !== '.css') return '[name].[ext]';
    // 规范 style 的输出格式
    return path.join(dir, 'style', base);
  },
}
const esStylePluginConfig = {
  ...stylePluginConfig,
  sourceMap: true, // 必须开启，否则 rollup-plugin-styles 会有 bug
  onExtract(data) {
    const { css, name, map } = data;
    const { base, dir } = path.parse(name);
    if (base !== 'index.css' || dir.match(/\/src/ig)) return false;
    return true;
  }
}

export default () => {
  switch (BABEL_ENV) {
    case 'umd':
      return [{
        input: entry,
        output: { ...umdOutput, file: 'dist/visible-lib.development.js' },
        external,
        plugins: [styles(stylePluginConfig), ...commonPlugins]
      }, {
        input: entry,
        output: { ...umdOutput, file: 'dist/visible-lib.production.min.js', plugins: [terser()] },
        external,
        plugins: [styles({ ...stylePluginConfig, minimize: true }), ...commonPlugins]
      }];
    case 'esm':
      return {
        input: [entry, ...componentsEntry, ...hooksEntry],
        preserveModules: true,
        output: { ...esOutput, dir: 'es/', format: 'es' },
        external,
        plugins: [styles(esStylePluginConfig), ...commonPlugins]
      };
    case 'cjs':
      return {
        input: [entry, ...componentsEntry, ...hooksEntry],
        preserveModules: true,
        output: { ...esOutput, dir: 'lib/', format: 'cjs' },
        external,
        plugins: [styles(esStylePluginConfig), ...commonPlugins]
      };
    default:
      return [];
  }
};
