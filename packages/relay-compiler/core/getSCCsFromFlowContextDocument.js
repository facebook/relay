/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getSCCsFromFlowContextDocument
 * @flow
 * @format
 */

'use strict';

const {getRawType} = require('GraphQLSchemaUtils');
const {
  GraphQLInputType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
} = require('graphql');

import type {Root} from 'GraphQLIR';

function flatten(arr) {
  return arr ? Array.prototype.concat.apply([], arr) : arr;
}

function inputObjectType(type: GraphQLInputType): GraphQLInputObjectType {
  const baseType = getRawType(type);
  if (!(baseType instanceof GraphQLInputObjectType))
    throw new Error(
      `${type.toString()} does not contain a GraphQLInputObjectType`,
    );
  return baseType;
}

function baseInputObjects(type: GraphQLInputType) {
  const fields = inputObjectType(type).getFields();
  return Object.keys(fields)
    .map(k => fields[k])
    .filter(
      field => getRawType(field.type) instanceof GraphQLInputObjectType,
    );
}

function buildInputObjectGraph(graph, input) {
  const k = input.name;
  if (graph.hasOwnProperty(k)) return graph;
  const updated = {
    ...graph,
    [k]: baseInputObjects(input.type).map(obj => obj.name),
  };
  return baseInputObjects(input.type).reduce(buildInputObjectGraph, updated);
}

function getInputObjectGraph(node: Root) {
  return flatten(
    node.argumentDefinitions
      .filter(arg => getRawType(arg.type) instanceof GraphQLInputObjectType)
      .map(arg => baseInputObjects(arg.type)),
  ).reduce(buildInputObjectGraph, {});
}

function transposeGraph(graph) {
  const transposed = Object.keys(graph).reduce(
    (g, k) => Object.assign(g, {[k]: []}),
    {},
  );
  Object.keys(graph).forEach(k => {
    graph[k].forEach(node => {
      transposed[node].push(k);
    });
  });
  return transposed;
}

function initVisited(graph) {
  return Object.keys(graph).reduce(
    (v, k) => Object.assign(v, {[k]: false}),
    {},
  );
}

function graphDFS(graph, key, visited, cb) {
  visited[key] = true;
  graph[key].forEach(node => {
    if (!visited[node]) graphDFS(graph, node, visited, cb);
    cb(node);
  });
}

function graphOrderNodes(graph) {
  const visited = initVisited(graph);
  const orderedNodes = [];
  Object.keys(graph).forEach(k => {
    if (!visited[k])
      graphDFS(graph, k, visited, node => {
        orderedNodes.push(node);
      });
  });
  return orderedNodes;
}

function graphSCCs(graph, orderedNodes) {
  const visited = initVisited(graph);
  const sccs = [[]];
  orderedNodes.reverse().forEach(k => {
    if (!visited[k]) {
      graphDFS(graph, k, visited, node => {
        sccs[sccs.length - 1].push(node);
      });
      sccs.push([]);
    }
  });
  return sccs;
}

function getInputObjectSCCs(node: Root) {
  const graph = getInputObjectGraph(node);
  const orderedNodes = graphOrderNodes(graph);
  const transposed = transposeGraph(graph);
  return graphSCCs(transposed, orderedNodes).filter(arr => arr.length);
}

module.exports = {
  getInputObjectSCCs,
};
