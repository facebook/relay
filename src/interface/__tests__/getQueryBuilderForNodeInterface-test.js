/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

jest.dontMock('getQueryBuilderForNodeInterface');

var getQueryBuilderForNodeInterface = require('getQueryBuilderForNodeInterface');

describe('a function built with getQueryBuilderForNodeInterface()', () => {
  const CHILDREN = ['children', 'children'];
  const IDENTIFYING_ARG_VALUE = 'identifyingArgValue';
  const METADATA = {some: 'metadata'};
  const NAME = 'Name';

  let RelayNodeInterface;
  let buildQuery;

  beforeEach(() => {
    jest.resetModuleRegistry();
    RelayNodeInterface = jest.genMockFromModule('RelayNodeInterface');
    buildQuery = getQueryBuilderForNodeInterface(RelayNodeInterface);
  });

  it('augments arguments then proxies to RelayQuery.Root.build', () => {
    const RelayQuery = require('RelayQuery');
    RelayQuery.Root.build = jest.genMockFunction();
    buildQuery(
      IDENTIFYING_ARG_VALUE,
      CHILDREN,
      METADATA,
      NAME
    );
    expect(RelayQuery.Root.build).toBeCalledWith(
      RelayNodeInterface.NODE,
      IDENTIFYING_ARG_VALUE,
      CHILDREN,
      {...METADATA, identifyingArgName: RelayNodeInterface.ID},
      NAME
    );
  });
});
