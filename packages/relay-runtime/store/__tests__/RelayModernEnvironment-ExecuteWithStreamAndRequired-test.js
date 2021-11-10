/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';
import type {
  Variables,
  CacheConfig,
} from 'relay-runtime/util/RelayRuntimeTypes';
import type {RequestParameters} from 'relay-runtime/util/RelayConcreteNode';

const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const {getFragment, getRequest, graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {RelayFeatureFlags} = require('relay-runtime');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe('execute() a query with @stream and @required', () => {
  let callbacks;
  let dataSource;
  let environment;
  let fetch;
  let fragment;
  let operation;
  let query;
  let selector;

  beforeEach(() => {
    RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = true;

    query = getRequest(graphql`
      query RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackQuery(
        $id: ID!
        $enableStream: Boolean!
      ) {
        node(id: $id) {
          ...RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment
        }
      }
    `);

    fragment = getFragment(graphql`
      fragment RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment on Feedback {
        id
        actors
          @stream(label: "actors", if: $enableStream, initial_count: 0)
          @required(action: LOG) {
          name
        }
      }
    `);
    const variables = {id: '1', enableStream: true};

    const complete = jest.fn();
    const error = jest.fn();
    const next = jest.fn();

    operation = createOperationDescriptor(query, variables);
    selector = createReaderSelector(fragment, '1', {}, operation.request);
    callbacks = {complete, error, next};

    fetch = (
      _query: RequestParameters,
      _variables: Variables,
      _cacheConfig: CacheConfig,
    ) => {
      return RelayObservable.create(sink => {
        dataSource = sink;
      });
    };
    const source = RelayRecordSource.create();
    const store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      store,
    });
  });

  afterEach(() => {
    RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = false;
  });

  it('bubbles @required @stream nodes up to the parent', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          __typename: 'Feedback',
          id: '1',
          actors: null,
        },
      },
    };
    dataSource.next(payload);
    jest.runAllTimers();

    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.missingRequiredFields).toEqual({
      action: 'LOG',
      fields: [
        {
          owner:
            'RelayModernEnvironmentExecuteWithStreamAndRequiredTestFeedbackFragment',
          path: 'actors',
        },
      ],
    });
    expect(snapshot.data).toEqual(null);
  });
});
