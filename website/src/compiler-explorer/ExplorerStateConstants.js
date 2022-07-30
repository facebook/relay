/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

export const DEFAULT_SCHEMA = `
type User {
  name: String
  age: Int
  best_friend: User
}

type Query {
  me: User
}
 `.trim();

export const DEFAULT_DOCUMENT = `
query MyQuery {
  me {
    name
    ...AgeFragment
    best_friend {
      ...AgeFragment
    }
  }
}

fragment AgeFragment on User {
  age
}
 `.trim();

export const FEATURE_FLAGS = [
  {
    key: 'enable_flight_transform',
    label: 'Flight Transforms',
    kind: 'bool',
    default: true,
  },
  {
    key: 'hash_supported_argument',
    label: 'Hash Supported Argument',
    kind: 'enum',
    default: true,
  },
  {key: 'no_inline', label: '@no_inline', kind: 'enum', default: true},
  {
    key: 'enable_3d_branch_arg_generation',
    label: '3D Branch Arg Generation',
    kind: 'bool',
    default: true,
  },
  {
    key: 'actor_change_support',
    label: 'Actor Change Support',
    kind: 'enum',
    default: true,
  },
  {
    key: 'text_artifacts',
    label: 'Text Artifacts',
    kind: 'enum',
    default: true,
  },
  {
    key: 'enable_client_edges',
    label: 'Client Edges',
    kind: 'enum',
    default: true,
  },
];

export const DEFAULT_STATE = {
  schemaText: DEFAULT_SCHEMA,
  documentText: DEFAULT_DOCUMENT,
  outputType: 'operation',
  featureFlags: Object.fromEntries(FEATURE_FLAGS.map(f => [f.key, f.default])),
  language: 'typescript',
};
