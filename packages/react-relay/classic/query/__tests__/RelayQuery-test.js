/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

jest.enableAutomock().mock('warning');

require('configureForRelayOSS');

const QueryBuilder = require('QueryBuilder');
const Relay = require('Relay');
const RelayFragmentReference = require('RelayFragmentReference');
const RelayMetaRoute = require('RelayMetaRoute');
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

const {getClassicFragment, graphql} = require('RelayGraphQLTag');

describe('RelayQuery', () => {
  const {getNode} = RelayTestUtils;

  function buildIdField() {
    return RelayQuery.Field.build({
      fieldName: 'id',
      type: 'String',
    });
  }

  beforeEach(() => {
    jest.resetModules();

    expect.extend(RelayTestUtils.matchers);
  });

  describe('Root', () => {
    describe('build()', () => {
      it('creates roots', () => {
        const field = buildIdField();
        const root = RelayQuery.Root.build(
          'RelayQueryTest',
          'node',
          '4',
          [field],
          {},
          'Node',
          'FooRoute',
        );
        expect(root instanceof RelayQuery.Root).toBe(true);
        expect(root.getChildren().length).toBe(1);
        expect(root.getChildren()[0]).toBe(field);
        expect(root.getRoute().name).toBe('FooRoute');
      });

      it('creates deferred roots', () => {
        const field = buildIdField();
        const root = RelayQuery.Root.build(
          'RelayQueryTest',
          'node',
          '4',
          [field],
          {isDeferred: true},
        );
        expect(root instanceof RelayQuery.Root).toBe(true);
        expect(root.getChildren().length).toBe(1);
        expect(root.getChildren()[0]).toBe(field);
      });

      it('creates roots with batch calls', () => {
        const root = RelayQuery.Root.build(
          'RelayQueryTest',
          'node',
          QueryBuilder.createBatchCallVariable('q0', '$.*.id'),
          [],
        );
        expect(root instanceof RelayQuery.Root).toBe(true);
        expect(root.getBatchCall()).toEqual({
          refParamName: 'ref_q0',
          sourceQueryID: 'q0',
          sourceQueryPath: '$.*.id',
        });
      });

      // There are some cases where the identifyingArgValue is optional
      it('warns if the identifyingArgValue is missing', () => {
        const field = buildIdField();
        RelayQuery.Root.build('RelayQueryTest', 'node', null, [field], {
          isDeferred: true,
        });
        expect([
          'QueryBuilder.createQuery(): An argument value may be required for ' +
            'query `%s(%s: ???)`.',
          'node',
          'id',
        ]).toBeWarnedNTimes(1);
      });
      it('clones roots with different route', () => {
        const field = buildIdField();
        const root = RelayQuery.Root.build(
          'RelayQueryTest',
          'node',
          '4',
          [field],
          {},
          'Node',
          'FooRoute',
        );
        const newRoute = RelayMetaRoute.get('BarRoute');
        const clone = root.cloneWithRoute([field], newRoute);
        expect(clone instanceof RelayQuery.Root).toBe(true);
        expect(clone.getChildren().length).toBe(1);
        expect(clone.getChildren()[0]).toBe(field);
        expect(clone.getRoute().name).toBe('BarRoute');
        expect(clone.getName()).toBe('BarRoute');
        expect(root.getRoute().name).toBe('FooRoute');
        expect(root.getName()).toBe('RelayQueryTest');
        expect(
          root.cloneWithRoute([field], RelayMetaRoute.get('FooRoute')),
        ).toBe(root);
      });
    });

    describe('getCallsWithValues()', () => {
      it('returns an empty array when there are no arguments', () => {
        const root = RelayQuery.Root.build('RelayQueryTest', 'viewer');
        expect(root.getCallsWithValues()).toEqual([]);
      });

      it('returns an array including the identifying argument', () => {
        const root = RelayQuery.Root.build(
          'RelayQueryTest',
          'foo',
          '123',
          null,
          {identifyingArgName: 'id'},
        );
        expect(root.getCallsWithValues()).toEqual([{name: 'id', value: '123'}]);
      });

      // it('returns an array of every argument', () => {
      //   //   TODO: When it's possible to do so, create a root with both
      //   //         identifying and non-identifying arguments.
      //   const root;
      //   expect(root.getCallsWithValues()).toEqual([
      //     /* all of the arguments */
      //   ]);
      // });
    });

    describe('getFieldName()', () => {
      it('returns the name of the root field', () => {
        const root = RelayQuery.Root.build('RelayQueryTest', 'viewer');
        expect(root.getFieldName()).toBe('viewer');
      });
    });

    describe('getIdentifyingArg()', () => {
      it('returns nothing when there is no identifying argument', () => {
        const root = RelayQuery.Root.build('RelayQueryTest', 'viewer');
        expect(root.getIdentifyingArg()).toBeUndefined();
      });

      it('returns the sole identifying argument', () => {
        const root = RelayQuery.Root.build(
          'RelayQueryTest',
          'foo',
          '123',
          null,
          {identifyingArgName: 'id'},
        );
        expect(root.getIdentifyingArg()).toEqual({
          name: 'id',
          value: '123',
        });
      });

      it('returns the identifying argument with type', () => {
        const root = RelayQuery.Root.build(
          'RelayQueryTest',
          'foo',
          '123',
          null,
          {identifyingArgName: 'id', identifyingArgType: 'scalar'},
        );
        expect(root.getIdentifyingArg()).toEqual({
          name: 'id',
          type: 'scalar',
          value: '123',
        });
      });

      // it('returns only the identifying argument', () => {
      //   TODO: When it's possible to do so, create a root with both
      //         identifying and non-identifying arguments.
      //   const root;
      //   expect(root.getIdentifyingArg()).toBe({
      //    /* only the identifying one */
      //   });
      // });
    });
  });

  describe('Fragment', () => {
    describe('build()', () => {
      it('creates empty fragments', () => {
        const fragment = RelayQuery.Fragment.build('TestFragment', 'Node', []);
        expect(fragment instanceof RelayQuery.Fragment).toBe(true);
        expect(fragment.getDebugName()).toBe('TestFragment');
        expect(fragment.getType()).toBe('Node');
        expect(fragment.getChildren().length).toBe(0);
        expect(fragment.isPlural()).toBe(false);
      });

      it('creates fragments', () => {
        const field = buildIdField();
        const fragment = RelayQuery.Fragment.build(
          'TestFragment',
          'Node',
          [field],
          {plural: true},
          'FooRoute',
        );
        expect(fragment instanceof RelayQuery.Fragment).toBe(true);
        expect(fragment.getDebugName()).toBe('TestFragment');
        expect(fragment.getType()).toBe('Node');
        expect(fragment.getChildren().length).toBe(1);
        expect(fragment.getChildren()[0]).toBe(field);
        expect(fragment.isPlural()).toBe(true);
        expect(fragment.getRoute().name).toBe('FooRoute');
      });
    });

    describe('getConcreteFragmentID()', () => {
      it('returns the same id for two different RelayQuery nodes', () => {
        const concreteNode = Relay.QL`fragment on Node { id }`;
        const fragmentA = getNode(concreteNode);
        const fragmentB = getNode(concreteNode);
        expect(fragmentA.getConcreteFragmentID()).toBe(
          fragmentB.getConcreteFragmentID(),
        );
      });

      it('returns a different id for two different concrete nodes', () => {
        const fragmentA = getNode(Relay.QL`fragment on Node { id }`);
        const fragmentB = getNode(Relay.QL`fragment on Node { id }`);
        expect(fragmentA.getConcreteFragmentID()).not.toBe(
          fragmentB.getConcreteFragmentID(),
        );
      });
    });

    describe('getCompositeHash()', () => {
      it('returns one hash for nodes with the same variables / route', () => {
        const node = Relay.QL`fragment on Node { id }`;
        const route = RelayMetaRoute.get('route');
        const variables = {foo: 123};
        expect(
          RelayQuery.Fragment.create(node, route, variables).getCompositeHash(),
        ).toBe(
          RelayQuery.Fragment.create(node, route, variables).getCompositeHash(),
        );
      });

      it('returns different hashes for nodes with different variables', () => {
        const node = Relay.QL`fragment on Node { id }`;
        const route = RelayMetaRoute.get('route');
        const variablesA = {foo: 123};
        const variablesB = {foo: 456};
        expect(
          RelayQuery.Fragment
            .create(node, route, variablesA)
            .getCompositeHash(),
        ).not.toBe(
          RelayQuery.Fragment
            .create(node, route, variablesB)
            .getCompositeHash(),
        );
      });

      it('returns different hashes for nodes with different routes', () => {
        const node = Relay.QL`fragment on Node { id }`;
        const routeA = RelayMetaRoute.get('routeA');
        const routeB = RelayMetaRoute.get('routeB');
        const variables = {foo: 123};
        expect(
          RelayQuery.Fragment
            .create(node, routeA, variables)
            .getCompositeHash(),
        ).not.toBe(
          RelayQuery.Fragment
            .create(node, routeB, variables)
            .getCompositeHash(),
        );
      });

      it('returns one hash for nodes cloned with the same children', () => {
        const fragment = getNode(Relay.QL`fragment on Node { id, __typename }`);
        const fragmentClone = fragment.clone(fragment.getChildren());
        expect(fragmentClone.getCompositeHash()).toBe(
          fragment.getCompositeHash(),
        );
      });

      it('returns different hashes for nodes cloned with new children', () => {
        const fragment = getNode(Relay.QL`fragment on Node { id, __typename }`);
        const fragmentClone = fragment.clone(fragment.getChildren().slice(1));
        expect(fragmentClone.getCompositeHash()).not.toBe(
          fragment.getCompositeHash(),
        );
      });
    });
  });

  describe('Field', () => {
    describe('build()', () => {
      it('builds scalar fields', () => {
        const field = buildIdField();
        expect(field instanceof RelayQuery.Field).toBe(true);
        expect(field.getSchemaName()).toBe('id');
        expect(field.getApplicationName()).toBe('id');
        expect(field.canHaveSubselections()).toBe(false);
        expect(field.getChildren().length).toBe(0);
        expect(field.getCallsWithValues()).toEqual([]);
      });

      it('builds fields with children', () => {
        const child = buildIdField();
        const fragment = getNode(Relay.QL`fragment on Node{id}`);
        const field = RelayQuery.Field.build({
          fieldName: 'node',
          children: [child, fragment],
          metadata: {canHaveSubselections: true},
          type: 'Node',
        });
        expect(field.canHaveSubselections()).toBe(true);
        const children = field.getChildren();
        expect(children.length).toBe(2);
        expect(children[0]).toBe(child);
        expect(children[1]).toBe(fragment);
      });

      it('builds fields with calls', () => {
        let field = RelayQuery.Field.build({
          fieldName: 'profilePicture',
          calls: [{name: 'size', value: 32}],
          metadata: {canHaveSubselections: true},
          type: 'ProfilePicture',
        });
        expect(field.getCallsWithValues()).toEqual([{name: 'size', value: 32}]);
        field = RelayQuery.Field.build({
          fieldName: 'profilePicture',
          calls: [{name: 'size', value: ['32']}],
          metadata: {canHaveSubselections: true},
          type: 'ProfilePicture',
        });
        expect(field.getCallsWithValues()).toEqual([
          {name: 'size', value: ['32']},
        ]);
      });

      it('builds directives with argument values', () => {
        const field = RelayQuery.Field.build({
          directives: [
            {
              args: [
                {
                  name: 'bar',
                  value: 'baz',
                },
              ],
              name: 'foo',
            },
          ],
          fieldName: 'profilePicture',
          type: 'ProfilePicture',
        });
        expect(field.getDirectives()).toEqual([
          {
            args: [{name: 'bar', value: 'baz'}],
            name: 'foo',
          },
        ]);
      });

      it('builds fields with custom route names', () => {
        const field = RelayQuery.Field.build({
          fieldName: 'node',
          children: [],
          metadata: {},
          routeName: 'FooRoute',
          type: 'Node',
        });
        expect(field.getRoute().name).toBe('FooRoute');
      });
    });
  });

  describe('Mutation', () => {
    describe('build()', () => {
      it('builds mutation with value', () => {
        const field = RelayQuery.Field.build({
          fieldName: 'does_viewer_like',
          type: 'Boolean',
        });
        const mutation = RelayQuery.Mutation.build(
          'FeedbackLikeMutation',
          'FeedbackLikeResponsePayload',
          'feedback_like',
          {feedback_id: '123'},
          [field],
          {},
          'FooRoute',
        );

        expect(mutation instanceof RelayQuery.Mutation).toBe(true);
        expect(mutation.getName()).toBe('FeedbackLikeMutation');
        expect(mutation.getResponseType()).toBe('FeedbackLikeResponsePayload');
        expect(mutation.getChildren().length).toBe(1);
        expect(mutation.getChildren()[0]).toBe(field);
        expect(mutation.getCall()).toEqual({
          name: 'feedback_like',
          value: {feedback_id: '123'},
        });
        expect(mutation.getCallVariableName()).toEqual('input');
        expect(mutation.getRoute().name).toBe('FooRoute');
      });

      it('builds mutation with variable', () => {
        const field = RelayQuery.Field.build({
          fieldName: 'does_viewer_like',
          type: 'Boolean',
        });
        const mutation = RelayQuery.Mutation.build(
          'FeedbackLikeMutation',
          'FeedbackLikeResponsePayload',
          'feedback_like',
          undefined,
          [field],
        );

        expect(mutation instanceof RelayQuery.Mutation).toBe(true);
        expect(mutation.getName()).toBe('FeedbackLikeMutation');
        expect(mutation.getResponseType()).toBe('FeedbackLikeResponsePayload');
        expect(mutation.getChildren().length).toBe(1);
        expect(mutation.getChildren()[0]).toBe(field);
        expect(mutation.getCall()).toEqual({name: 'feedback_like', value: ''});
        expect(mutation.getCallVariableName()).toEqual('input');
      });
    });
  });

  describe('isEquivalent()', () => {
    it('returns false for different concrete nodes', () => {
      const node1 = getNode(Relay.QL`fragment on Node{id}`);
      const ndoe2 = getNode(Relay.QL`fragment on Node{id}`);
      expect(node1.isEquivalent(ndoe2)).toBe(false);
    });

    it('return false for different variables', () => {
      const fragment = Relay.QL`fragment on Node{id}`;

      const node1 = getNode(fragment, {a: true});
      const ndoe2 = getNode(fragment, {a: false});
      expect(node1.isEquivalent(ndoe2)).toBe(false);
    });

    it('returns false for different routes', () => {
      const fragment = Relay.QL`fragment on Node{id}`;
      const variables = {a: false};
      const route1 = RelayMetaRoute.get('route1');
      const route2 = RelayMetaRoute.get('route2');

      const node1 = RelayQuery.Fragment.create(fragment, route1, variables);
      const node2 = RelayQuery.Fragment.create(fragment, route2, variables);
      expect(node1.isEquivalent(node2)).toBe(false);
    });

    it('returns true for identical node, route, and variables', () => {
      const fragment = Relay.QL`fragment on Node{id}`;
      const variables = {a: false};
      const route = RelayMetaRoute.get('route1');

      const node1 = RelayQuery.Fragment.create(fragment, route, variables);
      const node2 = RelayQuery.Fragment.create(fragment, route, variables);
      expect(node1.isEquivalent(node2)).toBe(true);
    });
  });

  describe('getChildren()', () => {
    it('expands fragment references', () => {
      const innerFragment = Relay.QL`
        fragment on User {
          id
          profilePicture(size:$size) {
            uri
          }
        }
      `;
      const reference = new RelayFragmentReference(
        () => innerFragment,
        {
          size: 'default',
        },
        {
          size: QueryBuilder.createCallVariable('outerSize'),
        },
      );
      const fragment = getNode(
        Relay.QL`
        fragment on User {
          id
          ${reference}
        }
      `,
        {
          outerSize: 'override',
        },
      );
      const children = fragment.getChildren();
      expect(children.length).toBe(2);
      expect(children[0].getSchemaName()).toBe('id');

      // the reference is expanded with overridden query variables
      expect(children[1] instanceof RelayQuery.Fragment);
      expect(children[1].getType()).toBe('User');
      const grandchildren = children[1].getChildren();
      expect(grandchildren.length).toBe(2);
      expect(grandchildren[0].getSchemaName()).toBe('id');
      expect(grandchildren[1].getSchemaName()).toBe('profilePicture');
      expect(grandchildren[1].getCallsWithValues()).toEqual([
        {name: 'size', type: '[Int]', value: 'override'},
      ]);
    });

    it('expands fragment spreads with call variables', () => {
      const fragments = {
        foo: graphql.experimental`
          fragment RelayQuery_foo on User @argumentDefinitions(
            size: {type: "Int"}
            cond: {type: "Boolean!", defaultValue: true}
          ) {
            id
            profilePicture(size: $size) @include(if: $cond) {
              uri
            }
          }
        `,
      };

      const spread = {
        kind: 'FragmentSpread',
        args: {
          // Create a call variable to simulate passing a `params` object
          size: QueryBuilder.createCallVariable('outerSize'),
        },
        fragment: getClassicFragment(fragments.foo),
      };
      const fragment = getNode(
        Relay.QL`
        fragment on User {
          id
          ${spread}
        }
      `,
        {
          outerSize: 'override',
        },
      );
      const children = fragment.getChildren();
      expect(children.length).toBe(2);
      expect(children[0].getSchemaName()).toBe('id');

      // the reference is expanded with overridden query variables
      expect(children[1] instanceof RelayQuery.Fragment);
      expect(children[1].getType()).toBe('User');
      expect(children[1].getVariables()).toEqual({
        size: 'override',
        cond: true, // defaults are populated
      });
      const grandchildren = children[1].getChildren();
      expect(grandchildren.length).toBe(2);
      expect(grandchildren[0].getSchemaName()).toBe('id');
      expect(grandchildren[1].getSchemaName()).toBe('profilePicture');
      expect(grandchildren[1].getCallsWithValues()).toEqual([
        {name: 'size', type: '[Int]', value: 'override'},
      ]);
    });

    it('expands fragment spreads with literal variables', () => {
      const fragments = {
        foo: graphql.experimental`
          fragment RelayQuery_foo on User @argumentDefinitions(
            size: {type: "Int"}
            cond: {type: "Boolean!", defaultValue: true}
          ) {
            id
            profilePicture(size: $size) @include(if: $cond) {
              uri
            }
          }
        `,
      };

      const spread = {
        kind: 'FragmentSpread',
        args: {
          // pass a literal value
          size: 'override',
        },
        fragment: getClassicFragment(fragments.foo),
      };
      const fragment = getNode(
        Relay.QL`
        fragment on User {
          id
          ${spread}
        }
      `,
      );
      const children = fragment.getChildren();
      expect(children.length).toBe(2);
      expect(children[0].getSchemaName()).toBe('id');

      // the reference is expanded with overridden query variables
      expect(children[1] instanceof RelayQuery.Fragment);
      expect(children[1].getType()).toBe('User');
      expect(children[1].getVariables()).toEqual({
        size: 'override',
        cond: true, // defaults are populated
      });
      const grandchildren = children[1].getChildren();
      expect(grandchildren.length).toBe(2);
      expect(grandchildren[0].getSchemaName()).toBe('id');
      expect(grandchildren[1].getSchemaName()).toBe('profilePicture');
      expect(grandchildren[1].getCallsWithValues()).toEqual([
        {name: 'size', type: '[Int]', value: 'override'},
      ]);
    });

    it('expands route conditional fragments', () => {
      const innerFragment1 = Relay.QL`
        fragment on User {
          id,
          profilePicture(size:$size) {
            uri,
          },
        }
      `;
      const innerFragment2 = Relay.QL`
        fragment on User {
          id,
          firstName
        }
      `;
      const reference1 = new RelayFragmentReference(
        () => innerFragment1,
        {
          size: 'default',
        },
        {
          size: QueryBuilder.createCallVariable('outerSize'),
        },
      );
      const reference2 = new RelayFragmentReference(
        () => innerFragment2,
        {},
        {},
      );
      const fragment = getNode(
        Relay.QL`
        fragment on User {
          id,
          ${route => reference1},
          ${route => [reference2]}
        }
      `,
        {
          outerSize: 'override',
        },
      );

      const children = fragment.getChildren();
      expect(children.length).toBe(3);
      expect(children[0].getSchemaName()).toBe('id');

      expect(children[1] instanceof RelayQuery.Fragment);
      expect(children[1].getType()).toBe('User');
      let grandchildren = children[1].getChildren();
      expect(grandchildren.length).toBe(2);
      expect(grandchildren[0].getSchemaName()).toBe('id');
      expect(grandchildren[1].getSchemaName()).toBe('profilePicture');
      expect(grandchildren[1].getCallsWithValues()).toEqual([
        {name: 'size', type: '[Int]', value: 'override'},
      ]);

      expect(children[2] instanceof RelayQuery.Fragment);
      expect(children[2].getType()).toBe('User');
      grandchildren = children[2].getChildren();
      expect(grandchildren.length).toBe(2);
      expect(grandchildren[0].getSchemaName()).toBe('id');
      expect(grandchildren[1].getSchemaName()).toBe('firstName');
    });
  });
});
