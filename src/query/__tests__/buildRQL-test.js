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

var RelayTestUtils = require('RelayTestUtils');
RelayTestUtils.unmockRelay();

jest.mock('warning');

describe('buildRQL', () => {
  var GraphQL;
  var React;
  var Relay;
  var RelayQuery;

  var buildRQL;

  var {getNode} = RelayTestUtils;

  var MockComponent;
  var MockContainer;

  beforeEach(() => {
    GraphQL = require('GraphQL');
    React = require('React');
    Relay = require('Relay');
    RelayQuery = require('RelayQuery');

    buildRQL = require('buildRQL');

    var render = jest.genMockFunction().mockImplementation(function() {
      // Make it easier to expect prop values.
      render.mock.calls[render.mock.calls.length - 1].props = this.props;
      return <div />;
    });
    MockComponent = React.createClass({render});
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });
    MockContainer.getQuery = jest.genMockFunction().mockReturnValue(
      Relay.QL`fragment on Node { name }`
    );

    jest.addMatchers(RelayTestUtils.matchers);
  });

  describe('Fragment()', () => {
    it('throws if the node is not a fragment', () => {
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
      expect(() => buildRQL.Fragment(builder, [])).toFailInvariant(
        'RelayQL: Invalid fragment composition, use ' +
        '`${Child.getFragment(\'name\')}`.'
      );
    });

    it('creates fragments with variables', () => {
      var builder = variables => Relay.QL`
        fragment on Node {
          id,
          profilePicture(size:$sizeVariable) {
            uri,
          },
        }
      `;
      var node = buildRQL.Fragment(builder, ['sizeVariable']);
      expect(GraphQL.isFragment(node)).toBe(true);

      // Confirm that `${variables.sizeVariable}` is a variable by applying
      // variable values using `RelayQuery`:
      var fragment = getNode(node, {
        sizeVariable: '32',
      });
      expect(fragment instanceof RelayQuery.Fragment).toBe(true);
      var children = fragment.getChildren();
      expect(children.length).toBe(2);
      expect(children[1].getSchemaName()).toBe('profilePicture');
      // Variable has the applied value, not initial value.
      expect(children[1].getCallsWithValues()).toEqual([
        {name: 'size', value: '32'},
      ]);
    });

    it('returns === fragments', () => {
      var builder = variables => Relay.QL`
        fragment on Node {
          id,
          profilePicture(size:$sizeVariable) {
            uri,
          },
        }
      `;
      var node1 = buildRQL.Fragment(builder, ['sizeVariable']);
      var node2 = buildRQL.Fragment(builder, ['sizeVariable']);
      expect(node1 === node2).toBe(true);
    });
  });

  describe('Query()', () => {
    it('throws if the node is not a query', () => {
      var builder = (Component, variables) => Relay.QL`
        fragment on Node {
          id,
        }
      `;
      expect(buildRQL.Query(builder, MockContainer, ['id'])).toBe(undefined);
    });

    it('creates queries with components and variables', () => {
      var builder = (Component, variables) => Relay.QL`
        query {
          node(id:$id) {
            id,
            ${Component.getQuery('foo')}
          }
        }
      `;
      var node = buildRQL.Query(builder, MockContainer, ['id']);
      expect(GraphQL.isQuery(node)).toBe(true);

      // Confirm that `${variables.id}` is a variable by applying variable
      // values using `RelayQuery`:
      var variables = {id: '123'};
      var query = getNode(node, variables);
      expect(query instanceof RelayQuery.Root).toBe(true);
      expect(query.getRootCall()).toEqual({
        name: 'node',
        value: '123',
      });
      expect(query.getChildren()[1].equals(
        getNode(MockContainer.getQuery(), variables)
      )).toBe(true);
    });

    it('returns === queries for the same component', () => {
      var builder = (Component, variables) => Relay.QL`
        query {
          node(id:$id) {
            ${Component.getQuery('foo')}
          }
        }
      `;
      var node1 = buildRQL.Query(builder, MockContainer, ['id']);
      var node2 = buildRQL.Query(builder, MockContainer, ['id']);
      expect(node1 === node2).toBe(true);
    });

    it('returns different queries for different components', () => {
      var MockContainer2 = Relay.createContainer(MockComponent, {
        fragments: {},
      });
      MockContainer2.getQuery = jest.genMockFunction().mockReturnValue(
        Relay.QL`fragment on Node { name }`
      );

      var builder = (Component, variables) => Relay.QL`
        query {
          node(id:$id) {
            ${Component.getQuery('foo')}
          }
        }
      `;
      var node1 = buildRQL.Query(builder, MockContainer, ['id']);
      var node2 = buildRQL.Query(builder, MockContainer2, ['id']);
      expect(node1 === node2).toBe(false);
    });
  });
});
