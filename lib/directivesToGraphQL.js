/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule directivesToGraphQL
 * 
 * @typechecks
 */

'use strict';

var QueryBuilder = require('./QueryBuilder');

/**
 * @internal
 *
 * Convert plain object `{name, arguments}` directives to GraphQL directive
 * nodes.
 */
function directivesToGraphQL(directives) {
  return directives.map(function (_ref) {
    var name = _ref.name;
    var args = _ref.args;

    var concreteArguments = args.map(function (_ref2) {
      var name = _ref2.name;
      var value = _ref2.value;

      var concreteArgument = null;
      if (Array.isArray(value)) {
        concreteArgument = value.map(QueryBuilder.createCallValue);
      } else if (value != null) {
        concreteArgument = QueryBuilder.createCallValue(value);
      }
      return QueryBuilder.createDirectiveArgument(name, concreteArgument);
    });
    return QueryBuilder.createDirective(name, concreteArguments);
  });
}

module.exports = directivesToGraphQL;