import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/extract-content.js',
  output: {
    file: 'scripts/extract-content.js',
    format: 'iife', // Immediately Invoked Function Expression for browser
  },
  plugins: [
    resolve(),
    commonjs()
  ]
};
