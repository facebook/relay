/*
* @providesModule createQuerySetAndFragmentPointers
* @typechecks
* @flow
*/

import type {
  Variables,
} from 'RelayTypes';

import type {RelayQuerySet} from 'RelayInternalTypes';
import type {RelayQLFragmentBuilder} from 'buildRQL';
import type {ConcreteFragment} from 'ConcreteQuery';
import type {RelayContainerSpec} from 'RelayContainer';


const RelayMetaRoute = require('RelayMetaRoute');
const RelayQuery = require('RelayQuery');
const RelayStoreData = require('RelayStoreData');

const buildRQL = require('buildRQL');
const invariant = require('invariant');



const GraphQLFragmentPointer = require('GraphQLFragmentPointer');
const RelayRecord = require('RelayRecord');

function createQuerySetAndFragmentPointers(
  containerName: string,
  storeData: RelayStoreData,
  variables: Variables,
  route: RelayMetaRoute,
  containerSpec: RelayContainerSpec,
  currentData: {[propName: string]: mixed}
): {
  fragmentPointers: {[key: string]: ?GraphQLFragmentPointer},
  querySet: RelayQuerySet,
} {
  var fragmentPointers = {};
  var querySet = {};
  containerSpec.fragments.forEach((fragmentBuilder, fragmentName) => {
    var fragment = createFragmentQueryNode(
      containerName,
      fragmentName,
      variables,
      route,
      containerSpec
      );
    var queryData = currentData[fragmentName];
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

function createFragmentQueryNode(
  containerName: string,
  fragmentName: string,
  variables: Variables,
  route: RelayMetaRoute,
  containerSpec: RelayContainerSpec
): RelayQuery.Fragment {
  const fragmentBuilder = containerSpec.fragments[fragmentName];
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
    containerSpec.initialVariables || {}
  );
  // TODO: Allow routes without names, #7856965.
  var metaRoute = RelayMetaRoute.get(route.name);
  if (containerSpec.prepareVariables) {
    variables = containerSpec.prepareVariables(variables, metaRoute);
  }
  return RelayQuery.Fragment.create(
    fragment,
    metaRoute,
    variables
  );
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

module.exports = createQuerySetAndFragmentPointers;
