import { VoiceOverBrowser } from './voiceover/index.js';

export interface PluginCommand {
  command: string;
  payload: any;
  session: any;
}

let voiceOver: VoiceOverBrowser = null;

export function voiceOverPlugin() {
  return {
    name: 'voice-over-plugin',
    async executeCommand({ command, payload, session }: PluginCommand) {
      if (command === 'voice-over' && session.browser.type === 'playwright') {
        if (voiceOver === null) {
          voiceOver = new VoiceOverBrowser();
          await voiceOver.boot();
        }

        await voiceOver.start(session.browser.getPage(session.id));
        let results: string[] = [];
        
        try {
          results = await voiceOver.runAll(payload);
        } catch (err) {
          console.log(err);
          await voiceOver.stop();
          return err;
        } finally {
          return results;
        }
      }
    },
  };
}
