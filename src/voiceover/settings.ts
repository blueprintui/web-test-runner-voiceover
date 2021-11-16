import { exec } from './utils.js';

interface VOSettings {
  doNotShowSplashScreen?: string;
  disableSpeech?: string;
  disableSound?: string;
  displayTextEnabled?: string;
  rateAsPercent?: string;
  loginGreeting?: string;
}

export const testSettings: VOSettings = {
  doNotShowSplashScreen: '1',
  disableSpeech: '1',
  disableSound: '1',
  displayTextEnabled: '0',
  rateAsPercent: '100',
  loginGreeting: 'VoiceOver is on'
};

export const defaultSettings: VOSettings = {
  doNotShowSplashScreen: '1',
  disableSpeech: '0',
  disableSound: '0',
  displayTextEnabled: '1',
  rateAsPercent: '45',
  loginGreeting: 'Welcome to macOS. VoiceOver is on.'
};

export async function getSettingDefault(settingDefaults: string) {
  return await exec(`defaults read ${settingDefaults}`);
}

export async function updateSettings(settings: VOSettings) {
  // await exec(`defaults write com.apple.VoiceOver4/default SCREnableAppleScript ${settings.enableAppleScript}`);
  await exec(`defaults write com.apple.VoiceOverTraining doNotShowSplashScreen ${settings.doNotShowSplashScreen}`);
  await exec(`defaults write com.apple.VoiceOver4/default SCRCategories_SCRCategorySystemWide_SCRSpeechComponentSettings_SCRDisableSpeech ${settings.disableSpeech}`);
  await exec(`defaults write com.apple.VoiceOver4/default SCRCategories_SCRCategorySystemWide_SCRSoundComponentSettings_SCRDisableSound ${settings.disableSound}`);
  await exec(`defaults write com.apple.VoiceOver4/default SCRDisplayTextEnabled ${settings.displayTextEnabled}`);
  await exec(`defaults write com.apple.VoiceOver4/default SCRCategories_SCRCategorySystemWide_SCRSpeechLanguages_default_SCRSpeechComponentSettings_SCRRateAsPercent ${settings.rateAsPercent}`);
  await exec(`defaults write com.apple.VoiceOver4/default loginGreeting "${settings.loginGreeting}"`);
}
