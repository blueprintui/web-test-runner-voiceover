import { run as jxaRun } from '@jxa/run';
import { exec as ex } from 'child_process';
import '@jxa/global-type';
import { Command, Commands } from '../commands.js';
import { Page } from 'playwright';
import { promisify } from 'util';
import { updateSettings, testSettings, defaultSettings } from './settings.js';
import { appendMarker } from './dom.js';
import { processHasStarted } from './system.js';

const exec = (cmd: string) => {
  return promisify<any>(ex)(cmd).catch((err: any) => console.log(err));
}

export class VoiceOverBrowser {
  page: Page;

  constructor() {
    for (const event of ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM']) {
      process.on(event, () => this.stop());
    }
  }

  async boot() {
    updateSettings(testSettings);
    await exec('/System/Library/CoreServices/VoiceOver.app/Contents/MacOS/VoiceOverStarter');
    await this.untilPhrase('web content');
  }

  async start(page: Page) {
    this.page = page;
    await appendMarker(page);
    await processHasStarted('Playwright');
    await processHasStarted('VoiceOver');
    await this.focusBrowser();
    await this.run(Commands.nextHeading);
  }

  async runAll(commands: Command[]) {
    await this.page.waitForTimeout(0);
    await this.run(Commands.nextHeading);

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

  stop() {
    updateSettings(defaultSettings);
    ex('killall VoiceOver');
  }

  private async focusBrowser() {
    return jxaRun(() => {
      Application('System Events').applicationProcesses.byName('Playwright').windows[0].actions.byName('AXRaise');
    });
  }

  private async lastPhrase() {
    return jxaRun<string>(() => (Application('VoiceOver').lastPhrase as any).content()).catch(err => console.log(err));
  }

  async untilPhrase(includes: string) {
    await new Promise(r => {
      let count = 0;
      const i = setInterval(async () => {
        const phrase = await this.lastPhrase();

        if (phrase && phrase.toLocaleLowerCase().includes(includes.toLocaleLowerCase())) {
          r('');
          clearInterval(i);
        }
        
        if (count > 10) {
          r('error');
          clearInterval(i);
        }

        count++;
      }, 1000);
    });
  }
}
