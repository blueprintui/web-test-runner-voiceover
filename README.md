# web-test-runner-voiceover

The Web Test Runner Voiceover provides plugins for [web-test-runner](https://modern-web.dev/docs/test-runner/overview/) to automate Voiceover Screen reader testing.

## Setup

Below you can find a minimal setup. To use `web-test-runner-voiceover` create a standalone test runner separate from your standard test runner config. Tests should be run independent of other tests and only run one test and browser at a time for the most accurate results. Currently Github Action CI support is not available due to permission issues.


```javascript
// web-test-runner.voiceover.mjs
import { playwrightLauncher } from '@web/test-runner-playwright';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { fromRollup } from '@web/dev-server-rollup';
import alias from '@rollup/plugin-alias';
import { voiceOverPlugin } from 'web-test-runner-voiceover';

export default ({
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
```

## Permissions

To run the tests certain permissions must be enabled.

1. In the VoiceOver Utility app check "Allow VoiceOver to be controlled with AppleScript"
2. Enable Terminal app in System Preferences => Security & Privacy => Privacy => Accessibility.
3. Allow Terminal/VoiceOver permissions when prompted

## Tests

```javascript
import { expect } from '@esm-bundle/chai';
import { VoiceOverTest, Commands } from 'web-test-runner-voiceover/browser.js';

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