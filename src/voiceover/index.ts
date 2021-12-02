import { run as jxaRun } from '@jxa/run';
import { Page } from 'playwright';
import '@jxa/global-type';

import { Command, Commands } from '../commands.js';
import { updateSettings, testSettings, defaultSettings } from './settings.js';
import { appendMarker } from './dom.js';
import { getAppleScriptVoiceOverPermissions, processHasStarted, startVoiceOverProcess, stopProcess } from './system.js';

for (const event of ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM']) {
  process.on(event, () => {
    updateSettings(defaultSettings, false);
    stopProcess('VoiceOver');
  });
}

export class VoiceOverBrowser {
  async boot() {
    stopProcess('VoiceOver');
    await updateSettings(testSettings);
    await getAppleScriptVoiceOverPermissions();
    await startVoiceOverProcess();
    await untilPhrase('web content');
  }

  async start(page: Page) {
    await appendMarker(page);
    await processHasStarted('Playwright');
    await processHasStarted('VoiceOver');
    await focusBrowser();
    await run(Commands.nextHeading);
  }

  async stop() {
    return stopProcess('VoiceOver');
  }

  async runAll(config: { commands: Command[], expected: string[]}) {
    let i = 0;
    let results = [];
    while (i < config.commands.length) {
      await run(config.commands[i]);
      const result = await untilPhrase(config.expected[i]);
      console.log(result);
      results.push(result);
      i++;
    }
    return results;
  }
}

async function focusBrowser() {
  return jxaRun(() => {
    Application('System Events').applicationProcesses.byName('Playwright').windows[0].actions.byName('AXRaise');
  });
}

async function run(command: Command) {
  await jxaRun(
    ({ keyCode, modifiers }) => Application('System Events').keyCode(keyCode, { using: modifiers }),
    command
  );
}

async function lastPhrase() {
  return jxaRun<string>(() => (Application('VoiceOver').lastPhrase as any).content()).catch(err => console.log(err));
}

async function untilPhrase(value: string): Promise<string> {
  return new Promise(async (resolve) => {
    let count = 0;
    let phrases: string[] = [];
    while (count < 50) {
      const phrase = await lastPhrase();
      const result = value.trim().toLocaleLowerCase();
      if (phrase && phrase.trim().toLocaleLowerCase().includes(result)) {
        resolve(result);
        break;
      } else {
        count++;
        phrases.push(phrase as string);
        if (!(phrase as string)?.includes('. Speech off.')) {
          console.log(phrase);
        }
        await new Promise(r => setTimeout(() => r(null), 10));
      }
    }

    if (count >= 1000) {
      resolve(`${[...new Set(phrases)].join('. ')}`);
    }
  })
}
