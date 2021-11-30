/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 * @flow strict-local
 */

'use strict';

import type {readUpdatableQueryEXPERIMENTALTest2UpdatableQuery} from './__generated__/readUpdatableQueryEXPERIMENTALTest2UpdatableQuery.graphql';
import type {readUpdatableQueryEXPERIMENTALTestRegularQuery} from './__generated__/readUpdatableQueryEXPERIMENTALTestRegularQuery.graphql';
import type {readUpdatableQueryEXPERIMENTALTestUpdatableQuery} from './__generated__/readUpdatableQueryEXPERIMENTALTestUpdatableQuery.graphql';

const RelayNetwork = require('../../network/RelayNetwork');
const {getRequest, graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../../store/RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../../store/RelayModernOperationDescriptor');
const RelayModernStore = require('../../store/RelayModernStore');
const RelayReader = require('../../store/RelayReader');
const RelayRecordSource = require('../../store/RelayRecordSource');
const commitLocalUpdate = require('../commitLocalUpdate');

const updatableQuery = graphql`
  query readUpdatableQueryEXPERIMENTALTestUpdatableQuery @updatable {
    me {
      __typename
      id
      name
      ...readUpdatableQueryEXPERIMENTALTest_user
    }
    node(id: "4") {
      ... on User {
        __typename
        name
      }
    }
    node2: node(id: "5") {
      ... on User {
        __typename
        name
        parents {
          ...readUpdatableQueryEXPERIMENTALTest_user
          name
          parents {
            name
          }
        }
      }
    }
  }
`;

const updatableQuery2 = graphql`
  query readUpdatableQueryEXPERIMENTALTest2UpdatableQuery($id: ID!) @updatable {
    node(id: $id) {
      __typename
    }
  }
`;

const regularQuery = graphql`
  query readUpdatableQueryEXPERIMENTALTestRegularQuery {
    me {
      id
      name
    }
    node(id: "4") {
      __typename
      ...readUpdatableQueryEXPERIMENTALTest_user
      ... on User {
        name
      }
    }
    node2: node(id: "5") {
      ... on User {
        name
        parents {
          id
          name
          parents {
            id
          }
        }
      }
    }
  }
`;

graphql`
  fragment readUpdatableQueryEXPERIMENTALTest_user on User @assignable {
    __typename
  }
`;

describe('readUpdatableQuery', () => {
  let environment;
  let operation;
  let rootRequest;

  beforeEach(() => {
    rootRequest = getRequest(regularQuery);
    operation = createOperationDescriptor(rootRequest, {});
    const source = RelayRecordSource.create();
    const store = new RelayModernStore(source);

    const fetch = jest.fn();
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      store,
    });
  });

  it('can be used to read scalar values', () => {
    environment.commitPayload(operation, {
      me: {
        id: '4',
        __typename: 'User',
        name: 'Zuck',
      },
      node: null,
      node2: null,
    });

    commitLocalUpdate(environment, store => {
      const me = store.getRoot()?.getLinkedRecord('me');
      expect(me?.getValue('id')).toEqual('4');
      expect(me?.getValue('name')).toEqual('Zuck');

      const updatableData =
        store.readUpdatableQuery_EXPERIMENTAL<readUpdatableQueryEXPERIMENTALTestUpdatableQuery>(
          updatableQuery,
          {},
        );

      expect(updatableData.me?.id).toEqual('4');
      expect(updatableData.me?.name).toEqual('Zuck');
    });
  });

  it('can be used to update scalar values', () => {
    environment.commitPayload(operation, {
      me: {
        id: '4',
        __typename: 'User',
        name: 'Zuck',
      },
      node: null,
      node2: null,
    });

    commitLocalUpdate(environment, store => {
      const me = store.getRoot()?.getLinkedRecord('me');
      expect(me?.getValue('id')).toEqual('4');
      expect(me?.getValue('name')).toEqual('Zuck');

      const updatableData =
        store.readUpdatableQuery_EXPERIMENTAL<readUpdatableQueryEXPERIMENTALTestUpdatableQuery>(
          updatableQuery,
          {},
        );

      if (updatableData.me != null) {
        updatableData.me.name = 'MetaZuck';
      }
      expect(updatableData.me?.name).toEqual('MetaZuck');
      expect(me?.getValue('name')).toEqual('MetaZuck');
    });

    const source = environment.getStore().getSource();
    const selector = operation.fragment;
    const readOnlyData = ((RelayReader.read(source, selector) // $FlowFixMe[unclear-type] Just to cast it to a better type!
      .data: any): readUpdatableQueryEXPERIMENTALTestRegularQuery['response']);
    expect(readOnlyData?.me?.name).toEqual('MetaZuck');
  });

  it('cannot be used to update ids or typenames', () => {
    environment.commitPayload(operation, {
      me: {
        id: '4',
        __typename: 'User',
        name: 'Zuck',
      },
      node: null,
      node2: null,
    });

    commitLocalUpdate(environment, store => {
      const me = store.getRoot()?.getLinkedRecord('me');
      expect(me?.getValue('id')).toEqual('4');
      expect(me?.getValue('name')).toEqual('Zuck');

      const updatableData =
        store.readUpdatableQuery_EXPERIMENTAL<readUpdatableQueryEXPERIMENTALTestUpdatableQuery>(
          updatableQuery,
          {},
        );

      expect(() => {
        if (updatableData.me != null) {
          if (updatableData.me.__typename === 'User') {
            // $FlowFixMe[cannot-write] That's the point!
            updatableData.me.id = '5';
          }
        }
      }).toThrowError();
      expect(() => {
        if (updatableData.me != null) {
          if (updatableData.me.__typename === 'User') {
            // $FlowFixMe[cannot-write] That's the point!
            updatableData.me.__typename = '5';
          }
        }
      }).toThrowError();
    });
  });

  it('does not create setters for fields within non-matching inline fragments', () => {
    environment.commitPayload(operation, {
      me: null,
      node: {
        __typename: 'User',
        id: '4',
        name: 'Zuck',
        __isUser: 'User',
      },
      node2: {
        __typename: 'Page',
        id: '5',
      },
    });

    commitLocalUpdate(environment, store => {
      const node = store.getRoot()?.getLinkedRecord('node', {id: '4'});
      expect(node?.getValue('id')).toEqual('4');
      expect(node?.getValue('name')).toEqual('Zuck');

      const node2 = store.getRoot()?.getLinkedRecord('node', {id: '5'});
      expect(node2?.getValue('id')).toEqual('5');
      expect(node2?.getValue('name')).toEqual(undefined);

      const updatableData =
        store.readUpdatableQuery_EXPERIMENTAL<readUpdatableQueryEXPERIMENTALTestUpdatableQuery>(
          updatableQuery,
          {},
        );

      if (updatableData.node != null) {
        const propertyDescriptor = Object.getOwnPropertyDescriptor(
          updatableData.node,
          'name',
        );
        expect(propertyDescriptor?.set).not.toEqual(undefined);
      }
      if (updatableData.node != null) {
        if (updatableData.node.__typename === 'User') {
          updatableData.node.name = 'MetaZuck';
          expect(updatableData.node.name).toEqual('MetaZuck');
        } else {
          throw new Error('Expected updatableData.node to have type User');
        }
      }
      expect(node?.getValue('name')).toEqual('MetaZuck');

      // Because node2 is not a user, selections within an inline fragment on User do not result
      // in a setter being created
      if (updatableData.node2 != null) {
        const propertyDescriptor2 = Object.getOwnPropertyDescriptor(
          updatableData.node2,
          'name',
        );
        expect(propertyDescriptor2).toEqual(undefined);

        // In __DEV__, this throws. In prod, this updates a value on an object, but that
        // doesn't update any value in the store, as evidenced by the undefined property
        // descriptor.
        expect(() => {
          if (updatableData.node2 != null) {
            // $FlowFixMe[prop-missing] that's the point!
            updatableData.node2.name = 'MetaZuck';
          }
        }).toThrowError();
      } else {
        throw new Error('Expected node2 to be found');
      }
    });
  });

  it('lets you assign linked fields if the linked field in the updatable query contains an inline fragment', () => {
    environment.commitPayload(operation, {
      me: {
        __typename: 'User',
        id: '42',
        name: 'NotZuck',
      },
      node: {
        __typename: 'User',
        id: '4',
        name: 'Zuck',
        __isUser: 'User',
      },
      node2: null,
    });

    commitLocalUpdate(environment, store => {
      const me = store.getRoot()?.getLinkedRecord('me');
      expect(me?.getValue('id')).toEqual('42');
      expect(me?.getValue('name')).toEqual('NotZuck');

      const node = store.getRoot()?.getLinkedRecord('node', {id: '4'});
      expect(node?.getValue('id')).toEqual('4');
      expect(node?.getValue('name')).toEqual('Zuck');

      const updatableData = store.readUpdatableQuery_EXPERIMENTAL(
        updatableQuery,
        {},
      );

      const source = environment.getStore().getSource();
      const selector = operation.fragment;
      const readOnlyData = ((RelayReader.read(source, selector) // $FlowFixMe[unclear-type] Just to cast it to a better type!
        .data: any): readUpdatableQueryEXPERIMENTALTestRegularQuery['response']);

      expect(readOnlyData.me?.id).toBe('42');

      if (readOnlyData.node != null) {
        if (readOnlyData.node.__typename === 'User') {
          expect(readOnlyData.node.__id).toBe('4');
        }
      }

      if (updatableData.me != null) {
        updatableData.me = readOnlyData.node;
        // Flow inference must be cleared here
        (() => {})();
        expect(updatableData.me.id).toBe('4');
      }
    });

    const source = environment.getStore().getSource();
    const selector = operation.fragment;
    const readOnlyData = ((RelayReader.read(source, selector) // $FlowFixMe[unclear-type] Just to cast it to a better type!
      .data: any): readUpdatableQueryEXPERIMENTALTestRegularQuery['response']);
    expect(readOnlyData.me?.id).toBe('4');
  });

  it('lets you delete linked fields by assigning null', () => {
    environment.commitPayload(operation, {
      me: {
        __typename: 'User',
        id: '42',
        name: 'NotZuck',
      },
      node: {
        __typename: 'User',
        id: '4',
        name: 'Zuck',
        __isUser: 'User',
      },
      node2: null,
    });

    commitLocalUpdate(environment, store => {
      const me = store.getRoot()?.getLinkedRecord('me');
      expect(me?.getValue('id')).toEqual('42');
      expect(me?.getValue('name')).toEqual('NotZuck');

      const node = store.getRoot()?.getLinkedRecord('node', {id: '4'});
      expect(node?.getValue('id')).toEqual('4');
      expect(node?.getValue('name')).toEqual('Zuck');

      const updatableData =
        store.readUpdatableQuery_EXPERIMENTAL<readUpdatableQueryEXPERIMENTALTestUpdatableQuery>(
          updatableQuery,
          {},
        );

      if (updatableData.me != null) {
        updatableData.me = null;
      }

      expect(updatableData.me).toBe(null);
      expect(store.getRoot()?.getLinkedRecord('me')).toBe(null);
    });

    const source = environment.getStore().getSource();
    const selector = operation.fragment;
    const readOnlyData = ((RelayReader.read(source, selector) // $FlowFixMe[unclear-type] Just to cast it to a better type!
      .data: any): readUpdatableQueryEXPERIMENTALTestRegularQuery['response']);
    expect(readOnlyData.me).toBe(null);
  });

  it('does not let you assign linked fields if the linked field in the updatable query does not contain an inline fragment', () => {
    environment.commitPayload(operation, {
      me: {
        __typename: 'User',
        id: '42',
        name: 'NotZuck',
      },
      node: {
        __typename: 'User',
        id: '4',
        name: 'Zuck',
        __isUser: 'User',
      },
      node2: null,
    });

    commitLocalUpdate(environment, store => {
      const me = store.getRoot()?.getLinkedRecord('me');
      expect(me?.getValue('id')).toEqual('42');
      expect(me?.getValue('name')).toEqual('NotZuck');

      const node = store.getRoot()?.getLinkedRecord('node', {id: '4'});
      expect(node?.getValue('id')).toEqual('4');
      expect(node?.getValue('name')).toEqual('Zuck');

      const updatableData =
        store.readUpdatableQuery_EXPERIMENTAL<readUpdatableQueryEXPERIMENTALTestUpdatableQuery>(
          updatableQuery,
          {},
        );

      const source = environment.getStore().getSource();
      const selector = operation.fragment;
      const readOnlyData = ((RelayReader.read(source, selector) // $FlowFixMe[unclear-type] Just to cast it to a better type!
        .data: any): readUpdatableQueryEXPERIMENTALTestRegularQuery['response']);

      expect(readOnlyData?.me).not.toBe(null);
      if (updatableData.node != null) {
        if (updatableData.node.__typename === 'User') {
          expect(updatableData.node.name).toBe('Zuck');
        }
      } else {
        throw new Error('Expected node to exist');
      }

      if (updatableData.me != null && readOnlyData != null) {
        expect(() => {
          // $FlowFixMe[cannot-write] That's the point!
          updatableData.node = readOnlyData.me;
        }).toThrowError();
      }

      // name is unchanged
      if (updatableData.node != null) {
        if (updatableData.node.__typename === 'User') {
          expect(updatableData.node.name).toBe('Zuck');
        }
      }
    });
  });

  it('allows you to assign an empty array to clear plural linked fields', () => {
    environment.commitPayload(operation, {
      me: null,
      node: null,
      node2: {
        __typename: 'User',
        id: '5',
        name: 'Oedipus',
        __isUser: 'User',
        parents: [
          {
            __isUser: 'User',
            __typename: 'User',
            id: '467',
            name: 'Laius',
            parents: [],
          },
        ],
      },
    });

    commitLocalUpdate(environment, store => {
      const parents = store
        .getRoot()
        .getLinkedRecord('node', {id: '5'})
        ?.getLinkedRecords('parents');
      if (parents != null) {
        expect(parents[0]?.getValue('name')).toEqual('Laius');
      } else {
        throw new Error('parents should not be null');
      }

      const updatableData =
        store.readUpdatableQuery_EXPERIMENTAL<readUpdatableQueryEXPERIMENTALTestUpdatableQuery>(
          updatableQuery,
          {},
        );

      if (updatableData.node2 != null) {
        if (updatableData.node2.__typename === 'User') {
          updatableData.node2.parents = [];
          expect(updatableData.node2.parents).toEqual([]);
          expect(
            store
              .getRoot()
              ?.getLinkedRecord('node', {id: '5'})
              ?.getLinkedRecords('parents'),
          ).toEqual([]);
        }
      } else {
        throw new Error('Expected node2 to exist');
      }
    });

    const source = environment.getStore().getSource();
    const selector = operation.fragment;
    const readOnlyData = ((RelayReader.read(source, selector) // $FlowFixMe[unclear-type] Just to cast it to a better type!
      .data: any): readUpdatableQueryEXPERIMENTALTestRegularQuery['response']);
    expect(readOnlyData.node2?.parents).toEqual([]);
  });

  it('allows you to assign to plural linked fields', () => {
    environment.commitPayload(operation, {
      me: null,
      node: {
        __isUser: 'User',
        __typename: 'User',
        id: '4',
        name: 'Gaius Julius Caesar',
      },
      node2: {
        __typename: 'User',
        id: '5',
        name: 'Gaius Julius Caesar Octavianus',
        __isUser: 'User',
        parents: [
          {
            __typename: 'User',
            __isUser: 'User',
            id: '467',
            name: 'Gaius Octavius',
            parents: [],
          },
        ],
      },
    });

    commitLocalUpdate(environment, store => {
      const updatableData =
        store.readUpdatableQuery_EXPERIMENTAL<readUpdatableQueryEXPERIMENTALTestUpdatableQuery>(
          updatableQuery,
          {},
        );

      const source = environment.getStore().getSource();
      const selector = operation.fragment;
      const readOnlyData = ((RelayReader.read(source, selector) // $FlowFixMe[unclear-type] Just to cast it to a better type!
        .data: any): readUpdatableQueryEXPERIMENTALTestRegularQuery['response']);

      if (updatableData.node2 != null) {
        if (updatableData.node2.__typename === 'User') {
          if (readOnlyData.node != null) {
            if (readOnlyData.node.__typename === 'User') {
              updatableData.node2.parents = [readOnlyData.node];
            }
          }

          if (updatableData.node2.parents[0] != null) {
            expect(updatableData.node2.parents[0]?.name).toBe(
              'Gaius Julius Caesar',
            );
          } else {
            throw new Error('Expected parent to exist');
          }
        } else {
          throw new Error('Expected node2 to have typename User');
        }
      } else {
        throw new Error('Expected node2 to exist');
      }
    });
    const source = environment.getStore().getSource();
    const selector = operation.fragment;
    const readOnlyData = ((RelayReader.read(source, selector) // $FlowFixMe[unclear-type] Just to cast it to a better type!
      .data: any): readUpdatableQueryEXPERIMENTALTestRegularQuery['response']);
    if (readOnlyData.node2?.parents != null) {
      expect(readOnlyData.node2?.parents[0]?.name).toBe('Gaius Julius Caesar');
    } else {
      throw new Error('Expected parents to exist');
    }
  });

  it('lets you access fields deeply', () => {
    environment.commitPayload(operation, {
      me: null,
      node: {
        __isUser: 'User',
        __typename: 'User',
        id: '4',
        name: 'Yancy Fry',
      },
      node2: {
        __typename: 'User',
        id: '5',
        name: 'Philip Fry',
        __isUser: 'User',
        parents: [
          {
            __typename: 'User',
            __isUser: 'User',
            id: '4',
            name: 'Yancy Fry',
            parents: [
              {
                id: '5',
              },
            ],
          },
        ],
      },
    });
    commitLocalUpdate(environment, store => {
      const updatableData =
        store.readUpdatableQuery_EXPERIMENTAL<readUpdatableQueryEXPERIMENTALTestUpdatableQuery>(
          updatableQuery,
          {},
        );

      if (updatableData.node2 != null) {
        if (updatableData.node2.__typename === 'User') {
          expect(updatableData.node2?.parents[0].parents[0].name).toBe(
            'Philip Fry',
          );
        } else {
          throw new Error('Expected node2 to be a User');
        }
      } else {
        throw new Error('Expected node2 to exist');
      }
    });
  });

  it('lets you use variables', () => {
    environment.commitPayload(operation, {
      me: null,
      node: {
        id: '4',
        __typename: 'Metahuman',
      },
      node2: {
        id: '5',
        __typename: 'Page',
      },
    });

    commitLocalUpdate(environment, store => {
      const updatableData =
        store.readUpdatableQuery_EXPERIMENTAL<readUpdatableQueryEXPERIMENTALTest2UpdatableQuery>(
          updatableQuery2,
          {id: '4'},
        );
      expect(updatableData.node?.__typename).toBe('Metahuman');

      const updatableData2 =
        store.readUpdatableQuery_EXPERIMENTAL<readUpdatableQueryEXPERIMENTALTest2UpdatableQuery>(
          updatableQuery2,
          {id: '5'},
        );
      expect(updatableData2.node?.__typename).toBe('Page');

      const updatableData3 =
        store.readUpdatableQuery_EXPERIMENTAL<readUpdatableQueryEXPERIMENTALTest2UpdatableQuery>(
          updatableQuery2,
          {id: '42'},
        );
      expect(updatableData3.node).toBe(undefined);
    });
  });

  it('should ignore extra variables, though flow will complain', () => {
    environment.commitPayload(operation, {
      me: null,
      node: {
        id: '4',
        __typename: 'Metahuman',
      },
      node2: null,
    });

    commitLocalUpdate(environment, store => {
      const updatableData =
        store.readUpdatableQuery_EXPERIMENTAL<readUpdatableQueryEXPERIMENTALTest2UpdatableQuery>(
          updatableQuery2,
          // $FlowFixMe[prop-missing] That's the point
          {id: '4', foo: 'bar'},
        );
      expect(updatableData.node?.__typename).toBe('Metahuman');
    });
  });
});
