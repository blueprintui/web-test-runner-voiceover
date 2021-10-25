import { expect } from '@esm-bundle/chai';
import { VoiceOverTest, Commands } from 'web-test-runner-voiceover/browser';

describe('should enable voice over tests with radios', () => {
  let element: HTMLElement;

  beforeEach(async () => {
    element = document.createElement('div');
    element.innerHTML = /*html*/`
      <p>Select Memory:</p>
      <label for="128">128 gb</label>
      <input type="radio" id="128" name="memory" value="128" checked>

      <label for="256">256 gb</label>
      <input type="radio" id="256" name="memory" value="256">
        
      <label for="512">512 gb</label>
      <input type="radio" id="512" name="memory" value="512">  
    `;
    document.body.appendChild(element);
  });

  afterEach(() => element.remove());

  it('should read radios', async () => {
    const test = new VoiceOverTest();
    test.queue(Commands.right, 'select memory:');
    test.queue(Commands.right, '128 gb');
    test.queue(Commands.right, '128 gb selected radio button, 1 of 3');
    test.queue(Commands.right, '256 gb');
    test.queue(Commands.right, '256 gb radio button, 2 of 3');
    test.queue(Commands.right, '512 gb');
    test.queue(Commands.right, '512 gb radio button, 3 of 3');
    test.queue(Commands.space, 'selected 512 gb radio button, 3 of 3');
    const result = await test.run();
    expect(result.values).to.eql(result.expected);
  });
});
