/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const QueryBuilder = require('./QueryBuilder');

import type {Directive} from '../tools/RelayInternalTypes';
import type {ConcreteDirective} from './ConcreteQuery';

/**
 * @internal
 *
 * Convert plain object `{name, arguments}` directives to GraphQL directive
 * nodes.
 */
function directivesToGraphQL(
  directives: Array<Directive>,
): Array<ConcreteDirective> {
  return directives.map(({name: directiveName, args}) => {
    const concreteArguments = args.map(({name: argName, value}) => {
      let concreteArgument = null;
      if (Array.isArray(value)) {
        concreteArgument = value.map(QueryBuilder.createCallValue);
      } else if (value != null) {
        concreteArgument = QueryBuilder.createCallValue(value);
      }
      return QueryBuilder.createDirectiveArgument(argName, concreteArgument);
    });
    return QueryBuilder.createDirective(directiveName, concreteArguments);
  });
}

module.exports = directivesToGraphQL;
