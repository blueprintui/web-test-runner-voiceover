import * as osascript from 'node-osascript';

async function processIsRunning(process: string) {
  return await new Promise<string>((resolve, reject) => {
    const command = `
tell application "System Events"
  name of every process contains ("${process}")
end tell`;
    osascript.execute(command, (err: any, result: any, _raw: any) => {
      err ? reject(err) : resolve(result);
    });
  });
}

export function processHasStarted(process: string) {
  return retry(() => processIsRunning(process)).catch(err => console.log(`${process}: ${err}`));
}

function retry(
  fn: any,
  maxTries = 10,
  promise?: Promise<any>,
  promiseObject: { resolve: any; reject: any } = {
    resolve: null,
    reject: null,
  }
) {
  maxTries--;

  promise =
    promise ||
    new Promise((resolve, reject) => {
      promiseObject.resolve = resolve;
      promiseObject.reject = reject;
    });

  fn()
    .then((result: any) => {
      promiseObject.resolve(result);
    })
    .catch(() => {
      if (maxTries > 0) {
        retry(fn, maxTries, promise, promiseObject);
      } else {
        promiseObject.reject('Max attempts reached');
      }
    });

  return promise;
}
