/**
 * Copyright 2013-2015, Facebook, Inc.
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
var ErrorUtils = require('ErrorUtils');
var GraphQLFragmentPointer = require('GraphQLFragmentPointer');
var GraphQLStoreDataHandler = require('GraphQLStoreDataHandler');
var React = require('React');
var ReactDOM = require('ReactDOM');
var RelayContainerComparators = require('RelayContainerComparators');
var RelayContainerProxy = require('RelayContainerProxy');
var RelayDeprecated = require('RelayDeprecated');
var RelayFragmentReference = require('RelayFragmentReference');
import type {DataID, RelayQuerySet} from 'RelayInternalTypes';
var RelayMetaRoute = require('RelayMetaRoute');
var RelayMutationTransaction = require('RelayMutationTransaction');
var RelayPendingQueryTracker = require('RelayPendingQueryTracker');
var RelayPropTypes = require('RelayPropTypes');
var RelayProfiler = require('RelayProfiler');
var RelayQuery = require('RelayQuery');
var RelayStore = require('RelayStore');
var RelayStoreData = require('RelayStoreData');
import type {
  Abortable,
  ComponentReadyStateChangeCallback,
  RelayContainer,
  RelayProp,
  Subscription,
  Variables
} from 'RelayTypes';
import type URI from 'URI';

var buildRQL = require('buildRQL');
import type {RelayQLFragmentBuilder, RelayQLQueryBuilder} from 'buildRQL';
var forEachObject = require('forEachObject');
var invariant = require('invariant');
var nullthrows = require('nullthrows');
var prepareRelayContainerProps = require('prepareRelayContainerProps');
var shallowEqual = require('shallowEqual');
var warning = require('warning');

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
  uri?: ?URI;
  useMockData?: bool;
};
export type RootQueries = {
  [queryName: string]: RelayQLQueryBuilder;
};

var containerContextTypes = {
  route: RelayPropTypes.QueryConfig.isRequired,
};
var nextContainerID = 0;

RelayStoreData.getDefaultInstance().getChangeEmitter().injectBatchingStrategy(
  ReactDOM.unstable_batchedUpdates
);

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
  spec: RelayContainerSpec,
  containerID: string
): RelayContainer {
  var componentName = Component.displayName || Component.name;
  var containerName = 'Relay(' + componentName + ')';

  var fragments = spec.fragments;
  var fragmentNames = Object.keys(fragments);
  var initialVariables = spec.initialVariables || {};
  var prepareVariables = spec.prepareVariables;

  class RelayContainer extends React.Component {
    mounted: boolean;
    _deferredErrors: ?Object;
    _deferredSubscriptions: ?Object;
    _didShowFakeDataWarning: boolean;
    _fragmentPointers: {[key: string]: GraphQLFragmentPointer};
    _hasNewDeferredData: boolean;
    _hasStaleQueryData: boolean;
    _fragmentSubscriptions: {[key: string]: Subscription};

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

      var {route} = context;
      invariant(
        route && typeof route.name === 'string',
        'RelayContainer: `%s` was rendered without a valid route. Make sure ' +
        'the route is valid, and make sure that it is correctly set on the ' +
        'parent component\'s context (e.g. using <RelayRootContainer>).',
        containerName
      );

      var self: any = this;
      self.forceFetch = this.forceFetch.bind(this);
      self.getFragmentError = this.getFragmentError.bind(this);
      self.getPendingTransactions = this.getPendingTransactions.bind(this);
      self.hasFragmentData = this.hasFragmentData.bind(this);
      self.hasOptimisticUpdate = this.hasOptimisticUpdate.bind(this);
      self.setVariables = this.setVariables.bind(this);

      this._deferredErrors = null;
      this._deferredSubscriptions = null;
      this._didShowFakeDataWarning = false;
      this._fragmentPointers = {};
      this._hasNewDeferredData = false;
      this._hasStaleQueryData = false;
      this._fragmentSubscriptions = {};

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
      fragmentPointers: {[key: string]: GraphQLFragmentPointer},
      querySet: RelayQuerySet,
    } {
      var fragmentPointers = {};
      var querySet = {};
      var storeData = RelayStoreData.getDefaultInstance();
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
          var pluralFragmentPointers = [];
          queryData.forEach((data, ii) => {
            var dataID = GraphQLStoreDataHandler.getID(data);
            if (dataID) {
              querySet[fragmentName + ii] =
                storeData.buildFragmentQueryForDataID(fragment, dataID);
              pluralFragmentPointers.push(
                new GraphQLFragmentPointer(dataID, fragment)
              );
            }
          });
          if (pluralFragmentPointers.length) {
            fragmentPointer = pluralFragmentPointers;
          }
        } else {
          var dataID = GraphQLStoreDataHandler.getID(queryData);
          if (dataID) {
            fragmentPointer = new GraphQLFragmentPointer(dataID, fragment);
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
          this._updateFragmentSubscriptions();
          var queryData = this._getQueryData(this.props);
          partialState = {variables: nextVariables, queryData};
        } else {
          partialState = {};
        }
        var mounted = this.mounted;
        if (mounted) {
          var updateProfiler = RelayProfiler.profile('RelayContainer.update');
          ReactDOM.unstable_batchedUpdates(() => {
            this.setState(partialState, () => {
              updateProfiler.stop();
              if (isComplete) {
                completeProfiler.stop();
              }
            });
            if (callback) {
              callback.call(this.refs.component, {...readyState, mounted});
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
          RelayStore.forceFetch(querySet, onReadyStateChange) :
          RelayStore.primeCache(querySet, onReadyStateChange),
      };
      this.pending = current;
    }

    /**
     * Determine if the supplied record reflects an optimistic update.
     */
    hasOptimisticUpdate(
      record: Object
    ): boolean {
      var dataID = GraphQLStoreDataHandler.getID(record);
      invariant(
        dataID != null,
        'RelayContainer.hasOptimisticUpdate(): Expected a record in `%s`.',
        componentName
      );
      var storeData = RelayStoreData.getDefaultInstance();
      return storeData.getQueuedStore().hasOptimisticUpdate(dataID);
    }

    /**
     * Returns the pending mutation transactions affecting the given record.
     */
    getPendingTransactions(record: Object): ?Array<RelayMutationTransaction> {
      const dataID = GraphQLStoreDataHandler.getID(record);
      invariant(
        dataID != null,
        'RelayContainer.getPendingTransactions(): Expected a record in `%s`.',
        componentName
      );
      var storeData = RelayStoreData.getDefaultInstance();
      var mutationIDs = storeData.getQueuedStore().getClientMutationIDs(dataID);
      if (!mutationIDs) {
        return null;
      }
      const mutationQueue = storeData.getMutationQueue();
      return mutationIDs.map(id => mutationQueue.getTransaction(id));
    }

    /**
     * Returns any error related to fetching data for a deferred fragment.
     */
    getFragmentError(
      fragmentReference: RelayFragmentReference,
      record: Object
    ): ?Error {
      var deferredErrors = this._deferredErrors;
      if (!deferredErrors) {
        return null;
      }
      var dataID = GraphQLStoreDataHandler.getID(record);
      if (dataID == null) {
        // TODO: Throw instead, like we do in `hasFragmentData`, #7857010.
        warning(
          false,
          'RelayContainer.getFragmentError(): Invalid call from `%s`. Second ' +
          'argument is not a valid record.',
          componentName
        );
        return null;
      }
      var fragment = getDeferredFragment(
        fragmentReference,
        this.context,
        this.state.variables
      );
      invariant(
        fragment instanceof RelayQuery.Fragment,
        'RelayContainer.getFragmentError(): First argument is not a valid ' +
        'fragment. Ensure that there are no failing `if` or `unless` ' +
        'conditions.'
      );
      var fragmentID = fragment.getFragmentID();
      var subscriptionKey = getSubscriptionKey(dataID, fragmentID);
      return deferredErrors[subscriptionKey];
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
      if (
        !RelayPendingQueryTracker.hasPendingQueries() &&
        !this._deferredErrors
      ) {
        // nothing can be missing => must have data
        return true;
      }
      // convert builder -> fragment in order to get the fragment's name
      var dataID = GraphQLStoreDataHandler.getID(record);
      invariant(
        dataID != null,
        'RelayContainer.hasFragmentData(): Second argument is not a valid ' +
        'record. For `<%s X={this.props.X} />`, use ' +
        '`this.props.hasFragmentData(%s.getFragment(\'X\'), this.props.X)`.',
        componentName,
        componentName
      );
      var fragment = getDeferredFragment(
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
      var fragmentID = fragment.getFragmentID();
      var hasData = !storeData.getDeferredQueryTracker().isQueryPending(
        dataID,
        fragmentID
      );

      var subscriptionKey = getSubscriptionKey(dataID, fragmentID);
      if (!hasData) {
        // Query is pending: subscribe for updates to any missing deferred data.
        var deferredSubscriptions = this._deferredSubscriptions || {};
        if (!this._deferredSubscriptions) {
          this._deferredSubscriptions = deferredSubscriptions;
        }
        if (!deferredSubscriptions.hasOwnProperty(subscriptionKey)) {
          deferredSubscriptions[subscriptionKey] =
            storeData.getDeferredQueryTracker().addListenerForFragment(
              dataID,
              fragmentID,
              {
                onSuccess: this._handleDeferredSuccess.bind(this),
                onFailure: this._handleDeferredFailure.bind(this),
              }
            );
        }
      } else {
        // query completed: check for errors
        if (
          this._deferredErrors &&
          this._deferredErrors.hasOwnProperty(subscriptionKey)
        ) {
          hasData = false;
        }
      }

      return hasData;
    }

    componentWillMount(): void {
      if (this.context.route.useMockData) {
        return;
      }
      var variables =
        getVariablesWithPropOverrides(spec, this.props, initialVariables);
      this._updateFragmentPointers(this.props, this.context.route, variables);
      this._updateFragmentSubscriptions();
      var queryData = this._getQueryData(this.props);

      this.setState({
        variables,
        queryData,
      });
    }

    componentWillReceiveProps(
      nextProps: Object,
      nextContext?: Object
    ): void {
      var {route} = nullthrows(nextContext);
      if (route.useMockData) {
        return;
      }
      this.setState(state => {
        var variables = getVariablesWithPropOverrides(
          spec,
          nextProps,
          resetPropOverridesForVariables(spec, nextProps, state.variables)
        );
        this._updateFragmentPointers(nextProps, route, variables);
        this._updateFragmentSubscriptions();
        return {
          variables,
          queryData: this._getQueryData(nextProps),
        };
      });

    }

    componentWillUnmount(): void {
      // A guarded error in mounting might prevent initialization of
      // fragment subscriptions.
      if (this._fragmentSubscriptions) {
        forEachObject(this._fragmentSubscriptions, fragmentSubscription => {
          fragmentSubscription && fragmentSubscription.dispose()
        });
      }

      // Remove any subscriptions for pending deferred queries.
      var deferredSubscriptions = this._deferredSubscriptions;
      if (deferredSubscriptions) {
        forEachObject(deferredSubscriptions, subscription => {
          subscription && subscription.remove();
        });
      }

      this._deferredErrors = null;
      this._deferredSubscriptions = null;
      this._fragmentPointers = {};
      this._fragmentSubscriptions = {};

      var pending = this.pending;
      if (pending) {
        pending.request.abort();
        this.pending = null;
      }
      this.mounted = false;
    }

    _updateFragmentSubscriptions(): void {
      var fragmentPointers = this._fragmentPointers;
      var fragmentSubscriptions = this._fragmentSubscriptions;
      var storeData = RelayStoreData.getDefaultInstance();
      fragmentNames.forEach(fragmentName => {
        var fragmentPointer = fragmentPointers[fragmentName];
        var fragmentSubscription = fragmentSubscriptions[fragmentName];

        fragmentSubscription && fragmentSubscription.dispose();

        if (fragmentPointer) {
          fragmentSubscription = storeData.observeFragmentPointer(
            fragmentPointer,
            () => this._handleFragmentDataUpdate()
          );
          fragmentSubscriptions[fragmentName] = fragmentSubscription;
        } else {
          fragmentSubscriptions[fragmentName] = null;
        }
      });
    }

    _handleFragmentDataUpdate(): void {
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
        var propValue = props[fragmentName];
        warning(
          propValue !== undefined,
          'RelayContainer: Expected query `%s` to be supplied to `%s` as ' +
          'a prop from the parent. Pass an explicit `null` if this is ' +
          'intentional.',
          fragmentName,
          componentName
        );
        if (!propValue) {
          fragmentPointers[fragmentName] = null;
          return;
        }
        var fragment = getFragment(fragmentName, route, variables);
        var concreteFragmentID = fragment.getConcreteFragmentID();
        var fragmentPointer;

        if (fragment.isPlural()) {
          // Plural fragments require an array of fragment pointers.
          invariant(
            Array.isArray(propValue),
            'RelayContainer: Invalid prop `%s` supplied to `%s`, expected an ' +
            'array of records because the corresponding fragment is plural.',
            fragmentName,
            componentName
          );
          if (propValue.length) {
            fragmentPointer = propValue.map((item, ii) => {
              var eachFragmentPointer = item[concreteFragmentID];
              invariant(
                eachFragmentPointer,
                'RelayContainer: Invalid prop `%s` supplied to `%s`, ' +
                'expected element at index %s to have query data.',
                fragmentName,
                componentName,
                ii
              );
              return eachFragmentPointer;
            });
          }
        } else {
          invariant(
            !Array.isArray(propValue),
            'RelayContainer: Invalid prop `%s` supplied to `%s`, expected a ' +
            'single record because the corresponding fragment is not plural.',
            fragmentName,
            componentName
          );
          var fragmentPointer = propValue[concreteFragmentID];
          if (!fragmentPointer) {
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
        }
        fragmentPointers[fragmentName] = fragmentPointer || null;
      });
      if (__DEV__) {
        // If a fragment pointer is null, warn if it was found on another prop.
        fragmentNames.forEach(fragmentName => {
          if (fragmentPointers[fragmentName]) {
            return;
          }
          const fragment = getFragment(fragmentName, route, variables);
          const concreteFragmentID = fragment.getConcreteFragmentID();
          Object.keys(props).forEach(propName => {
            warning(
              fragmentPointers[propName] ||
              !props[propName] ||
              !props[propName][concreteFragmentID],
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
      var storeData = RelayStoreData.getDefaultInstance();
      fragmentNames.forEach(propName => {
        var propValue = props[propName];
        var fragmentPointer = fragmentPointers[propName];

        if (!propValue || !fragmentPointer) {
          // Allow mock data to pass through without modification.
          queryData[propName] = propValue;
        } else {
          queryData[propName] = storeData.readFragmentPointer(
            fragmentPointer
          );
        }
        if (this.state.queryData.hasOwnProperty(propName) &&
            queryData[propName] !== this.state.queryData[propName]) {
          this._hasStaleQueryData = true;
        }
      });
      return queryData;
    }

    /**
     * Update query props when deferred data becomes available.
     */
    _handleDeferredSuccess(
      dataID: string,
      fragmentID: string
    ): void {
      var subscriptionKey = getSubscriptionKey(dataID, fragmentID);
      var deferredSubscriptions = this._deferredSubscriptions;
      if (deferredSubscriptions &&
          deferredSubscriptions.hasOwnProperty(subscriptionKey)) {
        // Flag to force `shouldComponentUpdate` to return true.
        this._hasNewDeferredData = true;
        deferredSubscriptions[subscriptionKey].remove();
        delete deferredSubscriptions[subscriptionKey];

        var deferredSuccessProfiler = RelayProfiler.profile(
          'RelayContainer.handleDeferredSuccess'
        );
        var queryData = this._getQueryData(this.props);
        this.setState({queryData}, deferredSuccessProfiler.stop);
      }
    }

    /**
     * Update query props when deferred queries fail.
     */
    _handleDeferredFailure(
      dataID: string,
      fragmentID: string,
      error: Error
    ): void {
      var subscriptionKey = getSubscriptionKey(dataID, fragmentID);
      var deferredErrors = this._deferredErrors;
      if (!deferredErrors) {
        this._deferredErrors = deferredErrors = {};
      }
      // Flag to force `shouldComponentUpdate` to return true.
      this._hasNewDeferredData = true;
      deferredErrors[subscriptionKey] = error;

      var deferredFailureProfiler = RelayProfiler.profile(
        'RelayContainer.handleDeferredFailure'
      );
      // Dummy `setState` to trigger re-render.
      this.setState(this.state, deferredFailureProfiler.stop);
    }

    shouldComponentUpdate(
      nextProps: Object,
      nextState: any,
      nextContext: any
    ): boolean {
      // TODO: Fix bug with `_hasStaleQueryData` and `_hasNewDeferredData` both
      // being true. (This will return true two times in a row.)

      // Flag indicating that query data changed since previous render.
      if (this._hasStaleQueryData) {
        this._hasStaleQueryData = false;
        return true;
      }
      // Flag indicating that deferred data has resolved - this component's data
      // will not change since the data is for a child component, therefore
      // we force update here.
      if (this._hasNewDeferredData) {
        this._hasNewDeferredData = false;
        return true;
      }

      if (this.context.route !== nextContext.route) {
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
        getFragmentError: this.getFragmentError,
        getPendingTransactions: this.getPendingTransactions,
        hasFragmentData: this.hasFragmentData,
        hasOptimisticUpdate: this.hasOptimisticUpdate,
        route: this.context.route,
        setVariables: this.setVariables,
        variables: this.state.variables,
      };
      return (
        <Component
          {...this.props}
          {...this.state.queryData}
          {...prepareRelayContainerProps(relayProps, this)}
          ref="component"
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

/**
 * Constructs a unique key for a deferred subscription.
 */
function getSubscriptionKey(dataID: DataID, fragmentID: string): string {
  return dataID + '.' + fragmentID;
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
      isTypeConditional: fragmentReference.isTypeConditional(),
    }
  );
}

/**
 * Creates a lazy Relay container. The actual container is created the first
 * time a container is being constructed by React's rendering engine.
 */
function create(
  Component: ReactClass<any, any, any>,
  maybeSpec: Object // spec: RelayContainerSpec
): RelayLazyContainer {
  var spec = RelayDeprecated.upgradeContainerSpec(maybeSpec);

  var componentName = Component.displayName || Component.name;
  var containerName = 'Relay(' + componentName + ')';
  var containerID = (nextContainerID++).toString(36);

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
      Container = createContainerComponent(Component, spec, containerID);
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
  ContainerConstructor.getQuery = () => {
    // TODO(jkassens, #8978552): delete this
    invariant(
      false,
      'RelayContainer: `%s.getQuery` no longer exists; use `%s.getFragment`.',
      componentName,
      componentName
    );
  };

  ContainerConstructor.contextTypes = containerContextTypes;
  ContainerConstructor.displayName = containerName;
  ContainerConstructor.moduleName = (null: ?string);

  return ContainerConstructor;
}

module.exports = {create};
