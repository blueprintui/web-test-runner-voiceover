import { run as jxaRun } from '@jxa/run';
import { exec } from 'child_process';
import '@jxa/global-type';
import { Command, Commands } from './commands.js';
import { Page } from 'playwright';
// import * as osascript from 'node-osascript';

export class VoiceOverBrowser {
  process: Promise<any>;
  page: Page;

  constructor() {
    for (const event of ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM']) {
      process.on(event, () => this.stop());
    }

    this.process = new Promise((resolve, reject) => {
      exec('/System/Library/CoreServices/VoiceOver.app/Contents/MacOS/VoiceOverStarter', (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  stop() {
    return jxaRun(({ key, options }) => Application('System Events').keyCode(key, options), {
      key: 96,
      options: { using: 'command down' },
    });
  }

  async start(page: Page) {
    this.page = page;

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
    return jxaRun<string>(() => {
      return (Application('VoiceOver').lastPhrase as any).content()
    }).catch(err => console.log('LAST PHRASE ERROR', err));

//     const value = await new Promise<string>(resolve => {
//     const command = `
// set textLine to ""
// tell application "VoiceOver"
//   tell last phrase
//     set textLine to content
//   end tell
// end tell
// return textLine`;
//       osascript.execute(command, (err: any, result: any, _raw: any) => {
//         if (err) return console.error(err)

//         resolve(result)
//       });
//     });

//     return value;
  }
}
