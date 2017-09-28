/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @providesModule getIdentifierForSelection
 * @format
 */

'use strict';

const invariant = require('invariant');
const stableJSONStringify = require('../util/stableJSONStringifyOSS');

import type {Selection} from './GraphQLIR';

/**
 * Generates an identifier that is unique to a given selection: the alias for
 * fields, the type for inline fragments, and a summary of the condition
 * variable and passing value for conditions.
 */
function getIdentifierForSelection(node: Selection): string {
  let obj;
  switch (node.kind) {
    case 'LinkedField':
    case 'ScalarField':
      obj = {
        directives: node.directives,
        field: node.alias || node.name,
      };
      break;
    case 'InlineFragment':
      obj = {
        inlineFragment: node.typeCondition.toString(),
      };
      break;
    case 'Condition':
      obj = {
        condition: node.condition,
        passingValue: node.passingValue,
      };
      break;
    case 'FragmentSpread':
      obj = {
        fragmentSpread: node.name,
        args: node.args,
      };
      break;
    default:
      invariant(
        false,
        'getIdentifierForSelection: Unexpected kind `%s`.',
        node.kind,
      );
  }
  return stableJSONStringify(obj);
}

module.exports = getIdentifierForSelection;
