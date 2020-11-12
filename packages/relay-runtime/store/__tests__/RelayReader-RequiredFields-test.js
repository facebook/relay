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
const {createReaderSelector, RelayFeatureFlags} = require('relay-runtime');
const {generateAndCompile} = require('relay-test-utils-internal');

beforeEach(() => {
  RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = true;
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = false;
});

describe('RelayReader @required', () => {
  it('throws if a @required is encounted without the ENABLE_REQUIRED_DIRECTIVES feature flag enabled', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        firstName: 'Alice',
        lastName: null,
      },
    });
    const {FooQuery} = generateAndCompile(`
      query FooQuery {
        me {
          firstName
          lastName @required(action: LOG)
        }
      }
    `);
    const operation = createOperationDescriptor(FooQuery, {id: '1'});

    RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = false;

    expect(() => {
      read(source, operation.fragment);
    }).toThrowErrorMatchingInlineSnapshot(
      '"RelayReader(): Encountered a `@required` directive at path \\"me.lastName\\" in `FooQuery` without the `ENABLE_REQUIRED_DIRECTIVES` feature flag enabled."',
    );
  });

  it('bubbles @required(action: LOG) scalars up to LinkedField', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        firstName: 'Alice',
        lastName: null,
      },
    });
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

  it('if two @required(action: THROW) errors cascade, report the more deeply nested one', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        lastName: null,
      },
    });
    const {FooQuery} = generateAndCompile(`
      query FooQuery {
        me @required(action: THROW) {
          lastName @required(action: THROW)
        }
      }
    `);
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data, missingRequiredFields} = read(source, operation.fragment);
    expect(data).toEqual(null);
    expect(missingRequiredFields.field.path).toBe('me.lastName');
  });

  it('bubbles @required(action: LOG) scalars up to LinkedField even if subsequent fields are not unexpectedly null', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        firstName: 'Alice',
        lastName: null,
      },
    });
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
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        backgroundImage: {__ref: 'client:2'},
      },
      'client:2': {
        __id: 'client:2',
        __typename: 'Image',
        uri: null,
      },
    });
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
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        backgroundImage: {__ref: 'client:2'},
      },
      'client:2': {
        __id: 'client:2',
        __typename: 'Image',
        uri: null,
      },
    });
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
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        lastName: null,
      },
    });
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
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        screennames: {
          __refs: ['client:5:screennames:0', 'client:5:screennames:1'],
        },
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
    });
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
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        emailAddress: null,
      },
    });
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
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        screennames: {
          __refs: ['client:5:screennames:0', 'client:5:screennames:1'],
        },
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
    });
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
    const source = RelayRecordSource.create({
      '2': {
        __id: '2',
        id: '2',
        __typename: 'Viewer',
        allTimezones: null,
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        viewer: {__ref: '2'},
      },
    });
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

  it('@required(action: LOG) within an inline fragment on a concrete type bubbles if the type matches', () => {
    const source = RelayRecordSource.create({
      '3': {
        __id: '3',
        id: '3',
        __typename: 'NonNodeNoID',
        name: null,
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        maybeNodeInterface: {__ref: '3'},
      },
    });
    const {FooQuery} = generateAndCompile(`
      query FooQuery {
        maybeNodeInterface {
          ... on NonNodeNoID {
            name @required(action: LOG)
          }
        }
      }
    `);

    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data} = read(source, operation.fragment);
    expect(data).toEqual({maybeNodeInterface: null});
  });

  it('@required(action: LOG) within an inline fragment does not bubble if type does not match', () => {
    const source = RelayRecordSource.create({
      '3': {
        __id: '3',
        id: '3',
        __typename: 'NonNodeNoID',
        name: 'I am not a node',
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        maybeNodeInterface: {__ref: '3'},
      },
    });
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

  it('@required(action: LOG) bubbles across @skip', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        emailAddress: null,
      },
    });
    const {FooQuery} = generateAndCompile(`
      query FooQuery($skip: Boolean!) {
        me {
          emailAddresses @skip(if: $skip) @required(action: LOG)
        }
      }
    `);

    const operation = createOperationDescriptor(FooQuery, {
      id: '1',
      skip: false,
    });
    const {data} = read(source, operation.fragment);
    expect(data).toEqual({me: null});
  });

  it('@required(action: LOG) bubbles across @include', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        emailAddress: null,
      },
    });
    const {FooQuery} = generateAndCompile(`
      query FooQuery($include: Boolean!) {
        me {
          emailAddresses @include(if: $include) @required(action: LOG)
        }
      }
    `);

    const operation = createOperationDescriptor(FooQuery, {
      id: '1',
      include: true,
    });
    const {data} = read(source, operation.fragment);
    expect(data).toEqual({me: null});
  });

  it('@required(action: LOG) does not bubble if @required field is not @included', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        emailAddress: null,
        name: 'Zucc',
      },
    });
    const {FooQuery} = generateAndCompile(`
      query FooQuery($include: Boolean!) {
        me {
          emailAddresses @include(if: $include) @required(action: LOG)
          name
        }
      }
    `);

    const operation = createOperationDescriptor(FooQuery, {
      id: '1',
      include: false,
    });
    const {data} = read(source, operation.fragment);
    expect(data).toEqual({me: {name: 'Zucc'}});
  });

  it('@required(action: LOG) does not bubble if @required field is @skipped', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        emailAddress: null,
        name: 'Zucc',
      },
    });
    const {FooQuery} = generateAndCompile(`
      query FooQuery($skip: Boolean!) {
        me {
          emailAddresses @skip(if: $skip) @required(action: LOG)
          name
        }
      }
    `);

    const operation = createOperationDescriptor(FooQuery, {
      id: '1',
      skip: true,
    });
    const {data} = read(source, operation.fragment);
    expect(data).toEqual({me: {name: 'Zucc'}});
  });

  it('@required(action: LOG) bubbles client extension fields', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        client_nickname: null,
      },
    });
    const {FooQuery} = generateAndCompile(`
      query FooQuery{
        me {
          client_nickname @required(action: LOG)
        }
      }

      extend type User {
        client_nickname: String
      }
    `);

    const operation = createOperationDescriptor(FooQuery, {
      id: '1',
    });
    const {data} = read(source, operation.fragment);
    expect(data).toEqual({me: null});
  });

  it('bubbles @required(action: LOG) on Scalar up to parent fragment', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        lastName: null,
      },
    });
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
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        backgroundImage: {__ref: 'client:2'},
      },
      'client:2': {
        __id: 'client:2',
        __typename: 'Image',
        uri: null,
      },
    });
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
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        lastName: null,
      },
    });
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
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        firstName: 'Alice',
        lastName: null,
      },
    });
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

  it('bubbles nulls if the value is "missing" (still in the process of being loaded)', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        firstName: 'Alice',
        username: undefined,
      },
    });
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
