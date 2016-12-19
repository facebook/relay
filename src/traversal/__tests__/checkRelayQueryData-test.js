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

const GraphQLRange = require('GraphQLRange');
const Relay = require('Relay');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayTestUtils = require('RelayTestUtils');

const checkRelayQueryData = require('checkRelayQueryData');

describe('checkRelayQueryData', () => {
  let RelayRecordStore;

  const {getNode} = RelayTestUtils;
  let HAS_NEXT_PAGE, HAS_PREV_PAGE;

  function hasData(
    query,
    records,
    rootCallMap,
    fragmentFilter
  ) {
    const store = new RelayRecordStore(
      {records: records || {}},
      {rootCallMap: rootCallMap || {}}
    );
    return checkRelayQueryData(store, query, fragmentFilter);
  }

  beforeEach(() => {
    jest.resetModules();

    RelayRecordStore = require('RelayRecordStore');

    ({HAS_NEXT_PAGE, HAS_PREV_PAGE} = RelayConnectionInterface);
  });

  it('returns false when node is not in the store', () => {
    const result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {id}
        }
      `,
    ));

    expect(result).toEqual(false);
  });

  it('returns true when node is null', () => {
    const records = {
      1055790163: null,
    };

    const result = hasData(getNode(
     Relay.QL`
       query {
         node(id:"1055790163") {id}
       }
     `),
      records
    );

    expect(result).toEqual(true);
  });

  it('returns true when checking basic id query', () => {
    const records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
      },
    };

    const result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {id}
        }
      `),
      records
    );

    expect(result).toEqual(true);
  });

  it('returns false when a part of the node query is missing', () => {
    const records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
      },
    };

    const result = hasData(getNode(
      Relay.QL`
        query {
          nodes(ids:["1055790163","4"]) {id}
        }
      `),
      records
    );

    expect(result).toEqual(false);
  });

  it('returns true when data is available for custom root calls', () => {
    const records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
      },
    };

    const result = hasData(getNode(
      Relay.QL`
        query {
          username(name:"yuzhi") {id}
        }
      `),
      records,
      {username: {yuzhi: '1055790163'}}
    );

    expect(result).toEqual(true);
  });

  it('returns true when scalar field is available', () => {
    const records = {
      1055790163: {
        id: '1055790163',
        firstName: 'Yuzhi',
        __dataID__: '1055790163',
        __typename: 'User',
      },
    };

    const result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id
            firstName
          }
        }
      `),
      records
    );

    expect(result).toEqual(true);
  });

  it('returns false when scalar field is missing', () => {
    const records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
      },
    };

    const result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id
            firstName
          }
        }
      `),
      records
    );

    expect(result).toEqual(false);
  });

  it('returns true when nested fields are available', () => {
    const records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        friends: { __dataID__: 'friends_id'},
      },
      friends_id: {
        __dataID__:'friends_id',
        count: 500,
      },
    };

    const result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id
            friends {count}
          }
        }
      `),
      records
    );

    expect(result).toEqual(true);
  });

  it('returns false when missing nested field node', () => {
    const records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        friends: { __dataID__: 'friends_id'},
      },
    };

    const result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id
            friends {count}
          }
        }
      `),
      records
    );

    expect(result).toEqual(false);
  });

  it('returns false when missing nested field', () => {
    const records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        friends: { __dataID__: 'friends_id'},
      },
      friends_id: {
        __dataID__: 'friends_id',
      },
    };

    const result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id
            friends {count}
          }
        }
      `),
      records
    );

    expect(result).toEqual(false);
  });

  it('returns true when checking nested plural field', () => {
    const records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        screennames: [{__dataID__: 'client:screenname1'}],
      },
      'client:screenname1': {
        __dataID__: 'client:screenname1',
        service: true,
      },
    };

    const result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id
            screennames {service}
          }
        }
      `),
      records
    );

    expect(result).toEqual(true);
  });

  it('returns false when nested plural field node is missing', () => {
    const records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        screennames: [{__dataID__: 'client:screenname1'}],
      },
    };

    const result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id
            screennames {service}
          }
        }
      `),
      records
    );

    expect(result).toEqual(false);
  });

  it('returns false when nested plural field is missing', () => {
    const records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        screennames: [{__dataID__: 'client:screenname1'}],
      },
      'client:screenname1': {
        __dataID__: 'client:screenname1',
      },
    };

    const result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id
            screennames {service}
          }
        }
      `),
      records
    );

    expect(result).toEqual(false);
  });

  it('returns true when range is available', () => {
    const records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        friends: { __dataID__: 'friends_id'},
      },
      friends_id: {
        __dataID__:'friends_id',
        __range__: new GraphQLRange(),
      },
    };
    records.friends_id.__range__.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: [],
      diffCalls: [],
      pageInfo: {[HAS_NEXT_PAGE]: false, [HAS_PREV_PAGE]: false },
    });

    const result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id
            friends(first:"10") {
              edges { node {id}}
            }
          }
        }
      `),
      records
    );
    expect(result).toEqual(true);
  });

  it('returns false when range field has diff calls', () => {
    const records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        friends: { __dataID__: 'friends_id'},
      },
      friends_id: {
        __dataID__:'friends_id',
        __range__: new GraphQLRange(),
      },
    };
    records.friends_id.__range__.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: [],
      diffCalls: [RelayTestUtils.createCall('first', 10)],
      pageInfo: {[HAS_NEXT_PAGE]: false, [HAS_PREV_PAGE]: false },
    });

    const result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id
            friends(first:"10") {
              edges { node {id}}
            }
          }
        }
      `),
      records
    );
    expect(result).toEqual(false);
  });

  it('returns true when `edges` is available on non-connections', () => {
    const records = {
      viewer_id: {
        '__configs__{named:"some_gk"}': {__dataID__:'configs_id'},
        __dataID__: 'viewer_id',
      },
      configs_id: {
        __dataID__: 'configs_id',
        edges: [{__dataID__: 'edge_id'}],
      },
      edge_id: {
        __dataID__: 'edge_id',
        node: {__dataID__:'node_id'},
      },
      node_id: {
        __dataID__: 'node_id',
        name: 'some_gk',
      },
    };

    const result = hasData(getNode(
      Relay.QL`
        query {
          viewer {
            __configs__(named:"some_gk") {
              edges {
                node {
                  name
                }
              }
            }
           }
        }
      `),
      records,
      {viewer: {'': 'viewer_id'}}
    );

    expect(result).toEqual(true);
  });

  it('returns false when missing fields on edge in a range', () => {
    const records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        friends: { __dataID__: 'friends_id'},
      },
      friends_id: {
        __dataID__:'friends_id',
        __range__: new GraphQLRange(),
      },
      edge_id: {
        __dataID__: 'edge_id',
        node: {__dataID__:'node_id'},
      },
      node_id: {
        __dataID__: 'node_id',
        __typename: 'User',
        id: 'node_id',
      },
    };
    records.friends_id.__range__.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['edge_id'],
      diffCalls: [],
      pageInfo: {[HAS_NEXT_PAGE]: false, [HAS_PREV_PAGE]: false },
    });

    const result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id
            friends(first:"10") {
              edges { node {id}, cursor}
            }
          }
        }
      `),
      records
    );
    expect(result).toEqual(false);
  });

  it('returns false when missing fields on node in an edge', () => {
    const records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        friends: { __dataID__: 'friends_id'},
      },
      friends_id: {
        __dataID__:'friends_id',
        __range__: new GraphQLRange(),
      },
      edge_id: {
        __dataID__: 'edge_id',
        node: {__dataID__:'node_id'},
        cursor: 'cursor',
      },
      node_id: {
        __dataID__: 'node_id',
        __typename: 'User',
      },
    };
    records.friends_id.__range__.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['edge_id'],
      diffCalls: [],
      pageInfo: {[HAS_NEXT_PAGE]: false, [HAS_PREV_PAGE]: false },
    });

    const result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id
            friends(first:"10") {
              edges { node {id}, cursor}
            }
          }
        }
      `),
      records
    );
    expect(result).toEqual(false);
  });

  it('checks fragment when there are no fragment filters', () => {
    const records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        username: 'yuzhi',
      },
    };

    const fragment1 = Relay.QL`
      fragment on Node {username}
    `;
    const fragment2 = Relay.QL`
      fragment on Node {name}
    `;
    let result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {id, ${fragment1}}
        }
      `),
      records
    );

    expect(result).toEqual(true);
    result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {id, ${fragment2}}
        }
      `),
      records
    );

    expect(result).toEqual(false);
  });

  it('returns true if matching fragment data is available', () => {
    const records = {
      1055790163: {
        __dataID__: '1055790163',
        __typename: 'User',
        id: '1055790163',
        name: 'Yuzhi',
      },
    };
    const result = hasData(
      getNode(Relay.QL`
        query {
          node(id:"1055790163") {
            id
            ... on User {
              name
            }
          }
        }
      `),
      records
    );
    expect(result).toBe(true);
  });

  it('returns false if matching fragment data is unfetched', () => {
    const records = {
      1055790163: {
        __dataID__: '1055790163',
        __typename: 'User',
        id: '1055790163',
      },
    };
    const result = hasData(
      getNode(Relay.QL`
        query {
          node(id:"1055790163") {
            id
            ... on User {
              name #unfetched
            }
          }
        }
      `),
      records
    );
    expect(result).toBe(false);
  });

  it('returns true if non-matching fragment data is missing', () => {
    const records = {
      1055790163: {
        __dataID__: '1055790163',
        __typename: 'User',
        id: '1055790163',
      },
    };
    const result = hasData(
      getNode(Relay.QL`
        query {
          node(id:"1055790163") {
            id
            # non-matching type - should not count as missing data
            ... on Page {
              name
            }
          }
        }
      `),
      records
    );
    expect(result).toEqual(true);
  });
});
