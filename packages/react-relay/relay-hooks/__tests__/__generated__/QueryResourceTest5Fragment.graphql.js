/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6df9ff4d56a9459a858a96073f248d08>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type QueryResourceTest5Fragment$fragmentType: FragmentType;
export type QueryResourceTest5Fragment$data = {|
  +id: string,
  +username: ?string,
  +$fragmentType: QueryResourceTest5Fragment$fragmentType,
|};
export type QueryResourceTest5Fragment$key = {
  +$data?: QueryResourceTest5Fragment$data,
  +$fragmentSpreads: QueryResourceTest5Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "QueryResourceTest5Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "username",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "878f2c61705495c7c0bac374b56c49fb";
}

module.exports = ((node/*: any*/)/*: Fragment<
  QueryResourceTest5Fragment$fragmentType,
  QueryResourceTest5Fragment$data,
>*/);
