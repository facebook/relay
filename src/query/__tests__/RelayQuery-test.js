/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

require('configureForRelayOSS');

const QueryBuilder = require('QueryBuilder');
const Relay = require('Relay');
const RelayFragmentReference = require('RelayFragmentReference');
const RelayMetaRoute = require('RelayMetaRoute');
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayQuery', () => {
  var {getNode} = RelayTestUtils;

  function buildIdField() {
    return RelayQuery.Field.build({
      fieldName: 'id',
      type: 'String',
    });
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('Root', () => {
    describe('build()', () => {
      it('creates roots', () => {
        var field = buildIdField();
        var root = RelayQuery.Root.build(
          'RelayQueryTest',
          'node',
          '4',
          [field]
        );
        expect(root instanceof RelayQuery.Root).toBe(true);
        expect(root.getChildren().length).toBe(1);
        expect(root.getChildren()[0]).toBe(field);
      });

      it('creates deferred roots', () => {
        var field = buildIdField();
        var root = RelayQuery.Root.build(
          'RelayQueryTest',
          'node',
          '4',
          [field],
          {isDeferred: true}
        );
        expect(root instanceof RelayQuery.Root).toBe(true);
        expect(root.getChildren().length).toBe(1);
        expect(root.getChildren()[0]).toBe(field);
      });

      it('creates roots with batch calls', () => {
        var root = RelayQuery.Root.build(
          'RelayQueryTest',
          'node',
          QueryBuilder.createBatchCallVariable('q0', '$.*.id'),
          []
        );
        expect(root instanceof RelayQuery.Root).toBe(true);
        expect(root.getBatchCall()).toEqual({
          refParamName: 'ref_q0',
          sourceQueryID: 'q0',
          sourceQueryPath: '$.*.id',
        });
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
          {identifyingArgName: 'id'}
        );
        expect(root.getCallsWithValues()).toEqual([
          {name: 'id', value: '123'},
        ]);
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
          {identifyingArgName: 'id'}
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
          {identifyingArgName: 'id', identifyingArgType: 'scalar'}
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
        var fragment = RelayQuery.Fragment.build(
          'TestFragment',
          'Node',
          []
        );
        expect(fragment instanceof RelayQuery.Fragment).toBe(true);
        expect(fragment.getDebugName()).toBe('TestFragment');
        expect(fragment.getType()).toBe('Node');
        expect(fragment.getChildren().length).toBe(0);
        expect(fragment.isPlural()).toBe(false);
      });

      it('creates fragments', () => {
        var field = buildIdField();
        var fragment = RelayQuery.Fragment.build(
          'TestFragment',
          'Node',
          [field],
          {plural: true}
        );
        expect(fragment instanceof RelayQuery.Fragment).toBe(true);
        expect(fragment.getDebugName()).toBe('TestFragment');
        expect(fragment.getType()).toBe('Node');
        expect(fragment.getChildren().length).toBe(1);
        expect(fragment.getChildren()[0]).toBe(field);
        expect(fragment.isPlural()).toBe(true);
      });
    });

    describe('isCloned()', () => {
      it('returns false for a plain fragment', () => {
        const fragment = getNode(Relay.QL`fragment on Node { id, __typename }`);
        expect(fragment.isCloned()).toBe(false);
      });

      it('returns false for a fragment cloned with the same children', () => {
        const fragment = getNode(Relay.QL`fragment on Node { id, __typename }`);
        const fragmentClone = fragment.clone(fragment.getChildren());
        expect(fragmentClone.isCloned()).toBe(false);
      });

      it('returns true for a fragment cloned with new children', () => {
        const fragment = getNode(Relay.QL`fragment on Node { id, __typename }`);
        const fragmentClone = fragment.clone(fragment.getChildren().slice(1));
        expect(fragmentClone.isCloned()).toBe(true);
      });
    });

    describe('getConcreteNodeHash()', () => {
      it('returns the same hash for two different RelayQuery nodes', () => {
        const concreteNode = Relay.QL`fragment on Node { id }`;
        const fragmentA = getNode(concreteNode);
        const fragmentB = getNode(concreteNode);
        expect(fragmentA.getConcreteNodeHash())
          .toBe(fragmentB.getConcreteNodeHash());
      });

      it('returns a different hash for two different concrete nodes', () => {
        const fragmentA = getNode(Relay.QL`fragment on Node { id }`);
        const fragmentB = getNode(Relay.QL`fragment on Node { id }`);
        expect(fragmentA.getConcreteNodeHash())
          .not.toBe(fragmentB.getConcreteNodeHash());
      });
    });

    describe('getCompositeHash()', () => {
      it('returns one hash for nodes with the same variables / route', () => {
        const node = Relay.QL`fragment on Node { id }`;
        const route = RelayMetaRoute.get('route');
        const variables = {foo: 123};
        expect(
          new RelayQuery.Fragment(node, route, variables).getCompositeHash()
        ).toBe(
          new RelayQuery.Fragment(node, route, variables).getCompositeHash()
        );
      });

      it('returns different hashes for nodes with different variables', () => {
        const node = Relay.QL`fragment on Node { id }`;
        const route = RelayMetaRoute.get('route');
        const variablesA = {foo: 123};
        const variablesB = {foo: 456};
        expect(
          new RelayQuery.Fragment(node, route, variablesA).getCompositeHash()
        ).not.toBe(
          new RelayQuery.Fragment(node, route, variablesB).getCompositeHash()
        );
      });

      it('returns different hashes for nodes with different routes', () => {
        const node = Relay.QL`fragment on Node { id }`;
        const routeA = RelayMetaRoute.get('routeA');
        const routeB = RelayMetaRoute.get('routeB');
        const variables = {foo: 123};
        expect(
          new RelayQuery.Fragment(node, routeA, variables).getCompositeHash()
        ).not.toBe(
          new RelayQuery.Fragment(node, routeB, variables).getCompositeHash()
        );
      });
    });
  });

  describe('Field', () => {
    describe('build()', () => {
      it('builds scalar fields', () => {
        var field = buildIdField();
        expect(field instanceof RelayQuery.Field).toBe(true);
        expect(field.getSchemaName()).toBe('id');
        expect(field.getApplicationName()).toBe('id');
        expect(field.isScalar()).toBe(true);
        expect(field.getChildren().length).toBe(0);
        expect(field.getCallsWithValues()).toEqual([]);
      });

      it('builds fields with children', () => {
        var child = buildIdField();
        var fragment = getNode(Relay.QL`fragment on Node{id}`);
        var field = RelayQuery.Field.build({
          fieldName: 'node',
          children: [child, fragment],
          type: 'Node',
        });
        expect(field.isScalar()).toBe(false);
        var children = field.getChildren();
        expect(children.length).toBe(2);
        expect(children[0]).toBe(child);
        expect(children[1]).toBe(fragment);
      });

      it('builds fields with calls', () => {
        var field = RelayQuery.Field.build({
          fieldName: 'profilePicture',
          calls: [
            {name: 'size', value: 32},
          ],
          type: 'ProfilePicture',
        });
        expect(field.getCallsWithValues()).toEqual([
          {name: 'size', value: 32},
        ]);
        field = RelayQuery.Field.build({
          fieldName: 'profilePicture',
          calls: [
            {name: 'size', value: ['32']},
          ],
          type: 'ProfilePicture',
        });
        expect(field.getCallsWithValues()).toEqual([
          {name: 'size', value: ['32']},
        ]);
      });
    });
  });

  describe('Mutation', () => {
    describe('buildMutation()', () => {
      it('builds mutation with value', () => {
        var field = RelayQuery.Field.build({
          fieldName: 'does_viewer_like',
          type: 'Boolean',
        });
        var mutation = RelayQuery.Mutation.build(
          'FeedbackLikeMutation',
          'FeedbackLikeResponsePayload',
          'feedback_like',
          {feedback_id:'123'},
          [field]
        );

        expect(mutation instanceof RelayQuery.Mutation).toBe(true);
        expect(mutation.getName()).toBe('FeedbackLikeMutation');
        expect(mutation.getResponseType()).toBe('FeedbackLikeResponsePayload');
        expect(mutation.getChildren().length).toBe(1);
        expect(mutation.getChildren()[0]).toBe(field);
        expect(mutation.getCall())
          .toEqual({name: 'feedback_like', value: {feedback_id:'123'}});
        expect(mutation.getCallVariableName()).toEqual('input');
      });

      it('builds mutation with variable', () => {
        var field = RelayQuery.Field.build({
          fieldName: 'does_viewer_like',
          type: 'Boolean',
        });
        var mutation = RelayQuery.Mutation.build(
          'FeedbackLikeMutation',
          'FeedbackLikeResponsePayload',
          'feedback_like',
          undefined,
          [field]
        );

        expect(mutation instanceof RelayQuery.Mutation).toBe(true);
        expect(mutation.getName()).toBe('FeedbackLikeMutation');
        expect(mutation.getResponseType()).toBe('FeedbackLikeResponsePayload');
        expect(mutation.getChildren().length).toBe(1);
        expect(mutation.getChildren()[0]).toBe(field);
        expect(mutation.getCall())
          .toEqual({name: 'feedback_like', value: ''});
        expect(mutation.getCallVariableName()).toEqual('input');
      });
    });
  });

  describe('isEquivalent()', () => {
    it('returns false for different concrete nodes', () => {
      var node1 = getNode(Relay.QL`fragment on Node{id}`);
      var ndoe2 = getNode(Relay.QL`fragment on Node{id}`);
      expect(node1.isEquivalent(ndoe2)).toBe(false);
    });

    it('return false for different variables', () => {
      var fragment = Relay.QL`fragment on Node{id}`;

      var node1 = getNode(fragment, {a: true});
      var ndoe2 = getNode(fragment, {a: false});
      expect(node1.isEquivalent(ndoe2)).toBe(false);
    });

    it('returns false for different routes', () => {
      var fragment = Relay.QL`fragment on Node{id}`;
      var variables = {a: false};
      var route1 = RelayMetaRoute.get('route1');
      var route2 = RelayMetaRoute.get('route2');

      var node1 = RelayQuery.Fragment.create(fragment, route1, variables);
      var node2 = RelayQuery.Fragment.create(fragment, route2, variables);
      expect(node1.isEquivalent(node2)).toBe(false);
    });

    it('returns true for identical node, route, and variables', () => {
      var fragment = Relay.QL`fragment on Node{id}`;
      var variables = {a: false};
      var route = RelayMetaRoute.get('route1');

      var node1 = RelayQuery.Fragment.create(fragment, route, variables);
      var node2 = RelayQuery.Fragment.create(fragment, route, variables);
      expect(node1.isEquivalent(node2)).toBe(true);
    });
  });

  describe('getChildren()', () => {
    it('expands fragment references', () => {
      var innerFragment = Relay.QL`
        fragment on User {
          id,
          profilePicture(size:$size) {
            uri,
          },
        }
      `;
      var reference = new RelayFragmentReference(
        () => innerFragment,
        {
          size: 'default',
        },
        {
          size: QueryBuilder.createCallVariable('outerSize'),
        }
      );
      var fragment = getNode(Relay.QL`
        fragment on User {
          id,
          ${reference},
        }
      `, {
        outerSize: 'override',
      });
      var children = fragment.getChildren();
      expect(children.length).toBe(2);
      expect(children[0].getSchemaName()).toBe('id');

      // the reference is expanded with overridden query variables
      expect(children[1] instanceof RelayQuery.Fragment);
      expect(children[1].getType()).toBe('User');
      var grandchildren = children[1].getChildren();
      expect(grandchildren.length).toBe(2);
      expect(grandchildren[0].getSchemaName()).toBe('id');
      expect(grandchildren[1].getSchemaName()).toBe('profilePicture');
      expect(grandchildren[1].getCallsWithValues()).toEqual([
        {name: 'size', value: 'override'},
      ]);
    });
  });
});
