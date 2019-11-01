/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

const actualDeletedFiles = [];
const expectedDeletedFiles = [];

function install() {
  beforeEach(beforeEachCallback);
  afterEach(afterEachCallback);
}

function beforeEachCallback() {
  jest.mock('fs', () => ({
    unlinkSync(name: string): void {
      actualDeletedFiles.push(name);
    },
    existsSync(name: string): boolean {
      return true;
    },
  }));
  actualDeletedFiles.length = 0;
  expectedDeletedFiles.length = 0;
}

function afterEachCallback() {
  expect(actualDeletedFiles).toEqual(expectedDeletedFiles);
}

function expectDeletion(filepath: string): void {
  expectedDeletedFiles.push(filepath);
}

module.exports = {
  install,
  expectDeletion,
};
