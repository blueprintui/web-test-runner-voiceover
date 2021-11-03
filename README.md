# web-test-runner-voiceover

[![npm version](https://badge.fury.io/js/web-test-runner-voiceover.svg)](https://badge.fury.io/js/web-test-runner-performance) ![CI Build](https://github.com/coryrylan/web-test-runner-voiceover/actions/workflows/build.yml/badge.svg)

The Web Test Runner Voiceover provides plugins for [@web/test-runner](https://modern-web.dev/docs/test-runner/overview/) to automate Voiceover Screen reader testing.

![Web Test Runner Voiceover Example](https://github.com/coryrylan/web-test-runner-voiceover/blob/main/assets/web-test-runner-voiceover.png)

### Alternatives

Not using `@web/test-runner`? No worries! There is another great VoiceOver testing tool available called [auto-vo](https://github.com/ckundo/auto-vo). This tool enables similar VoiceOver testing as `web-test-runner-voiceover` but is optimized for content-based sites and works stand alone without requiring using `@web/test-runner`.

## Setup

Below you can find a minimal setup. To use `web-test-runner-voiceover` create a standalone test runner separate from your standard test runner config. Tests should be run independent of other tests and only run one test and browser at a time for the most accurate results.

```javascript
// web-test-runner.voiceover.mjs
import { playwrightLauncher } from '@web/test-runner-playwright';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { fromRollup } from '@web/dev-server-rollup';
import alias from '@rollup/plugin-alias';
import { voiceOverPlugin } from 'web-test-runner-voiceover'; 

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
      entries: [{ find: /^my-cool-library/, replacement: `${process.cwd()}/dist` }],
    }),
    esbuildPlugin({ ts: true, json: true, target: 'auto', sourceMap: true })
  ]
});
```
## Permissions

To run the tests certain permissions must be enabled. The first time running tests you will asked to allow permissions for `Terminal` to run have `Assistive Access` and to allow VoiceOver to be controlled by `AppleScript`.
Allow both of these permissions. Once allowed you should not be asked again to enable.

If you need to re-enable/disable
you can find `Assistive Access` under `System Preferences` > `Security & Privacy` > `Accessibility`. Re-enabling `AppleScript` can be found in the `VoiceOver Utilities` app.

The plugin will adjust VoiceOver preferences for optimal testing speed. The tests should **not** run in a headless browser. For optimal support for Mac users use the `webkit` option.

## Tests

```javascript
import { expect } from '@esm-bundle/chai';
import { VoiceOverTest, Commands } from 'web-test-runner-voiceover/browser';

describe('should enable voice over tests with inputs', () => {
  let element: HTMLElement;

  beforeEach(async () => {
    element = document.createElement('div');
    element.innerHTML = `
      <input aria-label="first name" placeholder="first name" />
      <input aria-label="last name" placeholder="last name" />
    `;
    document.body.appendChild(element);
  });

  afterEach(() => element.remove());

  it('should read inputs', async () => {
    const test = new VoiceOverTest();
    test.queue(Commands.right, 'first name edit text');
    test.queue(Commands.right, 'last name edit text');
    test.queue(Commands.left, 'first name edit text');
    const result = await test.run();
    expect(result.values).to.eql(result.expected);
  });
});
```

The various commands available can be found [here](https://github.com/coryrylan/web-test-runner-voiceover/blob/main/src/commands.ts).
Currently Github Action CI support is not available due to permission issues. To run tests locally and skip Github CI during a build a check can be added befor executing the tests.

```json
// package.json
"scripts": {
  "test": "node -e 'if (!process.env.GITHUB_ACTION)process.exit(1)' || web-test-runner",
},
```