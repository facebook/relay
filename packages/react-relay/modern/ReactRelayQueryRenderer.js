/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactRelayQueryRenderer
 * @flow
 * @format
 */

'use strict';

const React = require('React');
const RelayPropTypes = require('RelayPropTypes');

const areEqual = require('areEqual');
const deepFreeze = require('deepFreeze');

import type {CacheConfig, Disposable} from 'RelayCombinedEnvironmentTypes';
import type {
  RelayEnvironmentInterface as ClassicEnvironment,
} from 'RelayEnvironment';
import type {GraphQLTaggedNode} from 'RelayModernGraphQLTag';
import type {
  Environment,
  OperationSelector,
  RelayContext,
  Snapshot,
} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

type Props = {
  cacheConfig?: ?CacheConfig,
  environment: Environment | ClassicEnvironment,
  query: ?GraphQLTaggedNode,
  render: (readyState: ReadyState) => ?React.Element<*>,
  variables: Variables,
};
type ReadyState = {
  error: ?Error,
  props: ?Object,
  retry: ?() => void,
};
type State = {
  readyState: ReadyState,
};

/**
 * @public
 *
 * Orchestrates fetching and rendering data for a single view or view hierarchy:
 * - Fetches the query/variables using the given network implementation.
 * - Normalizes the response(s) to that query, publishing them to the given
 *   store.
 * - Renders the pending/fail/success states with the provided render function.
 * - Subscribes for updates to the root data and re-renders with any changes.
 */
class ReactRelayQueryRenderer extends React.Component {
  _pendingFetch: ?Disposable;
  _relayContext: RelayContext;
  _rootSubscription: ?Disposable;
  _selectionReference: ?Disposable;

  props: Props;
  state: State;

  constructor(props: Props, context: Object) {
    super(props, context);
    let {query, variables} = props;
    // TODO (#16225453) QueryRenderer works with old and new environment, but
    // the flow typing doesn't quite work abstracted.
    // $FlowFixMe
    const environment: Environment = props.environment;
    let operation = null;
    if (query) {
      const {
        createOperationSelector,
        getOperation,
      } = environment.unstable_internal;
      query = getOperation(query);
      operation = createOperationSelector(query, variables);
      variables = operation.variables;
    }

    this._pendingFetch = null;
    this._relayContext = {
      environment,
      variables,
    };
    this._rootSubscription = null;
    this._selectionReference = null;
    if (query) {
      this.state = {
        readyState: getDefaultState(),
      };
    } else {
      this.state = {
        readyState: {
          error: null,
          props: {},
          retry: null,
        },
      };
    }

    if (operation) {
      const readyState = this._fetch(operation, props.cacheConfig);
      if (readyState) {
        this.state = {readyState};
      }
    }
  }

  componentWillReceiveProps(nextProps: Props): void {
    if (
      nextProps.query !== this.props.query ||
      nextProps.environment !== this.props.environment ||
      !areEqual(nextProps.variables, this.props.variables)
    ) {
      const {query, variables} = nextProps;
      // TODO (#16225453) QueryRenderer works with old and new environment, but
      // the flow typing doesn't quite work abstracted.
      // $FlowFixMe
      const environment: Environment = nextProps.environment;
      if (query) {
        const {
          createOperationSelector,
          getOperation,
        } = environment.unstable_internal;
        const operation = createOperationSelector(
          getOperation(query),
          variables,
        );
        this._relayContext = {
          environment,
          variables: operation.variables,
        };
        const readyState = this._fetch(operation, nextProps.cacheConfig);
        this.setState({
          readyState: readyState || getDefaultState(),
        });
      } else {
        this._relayContext = {
          environment,
          variables,
        };
        this._release();
        this.setState({
          readyState: {
            error: null,
            props: {},
            retry: null,
          },
        });
      }
    }
  }

  componentWillUnmount(): void {
    this._release();
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    return (
      nextProps.render !== this.props.render ||
      nextState.readyState !== this.state.readyState
    );
  }

  _release(): void {
    if (this._pendingFetch) {
      this._pendingFetch.dispose();
      this._pendingFetch = null;
    }
    if (this._rootSubscription) {
      this._rootSubscription.dispose();
      this._rootSubscription = null;
    }
    if (this._selectionReference) {
      this._selectionReference.dispose();
      this._selectionReference = null;
    }
  }

  _fetch(operation: OperationSelector, cacheConfig: ?CacheConfig): ?ReadyState {
    const {environment} = this._relayContext;

    // Immediately retain the results of the new query to prevent relevant data
    // from being freed. This is not strictly required if all new data is
    // fetched in a single step, but is necessary if the network could attempt
    // to incrementally load data (ex: multiple query entries or incrementally
    // loading records from disk cache).
    const nextReference = environment.retain(operation.root);

    let readyState = getDefaultState();
    let snapshot: ?Snapshot; // results of the root fragment
    let isOnNextCalled = false;
    let isFunctionReturned = false;
    const onCompleted = () => {
      this._pendingFetch = null;
    };
    const onError = error => {
      readyState = {
        error,
        props: null,
        retry: () => {
          this._fetch(operation, cacheConfig);
        },
      };
      if (this._selectionReference) {
        this._selectionReference.dispose();
      }
      this._pendingFetch = null;
      this._selectionReference = nextReference;
      this.setState({readyState});
    };
    const onNext = () => {
      // `onNext` can be called multiple times by network layers that support
      // data subscriptions. Wait until the first payload to render `props` and
      // subscribe for data updates.
      if (snapshot) {
        return;
      }
      snapshot = environment.lookup(operation.fragment);
      readyState = {
        error: null,
        props: snapshot.data,
        retry: () => {
          this._fetch(operation, cacheConfig);
        },
      };

      if (this._selectionReference) {
        this._selectionReference.dispose();
      }
      this._rootSubscription = environment.subscribe(snapshot, this._onChange);
      this._selectionReference = nextReference;
      // This line should be called only once.
      isOnNextCalled = true;
      if (isFunctionReturned) {
        this.setState({readyState});
      }
    };

    if (this._pendingFetch) {
      this._pendingFetch.dispose();
    }
    if (this._rootSubscription) {
      this._rootSubscription.dispose();
    }
    const request = environment.streamQuery({
      cacheConfig,
      onCompleted,
      onError,
      onNext,
      operation,
    });
    this._pendingFetch = {
      dispose() {
        request.dispose();
        nextReference.dispose();
      },
    };
    isFunctionReturned = true;
    return isOnNextCalled ? readyState : null;
  }

  _onChange = (snapshot: Snapshot): void => {
    this.setState({
      readyState: {
        ...this.state.readyState,
        props: snapshot.data,
      },
    });
  };
  getChildContext(): Object {
    return {
      relay: this._relayContext,
    };
  }

  render() {
    // Note that the root fragment results in `readyState.props` is already
    // frozen by the store; this call is to freeze the readyState object and
    // error property if set.
    if (__DEV__) {
      deepFreeze(this.state.readyState);
    }
    return this.props.render(this.state.readyState);
  }
}

ReactRelayQueryRenderer.childContextTypes = {
  relay: RelayPropTypes.Relay,
};

function getDefaultState(): ReadyState {
  return {
    error: null,
    props: null,
    retry: null,
  };
}

module.exports = ReactRelayQueryRenderer;
