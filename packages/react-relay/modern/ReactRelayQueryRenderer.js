/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const React = require('React');
const RelayPropTypes = require('../classic/container/RelayPropTypes');

const areEqual = require('areEqual');
const deepFreeze = require('../classic/tools/deepFreeze');

import type {
  CacheConfig,
  Disposable,
} from '../classic/environment/RelayCombinedEnvironmentTypes';
import type {RelayEnvironmentInterface as ClassicEnvironment} from '../classic/store/RelayEnvironment';
import type {RerunParam, Variables} from '../classic/tools/RelayTypes';
import type {
  IEnvironment,
  GraphQLTaggedNode,
  OperationSelector,
  RelayContext,
  Snapshot,
} from 'RelayRuntime';

export type Props = {
  cacheConfig?: ?CacheConfig,
  environment: IEnvironment | ClassicEnvironment,
  query: ?GraphQLTaggedNode,
  render: (readyState: ReadyState) => React.Node,
  variables: Variables,
  rerunParamExperimental?: RerunParam,
};
export type ReadyState = {
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
class ReactRelayQueryRenderer extends React.Component<Props, State> {
  _pendingFetch: ?Disposable;
  _relayContext: RelayContext;
  _rootSubscription: ?Disposable;
  _selectionReferences: Array<Disposable> = [];

  state = {readyState: this._fetchForProps(this.props)};

  componentWillReceiveProps(nextProps: Props): void {
    if (
      nextProps.query !== this.props.query ||
      nextProps.environment !== this.props.environment ||
      !areEqual(nextProps.variables, this.props.variables)
    ) {
      this.setState({
        readyState: this._fetchForProps(nextProps),
      });
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

  _disposeSelectionReferences(): void {
    this._selectionReferences.forEach(r => r.dispose());
    this._selectionReferences = [];
  }

  _release(): void {
    // order is important, dispose of pendingFetch before selectionReferences
    if (this._pendingFetch) {
      this._pendingFetch.dispose();
      this._pendingFetch = null;
    }
    if (this._rootSubscription) {
      this._rootSubscription.dispose();
      this._rootSubscription = null;
    }
    this._disposeSelectionReferences();
  }

  _fetchForProps(props: Props): ReadyState {
    // TODO (#16225453) QueryRenderer works with old and new environment, but
    // the flow typing doesn't quite work abstracted.
    // $FlowFixMe
    const environment: IEnvironment = props.environment;

    const {query, variables} = props;
    if (query) {
      const {
        createOperationSelector,
        getRequest,
      } = environment.unstable_internal;
      const request = getRequest(query);
      const operation = createOperationSelector(request, variables);
      this._relayContext = {
        environment,
        variables: operation.variables,
      };
      return this._fetch(operation, props.cacheConfig) || getDefaultState();
    } else {
      this._relayContext = {
        environment,
        variables,
      };
      this._release();
      return {
        error: null,
        props: {},
        retry: null,
      };
    }
  }

  _fetch(operation: OperationSelector, cacheConfig: ?CacheConfig): ?ReadyState {
    const {environment} = this._relayContext;
    const {createOperationSelector} = environment.unstable_internal;

    const nextReferences = [];

    let readyState = getDefaultState();
    let snapshot: ?Snapshot; // results of the root fragment
    let hasSyncResult = false;
    let hasFunctionReturned = false;

    if (this._pendingFetch) {
      this._pendingFetch.dispose();
    }
    if (this._rootSubscription) {
      this._rootSubscription.dispose();
    }

    const request = environment
      .execute({operation, cacheConfig})
      .finally(() => {
        this._pendingFetch = null;
      })
      .subscribe({
        next: payload => {
          const operationForPayload = createOperationSelector(
            operation.node,
            payload.variables,
            payload.operation,
          );
          nextReferences.push(environment.retain(operationForPayload.root));
          // `next` can be called multiple times by network layers that support
          // data subscriptions. Wait until the first payload to render `props`
          // and subscribe for data updates.
          if (snapshot) {
            return;
          }
          snapshot = environment.lookup(operation.fragment);
          readyState = {
            error: null,
            props: snapshot.data,
            retry: () => {
              // Do not reset the default state if refetching after success,
              // handling the case where _fetch may return syncronously instead
              // of calling setState.
              const syncReadyState = this._fetch(operation, cacheConfig);
              if (syncReadyState) {
                this.setState({readyState: syncReadyState});
              }
            },
          };

          this._rootSubscription = environment.subscribe(
            snapshot,
            this._onChange,
          );
          // This line should be called only once.
          hasSyncResult = true;
          if (hasFunctionReturned) {
            this.setState({readyState});
          }
        },
        error: error => {
          readyState = {
            error,
            props: null,
            retry: () => {
              // Return to the default state when retrying after an error,
              // handling the case where _fetch may return syncronously instead
              // of calling setState.
              const syncReadyState = this._fetch(operation, cacheConfig);
              this.setState({readyState: syncReadyState || getDefaultState()});
            },
          };
          // We may have partially fulfilled the request, so let the next request
          // or the unmount dispose of the references.
          this._selectionReferences = this._selectionReferences.concat(
            nextReferences,
          );
          hasSyncResult = true;
          if (hasFunctionReturned) {
            this.setState({readyState});
          }
        },
        complete: () => {
          this._disposeSelectionReferences();
          this._selectionReferences = nextReferences;
        },
        unsubscribe: () => {
          // Let the next request or the unmount code dispose of the references.
          // We may have partially fulfilled the request.
          this._selectionReferences = this._selectionReferences.concat(
            nextReferences,
          );
        },
      });

    this._pendingFetch = {
      dispose() {
        request.unsubscribe();
      },
    };
    hasFunctionReturned = true;
    return hasSyncResult ? readyState : null;
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
