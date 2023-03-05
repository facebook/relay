/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ce4f1a36de7f23bca45c37b7108e333c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge$fragmentType: FragmentType;
type ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge$variables = any;
export type RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge$data = {|
  +id: string,
  +name: ?string,
  +nearest_neighbor: {|
    +id: string,
    +name: ?string,
  |},
  +$fragmentType: RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge$fragmentType,
|};
export type RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge$key = {
  +$data?: RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge$data,
  +$fragmentSpreads: RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "nearest_neighbor",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "fe9d1d04537877d59f4905abc58c777f";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge$fragmentType,
  RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge$data,
  ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge$variables,
>*/);
