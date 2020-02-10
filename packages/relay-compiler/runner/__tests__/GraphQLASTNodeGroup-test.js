/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 * @flow strict-local
 */

// flowlint ambiguous-object-type:error

'use strict';

const GraphQL = require('graphql');
const GraphQLNodeMap = require('../GraphQLNodeMap');

const invariant = require('invariant');

const {forChanges, forFullBuild} = require('../GraphQLASTNodeGroup');

import type {NodeGroup} from '../GraphQLASTNodeGroup';

function createNodeMap(source: string) {
  const nodes = GraphQL.parse(source).definitions.map(node => {
    invariant(
      node.kind === 'FragmentDefinition' || node.kind === 'OperationDefinition',
      'createNodeMap: source should only contain definitions',
    );
    return node;
  });
  return GraphQLNodeMap.from(nodes);
}

function formatResult(input: NodeGroup) {
  const base = [];
  const main = [];
  for (const name of input.nodes.keys()) {
    if (input.baseNames.has(name)) {
      base.push(name);
    } else {
      main.push(name);
    }
  }
  base.sort();
  main.sort();
  return {base, main};
}

describe('forFullBuild', () => {
  test('without base nodes', () => {
    const output = forFullBuild(
      createNodeMap(`
        query Q1 { ...F1 }
        fragment F1 on T { ...F2, ...NonExistent }
        fragment F2 on T { ...F3 }
        fragment F3 on T { x }
      `),
      [],
    );
    expect(formatResult(output)).toEqual({
      main: ['F1', 'F2', 'F3', 'Q1'],
      base: [],
    });
  });

  test('with base nodes', () => {
    const output = forFullBuild(
      createNodeMap(`
        query Q1 { ...F1 }
        fragment F1 on T { ...F2, ...NonExistent }
        fragment F2 on T { ...F3 }
      `),
      [
        createNodeMap(`
          fragment F3 on T { x }
          query QUnrelated { ...FUnrelated }
          fragment FUnrelated on T { x }
        `),
      ],
    );
    expect(formatResult(output)).toEqual({
      base: ['F3'],
      main: ['F1', 'F2', 'Q1'],
    });
  });
});

describe('forChanges', () => {
  it('should return empty result in no changes', () => {
    const nodeMap = createNodeMap(`
      query Q1 { id, name }
    `);
    const changedNames = new Set([]);
    const output = forChanges(nodeMap, changedNames);
    expect(formatResult(output)).toEqual({
      base: [],
      main: [],
    });
  });

  it('should handle added file', () => {
    const nodeMap = createNodeMap(`
      query Q1 { id, name }
      query Q2 { id, name }
    `);
    const changedNames = new Set(['Q2']);
    const output = forChanges(nodeMap, changedNames);
    expect(formatResult(output)).toEqual({
      base: [],
      main: ['Q2'],
    });
  });

  it('should handle updated fragment', () => {
    const nodeMap = createNodeMap(`
      query Q1 { id, name }
      query Q2 { id, ...F1 }
      fragment F1 on User { name }
    `);
    const changedNames = new Set(['F1']);
    const output = forChanges(nodeMap, changedNames);
    expect(formatResult(output)).toEqual({
      base: [],
      main: ['F1', 'Q2'],
    });
  });

  it('should handle updated fragment name', () => {
    const nodeMap = createNodeMap(`
      query Q1 { id, name }
      query Q2 { id, ...F1 }
      fragment F1 on User { name, ...F2 }
      fragment F2_Updated on User { profile_picture }
    `);
    const changedNames = new Set(['F2_Updated', 'F2']);
    const output = forChanges(nodeMap, changedNames);
    expect(formatResult(output)).toEqual({
      base: [],
      main: ['F1', 'F2_Updated', 'Q2'],
    });
  });

  it('should handle deleted query', () => {
    const nodeMap = createNodeMap(`
      query Q1 { id, name }
      query Q2 { id, name }
    `);
    const changedNames = new Set(['Q3']);
    const output = forChanges(nodeMap, changedNames);
    expect(formatResult(output)).toEqual({
      base: [],
      main: [],
    });
  });

  it('should handle changes in multiple fragments', () => {
    const nodeMap = createNodeMap(`
      query Q1 { ...F1 }
      fragment F1 on User { id ...F2_3D }
      fragment F2_3D on User { name }
      query Q2 { id, ...F2_3D }
    `);
    const changedNames = new Set(['Q1']);
    const output = forChanges(nodeMap, changedNames);
    expect(formatResult(output)).toEqual({
      base: [],
      main: ['F1', 'F2_3D', 'Q1'],
    });
  });

  it('should handle deleted fragment', () => {
    const nodeMap = createNodeMap(`
      query Q1 { id, name }
      query Q2 { id, name, ...F1 }
      fragment F1 on User { name, ...F2 }
      fragment F2 on User { profile_picture, ...F3 }
      query Q3 { id, ...F3 }
    `);
    const changedNames = new Set(['F3']);
    const output = forChanges(nodeMap, changedNames);
    expect(formatResult(output)).toEqual({
      base: [],
      main: ['F1', 'F2', 'Q2', 'Q3'],
    });
  });

  describe('with baseASTCaches', () => {
    it('should include documents from base AST cache (added)', () => {
      const baseCaches = [
        createNodeMap(`
          fragment BF1 on User { name, ...BF2 }
          fragment BF2 on User { profile_picture, ...BF3 }
        `),
        createNodeMap(`
          fragment BF3 on User { id }
        `),
      ];
      const nodeMap = createNodeMap(`
        query Q1 { id, name, ...F1 }
        fragment F1 on User { id, ...BF1 }
      `);
      const changedNames = new Set(['Q1']);
      const output = forChanges(nodeMap, changedNames, baseCaches);
      expect(formatResult(output)).toEqual({
        base: ['BF1', 'BF2', 'BF3'],
        main: ['F1', 'Q1'],
      });
    });

    it('should include documents from base AST cache (removed)', () => {
      const baseCaches = [
        createNodeMap(`
          query BQ1 { id, ...BF1 }
          fragment BF1 on User { name, ...BF2 }
          fragment BF2 on User { profile_picture, ...BF3 }
        `),
        createNodeMap(`
          fragment BF3 on User { id, name }
        `),
      ];
      const nodeMap = createNodeMap(`
        query Q1 { id, name, ...F1 }
        fragment F1 on User { id, ...F2, ...BF1 }
      `);
      const changedNames = new Set(['F2']);
      const output = forChanges(nodeMap, changedNames, baseCaches);
      expect(formatResult(output)).toEqual({
        base: ['BF1', 'BF2', 'BF3'],
        main: ['F1', 'Q1'],
      });
    });
  });
});
