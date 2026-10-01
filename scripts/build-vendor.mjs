// Bundles the browser libraries into public/js/vendor/ so the exhibit
// needs no CDN or internet connection. Run after `npm install`:
//   npm run build:vendor
// The output is committed, so the exhibition machine does not need to run this.
import { build } from 'esbuild';

await build({
  stdin: {
    contents: `
      export { Tiktoken } from 'js-tiktoken/lite';
      export { default as o200k_base } from 'js-tiktoken/ranks/o200k_base';
    `,
    resolveDir: process.cwd(),
    loader: 'js',
  },
  bundle: true,
  format: 'esm',
  minify: true,
  legalComments: 'inline',
  banner: { js: '/* js-tiktoken (MIT License, https://github.com/dqbd/tiktoken) with the o200k_base encoding. Bundled locally for offline use. */' },
  outfile: 'public/js/vendor/tiktoken-o200k.js',
});
console.log('Built public/js/vendor/tiktoken-o200k.js');
