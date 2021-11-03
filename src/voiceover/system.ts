import * as osascript from 'node-osascript';
import { exec as ex } from 'child_process';
import { promisify } from 'util';

const exec = (cmd: string) => {
  return promisify<any>(ex)(cmd).catch((err: any) => console.log(err));
}

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

export async function startVoiceOverProcess() {
  return exec('/System/Library/CoreServices/VoiceOver.app/Contents/MacOS/VoiceOverStarter');
}

export async function getAppleScriptVoiceOverPermissions() {
  return await new Promise<string>((resolve, reject) => {
    const command = `
tell application "VoiceOver Utility" to activate

tell application "System Events" to tell application process "VoiceOver Utility"
  tell window "VoiceOver Utility"
    set theCheckbox to checkbox "Allow VoiceOver to be controlled with AppleScript" of splitter group 1
    tell theCheckbox
      if not (its value as boolean) then 
        click theCheckbox
        delay 1
      end if
    end tell
  end tell
end tell

tell application "VoiceOver Utility" to quit`;
    osascript.execute(command, (err: any, result: any, _raw: any) => {
      err ? reject(err) : resolve(result);
    });
  });
}

export function processHasStarted(process: string) {
  return retry(() => processIsRunning(process)).catch(err => console.log(`${process}: ${err}`));
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
