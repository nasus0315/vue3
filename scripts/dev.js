const { resolve } = require('path');
const { build } = require('esbuild');

const target = 'runtime-dom';

build({
	entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
	outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`),
	bundle: true,
	sourcemap: true,
	format: 'esm',
	platform: 'browser',
	// watch: {
	// 	onRebuild() {
	// 		console.log(`onRebuild~~~~`);
	// 	},
	// },
}).then(() => {
	console.log(' Build complete.');
});
