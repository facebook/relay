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
import type {RootQueries} from 'RelayContainer';
var RelayDeprecated = require('RelayDeprecated');

var forEachObject = require('forEachObject');
var invariant = require('invariant');

export type Params = {[name: string]: mixed};
type ParamDefinition = {
  type: string;
  required: boolean;
};
export type ParamDefinitions = {[param: string]: ParamDefinition};
type StringOrURI = string | URI;
type URICreator = (routeConstructor: any, params: Params) => ?StringOrURI;

var createURI: $FlowIssue = () => null;

/**
 * Describes the root queries, param definitions and other metadata for a given
 * path (URI).
 */
class RelayRoute {
  name: string;
  params: Params;
  queries: RootQueries;
  uri: ?StringOrURI;

  static path: ?string;
  static paramDefinitions: ?ParamDefinitions;
  static prepareParams: ?(prevParams: Params) => Params;
  static processQueryParams: ?(prevParams: Params) => Params;
  static queries: ?Object;
  static routeName: string;

  constructor(initialParams?: ?Object, uri?: StringOrURI) {
    var {constructor} = this;
    var {
      routeName,
      queries,
      paramDefinitions,
      path,
      prepareParams,
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

    var processQueryParams = constructor.processQueryParams;
    if (processQueryParams && !prepareParams) {
      RelayDeprecated.warn({
        was: routeName + '.processQueryParams',
        now: routeName + '.prepareParams',
      });
      prepareParams = processQueryParams;
    }

    var params = initialParams || {};
    if (prepareParams) {
      params = prepareParams(params);
    }

    queries = queries || {};
    if (!uri && path) {
      uri = createURI(constructor, params);
    }

    forEachObject(paramDefinitions, (paramDefinition, paramName) => {
      if (params.hasOwnProperty(paramName)) {
        return;
      }
      invariant(
        !paramDefinition.required,
        'RelayRoute: Missing required parameter `%s` in `%s`. Check the ' +
        'supplied params or URI (%s).',
        paramName,
        routeName,
        uri
      );
      // Backfill param so that a call variable is created for it.
      params[paramName] = undefined;
    });

    Object.defineProperty(this, 'name', {
      enumerable: true,
      value: routeName,
      writable: false,
    });
    Object.defineProperty(this, 'params', {
      enumerable: true,
      value: params,
      writable: false,
    });
    Object.defineProperty(this, 'queries', {
      enumerable: true,
      value: queries,
      writable: false,
    });
    Object.defineProperty(this, 'uri', {
      enumerable: true,
      value: uri,
      writable: false,
    });
    if (__DEV__) {
      Object.freeze(this.params);
      Object.freeze(this.queries);
    }
  }

  static injectURICreator(creator: URICreator): void {
    createURI = creator;
  }

}

module.exports = RelayRoute;
