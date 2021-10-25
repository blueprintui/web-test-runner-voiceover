import { expect } from '@esm-bundle/chai';
import { VoiceOverTest, Commands } from 'web-test-runner-voiceover/browser';

describe('should enable voice over tests with buttons', () => {
  let element: HTMLElement;

  beforeEach(async () => {
    element = document.createElement('div');
    element.innerHTML = /*html*/`
      <button>four</button>
      <button>five</button>
      <button>six</button>
    `;
    document.body.appendChild(element);
  });

  afterEach(() => element.remove());

  it('should read buttons', async () => {
    const test = new VoiceOverTest();
    test.queue(Commands.right, 'four button');
    test.queue(Commands.right, 'five button');
    test.queue(Commands.right, 'six button');
    test.queue(Commands.left, 'five button');
    test.queue(Commands.left, 'four button');
    const result = await test.run();
    expect(result.values).to.eql(result.expected);
  });
});
