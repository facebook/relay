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
const invariant = require('invariant');
const mapObject = require('mapObject');

const {DataResourceCacheContext} = require('./DataResourceCache_UNSTABLE');

import type {
  FragmentSpec,
  TDataResourceCache,
} from './DataResourceCache_UNSTABLE';
import type {$FragmentRef} from 'react-relay/modern/ReactRelayTypes';
import type {
  Disposable,
  FragmentReference,
  GraphQLTaggedNode,
  Snapshot,
  RelayContext,
} from 'relay-runtime';

// prettier-ignore
export type $FragmentRefs<TFragmentData> = $Exact<
  $ObjMap<
    TFragmentData,
    & (<T: {+$refType: empty}>( T) =>  T)
    & (<T: {+$refType: empty}>(?T) => ?T)
    & (<TRef: FragmentReference, T: {+$refType: TRef}>(                 T ) =>                  $FragmentRef<T> )
    & (<TRef: FragmentReference, T: {+$refType: TRef}>(?                T ) => ?                $FragmentRef<T> )
    & (<TRef: FragmentReference, T: {+$refType: TRef}>( $ReadOnlyArray< T>) =>  $ReadOnlyArray< $FragmentRef<T>>)
    & (<TRef: FragmentReference, T: {+$refType: TRef}>(?$ReadOnlyArray< T>) => ?$ReadOnlyArray< $FragmentRef<T>>)
    & (<TRef: FragmentReference, T: {+$refType: TRef}>( $ReadOnlyArray<?T>) =>  $ReadOnlyArray<?$FragmentRef<T>>)
    & (<TRef: FragmentReference, T: {+$refType: TRef}>(?$ReadOnlyArray<?T>) => ?$ReadOnlyArray<?$FragmentRef<T>>)
    & (<T>(T) => T),
  >
>

type RenderProps<TFragmentData> = {|
  data: TFragmentData,
|};

// $FlowExpectedError - FragmentData can contain any types; it is only used to enforce the type of RenderProps
function createFragmentRenderer_UNSTABLE<TFragmentData: {[string]: any}>(
  fragmentSpec: FragmentSpec,
): React.ComponentType<{|
  ...$FragmentRefs<TFragmentData>,
  children: (RenderProps<TFragmentData>) => React.Node,
|}> {
  type Props = {|
    ...$FragmentRefs<TFragmentData>,
    children: (RenderProps<TFragmentData>) => React.Node,
  |};

  type InternalProps = {|
    ...Props,
    reactRelayContext: RelayContext & {query: GraphQLTaggedNode},
    DataResourceCache: TDataResourceCache,
  |};

  type State = {|
    mirroredFragmentRefs: $FragmentRefs<TFragmentData>,
  |};

  class FragmentRendererInternal extends React.Component<InternalProps, State> {
    _dataSubscriptions: Array<Disposable> | null = null;
    _renderedSnapshots: {[string]: Snapshot | $ReadOnlyArray<Snapshot>} = {};

    constructor(props: InternalProps) {
      super(props);
      const {
        DataResourceCache,
        children,
        reactRelayContext,
        ...fragmentRefs
      } = props;
      this.state = {
        mirroredFragmentRefs: fragmentRefs,
      };
    }

    static getDerivedStateFromProps(
      nextProps: InternalProps,
      prevState: State,
    ): $Shape<State> | null {
      const {
        DataResourceCache,
        children,
        reactRelayContext,
        ...fragmentRefs
      } = nextProps;
      const {environment, variables} = reactRelayContext;
      const {getDataIDsFromObject} = environment.unstable_internal;
      const fragmentMap = mapObject(
        fragmentSpec,
        environment.unstable_internal.getFragment,
      );
      const prevDataIDs = getDataIDsFromObject(
        fragmentMap,
        prevState.mirroredFragmentRefs,
      );
      const nextDataIDs = getDataIDsFromObject(fragmentMap, fragmentRefs);
      if (!areEqual(prevDataIDs, nextDataIDs)) {
        DataResourceCache.invalidateFragmentSpec({
          fragmentSpec,
          fragmentRefs,
          variables,
        });
        return {
          mirroredFragmentRefs: fragmentRefs,
        };
      }
      return null;
    }

    componentDidMount() {
      // TODO Check if data has changed between render and mount. Schedule another
      // update if so
      this._unsubscribe();
      this._subscribe();
    }

    componentDidUpdate(prevProps: InternalProps, prevState: State) {
      // TODO Check if data has changed between render and update. Schedule another
      // update if so
      const mustResubscribe =
        prevProps.reactRelayContext !== this.props.reactRelayContext ||
        prevState.mirroredFragmentRefs !== this.state.mirroredFragmentRefs;
      if (mustResubscribe) {
        this._unsubscribe();
        this._subscribe();
      }
    }

    componentWillUnmount() {
      const {
        DataResourceCache,
        children,
        reactRelayContext,
        ...fragmentRefs
      } = this.props;
      const {variables} = reactRelayContext;
      this._unsubscribe();

      // We invalidate on unmount because we want to allow a component that is
      // remounting in the future to read fresh data from the Relay store
      // If we didn't, new mounts of the component would always find the data
      // cached in DataResourceCache and not read from the store
      DataResourceCache.invalidateFragmentSpec({
        fragmentSpec,
        fragmentRefs,
        variables,
      });
    }

    _handleDataUpdate(fragmentKey, latestSnapshot) {
      const {
        DataResourceCache,
        children,
        reactRelayContext,
        ...fragmentRefs
      } = this.props;
      const {variables} = reactRelayContext;

      const fragment = fragmentSpec[fragmentKey];
      invariant(
        fragment != null,
        'FragmentRenderer: Expected fragment to be available during update',
      );
      const fragmentRef = fragmentRefs[fragmentKey];
      DataResourceCache.invalidateFragment({
        fragment,
        fragmentRef,
        variables,
      });
      DataResourceCache.setFragment({
        fragment,
        fragmentRef,
        variables,
        snapshot: latestSnapshot,
      });
      this.forceUpdate();
    }

    _subscribe() {
      const {reactRelayContext} = this.props;
      const {environment} = reactRelayContext;
      Object.keys(this._renderedSnapshots).forEach(key => {
        const snapshot = this._renderedSnapshots[key];
        invariant(
          snapshot !== null,
          'FragmentRenderer: Expected to have rendered with a snapshot',
        );
        const snapshots = Array.isArray(snapshot) ? snapshot : [snapshot];
        this._dataSubscriptions = (this._dataSubscriptions ?? []).concat(
          snapshots.map(s => {
            return environment.subscribe(s, latestSnapshot =>
              this._handleDataUpdate(key, latestSnapshot),
            );
          }),
        );
      });
    }

    _unsubscribe() {
      if (this._dataSubscriptions != null) {
        this._dataSubscriptions.map(s => s.dispose());
        this._dataSubscriptions = null;
      }
    }

    render() {
      const {
        DataResourceCache,
        children,
        reactRelayContext,
        ...fragmentRefs
      } = this.props;
      const {environment, query, variables} = reactRelayContext;
      const readResult = DataResourceCache.readFragmentSpec({
        environment,
        fragmentSpec,
        fragmentRefs,
        parentQuery: query,
        variables,
      });

      this._renderedSnapshots = {};
      const data = {};
      Object.keys(readResult).forEach(key => {
        const result = readResult[key];
        invariant(
          result != null,
          'FragmentRenderer: Expected to have read data',
        );
        data[key] = result.data;
        // WARNING: Keeping instance variables in render can be unsafe; however,
        // in this case it is safe because we're ensuring they are only used in the
        // commit phase.
        this._renderedSnapshots[key] = result.snapshot;
      });

      return children({
        data: data,
      });
    }
  }

  return function FragmentRenderer(props: Props) {
    // $FlowFixMe unstable_read is not yet typed
    const DataResourceCache = DataResourceCacheContext.unstable_read();
    // $FlowFixMe unstable_read is not yet typed
    const reactRelayContext = ReactRelayContext.unstable_read();
    invariant(
      reactRelayContext != null,
      'FragmentRenderer: Expected ReactRelayContext to have been passed',
    );
    invariant(
      reactRelayContext.query != null,
      'FragmentRenderer: Expected query to be avialable in context',
    );
    return (
      <FragmentRendererInternal
        {...props}
        DataResourceCache={DataResourceCache}
        reactRelayContext={reactRelayContext}
      />
    );
  };
}

module.exports = createFragmentRenderer_UNSTABLE;
