import * as osascript from 'node-osascript';
import { getSettingDefault } from './settings.js';
import { exec, retry } from './utils.js';

export async function stopProcess(process: string) {
  return await new Promise<string>((resolve, reject) => {
    const command = `
tell application "${process}"
  quit
end tell`;
    osascript.execute(command, (err: any, result: any, _raw: any) => {
      err ? reject(err) : resolve(result);
    });
  });
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

async function supportsAppleScript(): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      const value = await getSettingDefault('com.apple.VoiceOver4/default SCREnableAppleScript', false);
      resolve(value.stdout.trim() === '1');
    } catch {
      resolve(false);
    }
  })
}

export async function getAppleScriptVoiceOverPermissions() {
  return await new Promise<string>(async (resolve, reject) => {
    const supports = await supportsAppleScript();
    if (!supports) {
      const command = `
tell application "VoiceOver Utility" to quit
delay 1
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

    } else {
      resolve('1');
    }
  });
}

export async function processHasStarted(process: string) {
  return retry(() => processIsRunning(process)).catch(err => console.log(`${process}: ${err}`));
}

