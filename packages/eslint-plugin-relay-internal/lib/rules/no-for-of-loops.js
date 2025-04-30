/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

'use strict';

const rule = {
  meta: {
    messages: {
      forOfLoop:
        'for..of loops are not allowed. They get transformed into expensive iterator loops at build time.',
    },
  },
  create(context) {
    return {
      ForOfStatement: node => {
        context.report({node, messageId: 'forOfLoop'});
      },
    };
  },
};

module.exports = rule;
