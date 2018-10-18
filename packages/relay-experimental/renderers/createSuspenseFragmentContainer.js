/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const React = require('React');
const ReactRelayContext = require('react-relay/modern/ReactRelayContext');

const areEqual = require('areEqual');
const assertFragmentMap = require('react-relay/modern/assertFragmentMap');
const forEachObject = require('forEachObject');
const getRelayProp = require('../helpers/getRelayProp');
const invariant = require('invariant');
const mapObject = require('mapObject');

const {DataResourceContext} = require('./DataResource');
const {getFragment, getDataIDsFromObject} = require('relay-runtime');

import type {TDataResourceCache} from './DataResource';
import type {
  GeneratedNodeMap,
  RelayProp,
  $RelayProps,
} from 'react-relay/modern/ReactRelayTypes';
import type {
  Disposable,
  GraphQLTaggedNode,
  OperationSelector,
  Snapshot,
  RelayContext,
} from 'relay-runtime';

function createSuspenseFragmentContainer<
  Props: {},
  TComponent: React.ComponentType<Props>,
>(
  Component: TComponent,
  fragmentSpecInput: GraphQLTaggedNode | GeneratedNodeMap,
): React.ComponentType<
  $RelayProps<React.ElementConfig<TComponent>, RelayProp>,
> {
  type InternalProps = {|
    DataResource: TDataResourceCache,
    forwardedRef: React.Ref<TComponent>,
    fragmentRefs: {[string]: mixed},
    relayContext: RelayContext & {query?: OperationSelector},
  |};

  const componentName =
    // $FlowExpectedError - Supress lint: we actually want to do sketchy null check here
    Component.displayName || Component.displayName || 'Unknown';
  const containerName = `RelaySuspenseFragmentContainer(${componentName})`;
  assertFragmentMap(componentName, fragmentSpecInput);

  // $FlowExpectedError - The compiler converts a GraphQLTaggedNode into a GeneratedNodeMap for us
  const fragmentSpec: GeneratedNodeMap = (fragmentSpecInput: any);
  const fragmentNodes = mapObject(fragmentSpec, getFragment);

  class SuspenseFragmentRenderer extends React.Component<InternalProps> {
    static displayName = containerName;

    _dataSubscriptions: Array<Disposable> | null = null;
    _renderedSnapshots: {[string]: Snapshot | $ReadOnlyArray<Snapshot>} = {};

    componentDidMount() {
      // TODO Check if data has changed between render and mount. Schedule another
      // update if so
      this._unsubscribe();
      this._subscribe();
    }

    componentDidUpdate(prevProps: InternalProps) {
      // TODO Check if data has changed between render and update. Schedule another
      // update if so
      const mustResubscribe =
        prevProps.relayContext !== this.props.relayContext ||
        !areEqual(
          getDataIDsFromObject(fragmentNodes, prevProps.fragmentRefs),
          getDataIDsFromObject(fragmentNodes, this.props.fragmentRefs),
        );

      if (mustResubscribe) {
        this._unsubscribe();
        this._subscribe();
      }
    }

    componentWillUnmount() {
      const {DataResource, fragmentRefs, relayContext} = this.props;
      const {variables} = relayContext;
      this._unsubscribe();

      // We invalidate on unmount because we want to allow a component that is
      // remounting in the future to read fresh data from the Relay store
      // If we didn't, new mounts of the component would always find the data
      // cached in DataResource and not read from the store
      DataResource.invalidateFragmentSpec({
        fragmentNodes,
        fragmentRefs,
        variables,
      });
    }

    _handleDataUpdate(fragmentKey, latestSnapshot) {
      const {DataResource, fragmentRefs, relayContext} = this.props;
      const {variables} = relayContext;

      const fragmentNode = fragmentNodes[fragmentKey];
      invariant(
        fragmentNode != null,
        'SuspenseFragmentContainer: Expected fragment to be available during update',
      );
      const fragmentRef = fragmentRefs[fragmentKey];
      DataResource.setFragment({
        fragmentNode,
        fragmentRef,
        variables,
        snapshot: latestSnapshot,
      });
      this.forceUpdate();
    }

    _subscribe() {
      const {relayContext} = this.props;
      const {environment} = relayContext;
      const dataSubscriptions = this._dataSubscriptions ?? [];
      forEachObject(this._renderedSnapshots, (snapshot, key) => {
        invariant(
          snapshot !== null,
          'SuspenseFragmentContainer: Expected to have rendered with a snapshot',
        );
        if (Array.isArray(snapshot)) {
          snapshot.forEach(s => {
            dataSubscriptions.push(
              environment.subscribe(s, latestSnapshot =>
                this._handleDataUpdate(key, latestSnapshot),
              ),
            );
          });
        } else {
          dataSubscriptions.push(
            environment.subscribe(snapshot, latestSnapshot =>
              this._handleDataUpdate(key, latestSnapshot),
            ),
          );
        }
      });
      this._dataSubscriptions = dataSubscriptions;
    }

    _unsubscribe() {
      if (this._dataSubscriptions != null) {
        this._dataSubscriptions.map(s => s.dispose());
        this._dataSubscriptions = null;
      }
    }

    render() {
      const {
        DataResource,
        forwardedRef,
        fragmentRefs,
        relayContext,
      } = this.props;
      const {environment, query, variables} = relayContext;
      const readResult = DataResource.readFragmentSpec({
        environment,
        variables,
        fragmentNodes,
        fragmentRefs,
        parentQuery: query,
      });

      this._renderedSnapshots = {};
      const data = {};
      forEachObject(readResult, (result, key) => {
        if (result == null) {
          data[key] = null;
          return;
        }
        data[key] = result.data;
        // WARNING: Keeping instance variables in render can be unsafe; however,
        // in this case it is safe because we're ensuring they are only used in the
        // commit phase.
        this._renderedSnapshots[key] = result.snapshot;
      });

      return (
        <Component
          {...fragmentRefs}
          {...data}
          ref={forwardedRef}
          relay={getRelayProp(environment)}
        />
      );
    }
  }

  const SuspenseFragmentContainer = (props, ref) => {
    // $FlowFixMe - TODO T35024201 unstable_read is not yet typed
    const DataResource = DataResourceContext.unstable_read();
    // $FlowFixMe - TODO T35024201 unstable_read is not yet typed
    const relayContext = ReactRelayContext.unstable_read();
    invariant(
      relayContext != null,
      `SuspenseFragmentContainer: ${containerName} tried to render with ` +
        `missing context. This means that ${containerName} was not rendered ` +
        'as a descendant of a QueryRenderer.',
    );

    if (__DEV__) {
      const {isRelayModernEnvironment} = require('relay-runtime');
      if (!isRelayModernEnvironment(relayContext.environment)) {
        throw new Error(
          'SuspenseFragmentContainer: Can only use SuspenseFragmentContainer ' +
            `${containerName} in a Relay Modern environment!\n` +
            'When using Relay Modern and Relay Classic in the same ' +
            'application, ensure components use Relay Compat to work in ' +
            'both environments.\n' +
            'See: http://facebook.github.io/relay/docs/relay-compat.html',
        );
      }
    }

    return (
      <SuspenseFragmentRenderer
        relayContext={relayContext}
        DataResource={DataResource}
        fragmentRefs={props}
        forwardedRef={ref}
      />
    );
  };
  SuspenseFragmentContainer.displayName = containerName;

  // $FlowFixMe - TODO T29156721 forwardRef isn't Flow typed yet
  const ForwardRefFragmentContainer = React.forwardRef(
    SuspenseFragmentContainer,
  );

  if (__DEV__) {
    ForwardRefFragmentContainer.__ComponentClass = Component;
  }
  return ForwardRefFragmentContainer;
}

module.exports = createSuspenseFragmentContainer;
