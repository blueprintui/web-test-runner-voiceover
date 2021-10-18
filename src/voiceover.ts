import { run as jxaRun } from '@jxa/run';
import { exec } from 'child_process';
import '@jxa/global-type';
import { Command, Commands } from './commands.js';
import { Page } from 'playwright';
import * as osascript from 'node-osascript';

async function processIsRunning(process: string) {
  return await new Promise<string>((resolve, reject) => {
    const command = `
tell application "System Events"
  name of every process contains ("${process}")
end tell`;
    osascript.execute(command, (err: any, result: any, _raw: any) => {
      err ? reject(err) : resolve(result);
    });
  });
}

function retry(
  fn: any,
  maxTries = 10,
  promise?: Promise<any>,
  promiseObject: { resolve: any; reject: any } = {
    resolve: null,
    reject: null,
  }
) {
  maxTries--;

  promise =
    promise ||
    new Promise((resolve, reject) => {
      promiseObject.resolve = resolve;
      promiseObject.reject = reject;
    });

  fn()
    .then((result: any) => {
      promiseObject.resolve(result);
    })
    .catch(() => {
      if (maxTries > 0) {
        retry(fn, maxTries, promise, promiseObject);
      } else {
        promiseObject.reject('Max attempts reached');
      }
    });

  return promise;
}

export function processHasStarted(process: string) {
  return retry(() => processIsRunning(process)).catch(err => console.log(`${process}: ${err}`));
}

export class VoiceOverBrowser {
  // process: Promise<any>;
  page: Page;

  constructor() {
    for (const event of ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM']) {
      process.on(event, () => this.stop());
    }

    // this.process = new Promise((resolve, reject) => {
    //   exec('/System/Library/CoreServices/VoiceOver.app/Contents/MacOS/VoiceOverStarter', (err, stdout, stderr) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve({ stdout, stderr });
    //     }
    //   });
    // });
  }

  stop() {
    return jxaRun(({ key, options }) => Application('System Events').keyCode(key, options), {
      key: 96,
      options: { using: 'command down' },
    });
  }

  async start(page: Page) {
    this.page = page;

    console.log('start');
    const running = await processIsRunning('VoiceOver');
    console.log('running', running);
    if (!running) {
      await new Promise<string>((resolve, reject) => {
        osascript.execute(`tell application "System Events" to key code 96 using command down`, (err: any, result: any, _raw: any) => {
          console.log('result', result);
          console.log('err', err);
          err ? reject(err) : resolve(result);
        });
      });

    }

    // await this.process;
    await processHasStarted('Playwright');
    await processHasStarted('VoiceOver');
    await jxaRun(() => {
      Application('System Events').applicationProcesses.byName('Playwright').windows[0].actions.byName('AXRaise');
    });

    await this.page.evaluate(() => {
      const startMarker = document.querySelector('[vo-mark="start"]');
      const endMarker = document.querySelector('[vo-mark="end"]');

      if (!startMarker) {
        document.head.insertAdjacentHTML('beforeend', `<style>
          [vo-mark]:not(:focus):not(:active) {
            clip: rect(0 0 0 0); 
            clip-path: inset(50%);
            height: 1px;
            overflow: hidden;
            position: absolute;
            white-space: nowrap; 
            width: 1px;
          }
        </style>`);

        const start = document.createElement('h2');
        start.innerHTML = 'vo-start';
        start.setAttribute('vo-mark', 'start');
        document.querySelector('body').prepend(start);
      }

      if (!endMarker) {
        const end = document.createElement('h2');
        end.innerHTML = 'vo-end';
        end.setAttribute('vo-mark', 'end');
        document.querySelector('body').append(end);
      } else {
        endMarker.remove();
        document.querySelector('body').append(endMarker);
      }
    });
    return this._focusBrowser();
  }

  async runAll(commands: Command[]) {
    let i = 0;
    let results = [];
    while (i < commands.length) {
      await this.run(commands[i]);
      let lastPhrase = await this.lastPhrase();
      if (lastPhrase) {
        lastPhrase = lastPhrase.toLowerCase().trim();
        results.push(lastPhrase);
        console.log(lastPhrase);
      }
      i++;
    }
    return results;
  }

  async run(command: Command) {
    await jxaRun(
      ({ keyCode, modifiers }) => Application('System Events').keyCode(keyCode, { using: modifiers }),
      command
    );
    return this.page.waitForTimeout(command.name === 'Space' ? 100 : 25);
  }

  private async _focusBrowser() {
    await this.page.waitForTimeout(100);
    let j = 0;
    let windowFocused = false;
    while (j < 10 && !windowFocused) {
      const lastPhrase = await this.lastPhrase();
      if (lastPhrase && !lastPhrase.includes('vo-start')) {
        await this.run(Commands.nextHeading);
        j++;
      } else {
        windowFocused = true;
      }
    }
    return windowFocused;
  }

  private async lastPhrase() {
    // return jxaRun<string>(() => {
    //   return (Application('VoiceOver').lastPhrase as any).content()
    // }).catch(err => console.log('LAST PHRASE ERROR', err));

    return await new Promise<string>((resolve, reject) => {
      const command = `
tell application "VoiceOver"
  set lastPhrase to content of last phrase 
	return lastPhrase
end tell
      `;
      osascript.execute(command, (err: any, result: any, _raw: any) => {
        console.log('lastphrase err', err);
        console.log('lastphrase result', result);
        err || !result ? reject(err) : resolve(result);
      });
    });
  }
}
