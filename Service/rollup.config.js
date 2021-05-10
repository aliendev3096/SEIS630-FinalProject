import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import copy from 'rollup-plugin-copy'

export default [{
    input: 'src/server.ts',
    output: {
      file: 'build/server.js',
      format: 'es'
    },

    external: ['express', 'oracledb'],
    plugins: [
        babel({ babelHelpers: 'bundled' }),
        typescript({tsconfig: './tsconfig-server.json'}),
        resolve({ jail: 'src/**/*'}),
        commonjs(),
        copy({
          targets: [
            { src: 'src/**/*.css', dest: 'build/css' },
            { src: 'src/**/*.html', dest: 'build' },
          ]
        }),
    ]
  }
  // {
  //   input: 'src/index.ts',
  //   output: {
  //     dir: 'build/js',
  //     format: 'es'
  //   },

  //   external: ['express',  'oracledb'],
  //   plugins: [
  //       babel({ babelHelpers: 'bundled' }),
  //       typescript({tsconfig: './tsconfig.json'}),
  //       commonjs(),
  //       resolve(),
  //       copy({
  //         targets: [
  //           { src: 'src/**/*.css', dest: 'build/css' },
  //         ]
  //       }),
  //       json(),
  //   ]
  // }
]