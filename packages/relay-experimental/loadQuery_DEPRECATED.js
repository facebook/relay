/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const React = require('react');

const invariant = require('invariant');
const preloadQuery_DEPRECATED = require('./preloadQuery_DEPRECATED');

import type {
  PreloadableConcreteRequest,
  PreloadedQuery,
  PreloadOptions,
} from './EntryPointTypes.flow';
import type {
  GraphQLTaggedNode,
  IEnvironment,
  OperationType,
} from 'relay-runtime';

let RenderDispatcher = null;

function useTrackLoadQueryInRender() {
  if (RenderDispatcher === null) {
    // Flow does not know of React internals (rightly so), but we need to
    // ensure here that this function isn't called inside render.
    RenderDispatcher =
      // $FlowFixMe
      React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
        ?.ReactCurrentDispatcher?.current;
  }
}

function loadQuery<TQuery: OperationType, TEnvironmentProviderOptions>(
  environment: IEnvironment,
  preloadableRequest: GraphQLTaggedNode | PreloadableConcreteRequest<TQuery>,
  variables: $ElementType<TQuery, 'variables'>,
  options?: ?PreloadOptions,
  environmentProviderOptions?: ?TEnvironmentProviderOptions,
): PreloadedQuery<TQuery, TEnvironmentProviderOptions> {
  // Flow does not know of React internals (rightly so), but we need to
  // ensure here that this function isn't called inside render.
  const CurrentDispatcher =
    // $FlowFixMe
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
      ?.ReactCurrentDispatcher?.current;
  invariant(
    RenderDispatcher == null || CurrentDispatcher !== RenderDispatcher,
    'Relay: `preloadQuery` (or `prepareEntryPoint`) should not be called inside a React render function.',
  );
  return preloadQuery_DEPRECATED(
    environment,
    preloadableRequest,
    variables,
    options,
    environmentProviderOptions,
  );
}
module.exports = {loadQuery, useTrackLoadQueryInRender};
