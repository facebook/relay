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

// This contextual profiler can be used to wrap a react sub-tree. It will bind
// the RelayProfiler during the render phase of these components. Allows
// collecting metrics for a specific part of your application.

'use strict';

const React = require('react');

export type ProfilerContextType = {
  wrapPrepareQueryResource: <T>(cb: () => T) => T,
  ...
};

const ProfilerContext: React$Context<ProfilerContextType> = React.createContext(
  {
    wrapPrepareQueryResource: <T>(cb: () => T): T => {
      return cb();
    },
  },
);

module.exports = ProfilerContext;
