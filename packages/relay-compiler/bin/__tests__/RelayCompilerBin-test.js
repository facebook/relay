/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

jest.mock('graphql-compiler');
jest.mock('yargs');
jest.mock('@babel/polyfill');

require('graphql-compiler');
const yargs = require('yargs');

describe('RelayCompilerBin', () => {
  let originalProcessExit;
  let originalConsoleError;

  const mockCliArguments = (schema = './', src = './', persistOutput = './') => {
    yargs.usage.mockImplementation(() => ({
        options: () => ({
          help: () => ({
            argv: {schema, src, 'persist-output': persistOutput},
          }),
        }),
      })
    );
  };

  beforeEach(() => {
    jest.resetModules();
    originalProcessExit = process.exit;
    originalConsoleError = console.error;
    process.exit = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    process.exit = originalProcessExit;
    console.error = originalConsoleError;
  });

  test('should throw error when schema path does not exist', async () => {
    mockCliArguments('./some/path/schema.graphql');

    await require('../RelayCompilerBin');

    expect(console.error).toBeCalled();
    expect(console.error.mock.calls[0][0]).toEqual(expect.stringContaining('Error: --schema path does not exist:'));
    expect(process.exit).toBeCalled();
    expect(process.exit.mock.calls[0][0]).toEqual(1);
  });

  test('should throw error when src path does not exist', async () => {
    mockCliArguments('./', './some/path/src');

    await require('../RelayCompilerBin');

    expect(console.error).toBeCalled();
    expect(console.error.mock.calls[0][0]).toEqual(expect.stringContaining('Error: --src path does not exist:'));
    expect(process.exit).toBeCalled();
    expect(process.exit.mock.calls[0][0]).toEqual(1);
  });

  test('should throw error when persist-output path does not exist', async () => {
    mockCliArguments('./', './', 'some/path/complete.queryMap.json');

    await require('../RelayCompilerBin');

    expect(console.error).toBeCalled();
    expect(console.error.mock.calls[0][0]).toEqual(expect.stringContaining('Error: --persist-output path does not exist:'));
    expect(process.exit).toBeCalled();
    expect(process.exit.mock.calls[0][0]).toEqual(1);
  });

  test('should throw error when persist-output path does not end with a .json extension', async () => {
    mockCliArguments('./', './', './queryMap.graphql.js');

    await require('../RelayCompilerBin');

    expect(console.error).toBeCalled();
    expect(console.error.mock.calls[0][0]).toEqual(expect.stringContaining('Error: --persist-output must be a path to a .json file'));
    expect(process.exit).toBeCalled();
    expect(process.exit.mock.calls[0][0]).toEqual(1);
  });
});
