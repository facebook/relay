/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayContainer
 * @typechecks
 * @flow
 */

'use strict';

import type {ConcreteFragment} from 'ConcreteQuery';
const ErrorUtils = require('ErrorUtils');
const RelayFragmentPointer = require('RelayFragmentPointer');
const React = require('React');
const RelayContainerComparators = require('RelayContainerComparators');
const RelayContainerProxy = require('RelayContainerProxy');
import type {
  FragmentResolver,
  RelayContextInterface,
} from 'RelayContext';
const RelayFragmentReference = require('RelayFragmentReference');
import type {DataID, RelayQuerySet} from 'RelayInternalTypes';
const RelayMetaRoute = require('RelayMetaRoute');
const RelayMutationTransaction = require('RelayMutationTransaction');
const RelayPropTypes = require('RelayPropTypes');
const RelayProfiler = require('RelayProfiler');
const RelayQuery = require('RelayQuery');
const RelayRecord = require('RelayRecord');
const RelayRecordStatusMap = require('RelayRecordStatusMap');
import type {
  Abortable,
  ComponentReadyStateChangeCallback,
  RelayContainer,
  RelayProp,
  Variables,
} from 'RelayTypes';

const buildRQL = require('buildRQL');
import type {RelayQLFragmentBuilder, RelayQLQueryBuilder} from 'buildRQL';
const forEachObject = require('forEachObject');
const invariant = require('invariant');
const isRelayContext = require('isRelayContext');
const nullthrows = require('nullthrows');
const prepareRelayContainerProps = require('prepareRelayContainerProps');
const relayUnstableBatchedUpdates = require('relayUnstableBatchedUpdates');
const shallowEqual = require('shallowEqual');
const warning = require('warning');
const isReactComponent = require('isReactComponent');

type FragmentPointer = {
  fragment: RelayQuery.Fragment,
  dataIDs: DataID | Array<DataID>
};
export type RelayContainerSpec = {
  initialVariables?: Variables;
  prepareVariables?: (
    prevVariables: Variables,
    route: RelayMetaRoute
  ) => Variables;
  fragments: {
    [propName: string]: RelayQLFragmentBuilder
  };
};
export type RelayLazyContainer = Function;
export type RelayQueryConfigSpec = {
  name: string;
  params: Variables;
  queries: RootQueries;
  useMockData?: boolean;
};
export type RootQueries = {
  [queryName: string]: RelayQLQueryBuilder;
};

var containerContextTypes = {
  relay: RelayPropTypes.Context,
  route: RelayPropTypes.QueryConfig.isRequired,
};

/**
 * @public
 *
 * RelayContainer is a higher order component that provides the ability to:
 *
 *  - Encode data dependencies using query fragments that are parameterized by
 *    routes and variables.
 *  - Manipulate variables via methods on `this.props.relay`.
 *  - Automatically subscribe to data changes.
 *  - Avoid unnecessary updates if data is unchanged.
 *  - Propagate the `route` via context (available on `this.props.relay`).
 *
 */
function createContainerComponent(
  Component: ReactClass,
  spec: RelayContainerSpec
): RelayContainer {
  var componentName = Component.displayName || Component.name;
  var containerName = 'Relay(' + componentName + ')';

  var fragments = spec.fragments;
  var fragmentNames = Object.keys(fragments);
  var initialVariables = spec.initialVariables || {};
  var prepareVariables = spec.prepareVariables;

  class RelayContainer extends React.Component {
    mounted: boolean;
    _didShowFakeDataWarning: boolean;
    _fragmentPointers: {[key: string]: ?FragmentPointer};
    _hasStaleQueryData: boolean;
    _fragmentResolvers: {[key: string]: ?FragmentResolver};

    pending: ?{
      variables: Variables;
      request: Abortable;
    };
    state: {
      variables: Variables;
      queryData: {[propName: string]: mixed};
    };

    constructor(props, context) {
      super(props, context);

      var {relay, route} = context;
      invariant(
        isRelayContext(relay),
        'RelayContainer: `%s` was rendered with invalid Relay context `%s`. ' +
        'Make sure the `relay` property on the React context conforms to the ' +
        '`RelayContext` interface.',
        containerName,
        relay
      );
      invariant(
        route && typeof route.name === 'string',
        'RelayContainer: `%s` was rendered without a valid route. Make sure ' +
        'the route is valid, and make sure that it is correctly set on the ' +
        'parent component\'s context (e.g. using <RelayRootContainer>).',
        containerName
      );

      var self: any = this;
      self.forceFetch = this.forceFetch.bind(this);
      self.getPendingTransactions = this.getPendingTransactions.bind(this);
      self.hasFragmentData = this.hasFragmentData.bind(this);
      self.hasOptimisticUpdate = this.hasOptimisticUpdate.bind(this);
      self.hasPartialData = this.hasPartialData.bind(this);
      self.setVariables = this.setVariables.bind(this);

      this._didShowFakeDataWarning = false;
      this._fragmentPointers = {};
      this._hasStaleQueryData = false;
      this._fragmentResolvers = {};

      this.mounted = true;
      this.pending = null;
      this.state = {
        variables: {},
        queryData: {},
      };
    }

    /**
     * Requests an update to variables. This primes the cache for the new
     * variables and notifies the caller of changes via the callback. As data
     * becomes ready, the component will be updated.
     */
    setVariables(
      partialVariables?: ?Variables,
      callback?: ?ComponentReadyStateChangeCallback
    ): void {
      this._runVariables(partialVariables, callback, false);
    }

    /**
     * Requests an update to variables. Unlike `setVariables`, this forces data
     * to be fetched and written for the supplied variables. Any data that
     * previously satisfied the queries will be overwritten.
     */
    forceFetch(
      partialVariables?: ?Variables,
      callback?: ?ComponentReadyStateChangeCallback
    ): void {
      this._runVariables(partialVariables, callback, true);
    }

    /**
     * Creates a query for each of the component's fragments using the given
     * variables, and fragment pointers that can be used to resolve the results
     * of those queries. The fragment pointers are of the same shape as the
     * `_fragmentPointers` property.
     */
    _createQuerySetAndFragmentPointers(variables: Variables): {
      fragmentPointers: {[key: string]: ?FragmentPointer},
      querySet: RelayQuerySet,
    } {
      var fragmentPointers = {};
      var querySet = {};
      const storeData = this.context.relay.getStoreData();
      fragmentNames.forEach(fragmentName => {
        var fragment = getFragment(fragmentName, this.context.route, variables);
        var queryData = this.state.queryData[fragmentName];
        if (!fragment || queryData == null) {
          return;
        }

        var fragmentPointer;
        if (fragment.isPlural()) {
          invariant(
            Array.isArray(queryData),
            'RelayContainer: Invalid queryData for `%s`, expected an array ' +
            'of records because the corresponding fragment is plural.',
            fragmentName
          );
          const dataIDs = [];
          queryData.forEach((data, ii) => {
            var dataID = RelayRecord.getDataID(data);
            if (dataID) {
              querySet[fragmentName + ii] =
                storeData.buildFragmentQueryForDataID(fragment, dataID);
              dataIDs.push(dataID);
            }
          });
          if (dataIDs.length) {
            fragmentPointer = {fragment, dataIDs};
          }
        } else {
          /* $FlowFixMe(>=0.19.0) - queryData is mixed but getID expects Object
           */
          const dataID = RelayRecord.getDataID(queryData);
          if (dataID) {
            fragmentPointer = {
              fragment,
              dataIDs: dataID,
            };
            querySet[fragmentName] =
              storeData.buildFragmentQueryForDataID(fragment, dataID);
          }
        }

        fragmentPointers[fragmentName] = fragmentPointer;
      });
      return {fragmentPointers, querySet};
    }

    _runVariables(
      partialVariables: ?Variables,
      callback: ?ComponentReadyStateChangeCallback,
      forceFetch: boolean
    ): void {
      var lastVariables = this.state.variables;
      var prevVariables = this.pending ? this.pending.variables : lastVariables;
      var nextVariables = mergeVariables(prevVariables, partialVariables);

      this.pending && this.pending.request.abort();

      var completeProfiler = RelayProfiler.profile(
        'RelayContainer.setVariables', {
          containerName,
          nextVariables,
        }
      );

      // If variables changed or we are force-fetching, we need to build a new
      // set of queries that includes the updated variables. Because the pending
      // fetch is always canceled, always initiate a new fetch.
      var querySet = {};
      var fragmentPointers = null;
      if (forceFetch || !shallowEqual(nextVariables, lastVariables)) {
        ({querySet, fragmentPointers} =
          this._createQuerySetAndFragmentPointers(nextVariables));
      }

      var onReadyStateChange = ErrorUtils.guard(readyState => {
        var {aborted, done, error, ready} = readyState;
        var isComplete = aborted || done || error;
        if (isComplete && this.pending === current) {
          this.pending = null;
        }
        var partialState;
        if (ready && fragmentPointers) {
          // Only update query data if variables changed. Otherwise, `querySet`
          // and `fragmentPointers` will be empty, and `nextVariables` will be
          // equal to `lastVariables`.
          this._fragmentPointers = fragmentPointers;
          this._updateFragmentResolvers(this.context.relay);
          var queryData = this._getQueryData(this.props);
          partialState = {variables: nextVariables, queryData};
        } else {
          partialState = {};
        }
        var mounted = this.mounted;
        if (mounted) {
          var updateProfiler = RelayProfiler.profile('RelayContainer.update');
          relayUnstableBatchedUpdates(() => {
            this.setState(partialState, () => {
              updateProfiler.stop();
              if (isComplete) {
                completeProfiler.stop();
              }
            });
            if (callback) {
              callback.call(
                this.refs.component || null,
                {...readyState, mounted}
              );
            }
          });
        } else {
          if (callback) {
            callback({...readyState, mounted});
          }
          if (isComplete) {
            completeProfiler.stop();
          }
        }
      }, 'RelayContainer.onReadyStateChange');

      var current = {
        variables: nextVariables,
        request: forceFetch ?
          this.context.relay.forceFetch(querySet, onReadyStateChange) :
          this.context.relay.primeCache(querySet, onReadyStateChange),
      };
      this.pending = current;
    }

    /**
     * Determine if the supplied record reflects an optimistic update.
     */
    hasOptimisticUpdate(
      record: Object
    ): boolean {
      var dataID = RelayRecord.getDataID(record);
      invariant(
        dataID != null,
        'RelayContainer.hasOptimisticUpdate(): Expected a record in `%s`.',
        componentName
      );
      return this.context.relay.getStoreData().hasOptimisticUpdate(dataID);
    }

    /**
     * Returns the pending mutation transactions affecting the given record.
     */
    getPendingTransactions(record: Object): ?Array<RelayMutationTransaction> {
      const dataID = RelayRecord.getDataID(record);
      invariant(
        dataID != null,
        'RelayContainer.getPendingTransactions(): Expected a record in `%s`.',
        componentName
      );
      const storeData = this.context.relay.getStoreData();
      const mutationIDs = storeData.getClientMutationIDs(dataID);
      if (!mutationIDs) {
        return null;
      }
      const mutationQueue = storeData.getMutationQueue();
      return mutationIDs.map(id => mutationQueue.getTransaction(id));
    }

    /**
     * Checks if data for a deferred fragment is ready. This method should
     * *always* be called before rendering a child component whose fragment was
     * deferred (unless that child can handle null or missing data).
     */
    hasFragmentData(
      fragmentReference: RelayFragmentReference,
      record: Object
    ): boolean {
      const storeData = this.context.relay.getStoreData();
      if (!storeData.getPendingQueryTracker().hasPendingQueries()) {
        // nothing can be missing => must have data
        return true;
      }
      // convert builder -> fragment in order to get the fragment's name
      const dataID = RelayRecord.getDataID(record);
      invariant(
        dataID != null,
        'RelayContainer.hasFragmentData(): Second argument is not a valid ' +
        'record. For `<%s X={this.props.X} />`, use ' +
        '`this.props.hasFragmentData(%s.getFragment(\'X\'), this.props.X)`.',
        componentName,
        componentName
      );
      const fragment = getDeferredFragment(
        fragmentReference,
        this.context,
        this.state.variables
      );
      invariant(
        fragment instanceof RelayQuery.Fragment,
        'RelayContainer.hasFragmentData(): First argument is not a valid ' +
        'fragment. Ensure that there are no failing `if` or `unless` ' +
        'conditions.'
      );
      return storeData.getCachedStore().hasDeferredFragmentData(
        dataID,
        fragment.getCompositeHash()
      );
    }

    /**
     * Determine if the supplied record might be missing data.
     */
    hasPartialData(
      record: Object
    ): boolean {
      return RelayRecordStatusMap.isPartialStatus(
        record[RelayRecord.MetadataKey.STATUS]
      );
    }

    componentWillMount(): void {
      const {relay, route} = this.context;
      if (route.useMockData) {
        return;
      }
      this.setState(
        this._initialize(
          this.props,
          relay,
          route,
          initialVariables
        )
      );
    }

    componentWillReceiveProps(
      nextProps: Object,
      nextContext?: Object
    ): void {
      const {relay, route} = nullthrows(nextContext);
      if (route.useMockData) {
        return;
      }
      this.setState(state => {
        if (this.context.relay !== relay) {
          this._cleanup();
        }
        return this._initialize(
          nextProps,
          relay,
          route,
          resetPropOverridesForVariables(spec, nextProps, state.variables)
        );
      });
    }

    componentWillUnmount(): void {
      this._cleanup();
      this.mounted = false;
    }

    _initialize(
      props: Object,
      relayContext: RelayContextInterface,
      route: RelayQueryConfigSpec,
      prevVariables: Variables
    ): { variables: Variables, queryData: {[propName: string]: mixed} } {
      const variables = getVariablesWithPropOverrides(
        spec,
        props,
        prevVariables
      );
      this._updateFragmentPointers(props, route, variables);
      this._updateFragmentResolvers(relayContext);
      return {
        variables,
        queryData: this._getQueryData(props),
      };
    }

    _cleanup(): void {
      // A guarded error in mounting might prevent initialization of resolvers.
      if (this._fragmentResolvers) {
        forEachObject(
          this._fragmentResolvers,
          fragmentResolver => fragmentResolver && fragmentResolver.dispose()
        );
      }

      this._fragmentPointers = {};
      this._fragmentResolvers = {};

      var pending = this.pending;
      if (pending) {
        pending.request.abort();
        this.pending = null;
      }
    }

    _updateFragmentResolvers(relayContext: RelayContextInterface): void {
      var fragmentPointers = this._fragmentPointers;
      var fragmentResolvers = this._fragmentResolvers;
      fragmentNames.forEach(fragmentName => {
        var fragmentPointer = fragmentPointers[fragmentName];
        var fragmentResolver = fragmentResolvers[fragmentName];
        if (!fragmentPointer) {
          if (fragmentResolver) {
            fragmentResolver.dispose();
            fragmentResolvers[fragmentName] = null;
          }
        } else if (!fragmentResolver) {
          fragmentResolver = relayContext.getFragmentResolver(
            fragmentPointer.fragment,
            this._handleFragmentDataUpdate.bind(this)
          );
          fragmentResolvers[fragmentName] = fragmentResolver;
        }
      });
    }

    _handleFragmentDataUpdate(): void {
      if (!this.mounted) {
        return;
      }
      var queryData = this._getQueryData(this.props);
      var updateProfiler = RelayProfiler.profile(
        'RelayContainer.handleFragmentDataUpdate'
      );
      this.setState({queryData}, updateProfiler.stop);
    }

    _updateFragmentPointers(
      props: Object,
      route: RelayQueryConfigSpec,
      variables: Variables
    ): void {
      const fragmentPointers = this._fragmentPointers;
      fragmentNames.forEach(fragmentName => {
        const propValue = props[fragmentName];
        warning(
          propValue !== undefined,
          'RelayContainer: Expected prop `%s` to be supplied to `%s`, but ' +
          'got `undefined`. Pass an explicit `null` if this is intentional.',
          fragmentName,
          componentName
        );
        if (propValue == null) {
          fragmentPointers[fragmentName] = null;
          return;
        }
        // handle invalid prop values using a warning at first.
        if (typeof propValue !== 'object') {
          warning(
            false,
            'RelayContainer: Expected prop `%s` supplied to `%s` to be an ' +
            'object, got `%s`.',
            fragmentName,
            componentName,
            propValue
          );
          fragmentPointers[fragmentName] = null;
          return;
        }
        const fragment = getFragment(fragmentName, route, variables);
        let dataIDOrIDs;

        if (fragment.isPlural()) {
          // Plural fragments require the prop value to be an array of fragment
          // pointers, which are merged into a single fragment pointer to pass
          // to the query resolver `resolve`.
          invariant(
            Array.isArray(propValue),
            'RelayContainer: Invalid prop `%s` supplied to `%s`, expected an ' +
            'array of records because the corresponding fragment has ' +
            '`@relay(plural: true)`.',
            fragmentName,
            componentName
          );
          if (!propValue.length) {
            // Nothing to observe: pass the empty array through
            fragmentPointers[fragmentName] = null;
            return;
          }
          let dataIDs = null;
          propValue.forEach((item, ii) => {
            if (typeof item === 'object' && item != null) {
              const dataID = RelayFragmentPointer.getDataID(item, fragment);
              if (dataID) {
                dataIDs = dataIDs || [];
                dataIDs.push(dataID);
              }
            }
          });
          if (dataIDs) {
            invariant(
              dataIDs.length === propValue.length,
              'RelayContainer: Invalid prop `%s` supplied to `%s`. Some ' +
              'array items contain data fetched by Relay and some items ' +
              'contain null/mock data.',
              fragmentName,
              componentName
            );
          }
          dataIDOrIDs = dataIDs;
        } else {
          invariant(
            !Array.isArray(propValue),
            'RelayContainer: Invalid prop `%s` supplied to `%s`, expected a ' +
            'single record because the corresponding fragment is not plural ' +
            '(i.e. does not have `@relay(plural: true)`).',
            fragmentName,
            componentName
          );
          dataIDOrIDs = RelayFragmentPointer.getDataID(propValue, fragment);
        }
        if (dataIDOrIDs == null) {
          // TODO: Throw when we have mock data validation, #6332949.
          if (__DEV__) {
            if (!route.useMockData && !this._didShowFakeDataWarning) {
              this._didShowFakeDataWarning = true;
              warning(
                false,
                'RelayContainer: Expected prop `%s` supplied to `%s` to ' +
                'be data fetched by Relay. This is likely an error unless ' +
                'you are purposely passing in mock data that conforms to ' +
                'the shape of this component\'s fragment.',
                fragmentName,
                componentName
              );
            }
          }
        }
        fragmentPointers[fragmentName] = dataIDOrIDs ?
          {fragment, dataIDs: dataIDOrIDs} :
          null;
      });
      if (__DEV__) {
        // If a fragment pointer is null, warn if it was found on another prop.
        fragmentNames.forEach(fragmentName => {
          if (fragmentPointers[fragmentName]) {
            return;
          }
          const fragment = getFragment(fragmentName, route, variables);
          Object.keys(props).forEach(propName => {
            warning(
              fragmentPointers[propName] ||
              !RelayRecord.isRecord(props[propName]) ||
              typeof props[propName] !== 'object' ||
              props[propName] == null ||
              !RelayFragmentPointer.getDataID(
                props[propName],
                fragment
              ),
              'RelayContainer: Expected record data for prop `%s` on `%s`, ' +
              'but it was instead on prop `%s`. Did you misspell a prop or ' +
              'pass record data into the wrong prop?',
              fragmentName,
              componentName,
              propName
            );
          });
        });
      }
    }

    _getQueryData(
      props: Object
    ): Object {
      var queryData = {};
      var fragmentPointers = this._fragmentPointers;
      forEachObject(this._fragmentResolvers, (fragmentResolver, propName) => {
        var propValue = props[propName];
        var fragmentPointer = fragmentPointers[propName];

        if (!propValue || !fragmentPointer) {
          // Clear any subscriptions since there is no data.
          fragmentResolver && fragmentResolver.dispose();
          // Allow mock data to pass through without modification.
          queryData[propName] = propValue;
        } else {
          queryData[propName] = fragmentResolver.resolve(
            fragmentPointer.fragment,
            fragmentPointer.dataIDs
          );
        }
        if (this.state.queryData.hasOwnProperty(propName) &&
            queryData[propName] !== this.state.queryData[propName]) {
          this._hasStaleQueryData = true;
        }
      });
      return queryData;
    }

    shouldComponentUpdate(
      nextProps: Object,
      nextState: any,
      nextContext: any
    ): boolean {
      // Flag indicating that query data changed since previous render.
      if (this._hasStaleQueryData) {
        this._hasStaleQueryData = false;
        return true;
      }

      if (this.context.relay !== nextContext.relay ||
          this.context.route !== nextContext.route) {
        return true;
      }

      var fragmentPointers = this._fragmentPointers;
      return (
        !RelayContainerComparators.areNonQueryPropsEqual(
          fragments,
          this.props,
          nextProps
        ) ||
        (
          fragmentPointers &&
          !RelayContainerComparators.areQueryResultsEqual(
            fragmentPointers,
            this.state.queryData,
            nextState.queryData
          )
        ) ||
        !RelayContainerComparators.areQueryVariablesEqual(
          this.state.variables,
          nextState.variables
        )
      );
    }

    render(): ReactElement {
      var relayProps: RelayProp = {
        forceFetch: this.forceFetch,
        getPendingTransactions: this.getPendingTransactions,
        hasFragmentData: this.hasFragmentData,
        hasOptimisticUpdate: this.hasOptimisticUpdate,
        hasPartialData: this.hasPartialData,
        route: this.context.route,
        setVariables: this.setVariables,
        variables: this.state.variables,
      };
      return (
        <Component
          {...this.props}
          {...this.state.queryData}
          {...prepareRelayContainerProps(relayProps, this)}
          ref={isReactComponent(Component) ? 'component' : null}
        />
      );
    }
  }

  function getFragment(
    fragmentName: string,
    route: RelayQueryConfigSpec,
    variables: Variables
  ): RelayQuery.Fragment {
    var fragmentBuilder = fragments[fragmentName];
    invariant(
      fragmentBuilder,
      'RelayContainer: Expected `%s` to have a query fragment named `%s`.',
      containerName,
      fragmentName
    );
    var fragment = buildContainerFragment(
      containerName,
      fragmentName,
      fragmentBuilder,
      initialVariables
    );
    // TODO: Allow routes without names, #7856965.
    var metaRoute = RelayMetaRoute.get(route.name);
    if (prepareVariables) {
      variables = prepareVariables(variables, metaRoute);
    }
    return RelayQuery.Fragment.create(
      fragment,
      metaRoute,
      variables
    );
  }

  initializeProfiler(RelayContainer);
  RelayContainer.contextTypes = containerContextTypes;
  RelayContainer.displayName = containerName;
  RelayContainerProxy.proxyMethods(RelayContainer, Component);

  return RelayContainer;
}

/**
 * TODO: Stop allowing props to override variables, #7856288.
 */
function getVariablesWithPropOverrides(
  spec: RelayContainerSpec,
  props: Object,
  variables: Variables
): Variables {
  var initialVariables = spec.initialVariables;
  if (initialVariables) {
    var mergedVariables;
    for (var key in initialVariables) {
      if (key in props) {
        mergedVariables = mergedVariables || {...variables};
        mergedVariables[key] = props[key];
      }
    }
    variables = mergedVariables || variables;
  }
  return variables;
}

/**
 * Compare props and variables and reset the internal query variables if outside
 * query variables change the component.
 *
 * TODO: Stop allowing props to override variables, #7856288.
 */
function resetPropOverridesForVariables(
  spec: RelayContainerSpec,
  props: Object,
  variables: Variables
): Variables {
  var initialVariables = spec.initialVariables;
  for (var key in initialVariables) {
    if (key in props && props[key] != variables[key]) {
      return initialVariables;
    }
  }
  return variables;
}

function initializeProfiler(RelayContainer: RelayContainer): void {
  RelayProfiler.instrumentMethods(RelayContainer.prototype, {
    componentWillMount:
      'RelayContainer.prototype.componentWillMount',
    componentWillReceiveProps:
      'RelayContainer.prototype.componentWillReceiveProps',
    shouldComponentUpdate:
      'RelayContainer.prototype.shouldComponentUpdate',
  });
}

/**
 * Merges a partial update into a set of variables. If no variables changed, the
 * same object is returned. Otherwise, a new object is returned.
 */
function mergeVariables(
  currentVariables: Variables,
  partialVariables: ?Variables
): Variables {
  if (partialVariables) {
    for (var key in partialVariables) {
      if (currentVariables[key] !== partialVariables[key]) {
        return {...currentVariables, ...partialVariables};
      }
    }
  }
  return currentVariables;
}

/**
 * Wrapper around `buildRQL.Fragment` with contextual error messages.
 */
function buildContainerFragment(
  containerName: string,
  fragmentName: string,
  fragmentBuilder: RelayQLFragmentBuilder,
  variables: Variables
): ConcreteFragment {
  var fragment = buildRQL.Fragment(
    fragmentBuilder,
    variables
  );
  invariant(
    fragment,
    'Relay.QL defined on container `%s` named `%s` is not a valid fragment. ' +
    'A typical fragment is defined using: Relay.QL`fragment on Type {...}`',
    containerName,
    fragmentName
  );
  return fragment;
}

function getDeferredFragment(
  fragmentReference: RelayFragmentReference,
  context: Object,
  variables: Variables
): RelayQuery.Fragment {
  var route = RelayMetaRoute.get(context.route.name);
  var concreteFragment = fragmentReference.getFragment(variables);
  var concreteVariables = fragmentReference.getVariables(route, variables);
  return RelayQuery.Fragment.create(
    concreteFragment,
    route,
    concreteVariables,
    {
      isDeferred: true,
      isContainerFragment: fragmentReference.isContainerFragment(),
    }
  );
}

/**
 * Creates a lazy Relay container. The actual container is created the first
 * time a container is being constructed by React's rendering engine.
 */
function create(
  Component: ReactClass<any, any, any>,
  spec: RelayContainerSpec,
): RelayLazyContainer {
  var componentName = Component.displayName || Component.name;
  var containerName = 'Relay(' + componentName + ')';

  var fragments = spec.fragments;
  invariant(
    typeof fragments === 'object' && fragments,
    'Relay.createContainer(%s, ...): Missing `fragments`, which is expected ' +
    'to be an object mapping from `propName` to: () => Relay.QL`...`',
    componentName
  );
  var fragmentNames = Object.keys(fragments);
  var initialVariables = spec.initialVariables || {};
  var prepareVariables = spec.prepareVariables;

  var Container;
  function ContainerConstructor(props, context) {
    if (!Container) {
      Container = createContainerComponent(Component, spec);
    }
    return new Container(props, context);
  }

  ContainerConstructor.getFragmentNames = () => fragmentNames;
  ContainerConstructor.hasFragment = fragmentName => !!fragments[fragmentName];
  ContainerConstructor.hasVariable = variableName =>
    Object.prototype.hasOwnProperty.call(initialVariables, variableName);

  /**
   * Retrieves a reference to the fragment by name. An optional second argument
   * can be supplied to override the component's default variables.
   */
  ContainerConstructor.getFragment = function(
    fragmentName: string,
    variableMapping?: Variables
  ): RelayFragmentReference {
    var fragmentBuilder = fragments[fragmentName];
    if (!fragmentBuilder) {
      invariant(
        false,
        '%s.getFragment(): `%s` is not a valid fragment name. Available ' +
        'fragments names: %s',
        containerName,
        fragmentName,
        fragmentNames.map(name => '`' + name + '`').join(', ')
      );
    }
    invariant(
      typeof fragmentBuilder === 'function',
      'RelayContainer: Expected `%s.fragments.%s` to be a function returning '+
      'a fragment. Example: `%s: () => Relay.QL`fragment on ...`',
      containerName,
      fragmentName,
      fragmentName
    );
    return RelayFragmentReference.createForContainer(
      () => buildContainerFragment(
        containerName,
        fragmentName,
        fragmentBuilder,
        initialVariables
      ),
      initialVariables,
      variableMapping,
      prepareVariables
    );
  };

  ContainerConstructor.contextTypes = containerContextTypes;
  ContainerConstructor.displayName = containerName;
  ContainerConstructor.moduleName = (null: ?string);

  return ContainerConstructor;
}

module.exports = {create};
