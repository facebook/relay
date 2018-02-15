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
const ReactRelayQueryFetcher = require('./ReactRelayQueryFetcher');
const RelayPropTypes = require('../classic/container/RelayPropTypes');

const areEqual = require('areEqual');
const deepFreeze = require('deepFreeze');
const polyfill = require('react-lifecycles-compat');

import type {RelayEnvironmentInterface as ClassicEnvironment} from '../classic/store/RelayEnvironment';
import type {DataFrom} from './ReactRelayQueryFetcher';
import type {
  CacheConfig,
  GraphQLTaggedNode,
  IEnvironment,
  RelayContext,
  Snapshot,
  Variables,
} from 'RelayRuntime';

type RetryCallbacks = {
  handleDataChange: ({
    error?: Error,
    snapshot?: Snapshot,
  }) => void,
  handleError: (error: Error) => void,
};

export type RenderProps = {
  error: ?Error,
  props: ?Object,
  retry: ?() => void,
};

export type Props = {
  cacheConfig?: ?CacheConfig,
  dataFrom?: DataFrom,
  environment: IEnvironment | ClassicEnvironment,
  query: ?GraphQLTaggedNode,
  render: (renderProps: RenderProps) => React.Node,
  variables: Variables,
};

type State = {
  prevQuery: ?GraphQLTaggedNode,
  prevEnvironment: IEnvironment | ClassicEnvironment,
  prevVariables: Variables,
  queryFetcher: ReactRelayQueryFetcher,
  relayContext: RelayContext,
  renderProps: RenderProps,
  retryCallbacks: RetryCallbacks,
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
  static childContextTypes = {
    relay: RelayPropTypes.Relay,
  };

  constructor(props: Props, context: Object) {
    super(props, context);

    const handleDataChange = ({
      error,
      snapshot,
    }: {
      error?: Error,
      snapshot?: Snapshot,
    }): void => {
      this.setState({
        renderProps: getRenderProps(
          error,
          snapshot,
          queryFetcher,
          retryCallbacks,
        ),
      });
    };

    const handleError = (error: Error) =>
      this.setState({renderProps: getLoadingRenderProps()});

    const retryCallbacks = {
      handleDataChange,
      handleError,
    };

    const queryFetcher = new ReactRelayQueryFetcher();

    this.state = {
      prevQuery: this.props.query,
      prevEnvironment: this.props.environment,
      prevVariables: this.props.variables,
      queryFetcher,
      retryCallbacks,
      ...getStateUpdateForProps(this.props, queryFetcher, retryCallbacks),
    };
  }

  static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State,
  ): $Shape<State> | null {
    if (
      prevState.prevQuery !== nextProps.query ||
      prevState.prevEnvironment !== nextProps.environment ||
      !areEqual(prevState.prevVariables, nextProps.variables)
    ) {
      return {
        prevQuery: nextProps.query,
        prevEnvironment: nextProps.environment,
        prevVariables: nextProps.variables,
        ...getStateUpdateForProps(
          nextProps,
          prevState.queryFetcher,
          prevState.retryCallbacks,
        ),
      };
    }

    return null;
  }

  componentWillUnmount(): void {
    this.state.queryFetcher.dispose();
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    return (
      nextProps.render !== this.props.render ||
      nextState.renderProps !== this.state.renderProps
    );
  }

  getChildContext(): Object {
    return {
      relay: this.state.relayContext,
    };
  }

  render() {
    // Note that the root fragment results in `renderProps.props` is already
    // frozen by the store; this call is to freeze the renderProps object and
    // error property if set.
    if (__DEV__) {
      deepFreeze(this.state.renderProps);
    }
    return this.props.render(this.state.renderProps);
  }
}

function getLoadingRenderProps(): RenderProps {
  return {
    error: null,
    props: null, // `props: null` indicates that the data is being fetched (i.e. loading)
    retry: null,
  };
}

function getEmptyRenderProps(): RenderProps {
  return {
    error: null,
    props: {}, // `props: {}` indicates no data available
    retry: null,
  };
}

function getRenderProps(
  error: ?Error,
  snapshot: ?Snapshot,
  queryFetcher: ReactRelayQueryFetcher,
  retryCallbacks: RetryCallbacks,
): RenderProps {
  return {
    error: error ? error : null,
    props: snapshot ? snapshot.data : null,
    retry: () => {
      const syncSnapshot = queryFetcher.retry();
      if (syncSnapshot) {
        retryCallbacks.handleDataChange({snapshot: syncSnapshot});
      } else if (error) {
        retryCallbacks.handleError(error);
      }
    },
  };
}

function getStateUpdateForProps(
  props: Props,
  queryFetcher: ReactRelayQueryFetcher,
  retryCallbacks: RetryCallbacks,
): $Shape<State> {
  // TODO (#16225453) QueryRenderer works with old and new environment, but
  // the flow typing doesn't quite work abstracted.
  // $FlowFixMe
  const environment: IEnvironment = props.environment;

  const {query, variables} = props;
  if (query) {
    const {createOperationSelector, getRequest} = environment.unstable_internal;
    const request = getRequest(query);
    const operation = createOperationSelector(request, variables);

    const relayContext = {
      environment,
      variables: operation.variables,
    };

    try {
      const snapshot = queryFetcher.fetch({
        cacheConfig: props.cacheConfig,
        dataFrom: props.dataFrom,
        environment,
        onDataChange: retryCallbacks.handleDataChange,
        operation,
      });
      if (!snapshot) {
        return {
          relayContext,
          renderProps: getLoadingRenderProps(),
        };
      }

      return {
        relayContext,
        renderProps: getRenderProps(
          null,
          snapshot,
          queryFetcher,
          retryCallbacks,
        ),
      };
    } catch (error) {
      return {
        relayContext,
        renderProps: getRenderProps(error, null, queryFetcher, retryCallbacks),
      };
    }
  } else {
    queryFetcher.dispose();

    return {
      relayContext: {
        environment,
        variables,
      },
      renderProps: getEmptyRenderProps(),
    };
  }
}

// Make static getDerivedStateFromProps work with older React versions:
polyfill(ReactRelayQueryRenderer);

module.exports = ReactRelayQueryRenderer;
