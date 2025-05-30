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

module.exports = {
  root: true,
  // TODO - migrate this onto @react-native-community/eslint-config
  extends: ['fbjs'],
  plugins: ['jest', 'relay', 'react-hooks', 'relay-internal'],
  parser: 'hermes-eslint',
  rules: {
    // Consistency with internal config
    'no-class-assign': 'off',

    // This is very noisy, so disable
    'consistent-return': 'off',

    // Flow declares trip up the no-redeclare rule
    'no-redeclare': 'off',

    // Flow handles these rules
    'no-unreachable': 'off',

    // Prettier and ESLint may disagree on the following rules
    indent: 'off',
    'array-bracket-spacing': 'off',
    'comma-dangle': 'off',
    'max-len': 'off',
    'no-extra-parens': 'off',
    'space-before-function-paren': 'off',
    'ft-flow/object-type-delimiter': 'off',
    'babel/flow-object-type': 'off',

    // Tests do not need to follow relay naming rules
    'relay/graphql-naming': 'off',

    // TODO T31139228: remove or re-enable these once eslint-plugin-flowtype
    // is compatible with babel-eslint >= 8
    'no-undef': 'off',
    'no-unused-vars': [
      1,
      {
        args: 'none',
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],

    // This has a different name internally
    'no-label-var': 'off',

    // Relay uses console statements for debugging and compile feedback
    'no-console': [
      'warn',
      {
        allow: [
          'warn',
          'error',
          'debug',
          'time',
          'timeEnd',
          'timeStamp',
          'groupCollapsed',
          'groupEnd',
        ],
      },
    ],

    // Duplicating some errors that are enforced internally
    'prefer-const': 'error',
    'no-trailing-spaces': 'error',

    // These rules are not required with hermes-eslint
    'ft-flow/define-flow-type': 0,
    'ft-flow/use-flow-type': 0,

    // depreciated rules
    'no-spaced-func': 0,

    // Custom rules for our own codebase
    'relay-internal/no-mixed-import-and-require': 'error',
    'relay-internal/sort-imports': 'error',
  },
  overrides: [
    {
      files: ['packages/relay-runtime/**/*.js', 'packages/react-relay/**/*.js'],
      excludedFiles: [
        '**/__tests__/**',

        // The following files should eventually be migrated to not break this
        // rule. Until then, we'll grandfather them in here.
        // If anyone feels inspired, they can:
        //
        // 1. Remove a file from this list
        // 2. Run `yarn lint`
        // 3. Fix/supress all warnings
        // 4. Open a PR
        // 5. Profit?
        'packages/react-relay/relay-hooks/readFragmentInternal.js',
        'packages/react-relay/relay-hooks/useEntryPointLoader.js',
        'packages/react-relay/relay-hooks/useFragmentInternal_CURRENT.js',
        'packages/react-relay/relay-hooks/useFragmentInternal_EXPERIMENTAL.js',
        'packages/react-relay/relay-hooks/useQueryLoader.js',
        'packages/react-relay/relay-hooks/useQueryLoader_EXPERIMENTAL.js',
        'packages/relay-runtime/handlers/connection/MutationHandlers.js',
        'packages/relay-runtime/multi-actor-environment/MultiActorEnvironment.js',
        'packages/relay-runtime/mutations/RelayDeclarativeMutationConfig.js',
        'packages/relay-runtime/mutations/createUpdatableProxy.js',
        'packages/relay-runtime/store/DataChecker.js',
        'packages/relay-runtime/store/OperationExecutor.js',
        'packages/relay-runtime/store/RelayErrorTrie.js',
        'packages/relay-runtime/store/RelayExperimentalGraphResponseHandler.js',
        'packages/relay-runtime/store/RelayExperimentalGraphResponseTransform.js',
        'packages/relay-runtime/store/RelayModernStore.js',
        'packages/relay-runtime/store/RelayOperationTracker.js',
        'packages/relay-runtime/store/RelayRecordSource.js',
        'packages/relay-runtime/store/RelayReferenceMarker.js',
        'packages/relay-runtime/store/RelayResponseNormalizer.js',
        'packages/relay-runtime/store/live-resolvers/LiveResolverCache.js',
        'packages/relay-runtime/store/observeFragmentExperimental.js',
        'packages/relay-runtime/util/RelayReplaySubject.js',
        'packages/relay-runtime/util/getValueAtPath.js',
        'packages/relay-runtime/util/handlePotentialSnapshotErrors.js',
      ],
      rules: {
        'relay-internal/no-for-of-loops': 'error',
      },
    },
  ],
};
