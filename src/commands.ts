export interface Command {
  name: string,
  keyCode: number,
  modifiers: string[],
}

export const Commands: { [key: string]: Command } = {
  left: {
    name: 'Cursor Left',
    keyCode: 123,
    modifiers: ['control down', 'option down'],
  },
  right: {
    name: 'Cursor Right',
    keyCode: 124,
    modifiers: ['control down', 'option down'],
  },
  up: {
    name: 'Cursor Up',
    keyCode: 126,
    modifiers: ['control down', 'option down'],
  },
  down: {
    name: 'Cursor Down',
    keyCode: 125,
    modifiers: ['control down', 'option down'],
  },
  arrowLeft: {
    name: 'Arrow Left',
    keyCode: 123,
    modifiers: [],
  },
  arrowRight: {
    name: 'Arrow Right',
    keyCode: 124,
    modifiers: [],
  },
  arrowUp: {
    name: 'Arrow Up',
    keyCode: 126,
    modifiers: [],
  },
  arrowDown: {
    name: 'Arrow Down',
    keyCode: 125,
    modifiers: [],
  },
  interact: {
    name: 'Interact',
    keyCode: 124,
    modifiers: ['shift down', 'control down', 'option down'],
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
  previousHeading: {
    name: 'Previous Heading',
    keyCode: 4,
    modifiers: ['shift down', 'control down', 'option down', 'command down'],
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
  },
  home: {
    name: 'Home',
    keyCode: 115,
    modifiers: ['shift down'],
  }
};
