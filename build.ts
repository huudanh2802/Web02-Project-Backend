/* eslint-disable no-console */
/* eslint-disable no-promise-executor-return */
/**
 * Remove old files, copy front-end ones.
 */

import fs from "fs-extra";
import childProcess from "child_process";

/**
 * Remove file
 */
function remove(loc: string): Promise<void> {
  return new Promise((res, rej) => {
    return fs.remove(loc, (err) => {
      return err ? rej(err) : res();
    });
  });
}

/**
 * Copy file.
 */
function copy(src: string, dest: string): Promise<void> {
  return new Promise((res, rej) => {
    return fs.copy(src, dest, (err) => {
      return err ? rej(err) : res();
    });
  });
}

/**
 * Do command line command.
 */
function exec(cmd: string, loc: string): Promise<void> {
  return new Promise((res, rej) => {
    return childProcess.exec(cmd, { cwd: loc }, (err, stdout, stderr) => {
      if (stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.log(stderr);
      }
      return err ? rej(err) : res();
    });
  });
}

/**
 * Start
 */
(async () => {
  try {
    // Remove current build
    await remove("./dist/");
    // Copy back-end files
    await exec("tsc --build tsconfig.prod.json", "./");
  } catch (err) {
    console.log(err);
  }
})();
