import { exec } from './utils.js';

interface VOSettings {
  voiceOverCursorEnabled?: string,
  doNotShowSplashScreen?: string;
  disableSpeech?: string;
  disableSound?: string;
  displayTextEnabled?: string;
  rateAsPercent?: string;
  loginGreeting?: string;
}

export const testSettings: VOSettings = {
  voiceOverCursorEnabled: '1',
  doNotShowSplashScreen: '1',
  disableSpeech: '1',
  disableSound: '1',
  displayTextEnabled: '0',
  rateAsPercent: '100',
  loginGreeting: ''
};

export const defaultSettings: VOSettings = {
  voiceOverCursorEnabled: '1',
  doNotShowSplashScreen: '1',
  disableSpeech: '0',
  disableSound: '0',
  displayTextEnabled: '1',
  rateAsPercent: '45',
  loginGreeting: 'Welcome to macOS. VoiceOver is on.'
};

export async function getSettingDefault(settingDefaults: string, async = true) {
  return await exec(`defaults read ${settingDefaults}`, async);
}

export function updateSettings(settings: VOSettings, async = true) {
  const commands = [
    // `defaults write com.apple.VoiceOver4/default SCREnableAppleScript -bool YES`,
    `defaults write com.apple.VoiceOverTraining doNotShowSplashScreen ${settings.doNotShowSplashScreen}`,
    `defaults write com.apple.VoiceOver4/default SCRVoiceOverCursorEnabled ${settings.voiceOverCursorEnabled}`,
    `defaults write com.apple.VoiceOver4/default SCRCategories_SCRCategorySystemWide_SCRSpeechComponentSettings_SCRDisableSpeech ${settings.disableSpeech}`,
    `defaults write com.apple.VoiceOver4/default SCRCategories_SCRCategorySystemWide_SCRSoundComponentSettings_SCRDisableSound ${settings.disableSound}`,
    `defaults write com.apple.VoiceOver4/default SCRDisplayTextEnabled ${settings.displayTextEnabled}`,
    `defaults write com.apple.VoiceOver4/default SCRCategories_SCRCategorySystemWide_SCRSpeechLanguages_default_SCRSpeechComponentSettings_SCRRateAsPercent ${settings.rateAsPercent}`,
    `defaults write com.apple.VoiceOver4/default loginGreeting "${settings.loginGreeting}"`,
  ];

  return async ? Promise.all(commands.map(c => exec(c))) : commands.forEach(c => exec(c, false));
}
