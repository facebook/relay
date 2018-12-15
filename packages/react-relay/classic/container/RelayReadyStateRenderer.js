/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const React = require('React');
const ReactRelayContext = require('../../modern/ReactRelayContext');
const RelayFragmentPointer = require('../query/RelayFragmentPointer');
const RelayStaticContainer = require('./RelayStaticContainer');

const getRelayQueries = require('./getRelayQueries');
const mapObject = require('mapObject');

import type {RelayQueryConfigInterface} from '../query-config/RelayQueryConfig';
import type RelayQuery from '../query/RelayQuery';
import type {RelayEnvironmentInterface} from '../store/RelayEnvironment';
import type {RelayQuerySet} from '../tools/RelayInternalTypes';
import type {ReadyState, ReadyStateEvent} from '../tools/RelayTypes';

type Props = {
  Container: React.ComponentType<any>,
  environment: RelayEnvironmentInterface,
  queryConfig: RelayQueryConfigInterface,
  readyState?: ?ReadyState,
  render?: ?RelayRenderCallback,
  retry: RelayRetryCallback,
};
type RelayContainerProps = {
  [propName: string]: mixed,
};
type RelayContainerPropsFactory = RelayContainerPropsFactory;
type RelayRenderArgs = {
  done: boolean,
  error: ?Error,
  events: Array<ReadyStateEvent>,
  props: ?RelayContainerProps,
  retry: RelayRetryCallback,
  stale: boolean,
};

export type RelayRenderCallback =
  /* $FlowFixMe(>=0.38.0 site=www) - Flow error detected during the deployment
   * of v0.38.0. To see the error, remove this comment and run flow */
  (renderArgs: RelayRenderArgs) => ?React.Element<any>;
export type RelayRetryCallback = () => void;

/**
 * @public
 *
 * RelayReadyStateRenderer synchronously renders a container and query config
 * given `readyState`. The `readyState` must be an accurate representation of
 * the data that currently resides in the supplied `environment`. If you need
 * data to be fetched in addition to rendering, please use `RelayRenderer`.
 *
 * If `readyState` is not supplied, the previously rendered `readyState` will
 * continue to be rendered (or null if there is no previous `readyState`).
 */
class RelayReadyStateRenderer extends React.Component<
  Props,
  {
    getContainerProps: RelayContainerPropsFactory,
  },
> {
  // TODO t16225453
  _relay: $FlowFixMe;

  constructor(props: Props, context: any) {
    super(props, context);
    this._relay = {
      environment: props.environment,
      variables: props.queryConfig.params,
      route: props.queryConfig,
    };
    this.state = {
      getContainerProps: createContainerPropsFactory(),
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props): void {
    if (
      this.props.environment !== nextProps.environment ||
      this.props.queryConfig !== nextProps.queryConfig
    ) {
      this._relay = {
        environment: nextProps.environment,
        variables: nextProps.queryConfig.params,
        route: nextProps.queryConfig,
      };
    }
  }

  /**
   * Avoid updating when we have fetched data but are still not ready.
   */
  shouldComponentUpdate(nextProps: Props): boolean {
    const prevProps = this.props;
    if (
      prevProps.Container !== nextProps.Container ||
      prevProps.environment !== nextProps.environment ||
      prevProps.queryConfig !== nextProps.queryConfig ||
      prevProps.render !== nextProps.render ||
      prevProps.retry !== nextProps.retry
    ) {
      return true;
    }
    const prevReadyState = prevProps.readyState;
    const nextReadyState = nextProps.readyState;
    if (prevReadyState == null || nextReadyState == null) {
      return true;
    }
    if (
      prevReadyState.aborted !== nextReadyState.aborted ||
      prevReadyState.done !== nextReadyState.done ||
      prevReadyState.error !== nextReadyState.error ||
      prevReadyState.ready !== nextReadyState.ready ||
      prevReadyState.stale !== nextReadyState.stale
    ) {
      return true;
    }
    return nextReadyState.ready;
  }

  render(): React.Node {
    let children;
    let shouldUpdate = false;

    const {readyState, render} = this.props;
    if (readyState) {
      if (render) {
        children = render({
          done: readyState.done,
          error: readyState.error,
          events: readyState.events,
          props: readyState.ready
            ? this.state.getContainerProps(this.props)
            : null,
          retry: this.props.retry,
          stale: readyState.stale,
        });
      } else if (readyState.ready) {
        const {Container} = this.props;
        children = <Container {...this.state.getContainerProps(this.props)} />;
      }
      shouldUpdate = true;
    }
    if (children === undefined) {
      children = null;
      shouldUpdate = false;
    }
    return (
      <ReactRelayContext.Provider value={this._relay}>
        <RelayStaticContainer shouldUpdate={shouldUpdate}>
          {children}
        </RelayStaticContainer>
      </ReactRelayContext.Provider>
    );
  }
}

function createContainerPropsFactory(): RelayContainerPropsFactory {
  let prevProps: ?Props;
  let querySet: ?RelayQuerySet;

  return function(nextProps: Props): RelayContainerProps {
    if (
      !querySet ||
      !prevProps ||
      prevProps.Container !== nextProps.Container ||
      prevProps.queryConfig !== nextProps.queryConfig
    ) {
      querySet = getRelayQueries(nextProps.Container, nextProps.queryConfig);
    }
    const containerProps = {
      ...nextProps.queryConfig.params,
      ...mapObject(querySet, query =>
        createFragmentPointerForRoot(nextProps.environment, (query: any)),
      ),
    };
    prevProps = nextProps;
    return containerProps;
  };
}

function createFragmentPointerForRoot(
  environment: RelayEnvironmentInterface,
  query: RelayQuery.Root,
) {
  return query
    ? RelayFragmentPointer.createForRoot(
        environment.getStoreData().getQueuedStore(),
        query,
      )
    : null;
}

module.exports = RelayReadyStateRenderer;
