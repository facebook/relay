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

// Note: This is purposefully not using Flow because the Rust Relay Compiler
// will execute it directly with Node.

const {join} = require('path');

/**
 * Due to difference in how files are organized on GitHub and how they are
 * organized in Meta's internal repo, this config needs to emit different
 * paths depending on the environment.
 */
function makeConfig() {
  const IS_OSS = !__dirname.includes('__github__');
  const basePath = IS_OSS ? 'packages' : '../..';
  return {
    root: IS_OSS ? '..' : '.',
    name: 'tests',
    sources: {
      '': 'tests',
    },
    excludes: ['**/node_modules/**'],
    header: [
      'Copyright (c) Meta Platforms, Inc. and affiliates.',
      '',
      'This source code is licensed under the MIT license found in the',
      'LICENSE file in the root directory of this source tree.',
      '',
      '@oncall relay',
    ],
    projects: {
      tests: {
        enumModuleSuffix: null,
        schema: join(basePath, 'relay-test-utils-internal/testschema.graphql'),
        schemaConfig: {
          nonNodeIdFields: {
            allowedIdTypes: {
              IDFieldTests: 'IDFieldIsID',
              NonNode: 'NonNodeID',
            },
          },
          deferStreamInterface: {
            deferName: 'defer',
            streamName: 'stream',
            ifArg: 'if',
            labelArg: 'label',
            initialCountArg: 'initial_count',
            useCustomizedBatchArg: 'use_customized_batch',
          },
        },
        schemaExtensions: [
          join(basePath, 'relay-test-utils-internal/schema-extensions'),
        ],
        customScalarTypes: {
          OpaqueScalarType: {
            name: 'OpaqueScalarType',
            path: '../OpaqueScalarType',
          },
        },
        jsModuleFormat: 'commonjs',
        moduleImportConfig: {
          dynamicModuleProvider: {
            mode: 'Custom',
            statement: "() => require('./.<$module>')",
          },
          surface: 'resolvers',
        },
        featureFlags: {
          no_inline: {
            kind: 'enabled',
          },
          actor_change_support: {
            kind: 'enabled',
          },
          relay_resolver_enable_interface_output_type: {
            kind: 'enabled',
          },
          enable_exec_time_resolvers_directive: true,
        },
        language: 'flow',
        resolverContextType: {
          name: 'TestResolverContextType',
          path: join(
            basePath,
            'relay-runtime/mutations/__tests__/TestResolverContextType',
          ),
        },
      },
    },
    isDevVariableName: '__DEV__',
  };
}

module.exports = makeConfig();
