/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule directivesToGraphQL
 * @flow
 */

'use strict';

import type {ConcreteDirective} from 'ConcreteQuery';
import type {Directive} from 'RelayInternalTypes';
const QueryBuilder = require('QueryBuilder');

/**
 * @internal
 *
 * Convert plain object `{name, arguments}` directives to GraphQL directive
 * nodes.
 */
function directivesToGraphQL(
  directives: Array<Directive>
): Array<ConcreteDirective> {
  return directives.map(({name: directiveName, args}) => {
    const concreteArguments = args.map(({name: argName, value}) => {
      let concreteArgument = null;
      if (Array.isArray(value)) {
        concreteArgument = value.map(QueryBuilder.createCallValue);
      } else if (value != null)  {
        concreteArgument = QueryBuilder.createCallValue(value);
      }
      return QueryBuilder.createDirectiveArgument(argName, concreteArgument);
    });
    return QueryBuilder.createDirective(directiveName, concreteArguments);
  });
}

module.exports = directivesToGraphQL;
