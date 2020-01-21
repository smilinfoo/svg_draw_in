// rollup.config.js
import serve from 'rollup-plugin-dev-server'
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import {terser} from 'rollup-plugin-terser';

export default {
  input: 'src/main.js',
  output:[ 
    {
      file: 'dist/svg_draw_in.js',
      format: 'iife',
      name:'svg_draw_in',
    },
    {
      file: 'dist/svg_draw_in.min.js',
      format: 'iife',
      name:'svg_draw_in',
      plugins: [terser()]
    },
    {
      file: 'dist/svg_draw_in.umd.js',
      format: 'umd',
      name:'svg_draw_in'
    },
    {
      file: 'dist/svg_draw_in.jsm',
      format: 'esm',
      name:'svg_draw_in'
    },
  ],
  plugins: [
    serve({
      open: true,
      contentBase: ['examples', 'dist']
    }),
    resolve(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ],
  watch:{
    include: 'src/**'
  }
};