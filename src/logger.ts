export function createLogger(name: string) {
  let verbose = false;

  function setVerbose(value: boolean) {
    verbose = value;
  }

  function debug(...args: any[]) {
    if (verbose) {
      console.debug(`%c[${name}]`, 'font-weight:bold;color:white;', ...args);
    }
  }

  return {
    setVerbose,
    debug,
  };
}
