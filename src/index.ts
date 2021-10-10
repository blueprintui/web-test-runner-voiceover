import { VoiceOverBrowser } from './voiceover.js';

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
        }

        await new Promise(r => setTimeout(() => r(null), 1000));
        await voiceOver.start(session.browser.getPage(session.id));
        let results: string[] = [];
        
        try {
          results = await voiceOver.runAll(payload.commands);
        } catch (err) {
          console.log(err);
          return err;
        } finally {
          return results;
        }
      }
    },
  };
}
