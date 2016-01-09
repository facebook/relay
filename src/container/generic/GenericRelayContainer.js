/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GenericRelayContainer
 * @typechecks
 * @flow
 */

'use strict';

//
import type {
  Abortable,
  ComponentReadyStateChangeCallback,
  RelayContainer,
  RelayProp,
  Subscription,
  Variables,
} from 'RelayTypes';
import type {ConcreteFragment} from 'ConcreteQuery';
import type {ContainerCallback, ContainerDataState} from 'GenericRelayRootContainer';
import type {RelayContainerSpec, RelayLazyContainer, RelayQueryConfigSpec} from 'RelayContainer';
import type RelayMutationTransaction from 'RelayMutationTransaction';
import type {RelayQLFragmentBuilder, RelayQLQueryBuilder} from 'buildRQL';
import type {RelayQuerySet} from 'RelayInternalTypes';

const GraphQLFragmentPointer = require('GraphQLFragmentPointer');
const RelayRecord = require('RelayRecord');
const GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');
const RelayFragmentReference = require('RelayFragmentReference');
const RelayMetaRoute = require('RelayMetaRoute');
const RelayQuery = require('RelayQuery');
const RelayStore = require('RelayStore');
const RelayStoreData = require('RelayStoreData');

const buildRQL = require('buildRQL');
const forEachObject = require('forEachObject');
const invariant = require('invariant');
const shallowEqual = require('shallowEqual');
const warning = require('warning');

var storeData = RelayStoreData.getDefaultInstance();

type PropsIncludingRoute = {
  [key: string]: mixed,
  route: RelayQueryConfigSpec
}


function createContainerComponent(
  componentName: string,
  spec: RelayContainerSpec
): any {
  var containerName = 'Relay(' + componentName + ')';

  var fragments = spec.fragments;
  var fragmentNames = Object.keys(fragments);
  var initialVariables = spec.initialVariables || {};
  var prepareVariables = spec.prepareVariables;

  const doneState = {done:true, ready:true, aborted:false, stale:false};

  class GenericRelayContainer {
    callback: ContainerCallback;
    route: RelayQueryConfigSpec;
    _didShowFakeDataWarning: boolean;
    _fragmentPointers: {[key: string]: ?GraphQLFragmentPointer};
    _hasStaleQueryData: boolean;
    _queryResolvers: {[key: string]: ?GraphQLStoreQueryResolver};
    props: {[key: string]: mixed};

    variables: Variables;
    queryData: {[propName: string]: mixed};


    pending: ?{
      variables: Variables;
      request: Abortable;
    };


    constructor(props: PropsIncludingRoute, callback: ContainerCallback) {
      invariant(callback != null, 'A callback function must be provided');

      this.props = props;
      this.route = props.route;
      this.callback = callback;

      var self: any = this;
      self.forceFetch = this.forceFetch.bind(this);
      self.getPendingTransactions = this.getPendingTransactions.bind(this);
      self.hasOptimisticUpdate = this.hasOptimisticUpdate.bind(this);
      self.setVariables = this.setVariables.bind(this);

      this._didShowFakeDataWarning = false;
      this._fragmentPointers = {};
      this._hasStaleQueryData = false;
      this._queryResolvers = {};

      this.pending = null;
      this.variables =  {};
      this.queryData = {};
    }



    cleanup(): void {
      if (this._queryResolvers) {
        forEachObject(
          this._queryResolvers,
          queryResolver => queryResolver && queryResolver.reset()
        );
      }

      this._fragmentPointers = {};
      this._queryResolvers = {};

      var pending = this.pending;
      if (pending) {
        pending.request.abort();
        this.pending = null;
      }

    }

    _updateState(variables:Variables, newState: ContainerDataState) {
      this.variables = variables;
      this.queryData = newState.data;
      this.callback(newState);
    }


    update(nextProps: PropsIncludingRoute): void {
      this.props = nextProps;
      this.route = this.props.route;
      var variables = getVariablesWithPropOverrides(
        spec,
        nextProps,
        resetPropOverridesForVariables(spec, nextProps, this.variables)
      );
      this._updateFragmentPointers(nextProps, this.route, variables);
      this._updateQueryResolvers();

      const queryData = this._getQueryData(nextProps);
      this._updateState(
        variables,
        {data: queryData, ...doneState}
      );
    }


    setVariables(
      partialVariables?: ?Variables
    ): void {
      this._runVariables(partialVariables, false);
    }

    forceFetch(
      partialVariables?: ?Variables
    ): void {
      this._runVariables(partialVariables, true);
    }


    _createQuerySetAndFragmentPointers(variables: Variables): {
      fragmentPointers: {[key: string]: ?GraphQLFragmentPointer},
      querySet: RelayQuerySet,
    } {
      var fragmentPointers = {};
      var querySet = {};
      fragmentNames.forEach(fragmentName => {
        var fragment = getFragment(fragmentName, this.route, variables);
        var queryData = this.queryData[fragmentName];
        if (!fragment || queryData == null) {
          return;
        }

        var fragmentPointer;
        if (fragment.isPlural()) {
          invariant(
            Array.isArray(queryData),
            'GenericRelayContainer: Invalid queryData for `%s`, expected an array ' +
            'of records because the corresponding fragment is plural.',
            fragmentName
          );
          var dataIDs = [];
          queryData.forEach((data, ii) => {
            var dataID = RelayRecord.getDataID(data);
            if (dataID) {
              querySet[fragmentName + ii] =
                storeData.buildFragmentQueryForDataID(fragment, dataID);
              dataIDs.push(dataID);
            }
          });
          if (dataIDs.length) {
            fragmentPointer = new GraphQLFragmentPointer(dataIDs, fragment);
          }
        } else {
          /* $FlowFixMe(>=0.19.0) - queryData is mixed but getID expects Object
           */
          var dataID = RelayRecord.getDataID(queryData);
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
      forceFetch: boolean
    ): void {
      var lastVariables = this.variables;
      var prevVariables = this.pending ? this.pending.variables : lastVariables;
      var nextVariables = mergeVariables(prevVariables, partialVariables);

      this.pending && this.pending.request.abort();

      // If variables changed or we are force-fetching, we need to build a new
      // set of queries that includes the updated variables. Because the pending
      // fetch is always canceled, always initiate a new fetch.
      var querySet = {};
      var fragmentPointers = null;
      if (forceFetch || !shallowEqual(nextVariables, lastVariables)) {
        ({querySet, fragmentPointers} =
          this._createQuerySetAndFragmentPointers(nextVariables));
      }

      const onReadyStateChange = readyState => {
        var {aborted, done, error, ready} = readyState;
        var isComplete = aborted || done || error;
        if (isComplete && this.pending === current) {
          this.pending = null;
        }
        if (ready && fragmentPointers) {
          this._fragmentPointers = fragmentPointers;
          this._updateQueryResolvers();
          var queryData = this._getQueryData(this.props);
          this._updateState(nextVariables, {data: queryData, ...readyState});
        }

      };

      const request = forceFetch ?
        RelayStore.forceFetch(querySet, onReadyStateChange) :
        RelayStore.primeCache(querySet, onReadyStateChange);

      var current = {
        variables: nextVariables,
        request,
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
        'GenericRelayContainer.hasOptimisticUpdate(): Expected a record in `%s`.',
        componentName
      );
      return storeData.hasOptimisticUpdate(dataID);
    }

    /**
     * Returns the pending mutation transactions affecting the given record.
     */
    getPendingTransactions(record: Object): ?Array<RelayMutationTransaction> {
      const dataID = RelayRecord.getDataID(record);
      invariant(
        dataID != null,
        'GenericRelayContainer.getPendingTransactions(): Expected a record in `%s`.',
        componentName
      );
      const mutationIDs = storeData.getClientMutationIDs(dataID);
      if (!mutationIDs) {
        return null;
      }
      const mutationQueue = storeData.getMutationQueue();
      return mutationIDs.map(id => mutationQueue.getTransaction(id));
    }




    _updateQueryResolvers(): void {
      var fragmentPointers = this._fragmentPointers;
      var queryResolvers = this._queryResolvers;
      fragmentNames.forEach(fragmentName => {
        var fragmentPointer = fragmentPointers[fragmentName];
        var queryResolver = queryResolvers[fragmentName];
        if (!fragmentPointer) {
          if (queryResolver) {
            queryResolver.reset();
            queryResolvers[fragmentName] = null;
          }
        } else if (!queryResolver) {
          queryResolver = new GraphQLStoreQueryResolver(
            storeData,
            fragmentPointer,
            this._handleFragmentDataUpdate.bind(this)
          );
          queryResolvers[fragmentName] = queryResolver;
        }
      });
    }

    _handleFragmentDataUpdate(): void {
      const queryData = this._getQueryData(this.props);
      this._updateState(this.variables, {data:queryData, ...doneState});
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
          'GenericRelayContainer: Expected query `%s` to be supplied to `%s` as ' +
          'a prop from the parent. Pass an explicit `null` if this is ' +
          'intentional.',
          fragmentName,
          componentName
        );
        if (!propValue) {
          fragmentPointers[fragmentName] = null;
          return;
        }
        const fragment = getFragment(fragmentName, route, variables);
        const concreteFragmentHash = fragment.getConcreteNodeHash();
        let dataIDOrIDs;

        if (fragment.isPlural()) {
          // Plural fragments require the prop value to be an array of fragment
          // pointers, which are merged into a single fragment pointer to pass
          // to the query resolver `resolve`.
          invariant(
            Array.isArray(propValue),
            'GenericRelayContainer: Invalid prop `%s` supplied to `%s`, expected an ' +
            'array of records because the corresponding fragment is plural.',
            fragmentName,
            componentName
          );
          if (propValue.length) {
            dataIDOrIDs = propValue.reduce((acc, item, ii) => {
              const eachFragmentPointer = item[concreteFragmentHash];
              invariant(
                eachFragmentPointer,
                'GenericRelayContainer: Invalid prop `%s` supplied to `%s`, ' +
                'expected element at index %s to have query data.',
                fragmentName,
                componentName,
                ii
              );
              return acc.concat(eachFragmentPointer.getDataIDs());
            }, []);
          } else {
            // An empty plural fragment cannot be observed; the empty array prop
            // can be passed as-is to the component.
            dataIDOrIDs = null;
          }
        } else {
          invariant(
            !Array.isArray(propValue),
            'GenericRelayContainer: Invalid prop `%s` supplied to `%s`, expected a ' +
            'single record because the corresponding fragment is not plural.',
            fragmentName,
            componentName
          );
          const fragmentPointer = propValue[concreteFragmentHash];
          if (fragmentPointer) {
            dataIDOrIDs = fragmentPointer.getDataID();
          } else {
            // TODO: Throw when we have mock data validation, #6332949.
            dataIDOrIDs = null;
            if (__DEV__) {
              if (!route.useMockData && !this._didShowFakeDataWarning) {
                this._didShowFakeDataWarning = true;
                warning(
                  false,
                  'GenericRelayContainer: Expected prop `%s` supplied to `%s` to ' +
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
        fragmentPointers[fragmentName] = dataIDOrIDs ?
          new GraphQLFragmentPointer(dataIDOrIDs, fragment) :
          null;
      });
      if (__DEV__) {
        // If a fragment pointer is null, warn if it was found on another prop.
        fragmentNames.forEach(fragmentName => {
          if (fragmentPointers[fragmentName]) {
            return;
          }
          const fragment = getFragment(fragmentName, route, variables);
          const concreteFragmentHash = fragment.getConcreteNodeHash();
          Object.keys(props).forEach(propName => {
            warning(
              fragmentPointers[propName] ||
              !props[propName] ||
              !props[propName][concreteFragmentHash],
              'GenericRelayContainer: Expected record data for prop `%s` on `%s`, ' +
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
      forEachObject(this._queryResolvers, (queryResolver, propName) => {
        var propValue = props[propName];
        var fragmentPointer = fragmentPointers[propName];

        if (!propValue || !fragmentPointer) {
          // Clear any subscriptions since there is no data.
          queryResolver && queryResolver.reset();
          // Allow mock data to pass through without modification.
          queryData[propName] = propValue;
        } else {
          queryData[propName] = queryResolver.resolve(fragmentPointer);
        }
        if (this.queryData.hasOwnProperty(propName) &&
            queryData[propName] !== this.queryData[propName]) {
          this._hasStaleQueryData = true;
        }
      });
      return queryData;
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
      'GenericRelayContainer: Expected `%s` to have a query fragment named `%s`.',
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

  return GenericRelayContainer;
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

function create(
  componentName: string,
  spec: RelayContainerSpec
): RelayLazyContainer {
  var containerName = 'Relay(' + componentName + ')';

  var fragments = spec.fragments;
  invariant(
    typeof fragments === 'object' && fragments,
    'Relay.createGenericContainer(%s, ...): Missing `fragments`, which is expected ' +
    'to be an object mapping from `propName` to: () => Relay.QL`...`',
    componentName
  );
  var fragmentNames = Object.keys(fragments);
  var initialVariables = spec.initialVariables || {};
  var prepareVariables = spec.prepareVariables;

  var Container;
  function ContainerConstructor(props, callback) {
    if (!Container) {
      Container = createContainerComponent(componentName, spec);
    }
    return new Container(props, callback);
  }

  ContainerConstructor.getFragmentNames = () => fragmentNames;
  ContainerConstructor.hasFragment = fragmentName => !!fragments[fragmentName];
  ContainerConstructor.hasVariable = variableName =>
    Object.prototype.hasOwnProperty.call(initialVariables, variableName);

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
      'GenericRelayContainer: Expected `%s.fragments.%s` to be a function returning '+
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

  ContainerConstructor.displayName = containerName;
  ContainerConstructor.moduleName = (null: ?string);

  return ContainerConstructor;
}

module.exports = {create};
