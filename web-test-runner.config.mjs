import { playwrightLauncher } from '@web/test-runner-playwright';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { fromRollup } from '@web/dev-server-rollup';
import alias from '@rollup/plugin-alias';
import { voiceOverPlugin } from './dist/index.js'; // web-test-runner-voiceover

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  concurrency: 1,
  concurrentBrowsers: 1,
  files: ['./src/**/*.spec.ts'],
  testsFinishTimeout: 60000,
  testFramework: {
    config: { timeout: '60000' }
  },
  browsers: [playwrightLauncher({ product: 'webkit', launchOptions: { headless: false } })],
  nodeResolve: true,
  dedupe: true,
  plugins: [
    voiceOverPlugin(),
    fromRollup(alias)({
      entries: [
        { find: /^web-test-runner-voiceover$/, replacement: `${process.cwd()}/dist` },
        { find: /^web-test-runner-voiceover\/(.+)\.js$/, replacement: `${process.cwd()}/dist/$1.js` },
        { find: /^(.*)\.ts$/, replacement: `${process.cwd()}/$1.js` },
        { find: '.js', replacement: `.ts` },
      ],
    }),
    esbuildPlugin({ ts: true, json: true, target: 'auto', sourceMap: true })
  ]
});
