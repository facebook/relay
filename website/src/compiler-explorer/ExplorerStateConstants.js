/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
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
    key: 'skip_printing_nulls',
    label: 'Skip Printing Nulls',
    kind: 'enum',
    default: false,
  },
  {
    key: 'compact_query_text',
    label: 'Compact Query Text',
    kind: 'enum',
    default: false,
  },
  {
    key: 'enforce_fragment_alias_where_ambiguous',
    label: 'Enforce @alias where ambiguous',
    kind: 'enum',
    default: true,
  },
];

export const DEFAULT_STATE = {
  schemaText: DEFAULT_SCHEMA,
  documentText: DEFAULT_DOCUMENT,
  inputWindow: 'schema',
  outputType: 'operation',
  featureFlags: Object.fromEntries(FEATURE_FLAGS.map(f => [f.key, f.default])),
  language: 'typescript',
};
