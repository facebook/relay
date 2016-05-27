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
import type {RelayEnvironmentInterface} from 'RelayEnvironment';
const RelayFragmentPointer = require('RelayFragmentPointer');
import type {RelayQuerySet} from 'RelayInternalTypes';
const RelayPropTypes = require('RelayPropTypes');
import type RelayQuery from 'RelayQuery';
import type {RelayQueryConfigInterface} from 'RelayQueryConfig';
import type {ReadyState, RelayContainer} from 'RelayTypes';
const StaticContainer = require('StaticContainer.react');

const getRelayQueries = require('getRelayQueries');
const mapObject = require('mapObject');

type Props = {
  Container: RelayContainer;
  environment: RelayEnvironmentInterface;
  queryConfig: RelayQueryConfigInterface;
  readyState?: ?ReadyState;
  render?: ?RelayRenderCallback;
  retry: RelayRetryCallback;
};

type RelayContainerProps = {
  [propName: string]: mixed;
};
type RelayContainerPropsFactory = RelayContainerPropsFactory;
export type RelayRenderCallback =
  (renderArgs: RelayRenderArgs) => ?React$Element<any>;
type RelayRenderArgs = {
  done: boolean;
  error: ?Error;
  props: ?RelayContainerProps;
  retry: ?RelayRetryCallback;
  stale: boolean;
};
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
    relay: RelayPropTypes.Environment,
    route: RelayPropTypes.QueryConfig.isRequired,
  };

  props: Props;
  state: {
    getContainerProps: RelayContainerPropsFactory;
  };

  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {
      getContainerProps: createContainerPropsFactory(),
    };
  }

  getChildContext(): Object {
    return {
      relay: this.props.environment,
      route: this.props.queryConfig,
    };
  }

  render(): ?React$Element<any> {
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
