export function createLogger(name: string) {
  let verbose = false;

  function setVerbose(value: boolean) {
    verbose = value;
  }

  function debug(...args: any[]) {
    if (verbose) {
      console.debug(name, ...args);
    }
  }

  return {
    setVerbose,
    debug,
  };
}
