/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

jest.disableAutomock();

const RelayCompilerContext = require('RelayCompilerContext');
const RelayIRTransformer = require('RelayIRTransformer');
const RelayTestSchema = require('RelayTestSchema');

const parseGraphQLText = require('parseGraphQLText');

describe('RelayIRTransformer', () => {
  it('visits all node types', () => {
    const {definitions} = parseGraphQLText(RelayTestSchema, `
      query TestQuery($id: ID!) {
        node(id: $id) {
          ...on User {
            id
            ...UserProfile @include(if: $condition)
          }
          ...Foo @arguments(localId: $id)
        }
      }

      query ObjectArgumentQuery($text: String!) {
        checkinSearchQuery(query: {
          query: $text
        }) {
          query
        }
      }

      query ListArgumentQuery($waypoint: WayPoint!) {
        route(waypoints: [$waypoint, {
          lat: "0.0"
          lon: "0.0"
        }]) {
          steps {
            note
          }
        }
      }

      fragment UserProfile on User {
        profilePicture(size: $ProfilePicture_SIZE) {
          ...PhotoFragment
        }
      }

      fragment PhotoFragment on Image @argumentDefinitions(
        id: {type: "ID", nonNull: true}
        sizes: {type: "Int", list: true, defaultValue: [32, 64, 128]}
        scale: {type: "Int", imports: "globalScale"}
      ) {
        uri
      }
    `);
    const context = (new RelayCompilerContext(RelayTestSchema)).addAll(definitions);

    const astKinds = [
      'Argument',
      'Condition',
      // Currently skipped as there's no concise way to add a directive
      // 'Directive',
      'Fragment',
      'FragmentSpread',
      'InlineFragment',
      'LinkedField',
      'ListValue',
      'Literal',
      'LocalArgumentDefinition',
      'ObjectFieldValue',
      'ObjectValue',
      'Root',
      'ScalarField',
      'Variable',
    ];

    const sequence = [];
    const seenKinds = new Set();
    function createRecorder(kind) {
      return function(node, state) {
        expect(node.kind).toBe(kind);
        sequence.push(kind);
        seenKinds.add(kind);
        return this.traverse(node, state);
      };
    }

    const visitors = {};
    astKinds.forEach(kind => {
      visitors[kind] = createRecorder(kind);
    });
    RelayIRTransformer.transform(
      context,
      visitors,
      (node) => {
        sequence.push(`init state: ${node.kind} ${node.name}`);
        return {};
      }
    );

    expect(Array.from(astKinds).sort()).toEqual(Array.from(seenKinds).sort());
    expect(sequence).toMatchSnapshot();
  });
});
