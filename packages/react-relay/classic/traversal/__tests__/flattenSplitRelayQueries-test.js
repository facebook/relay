/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

require('configureForRelayOSS');

const RelayClassic_DEPRECATED = require('RelayClassic_DEPRECATED');
const RelayTestUtils = require('RelayTestUtils');

const flattenSplitRelayQueries = require('../flattenSplitRelayQueries');

describe('flattenSplitRelayQueries', () => {
  function getQuery() {
    return RelayTestUtils.getNode(
      RelayClassic_DEPRECATED.QL`query{node(id:"4"){id}}`,
    );
  }

  it('returns an empty array when there are no queries', () => {
    const split = {
      required: null,
      deferred: [],
    };
    expect(flattenSplitRelayQueries(split)).toEqual([]);
  });

  it('returns a single required query', () => {
    const split = {
      required: getQuery(),
      deferred: [],
    };
    expect(flattenSplitRelayQueries(split)).toEqual([split.required]);
  });

  it('returns a single deferred query', () => {
    const split = {
      required: null,
      deferred: [
        {
          required: getQuery(),
          deferred: [],
        },
      ],
    };
    expect(flattenSplitRelayQueries(split)).toEqual([
      split.deferred[0].required,
    ]);
  });

  it('returns required then deferred queries', () => {
    const split = {
      required: getQuery(),
      deferred: [
        {
          required: getQuery(),
          deferred: [],
        },
        {
          required: getQuery(),
          deferred: [],
        },
      ],
    };
    expect(flattenSplitRelayQueries(split)).toEqual([
      split.required,
      split.deferred[0].required,
      split.deferred[1].required,
    ]);
  });

  it('handles nested deferreds', () => {
    const split = {
      required: getQuery(),
      deferred: [
        {
          required: getQuery(),
          deferred: [
            {
              required: getQuery(),
              deferred: [],
            },
          ],
        },
      ],
    };
    expect(flattenSplitRelayQueries(split)).toEqual([
      split.required,
      split.deferred[0].required,
      split.deferred[0].deferred[0].required,
    ]);
  });
});
