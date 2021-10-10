export interface Command {
  name: string,
  keyCode: number,
  modifiers: string[],
}

export const Commands: { [key: string]: Command } = {
  left: {
    name: 'Move Left',
    keyCode: 123,
    modifiers: ['control down', 'option down'],
  },
  right: {
    name: 'Move Right',
    keyCode: 124,
    modifiers: ['control down', 'option down'],
  },
  up: {
    name: 'Move Up',
    keyCode: 126,
    modifiers: ['control down', 'option down'],
  },
  down: {
    name: 'Move Down',
    keyCode: 125,
    modifiers: ['control down', 'option down'],
  },
  tab: {
    name: 'Tab',
    keyCode: 48,
    modifiers: [],
  },
  nextHeading: {
    name: 'Next Heading',
    keyCode: 4,
    modifiers: ['control down', 'option down', 'command down'],
  },
  space: {
    name: 'Space',
    keyCode: 49,
    modifiers: [],
  },
  escape: {
    name: 'Escape',
    keyCode: 53,
    modifiers: [],
  }
};
