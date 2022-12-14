import { createLogger } from '../dist/logger';

describe('logger', () => {
  it('should log', () => {
    const { mock, release } = spoofLog();

    const logger = createLogger('test');
    logger.setVerbose(true);
    logger.debug('hello');

    expect(mock).toHaveBeenCalled();

    release();
  });

  it('should not log', () => {
    const { mock, release } = spoofLog();

    const logger = createLogger('test');
    logger.setVerbose(false);
    logger.debug('hello');

    expect(mock).not.toHaveBeenCalled();

    release();
  });
});

function spoofLog() {
  const log = jest.fn();
  const originalLog = console.debug;

  console.debug = log;

  const release = () => {
    console.debug = originalLog;
  };
  return { mock: log, release };
}
