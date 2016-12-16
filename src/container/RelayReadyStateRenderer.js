/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayReadyStateRenderer
 * @flow
 */

'use strict';

const React = require('React');
const RelayFragmentPointer = require('RelayFragmentPointer');
const RelayPropTypes = require('RelayPropTypes');
const StaticContainer = require('StaticContainer.react');

const getRelayQueries = require('getRelayQueries');
const mapObject = require('mapObject');

import type {LegacyRelayContext, RelayEnvironmentInterface} from 'RelayEnvironment';
import type {RelayQuerySet} from 'RelayInternalTypes';
import type RelayQuery from 'RelayQuery';
import type {RelayQueryConfigInterface} from 'RelayQueryConfig';
import type {ReadyState, ReadyStateEvent, RelayContainer} from 'RelayTypes';

type Props = {
  Container: RelayContainer,
  environment: RelayEnvironmentInterface,
  queryConfig: RelayQueryConfigInterface,
  readyState?: ?ReadyState,
  render?: ?RelayRenderCallback,
  retry: RelayRetryCallback,
};
type RelayContainerProps = {
  [propName: string]: mixed;
};
type RelayContainerPropsFactory = RelayContainerPropsFactory;
type RelayRenderArgs = {
  done: boolean,
  error: ?Error,
  events: Array<ReadyStateEvent>,
  props: ?RelayContainerProps,
  retry: ?RelayRetryCallback,
  stale: boolean,
};

export type RelayRenderCallback =
  (renderArgs: RelayRenderArgs) => ?React.Element<*>;
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
class RelayReadyStateRenderer extends React.Component {
  static childContextTypes = {
    relay: RelayPropTypes.LegacyRelay,
    route: RelayPropTypes.QueryConfig.isRequired,
  };

  _relay: LegacyRelayContext;
  props: Props;
  state: {
    getContainerProps: RelayContainerPropsFactory,
  };

  constructor(props: Props, context: any) {
    super(props, context);
    this._relay = {
      environment: props.environment,
      variables: props.queryConfig.params,
    };
    this.state = {
      getContainerProps: createContainerPropsFactory(),
    };
  }

  getChildContext(): Object {
    return {
      relay: this._relay,
      route: this.props.queryConfig,
    };
  }

  componentWillReceiveProps(nextProps: Props): void {
    if (
      this.props.environment !== nextProps.environment ||
      this.props.queryConfig !== nextProps.queryConfig
    ) {
      this._relay = {
        environment: nextProps.environment,
        variables: nextProps.queryConfig.params,
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
    if (prevReadyState == null ||
        nextReadyState == null) {
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

  render(): ?React.Element<*> {
    let children;
    let shouldUpdate = false;

    const {readyState, render} = this.props;
    if (readyState) {
      if (render) {
        children = render({
          done: readyState.done,
          error: readyState.error,
          events: readyState.events,
          props: readyState.ready ?
            this.state.getContainerProps(this.props) :
            null,
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
      <StaticContainer shouldUpdate={shouldUpdate}>
        {children}
      </StaticContainer>
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
      querySet = getRelayQueries(
        nextProps.Container,
        nextProps.queryConfig
      );
    }
    const containerProps = {
      ...nextProps.queryConfig.params,
      ...mapObject(
        querySet,
        query => createFragmentPointerForRoot(nextProps.environment, query)
      ),
    };
    prevProps = nextProps;
    return containerProps;
  };
}

function createFragmentPointerForRoot(
  environment: RelayEnvironmentInterface,
  query: RelayQuery.Root
) {
  return query ?
    RelayFragmentPointer.createForRoot(
      environment.getStoreData().getQueuedStore(),
      query
    ) :
    null;
}

module.exports = RelayReadyStateRenderer;
