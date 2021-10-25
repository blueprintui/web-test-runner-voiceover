import { expect } from '@esm-bundle/chai';
import { VoiceOverTest, Commands } from 'web-test-runner-voiceover/browser';

describe('should enable voice over tests with inputs', () => {
  let element: HTMLElement;

  beforeEach(async () => {
    element = document.createElement('div');
    element.innerHTML = /*html*/`
      <input aria-label="first name" placeholder="first name" />
      <input aria-label="last name" placeholder="last name" />
    `;
    document.body.appendChild(element);
  });

  afterEach(() => element.remove());

  it('should read inputs', async () => {
    const test = new VoiceOverTest();
    test.queue(Commands.right, 'first name edit text');
    test.queue(Commands.right, 'last name edit text');
    test.queue(Commands.left, 'first name edit text');
    const result = await test.run();
    expect(result.values).to.eql(result.expected);
  });
});

describe('should enable voice over tests with buttons', () => {
  let element: HTMLElement;

  beforeEach(async () => {
    element = document.createElement('div');
    element.innerHTML = /*html*/`
      <button>one</button>
      <button>two</button>
      <button>three</button>
    `;
    document.body.appendChild(element);
  });

  afterEach(() => element.remove());

  it('should read buttons', async () => {
    const test = new VoiceOverTest();
    test.queue(Commands.right, 'one button');
    test.queue(Commands.right, 'two button');
    test.queue(Commands.right, 'three button');
    test.queue(Commands.left, 'two button');
    test.queue(Commands.left, 'one button');
    const result = await test.run();
    expect(result.values).to.eql(result.expected);
  });

  it('should read buttons again after reset for test', async () => {
    const test = new VoiceOverTest();
    test.queue(Commands.right, 'one button');
    test.queue(Commands.right, 'two button');
    test.queue(Commands.left, 'one button');
    const result = await test.run();
    expect(result.values).to.eql(result.expected);
  });
});
