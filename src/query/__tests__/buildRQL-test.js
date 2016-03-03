/**
 * Copyright (c) 2013-present, Facebook, Inc.
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

jest.mock('warning');

const QueryBuilder = require('QueryBuilder');
const React = require('React');
const Relay = require('Relay');
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

const buildRQL = require('buildRQL');

describe('buildRQL', () => {
  var {getNode} = RelayTestUtils;

  var MockComponent;
  var MockContainer;

  beforeEach(() => {
    var render = jest.genMockFunction().mockImplementation(function() {
      // Make it easier to expect prop values.
      render.mock.calls[render.mock.calls.length - 1].props = this.props;
      return <div />;
    });
    MockComponent = React.createClass({render});
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {
        foo: () => Relay.QL`fragment on Node { name }`,
      },
    });

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('Fragment()', () => {
    it('returns undefined if the node is not a fragment', () => {
      var builder = () => Relay.QL`
        query {
          node(id:"123") {
            id,
          }
        }
      `;
      expect(buildRQL.Fragment(builder, [])).toBe(undefined);
    });

    it('throws if fragment substitutions are invalid', () => {
      var invalid = {};
      var builder = () => Relay.QL`
        fragment on Node {
          ${invalid},
        }
      `;
      expect(() => buildRQL.Fragment(builder, {})).toFailInvariant(
        'RelayQL: Invalid fragment composition, use ' +
        '`${Child.getFragment(\'name\')}`.'
      );
    });

    it('creates fragments with variables', () => {
      var builder = () => Relay.QL`
        fragment on Node {
          id,
          profilePicture(size:$sizeVariable) {
            uri,
          },
        }
      `;
      var node = buildRQL.Fragment(builder, {sizeVariable: null});
      expect(!!QueryBuilder.getFragment(node)).toBe(true);

      // Confirm that `${variables.sizeVariable}` is a variable by applying
      // variable values using `RelayQuery`:
      var fragment = getNode(node, {
        sizeVariable: '32',
      });
      expect(fragment instanceof RelayQuery.Fragment).toBe(true);
      var children = fragment.getChildren();
      expect(children.length).toBe(3);
      expect(children[1].getSchemaName()).toBe('profilePicture');
      // Variable has the applied value, not initial value.
      expect(children[1].getCallsWithValues()).toEqual([
        {name: 'size', value: '32'},
      ]);
    });

    it('returns === fragments', () => {
      var builder = () => Relay.QL`
        fragment on Node {
          id,
          profilePicture(size:$sizeVariable) {
            uri,
          },
        }
      `;
      var node1 = buildRQL.Fragment(builder, {sizeVariable: null});
      var node2 = buildRQL.Fragment(builder, {sizeVariable: null});
      expect(node1 === node2).toBe(true);
    });

    it('generates distinct fragments per fragment builder', () => {
      var concreteFragment = Relay.QL`fragment on Node { id }`;
      var builder1 = () => concreteFragment;
      var builder2 = () => concreteFragment;
      var node1 = buildRQL.Fragment(builder1);
      var node2 = buildRQL.Fragment(builder2);
      expect(node1).toBe(concreteFragment);
      expect(node1).not.toBe(node2);
      expect(node1.id).not.toBe(node2.id);
      expect(getNode(node1)).toEqualQueryNode(getNode(node2));
      expect(buildRQL.Fragment(builder1)).toBe(node1);
      expect(buildRQL.Fragment(builder2)).toBe(node2);
    });
  });

  describe('Query()', () => {
    it('returns undefined if the node is not a query', () => {
      var builder = () => Relay.QL`
        fragment on Node {
          id,
        }
      `;
      expect(
        buildRQL.Query(builder, MockContainer, 'foo', {})
      ).toBe(undefined);
    });

    it('creates queries with components and variables', () => {
      var builder = Component => Relay.QL`
        query {
          node(id:$id) {
            id,
            ${Component.getFragment('foo')}
          }
        }
      `;
      var node = buildRQL.Query(builder, MockContainer, 'foo', {id: null});
      expect(!!QueryBuilder.getQuery(node)).toBe(true);

      // Confirm that `${variables.id}` is a variable by applying variable
      // values using `RelayQuery`:
      var variables = {id: '123'};
      var query = getNode(node, variables);
      expect(query instanceof RelayQuery.Root).toBe(true);
      expect(query.getIdentifyingArg()).toEqual({
        name: 'id',
        value: '123',
      });
      expect(query.getChildren()[2].equals(
        getNode(MockContainer.getFragment('foo'), variables)
      )).toBe(true);
    });

    it('returns === queries for the same component', () => {
      var builder = Component => Relay.QL`
        query {
          node(id:$id) {
            ${Component.getFragment('foo')}
          }
        }
      `;
      var node1 = buildRQL.Query(builder, MockContainer, 'foo', {id: null});
      var node2 = buildRQL.Query(builder, MockContainer, 'foo', {id: null});
      expect(node1 === node2).toBe(true);
    });

    it('returns different queries for different components', () => {
      var MockContainer2 = Relay.createContainer(MockComponent, {
        fragments: {
          foo: () => Relay.QL`fragment on Node { name }`,
        },
      });

      var builder = Component => Relay.QL`
        query {
          node(id:$id) {
            ${Component.getFragment('foo')}
          }
        }
      `;
      var node1 = buildRQL.Query(builder, MockContainer, 'foo', {id: null});
      var node2 = buildRQL.Query(builder, MockContainer2, 'foo', {id: null});
      expect(node1 === node2).toBe(false);
    });

    it('implicitly adds component fragments if not provided', () => {
      var builder = () => Relay.QL`
        query {
          node(id:$id)
        }
      `;
      var node = buildRQL.Query(
        builder,
        MockContainer,
        'foo',
        {id: null},
      );
      expect(!!QueryBuilder.getQuery(node)).toBe(true);

      // Confirm that `${variables.id}` is a variable by applying
      // variable values using `RelayQuery`:
      var variables = {id: '123'};
      var query = getNode(node, variables);
      expect(query instanceof RelayQuery.Root).toBe(true);
      expect(query.getIdentifyingArg()).toEqual({
        name: 'id',
        value: '123',
      });
      expect(query.getChildren()[2].equals(
        getNode(MockContainer.getFragment('foo'), variables)
      )).toBe(true);
    });

    it('produces equal results for implicit and explicit definitions', () => {
      const MockContainer2 = Relay.createContainer(MockComponent, {
        initialVariables: {
          if: null,
        },
        fragments: {
          foo: () => Relay.QL`fragment on Node { firstName(if: $if) }`,
        },
      });
      const implicitBuilder = () => Relay.QL`
        query {
          viewer
        }
      `;
      const explicitBuilder = (Component, variables) => Relay.QL`
        query {
          viewer {
            ${Component.getFragment('foo', variables)}
          }
        }
      `;
      const initialVariables = {if: null};
      const implicitNode = buildRQL.Query(
        implicitBuilder,
        MockContainer2,
        'foo',
        initialVariables,
      );
      const explicitNode = buildRQL.Query(
        explicitBuilder,
        MockContainer2,
        'foo',
        initialVariables,
      );
      const variables = {if: true};
      const implicitQuery = getNode(implicitNode, variables);
      const explicitQuery = getNode(explicitNode, variables);
      expect(implicitQuery).toEqualQueryRoot(explicitQuery);
    });

    it('throws if non-scalar fields are given', () => {
      var builder = () => Relay.QL`
        query {
          viewer {
            actor
          }
        }
      `;

      expect(() => {
        buildRQL.Query(
          builder,
          MockContainer,
          'foo',
          {}
        );
      }).toFailInvariant(
        'Relay.QL: Expected query `viewer` to be empty. For example, use ' +
        '`node(id: $id)`, not `node(id: $id) { ... }`.'
      );
    });
  });
});
