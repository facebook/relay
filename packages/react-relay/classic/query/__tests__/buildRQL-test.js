/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

require('configureForRelayOSS');

jest.mock('warning');

const QueryBuilder = require('../QueryBuilder');
const React = require('React');
const RelayClassic = require('../../RelayPublic');
const RelayQuery = require('../RelayQuery');
const RelayQueryCaching = require('../../tools/RelayQueryCaching');
const RelayTestUtils = require('RelayTestUtils');

const buildRQL = require('../buildRQL');

describe('buildRQL', () => {
  const {getNode} = RelayTestUtils;

  let MockComponent;
  let MockContainer;

  beforeEach(() => {
    MockComponent = class extends React.Component {
      render() {
        return <div />;
      }
    };
    MockContainer = RelayClassic.createContainer(MockComponent, {
      initialVariables: {
        size: null,
      },
      fragments: {
        foo: () => RelayClassic.QL`fragment on User {
          profilePicture(size: $size) {
            uri
          }
        }`,
      },
    });

    expect.extend(RelayTestUtils.matchers);
  });

  afterEach(() => {
    // Ensure RelayQueryCaching reverts to pristine state.
    jest.resetModules();
  });

  describe('Fragment()', () => {
    it('returns undefined if the node is not a fragment', () => {
      const builder = () => RelayClassic.QL`
        query {
          node(id:"123") {
            id
          }
        }
      `;
      expect(buildRQL.Fragment(builder, [])).toBe(undefined);
    });

    it('throws if fragment substitutions are invalid', () => {
      const invalid = {};
      const builder = () => RelayClassic.QL`
        fragment on Node {
          ${invalid}
        }
      `;
      expect(() => buildRQL.Fragment(builder, {})).toFailInvariant(
        'RelayQL: Invalid fragment composition, use ' +
          "`${Child.getFragment('name')}`.",
      );
    });

    it('creates fragments with variables', () => {
      const builder = () => RelayClassic.QL`
        fragment on Node {
          id
          profilePicture(size:$sizeVariable) {
            uri
          }
        }
      `;
      const node = buildRQL.Fragment(builder, {sizeVariable: null});
      expect(!!QueryBuilder.getFragment(node)).toBe(true);

      // Confirm that `${variables.sizeVariable}` is a variable by applying
      // variable values using `RelayQuery`:
      const fragment = getNode(node, {
        sizeVariable: '32',
      });
      expect(fragment instanceof RelayQuery.Fragment).toBe(true);
      const children = fragment.getChildren();
      expect(children.length).toBe(3);
      expect(children[1].getSchemaName()).toBe('profilePicture');
      // Variable has the applied value, not initial value.
      expect(children[1].getCallsWithValues()).toEqual([
        {name: 'size', type: '[Int]', value: '32'},
      ]);
    });

    it('returns === fragments', () => {
      const builder = () => RelayClassic.QL`
        fragment on Node {
          id
          profilePicture(size:$sizeVariable) {
            uri
          }
        }
      `;
      const node1 = buildRQL.Fragment(builder, {sizeVariable: null});
      const node2 = buildRQL.Fragment(builder, {sizeVariable: null});
      expect(node1 === node2).toBe(true);
    });
  });

  describe('Query()', () => {
    it('returns undefined if the node is not a query', () => {
      const builder = () => RelayClassic.QL`
        fragment on Node {
          id
        }
      `;
      expect(buildRQL.Query(builder, MockContainer, 'foo', {})).toBe(undefined);
    });

    it('creates queries with components and variables', () => {
      const builder = Component => RelayClassic.QL`
        query {
          node(id:$id) {
            id
            ${Component.getFragment('foo')}
          }
        }
      `;
      const node = buildRQL.Query(builder, MockContainer, 'foo', {id: null});
      expect(!!QueryBuilder.getQuery(node)).toBe(true);

      // Confirm that `${variables.id}` is a variable by applying variable
      // values using `RelayQuery`:
      const variables = {id: '123'};
      const query = getNode(node, variables);
      expect(query instanceof RelayQuery.Root).toBe(true);
      expect(query.getIdentifyingArg()).toEqual({
        name: 'id',
        type: 'ID',
        value: '123',
      });
      expect(
        query
          .getChildren()[2]
          .equals(getNode(MockContainer.getFragment('foo'), variables)),
      ).toBe(true);
    });

    it('returns === queries for the same component', () => {
      const builder = Component => RelayClassic.QL`
        query {
          node(id:$id) {
            ${Component.getFragment('foo')}
          }
        }
      `;
      const node1 = buildRQL.Query(builder, MockContainer, 'foo', {id: null});
      const node2 = buildRQL.Query(builder, MockContainer, 'foo', {id: null});
      expect(node1 === node2).toBe(true);
    });

    it('returns different queries for different components', () => {
      const MockContainer2 = RelayClassic.createContainer(MockComponent, {
        fragments: {
          foo: () => RelayClassic.QL`fragment on Node { name }`,
        },
      });

      const builder = Component => RelayClassic.QL`
        query {
          node(id:$id) {
            ${Component.getFragment('foo')}
          }
        }
      `;
      const node1 = buildRQL.Query(builder, MockContainer, 'foo', {id: null});
      const node2 = buildRQL.Query(builder, MockContainer2, 'foo', {id: null});
      expect(node1 === node2).toBe(false);
    });

    it('returns different queries for the same component if cache is disabled', () => {
      RelayQueryCaching.disable();
      const builder = Component => RelayClassic.QL`
        query {
          node(id:$id) {
            ${Component.getFragment('foo')}
          }
        }
      `;
      const node1 = buildRQL.Query(builder, MockContainer, 'foo', {id: null});
      const node2 = buildRQL.Query(builder, MockContainer, 'foo', {id: null});
      expect(node1).not.toBe(node2);
    });

    it('filters the variables passed to components', () => {
      const builder = (Component, variables) => RelayClassic.QL`
        query {
          node(id: $id) {
            ${Component.getFragment('foo', variables)}
          }
        }
      `;
      const variables = {
        id: 123,
        size: 32,
      };
      const node = buildRQL.Query(builder, MockContainer, 'foo', variables);
      const query = getNode(node, variables);
      expect(query.getVariables()).toEqual(variables);
      expect(query.getChildren()[2].getVariables()).toEqual({
        size: 32,
      });
    });

    it('implicitly adds component fragments if not provided', () => {
      const builder = () => RelayClassic.QL`
        query {
          node(id:$id)
        }
      `;
      const node = buildRQL.Query(builder, MockContainer, 'foo', {id: null});
      expect(!!QueryBuilder.getQuery(node)).toBe(true);

      // Confirm that `${variables.id}` is a variable by applying
      // variable values using `RelayQuery`:
      const variables = {id: '123'};
      const query = getNode(node, variables);
      expect(query instanceof RelayQuery.Root).toBe(true);
      expect(query.getIdentifyingArg()).toEqual({
        name: 'id',
        type: 'ID',
        value: '123',
      });
      expect(
        query
          .getChildren()[2]
          .equals(getNode(MockContainer.getFragment('foo'), variables)),
      ).toBe(true);
    });

    it('produces equal results for implicit and explicit definitions', () => {
      const MockContainer2 = RelayClassic.createContainer(MockComponent, {
        initialVariables: {
          if: null,
        },
        fragments: {
          foo: () => RelayClassic.QL`fragment on Node { firstName(if: $if) }`,
        },
      });
      const implicitBuilder = () => RelayClassic.QL`
        query {
          viewer
        }
      `;
      const explicitBuilder = (Component, variables) => RelayClassic.QL`
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
      const builder = () => RelayClassic.QL`
        query {
          viewer {
            actor
          }
        }
      `;

      expect(() => {
        buildRQL.Query(builder, MockContainer, 'foo', {});
      }).toFailInvariant(
        'Relay.QL: Expected query `viewer` to be empty. For example, use ' +
          '`node(id: $id)`, not `node(id: $id) { ... }`.',
      );
    });
  });
});
