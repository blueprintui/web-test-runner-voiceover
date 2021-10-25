import { executeServerCommand } from '@web/test-runner-commands';
import { Command } from '../commands.js';

export * from '../commands.js';

export class VoiceOverTest {
  private commands: Command[] = [];
  private expected: string[] = [];

  async run(): Promise<{ values: string[], expected: string[] }> {
    const expected: string[] = [...this.expected];
    const values: string[] = await executeServerCommand('voice-over', { commands: this.commands });
    this.commands = [];
    this.expected = [];
    return { values, expected };
  }

  queue(command: Command, expect: string) {
    this.commands.push(command);
    this.expected.push(expect);
  }
}
