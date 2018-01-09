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

import type {CacheConfig} from '../classic/environment/RelayCombinedEnvironmentTypes';
import type {RelayEnvironmentInterface as ClassicEnvironment} from '../classic/store/RelayEnvironment';
import type {DataFrom} from './ReactRelayQueryFetcher';
import type {
  GraphQLTaggedNode,
  IEnvironment,
  RelayContext,
  Snapshot,
  Variables,
} from 'RelayRuntime';

export type RenderProps = {
  error: ?Error,
  props: ?Object,
  retry: ?() => void,
};

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

export type Props = {
  cacheConfig?: ?CacheConfig,
  dataFrom?: DataFrom,
  environment: IEnvironment | ClassicEnvironment,
  query: ?GraphQLTaggedNode,
  render: (renderProps: RenderProps) => React.Node,
  variables: Variables,
};

type State = {
  renderProps: RenderProps,
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
  _queryFetcher: ReactRelayQueryFetcher = new ReactRelayQueryFetcher();
  _relayContext: RelayContext;

  constructor(props: Props, context: Object) {
    super(props, context);
    this.state = {renderProps: this._fetchForProps(this.props)};
  }

  componentWillReceiveProps(nextProps: Props): void {
    if (
      nextProps.query !== this.props.query ||
      nextProps.environment !== this.props.environment ||
      !areEqual(nextProps.variables, this.props.variables)
    ) {
      this.setState({
        renderProps: this._fetchForProps(nextProps),
      });
    }
  }

  componentWillUnmount(): void {
    this._queryFetcher.dispose();
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    return (
      nextProps.render !== this.props.render ||
      nextState.renderProps !== this.state.renderProps
    );
  }

  _getRenderProps({snapshot, error}: {snapshot?: Snapshot, error?: Error}) {
    return {
      error: error ? error : null,
      props: snapshot ? snapshot.data : null,
      retry: () => {
        const syncSnapshot = this._queryFetcher.retry();
        if (syncSnapshot) {
          this._onDataChange({snapshot: syncSnapshot});
        } else if (error) {
          // If retrying after an error and no synchronous result available,
          // reset the render props
          this.setState({renderProps: getLoadingRenderProps()});
        }
      },
    };
  }

  _fetchForProps(props: Props): RenderProps {
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

      try {
        const snapshot = this._queryFetcher.fetch({
          cacheConfig: props.cacheConfig,
          dataFrom: props.dataFrom,
          environment,
          onDataChange: this._onDataChange,
          operation,
        });
        if (!snapshot) {
          return getLoadingRenderProps();
        }
        return this._getRenderProps({snapshot});
      } catch (error) {
        return this._getRenderProps({error});
      }
    }

    this._relayContext = {
      environment,
      variables,
    };
    this._queryFetcher.dispose();
    return getEmptyRenderProps();
  }

  _onDataChange = ({
    error,
    snapshot,
  }: {
    error?: Error,
    snapshot?: Snapshot,
  }): void => {
    this.setState({renderProps: this._getRenderProps({error, snapshot})});
  };

  getChildContext(): Object {
    return {
      relay: this._relayContext,
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

ReactRelayQueryRenderer.childContextTypes = {
  relay: RelayPropTypes.Relay,
};

module.exports = ReactRelayQueryRenderer;
