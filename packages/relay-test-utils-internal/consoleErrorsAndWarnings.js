/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

/* global jest, afterEach */

type API = $ReadOnly<{|
  disallowMessages: () => void,
  expectMessageWillFire: string => void,
  expectMessage: <T>(string, () => T) => T,
  expectMessageMany: <T>(Array<string>, () => T) => T,
|}>;

const originalConsoleError = console.error;

function createConsoleInterceptionSystem(
  typename: string,
  expectFunctionName: string,
  setUpMock: ((string) => void) => void,
): API {
  let installed = false;
  const expectedMessages: Array<string> = [];
  const contextualExpectedMessage: Array<string> = [];

  const typenameCap = typename.charAt(0).toUpperCase() + typename.slice(1);
  const typenameCapPlural = typenameCap + 's';
  const installerName = `disallow${typenameCap}s`;

  function handleMessage(message: string): void {
    const index = expectedMessages.findIndex(expected =>
      message.startsWith(expected),
    );
    if (
      contextualExpectedMessage.length > 0 &&
      contextualExpectedMessage[0] === message
    ) {
      contextualExpectedMessage.shift();
    } else if (index >= 0) {
      expectedMessages.splice(index, 1);
    } else {
      // log to console in case the error gets swallowed somewhere
      originalConsoleError(`Unexpected ${typenameCap}: ` + message);
      throw new Error(`${typenameCap}: ` + message);
    }
  }

  function disallowMessages(): void {
    if (installed) {
      throw new Error(`${installerName} should be called only once.`);
    }
    installed = true;
    setUpMock(handleMessage);

    afterEach(() => {
      contextualExpectedMessage.length = 0;
      if (expectedMessages.length > 0) {
        const error = new Error(
          `Some expected ${typename}s where not triggered:\n\n` +
            Array.from(expectedMessages, message => ` * ${message}`).join(
              '\n',
            ) +
            '\n',
        );
        expectedMessages.length = 0;
        throw error;
      }
    });
  }

  function expectMessageWillFire(message: string): void {
    if (!installed) {
      throw new Error(
        `${installerName} needs to be called before expect${typenameCapPlural}WillFire`,
      );
    }
    expectedMessages.push(message);
  }

  function expectMessage<T>(message: string, fn: () => T): T {
    return expectMessageMany([message], fn);
  }

  function expectMessageMany<T>(messages: Array<string>, fn: () => T): T {
    if (contextualExpectedMessage.length > 0) {
      throw new Error(`Cannot nest ${expectFunctionName}() calls.`);
    }
    contextualExpectedMessage.push(...messages);
    const result = fn();
    if (contextualExpectedMessage.length > 0) {
      const notFired = contextualExpectedMessage.toString();
      contextualExpectedMessage.length = 0;
      throw new Error(`Expected ${typename} in callback: ${notFired}`);
    }
    return result;
  }

  return {
    disallowMessages,
    expectMessageWillFire,
    expectMessage,
    expectMessageMany,
  };
}

module.exports = {
  createConsoleInterceptionSystem,
};
