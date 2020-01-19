// rollup.config.js
import serve from 'rollup-plugin-dev-server'
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

export default {
  input: 'src/main.js',
  output:[ 
    {
      file: 'dist/cjs.js',
      format: 'cjs'
    },
    {
      file: 'dist/es.js',
      format: 'es'
    },
    {
      file: 'dist/browser.js',
      format: 'iife'
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