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

const FSMock = require('../__mocks__/FSMock');

const fs = require('fs');
const invariant = require('invariant');
const nullthrows = require('nullthrows');
const path = require('path');

const {
  createEmptyState,
  deserializeState,
  serializeState,
  updateState,
} = require('../Artifacts');
const {parse} = require('graphql');

import type {ArtifactState, ArtifactMap} from '../Artifacts';
import type {ExecutableDefinitionNode} from 'graphql';
import type {SourceChanges} from 'relay-compiler';

FSMock.install();

function getFragment(graphqlText: string): ExecutableDefinitionNode {
  const ast = parse(graphqlText);
  const definition = nullthrows(ast.definitions[0]);
  invariant(
    definition.kind === 'FragmentDefinition',
    'Expected a fragment definition',
  );
  return definition;
}

function createNonEmptyState(): ArtifactState {
  return {
    artifacts: new Map([
      ['FragOne', new Set(['FragOne.graphql.js', 'FragOne.php'])],
      ['FragTwo', new Set(['FragTwo.graphql.js'])],
    ]),
    metadata: new Map([
      ['FragOne.graphql.js', 'f1a'],
      ['FragOne.php', 'f1b'],
      ['FragTwo.graphql.js', 'f2a'],
    ]),
  };
}

function createFileThreeChanges(): SourceChanges<ExecutableDefinitionNode> {
  return {
    added: [
      {
        file: 'Three.js',
        ast: getFragment('fragment FragThree on User { id }'),
      },
    ],
    removed: [],
  };
}

function createFileThreeGeneratedArtifacts(): ArtifactMap {
  return {
    artifacts: new Map([['FragThree', new Set(['FragThree.graphql.js'])]]),
    metadata: new Map([['FragThree.graphql.js', 'f3a']]),
  };
}

const updateFileOneChanges: SourceChanges<ExecutableDefinitionNode> = {
  added: [
    {
      file: 'One.js',
      ast: getFragment('fragment FragOne on User { v2 }'),
    },
  ],
  removed: [
    {
      file: 'One.js',
      ast: getFragment('fragment FragOne on User { v1 }'),
    },
  ],
};

const updateFileOneGeneratedArtifacts: ArtifactMap = {
  artifacts: new Map([['FragOne', new Set(['FragOne.graphql.js'])]]),
  metadata: new Map([['FragOne.graphql.js', 'f1a-updated']]),
};

function deleteFileOneChanges(): SourceChanges<ExecutableDefinitionNode> {
  return {
    added: [],
    removed: [
      {
        file: 'One.js',
        ast: getFragment('fragment FragOne on User { id }'),
      },
    ],
  };
}

function relativePathResolver(relativePath) {
  return path.join('base', 'dir', relativePath);
}

describe('serialization', () => {
  function testRoundTripSerialization(state) {
    const json = JSON.stringify(serializeState(state));
    const deserializedState = deserializeState(JSON.parse(json));
    expect(deserializedState).toEqual(state);
  }

  test('round trip serialization of empty state', () => {
    testRoundTripSerialization(createEmptyState());
  });

  test('round trip serialization of non-empty state', () => {
    testRoundTripSerialization(createNonEmptyState());
  });
});

describe('updateState', () => {
  test('new file on empty state', () => {
    const nextState = updateState(
      createEmptyState(),
      createFileThreeChanges(),
      createFileThreeGeneratedArtifacts(),
      fs,
      relativePathResolver,
    );
    expect(nextState).toMatchInlineSnapshot(`
      Object {
        "artifacts": Map {
          "FragThree" => Set {
            "FragThree.graphql.js",
          },
        },
        "metadata": Map {
          "FragThree.graphql.js" => "f3a",
        },
      }
    `);
  });

  test('new file on non empty state', () => {
    const nextState = updateState(
      createNonEmptyState(),
      createFileThreeChanges(),
      createFileThreeGeneratedArtifacts(),
      fs,
      relativePathResolver,
    );
    expect(nextState).toMatchInlineSnapshot(`
      Object {
        "artifacts": Map {
          "FragOne" => Set {
            "FragOne.graphql.js",
            "FragOne.php",
          },
          "FragTwo" => Set {
            "FragTwo.graphql.js",
          },
          "FragThree" => Set {
            "FragThree.graphql.js",
          },
        },
        "metadata": Map {
          "FragOne.graphql.js" => "f1a",
          "FragOne.php" => "f1b",
          "FragTwo.graphql.js" => "f2a",
          "FragThree.graphql.js" => "f3a",
        },
      }
    `);
  });

  test('delete file with artifacts', () => {
    const nextState = updateState(
      createNonEmptyState(),
      deleteFileOneChanges(),
      createEmptyState(),
      fs,
      relativePathResolver,
    );

    FSMock.expectDeletion(path.join('base', 'dir', 'FragOne.graphql.js'));
    FSMock.expectDeletion(path.join('base', 'dir', 'FragOne.php'));
    expect(nextState).toMatchInlineSnapshot(`
      Object {
        "artifacts": Map {
          "FragTwo" => Set {
            "FragTwo.graphql.js",
          },
        },
        "metadata": Map {
          "FragTwo.graphql.js" => "f2a",
        },
      }
    `);
  });

  test('delete file without artifacts', () => {
    const nextState = updateState(
      createEmptyState(),
      deleteFileOneChanges(),
      createEmptyState(),
      fs,
      relativePathResolver,
    );
    expect(nextState).toMatchInlineSnapshot(`
      Object {
        "artifacts": Map {},
        "metadata": Map {},
      }
    `);
  });

  test('update file', () => {
    const nextState = updateState(
      createNonEmptyState(),
      updateFileOneChanges,
      updateFileOneGeneratedArtifacts,
      fs,
      relativePathResolver,
    );

    // the new FragOne no longer generates the php file
    FSMock.expectDeletion(path.join('base', 'dir', 'FragOne.php'));

    expect(nextState).toMatchInlineSnapshot(`
      Object {
        "artifacts": Map {
          "FragOne" => Set {
            "FragOne.graphql.js",
          },
          "FragTwo" => Set {
            "FragTwo.graphql.js",
          },
        },
        "metadata": Map {
          "FragOne.graphql.js" => "f1a-updated",
          "FragTwo.graphql.js" => "f2a",
        },
      }
    `);
  });

  test('update file updating other artifact', () => {
    const generatedArtifacts: ArtifactMap = {
      artifacts: new Map([
        ['FragOne', new Set(['FragOne.graphql.js', 'FragOne.php'])],
        ['FragTwo', new Set(['FragTwo.graphql.js'])],
      ]),
      metadata: new Map([
        ['FragOne.graphql.js', 'f1a-updated'],
        ['FragOne.php', 'f1b-updated'],
        ['FragTwo.graphql.js', 'f2a-updated'],
      ]),
    };

    const nextState = updateState(
      createNonEmptyState(),
      updateFileOneChanges,
      generatedArtifacts,
      fs,
      relativePathResolver,
    );

    expect(nextState).toMatchInlineSnapshot(`
      Object {
        "artifacts": Map {
          "FragOne" => Set {
            "FragOne.graphql.js",
            "FragOne.php",
          },
          "FragTwo" => Set {
            "FragTwo.graphql.js",
          },
        },
        "metadata": Map {
          "FragOne.graphql.js" => "f1a-updated",
          "FragOne.php" => "f1b-updated",
          "FragTwo.graphql.js" => "f2a-updated",
        },
      }
    `);
  });

  test('create file updating other artifact', () => {
    const generatedArtifacts: ArtifactMap = {
      artifacts: new Map([
        ['FragOne', new Set(['FragOne.graphql.js'])],
        ['FragThree', new Set(['FragThree.graphql.js'])],
      ]),
      metadata: new Map([
        ['FragOne.graphql.js', 'f1a-updated'],
        ['FragThree.graphql.js', 'f3a'],
      ]),
    };

    const nextState = updateState(
      createNonEmptyState(),
      createFileThreeChanges(),
      generatedArtifacts,
      fs,
      relativePathResolver,
    );

    // the new FragOne no longer generates the php file
    FSMock.expectDeletion(path.join('base', 'dir', 'FragOne.php'));

    expect(nextState).toMatchInlineSnapshot(`
      Object {
        "artifacts": Map {
          "FragOne" => Set {
            "FragOne.graphql.js",
          },
          "FragTwo" => Set {
            "FragTwo.graphql.js",
          },
          "FragThree" => Set {
            "FragThree.graphql.js",
          },
        },
        "metadata": Map {
          "FragOne.graphql.js" => "f1a-updated",
          "FragTwo.graphql.js" => "f2a",
          "FragThree.graphql.js" => "f3a",
        },
      }
    `);
  });
});
