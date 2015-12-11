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

const GraphQLRange = require('GraphQLRange');
const Relay = require('Relay');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayTestUtils = require('RelayTestUtils');

const checkRelayQueryData = require('checkRelayQueryData');

describe('checkRelayQueryData', () => {
  var RelayRecordStore;

  var {getNode} = RelayTestUtils;
  var HAS_NEXT_PAGE, HAS_PREV_PAGE;

  function hasData(
    query,
    records,
    rootCallMap,
    fragmentFilter
  ) {
    var store = new RelayRecordStore(
      {records: records || {}},
      {rootCallMap: rootCallMap || {}}
    );
    return checkRelayQueryData(store, query, fragmentFilter);
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayRecordStore = require('RelayRecordStore');

    ({HAS_NEXT_PAGE, HAS_PREV_PAGE} = RelayConnectionInterface);
  });

  it('returns false when node is not in the store', () => {
    var result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {id}
        }
      `,
    ));

    expect(result).toEqual(false);
  });

  it('returns true when node is null', () => {
    var records = {
      1055790163: null,
    };

    var result = hasData(getNode(
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
    var records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
      },
    };

    var result = hasData(getNode(
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
    var records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
      },
    };

    var result = hasData(getNode(
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
    var records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
      },
    };

    var result = hasData(getNode(
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
    var records = {
      1055790163: {
        id: '1055790163',
        firstName: 'Yuzhi',
        __dataID__: '1055790163',
        __typename: 'User',
      },
    };

    var result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id,
            firstName
          }
        }
      `),
      records
    );

    expect(result).toEqual(true);
  });

  it('returns false when scalar field is missing', () => {
    var records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
      },
    };

    var result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id,
            firstName
          }
        }
      `),
      records
    );

    expect(result).toEqual(false);
  });

  it('returns true when nested fields are available', () => {
    var records = {
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

    var result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id,
            friends {count}
          }
        }
      `),
      records
    );

    expect(result).toEqual(true);
  });

  it('returns false when missing nested field node', () => {
    var records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        friends: { __dataID__: 'friends_id'},
      },
    };

    var result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id,
            friends {count}
          }
        }
      `),
      records
    );

    expect(result).toEqual(false);
  });

  it('returns false when missing nested field', () => {
    var records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        friends: { __dataID__: 'friends_id'},
      },
      friends_id: {
        __dataID__: 'friends_id',
      },
    };

    var result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id,
            friends {count}
          }
        }
      `),
      records
    );

    expect(result).toEqual(false);
  });

  it('returns true when checking nested plural field', () => {
    var records = {
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

    var result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id,
            screennames {service}
          }
        }
      `),
      records
    );

    expect(result).toEqual(true);
  });

  it('returns false when nested plural field node is missing', () => {
    var records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        screennames: [{__dataID__: 'client:screenname1'}],
      },
    };

    var result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id,
            screennames {service}
          }
        }
      `),
      records
    );

    expect(result).toEqual(false);
  });

  it('returns false when nested plural field is missing', () => {
    var records = {
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

    var result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id,
            screennames {service}
          }
        }
      `),
      records
    );

    expect(result).toEqual(false);
  });

  it('returns true when range is available', () => {
    var records = {
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

    var result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id,
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
    var records = {
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

    var result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id,
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
    var records = {
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

    var result = hasData(getNode(
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
    var records = {
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

    var result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id,
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
    var records = {
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

    var result = hasData(getNode(
      Relay.QL`
        query {
          node(id:"1055790163") {
            id,
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
    var records = {
      1055790163: {
        id: '1055790163',
        __dataID__: '1055790163',
        __typename: 'User',
        username: 'yuzhi',
      },
    };

    var fragment1 = Relay.QL`
      fragment on Node {username}
    `;
    var fragment2 = Relay.QL`
      fragment on Node {name}
    `;
    var result = hasData(getNode(
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
    var records = {
      1055790163: {
        __dataID__: '1055790163',
        __typename: 'User',
        id: '1055790163',
        name: 'Yuzhi',
      },
    };
    var result = hasData(
      getNode(Relay.QL`
        query {
          node(id:"1055790163") {
            id,
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
    var records = {
      1055790163: {
        __dataID__: '1055790163',
        __typename: 'User',
        id: '1055790163',
      },
    };
    var result = hasData(
      getNode(Relay.QL`
        query {
          node(id:"1055790163") {
            id,
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
    var records = {
      1055790163: {
        __dataID__: '1055790163',
        __typename: 'User',
        id: '1055790163',
      },
    };
    var result = hasData(
      getNode(Relay.QL`
        query {
          node(id:"1055790163") {
            id,
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
