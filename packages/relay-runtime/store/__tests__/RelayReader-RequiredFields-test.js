/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const RelayRecordSource = require('../RelayRecordSource');

const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {read} = require('../RelayReader');
const {createReaderSelector} = require('relay-runtime');
const {generateAndCompile} = require('relay-test-utils-internal');

describe('RelayReader @required', () => {
  let source;

  beforeEach(() => {
    const data = {
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        firstName: 'Alice',
        lastName: null,
        emailAddresses: null,
        backgroundImage: {__ref: 'client:2'},
        screennames: {
          __refs: ['client:5:screennames:0', 'client:5:screennames:1'],
        },
      },
      '2': {
        __id: '2',
        id: '2',
        __typename: 'Viewer',
        actor: {__ref: 'client:3'},
        allTimezones: null,
      },
      '3': {
        __id: '3',
        id: '3',
        __typename: 'NonNodeNoID',
        name: 'I am not a node',
      },
      'client:2': {
        __id: 'client:2',
        __typename: 'Image',
        uri: null,
      },
      'client:3': {
        __id: 'client:3',
        __typename: 'Actor',
        address: {__ref: 'client:4'},
      },
      'client:4': {
        __id: 'client:4',
        __typename: 'Address',
        country: null,
      },
      'client:5:screennames:0': {
        __id: 'client:5:screennames:0',
        __typename: 'Screenname',
        name: 'neo',
        service: 'IRC',
      },
      'client:5:screennames:1': {
        __id: 'client:5:screennames:1',
        __typename: 'Screenname',
        name: 'beast',
        service: null,
      },
      'client:6:timezones:0': {
        __id: 'client:6:timezones:0',
        __typename: 'TimezoneInfo',
        timezone: 'PARTY TIME',
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
        maybeNodeInterface: {__ref: '3'},
        viewer: {__ref: '2'},
      },
    };

    source = RelayRecordSource.create(data);
  });

  it('can request to throw on unexpected null', () => {
    const {FooQuery} = generateAndCompile(`
      query FooQuery {
        me {
          firstName
          lastName @required(action: THROW)
        }
      }
    `);
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    expect(() => {
      read(source, operation.fragment);
    }).toThrowErrorMatchingInlineSnapshot(
      "\"Unexpected null value in 'FooQuery' at path 'me.lastName'\"",
    );
  });

  it('bubbles @required(action: LOG) scalars up to LinkedField', () => {
    const {FooQuery} = generateAndCompile(`
      query FooQuery {
        me {
          firstName
          lastName @required(action: LOG)
        }
      }
    `);
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data} = read(source, operation.fragment);
    expect(data).toEqual({me: null});
  });

  it('bubbles @required(action: LOG) scalars up to LinkedField even if subsequent fields are not unexpectedly null', () => {
    const {FooQuery} = generateAndCompile(`
      query FooQuery {
        me {
          lastName @required(action: LOG)
          firstName @required(action: LOG)
        }
      }
    `);
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data} = read(source, operation.fragment);
    expect(data).toEqual({me: null});
  });

  it('only bubbles @required(action: LOG) scalars up to the parent LinkedField', () => {
    const {FooQuery} = generateAndCompile(`
      query FooQuery {
        me {
          backgroundImage {
            uri @required(action: LOG)
          }
        }
      }
    `);
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data} = read(source, operation.fragment);
    expect(data).toEqual({me: {backgroundImage: null}});
    expect(data).toMatchInlineSnapshot(`
      Object {
        "me": Object {
          "backgroundImage": null,
        },
      }
    `);
  });

  it('bubbles @required(action: LOG) through @required(action: LOG) LinkedField', () => {
    const {FooQuery} = generateAndCompile(`
      query FooQuery {
        me {
          backgroundImage @required(action: LOG) {
            uri @required(action: LOG)
          }
        }
      }
    `);
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data} = read(source, operation.fragment);
    expect(data).toEqual({me: null});
  });

  it('bubbles @required(action: LOG) scalars up to the query root', () => {
    const {FooQuery} = generateAndCompile(`
      query FooQuery {
        me @required(action: LOG) {
          lastName @required(action: LOG)
        }
      }
    `);
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data} = read(source, operation.fragment);
    expect(data).toBeNull();
  });

  it('bubbles @required(action: LOG) up to plural linked field', () => {
    const {FooQuery} = generateAndCompile(`
      query FooQuery {
        me {
          screennames {
            name
            service @required(action: LOG)
          }
        }
      }
    `);

    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data} = read(source, operation.fragment);
    expect(data).toEqual({
      me: {
        screennames: [{name: 'neo', service: 'IRC'}, null],
      },
    });
  });

  it('bubbles @required(action: LOG) on plural scalar field up to the parent', () => {
    const {FooQuery} = generateAndCompile(`
      query FooQuery {
        me {
          emailAddresses @required(action: LOG)
        }
      }
    `);

    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data} = read(source, operation.fragment);
    expect(data).toEqual({me: null});
  });

  it('does _not_ bubbles @required(action: LOG) on plural linked field up to the parent', () => {
    const {FooQuery} = generateAndCompile(`
      query FooQuery {
        me {
          screennames @required(action: LOG) {
            name
            service @required(action: LOG)
          }
        }
      }
    `);
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data} = read(source, operation.fragment);
    expect(data).toEqual({
      me: {
        screennames: [{name: 'neo', service: 'IRC'}, null],
      },
    });
  });

  it('bubbles when encountering a missing plural linked field', () => {
    const {FooQuery} = generateAndCompile(`
      query FooQuery {
        viewer {
          allTimezones @required(action: NONE) {
            timezone
          }
        }
      }
    `);
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data} = read(source, operation.fragment);
    expect(data).toEqual({viewer: null});
  });

  it('@required(action: LOG) within an inline fragment does not bubble if type does not match', () => {
    const {FooQuery} = generateAndCompile(`
      query FooQuery {
        maybeNodeInterface {
          ... on Story {
            # Weird that a story has a last name. Probably just test data being silly.
            lastName @required(action: LOG)
          }
          name
        }
      }
    `);

    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data} = read(source, operation.fragment);
    expect(data).toEqual({maybeNodeInterface: {name: 'I am not a node'}});
  });

  it('bubbles @required(action: LOG) on Scalar up to parent fragment', () => {
    const {BarFragment, UserQuery} = generateAndCompile(`
      query UserQuery {
        me {
          ...BarFragment
        }
      }
      fragment BarFragment on User {
        lastName @required(action: LOG)
      }
    `);
    const owner = createOperationDescriptor(UserQuery);
    const {data} = read(
      source,
      createReaderSelector(BarFragment, '1', {}, owner.request),
    );
    expect(data).toBeNull();
  });

  it('bubbles @required(action: LOG) on LinkedField up to parent fragment', () => {
    const {BarFragment, UserQuery} = generateAndCompile(`
      query UserQuery {
        me {
          ...BarFragment
        }
      }
      fragment BarFragment on User {
        backgroundImage @required(action: LOG) {
          uri @required(action: LOG)
        }
      }
    `);
    const owner = createOperationDescriptor(UserQuery);
    const {data} = read(
      source,
      createReaderSelector(BarFragment, '1', {}, owner.request),
    );
    expect(data).toBeNull();
  });

  it('bubbles @required(action: LOG) on LinkedField up to parent fragment on Query', () => {
    const {BarFragment, UserQuery} = generateAndCompile(`
      query UserQuery {
          ...BarFragment
      }
      fragment BarFragment on Query {
        me @required(action: LOG) {
          lastName @required(action: LOG)
        }
      }
    `);
    const owner = createOperationDescriptor(UserQuery, {});
    const {data} = read(
      source,
      createReaderSelector(BarFragment, 'client:root', {}, owner.request),
    );
    expect(data).toBeNull();
  });

  it('does not allow unexpected nulls to escape fragment boundaries', () => {
    const {BarFragment, UserQuery} = generateAndCompile(`
      query UserQuery {
        me @required(action: LOG) {
          firstName
        }
        ...BarFragment
      }
      fragment BarFragment on Query {
        me @required(action: LOG) {
          lastName @required(action: LOG)
        }
      }
    `);
    const operation = createOperationDescriptor(UserQuery, {});
    const {data: queryData} = read(source, operation.fragment);

    expect(queryData).toMatchObject({me: {firstName: 'Alice'}});

    const {data: fragmentData} = read(
      source,
      createReaderSelector(BarFragment, 'client:root', {}, operation.request),
    );
    expect(fragmentData).toBeNull();
  });

  it('bubble nulls if the value is "missing" (still in the process of being loaded)', () => {
    const {BarFragment, UserQuery} = generateAndCompile(`
      query UserQuery {
        me {
          ...BarFragment
        }
      }
      fragment BarFragment on User {
        firstName
        username @required(action: LOG)
      }
    `);
    const owner = createOperationDescriptor(UserQuery);
    const {data, isMissingData} = read(
      source,
      createReaderSelector(BarFragment, '1', {}, owner.request),
    );
    expect(isMissingData).toBe(true);
    expect(data).toEqual(null);
  });
});
