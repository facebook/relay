/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRoute
 * @flow
 * @typechecks
 */

'use strict';

import type URI from 'URI';
import type {ConfigQueries} from 'RelayQueryConfig';
const RelayQueryConfig = require('RelayQueryConfig');

const forEachObject = require('forEachObject');
const invariant = require('invariant');

type ParamDefinition = {
  type: string;
  required: boolean;
};
export type ParamDefinitions = {[param: string]: ParamDefinition};
type StringOrURI = string | URI;
type URICreator = (routeConstructor: any, params: Object) => ?StringOrURI;

var createURI: $FlowIssue = () => null;

/**
 * Describes the root queries, param definitions and other metadata for a given
 * path (URI).
 */
class RelayRoute<Tv: Object> extends RelayQueryConfig<Tv> {
  uri: ?StringOrURI;

  static path: ?string;
  static paramDefinitions: ?ParamDefinitions;
  static prepareParams: ?(prevParams: Tv) => Tv;
  static queries: ?ConfigQueries;
  static routeName: string;

  constructor(initialVariables?: ?Tv, uri?: StringOrURI) {
    super(initialVariables);
    var constructor = this.constructor;
    var {
      routeName,
      path,
    } = constructor;

    invariant(
      constructor !== RelayRoute,
      'RelayRoute: Abstract class cannot be instantiated.'
    );
    invariant(
      routeName,
      '%s: Subclasses of RelayRoute must define a `routeName`.',
      constructor.name || '<<anonymous>>'
    );

    if (!uri && path) {
      uri = createURI(constructor, this.params);
    }

    Object.defineProperty(this, 'uri', {
      enumerable: true,
      value: uri,
      writable: false,
    });
  }

  prepareVariables(prevVariables: ?Tv): ?Tv {
    var {
      paramDefinitions,
      prepareParams,
      routeName,
    } = this.constructor;
    var params = prevVariables;
    if (prepareParams) {
      /* $FlowFixMe(>=0.17.0) - params is ?Tv but prepareParams expects Tv */
      params = prepareParams(params);
    }
    forEachObject(paramDefinitions, (paramDefinition, paramName) => {
      if (params) {
        if (params.hasOwnProperty(paramName)) {
          return;
        } else {
          // Backfill param so that a call variable is created for it.
          params[paramName] = undefined;
        }
      }
      invariant(
        !paramDefinition.required,
        'RelayRoute: Missing required parameter `%s` in `%s`. Check the ' +
        'supplied params or URI.',
        paramName,
        routeName,
      );
    });
    return params;
  }

  static injectURICreator(creator: URICreator): void {
    createURI = creator;
  }

}

module.exports = RelayRoute;
