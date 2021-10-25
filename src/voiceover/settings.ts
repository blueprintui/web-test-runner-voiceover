import { promisify } from 'util';
import { exec } from 'child_process';

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

export function updateSettings(settings: VOSettings) {
  // await exec(`defaults write com.apple.VoiceOver4/default SCREnableAppleScript ${settings.enableAppleScript}`);
  exec(`defaults write com.apple.VoiceOverTraining doNotShowSplashScreen ${settings.doNotShowSplashScreen}`);
  exec(`defaults write com.apple.VoiceOver4/default SCRCategories_SCRCategorySystemWide_SCRSpeechComponentSettings_SCRDisableSpeech ${settings.disableSpeech}`);
  exec(`defaults write com.apple.VoiceOver4/default SCRCategories_SCRCategorySystemWide_SCRSoundComponentSettings_SCRDisableSound ${settings.disableSound}`);
  exec(`defaults write com.apple.VoiceOver4/default SCRDisplayTextEnabled ${settings.displayTextEnabled}`);
  exec(`defaults write com.apple.VoiceOver4/default SCRCategories_SCRCategorySystemWide_SCRSpeechLanguages_default_SCRSpeechComponentSettings_SCRRateAsPercent ${settings.rateAsPercent}`);
  exec(`defaults write com.apple.VoiceOver4/default loginGreeting "${settings.loginGreeting}"`);
}
