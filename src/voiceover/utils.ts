import { promisify } from 'util';
import { exec as ex } from 'child_process';

export const exec = (cmd: string) => {
  return promisify<any>(ex)(cmd).catch((err: any) => console.log(err));
}

export function retry(
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
