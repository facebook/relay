/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow
 * @format
 */

'use strict';

const {getFragmentResourceForEnvironment} = require('../FragmentResource');
const {
  RelayFeatureFlags,
  __internal: {fetchQuery},
  createOperationDescriptor,
  getFragment,
  getRequest,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');

beforeEach(() => {
  RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = true;
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = false;
});

let environment;
let query;
let FragmentResource;
let UserFragment;
let logger;
let requiredFieldLogger;
const componentDisplayName = 'TestComponent';

beforeEach(() => {
  logger = jest.fn();
  requiredFieldLogger = jest.fn();

  environment = createMockEnvironment({
    log: logger,
    requiredFieldLogger,
  });
  FragmentResource = getFragmentResourceForEnvironment(environment);

  UserFragment = getFragment(graphql`
    fragment FragmentResourceRequiredFieldTestUserFragment on User {
      id
      name @required(action: THROW)
      alternate_name @required(action: LOG)
    }
  `);

  query = createOperationDescriptor(
    getRequest(graphql`
      query FragmentResourceRequiredFieldTestUserQuery($id: ID!) {
        node(id: $id) {
          __typename
          ...FragmentResourceRequiredFieldTestUserFragment
        }
      }
    `),
    {id: '4'},
  );
});

test('Throws if a @required(action: THROW) field is null', () => {
  environment.commitPayload(query, {
    node: {
      __typename: 'User',
      id: '4',
      name: null,
      alternate_name: 'Zuckster',
    },
  });
  expect(() => {
    FragmentResource.read(
      getFragment(UserFragment),
      {
        __id: '4',
        __fragments: {
          FragmentResourceRequiredFieldTestUserFragment: {},
        },
        __fragmentOwner: query.request,
      },
      componentDisplayName,
    );
  }).toThrowError(
    "Relay: Missing @required value at path 'name' in 'FragmentResourceRequiredFieldTestUserFragment'.",
  );
});

test('Logs if a @required(action: LOG) field is null', () => {
  environment.commitPayload(query, {
    node: {
      __typename: 'User',
      id: '4',
      name: 'Zucc',
      alternate_name: null,
    },
  });
  FragmentResource.read(
    getFragment(UserFragment),
    {
      __id: '4',
      __fragments: {
        FragmentResourceRequiredFieldTestUserFragment: {},
      },
      __fragmentOwner: query.request,
    },
    componentDisplayName,
  );
  expect(requiredFieldLogger).toHaveBeenCalledWith({
    fieldPath: 'alternate_name',
    kind: 'missing_field.log',
    owner: 'FragmentResourceRequiredFieldTestUserFragment',
  });
});

test('Throws if a @required(action: THROW) field is present and then goes missing', () => {
  const callback = jest.fn();
  environment.commitPayload(query, {
    node: {
      __typename: 'User',
      id: '4',
      name: 'Zucc',
      alternate_name: 'Zuckster',
    },
  });
  const result = FragmentResource.read(
    getFragment(UserFragment),
    {
      __id: '4',
      __fragments: {
        FragmentResourceRequiredFieldTestUserFragment: {},
      },
      __fragmentOwner: query.request,
    },
    componentDisplayName,
  );
  expect(result.data).toEqual({
    id: '4',
    name: 'Zucc',
    alternate_name: 'Zuckster',
  });

  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(environment.subscribe).toHaveBeenCalledTimes(0);
  const disposable = FragmentResource.subscribe(result, callback);

  environment.commitPayload(query, {
    node: {
      __typename: 'User',
      id: '4',
      name: null,
      alternate_name: 'Zuckster',
    },
  });

  expect(() =>
    FragmentResource.read(
      getFragment(UserFragment),
      {
        __id: '4',
        __fragments: {
          FragmentResourceRequiredFieldTestUserFragment: {},
        },
        __fragmentOwner: query.request,
      },
      componentDisplayName,
    ),
  ).toThrowError(
    "Relay: Missing @required value at path 'name' in 'FragmentResourceRequiredFieldTestUserFragment'.",
  );

  expect(requiredFieldLogger).toHaveBeenCalledWith({
    fieldPath: 'name',
    kind: 'missing_field.throw',
    owner: 'FragmentResourceRequiredFieldTestUserFragment',
  });

  disposable.dispose();
});

it('should throw promise if reading missing data and network request for parent query is in flight', async () => {
  fetchQuery(environment, query).subscribe({});
  const fragmentNode = getFragment(UserFragment);
  const fragmentRef = {
    __id: '4',
    __fragments: {
      FragmentResourceRequiredFieldTestUserFragment: {},
    },
    __fragmentOwner: query.request,
  };

  // Try reading a fragment while parent query is in flight
  let thrown = null;
  try {
    FragmentResource.read(fragmentNode, fragmentRef, componentDisplayName);
  } catch (p) {
    thrown = p;
  }

  expect(thrown).toBeInstanceOf(Promise);

  environment.mock.resolve(query, {
    data: {
      node: {
        __typename: 'User',
        id: '4',
        name: null,
        alternate_name: 'Zuckster',
      },
    },
  });
  jest.runAllImmediates();
  await thrown;

  // Now that the request is complete, check that we detect the missing field.
  expect(() =>
    FragmentResource.read(
      getFragment(UserFragment),
      fragmentRef,
      componentDisplayName,
    ),
  ).toThrowError(
    "Relay: Missing @required value at path 'name' in 'FragmentResourceRequiredFieldTestUserFragment'.",
  );
});
