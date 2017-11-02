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

const RelayQueryConfig = require('../query-config/RelayQueryConfig');

const forEachObject = require('forEachObject');
const invariant = require('invariant');

import type {ConfigQueries} from '../query-config/RelayQueryConfig';
import type URI from 'URI';

type ParamDefinition = {
  type: string,
  required: boolean,
};
type StringOrURI = string | URI;
type URICreator = (routeConstructor: any, params: Object) => ?StringOrURI;

export type ParamDefinitions = {[param: string]: ParamDefinition};

let createURI: $FlowIssue = () => null;

/**
 * Describes the root queries, param definitions and other metadata for a given
 * path (URI).
 */
class RelayRoute<Tv: Object> extends RelayQueryConfig<Tv> {
  uri: ?StringOrURI;

  static path: ?string;
  static paramDefinitions: ?ParamDefinitions;
  static +prepareParams: ?(prevParams: Tv) => Tv;
  static queries: ?ConfigQueries;
  static routeName: string;

  constructor(initialVariables?: ?Tv, uri?: StringOrURI) {
    super(initialVariables);
    const constructor = this.constructor;
    const {routeName, path} = constructor;

    invariant(
      constructor !== RelayRoute,
      'RelayRoute: Abstract class cannot be instantiated.',
    );
    invariant(
      routeName,
      '%s: Subclasses of RelayRoute must define a `routeName`.',
      constructor.name || '<<anonymous>>',
    );

    // $FlowIssue #9905535 - Object.defineProperty doesn't understand getters
    Object.defineProperty(this, 'uri', {
      enumerable: true,
      get: function() {
        if (!uri && path) {
          uri = createURI(constructor, this.params);
        }
        return uri;
      },
    });
  }

  prepareVariables(prevVariables: ?Tv): ?Tv {
    const {paramDefinitions, prepareParams, routeName} = this.constructor;
    let params = prevVariables;
    if (prepareParams) {
      /* $FlowFixMe(>=0.17.0) - params is ?Tv but prepareParams expects Tv */
      params = prepareParams(params);
    }
    if (paramDefinitions) {
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
    }
    return params;
  }

  static injectURICreator(creator: URICreator): void {
    createURI = creator;
  }
}

module.exports = RelayRoute;
