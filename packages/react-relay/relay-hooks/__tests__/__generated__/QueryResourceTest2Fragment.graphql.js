/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<58a1ee2431175e31f260526fc9d87647>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type QueryResourceTest2Fragment$fragmentType: FragmentType;
export type QueryResourceTest2Fragment$data = {
  readonly id: string,
  readonly username: ?string,
  readonly $fragmentType: QueryResourceTest2Fragment$fragmentType,
};
export type QueryResourceTest2Fragment$key = {
  readonly $data?: QueryResourceTest2Fragment$data,
  readonly $fragmentSpreads: QueryResourceTest2Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "QueryResourceTest2Fragment",
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
  (node/*:: as any*/).hash = "f0b113469b6ab4c600feb4bcc81799eb";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  QueryResourceTest2Fragment$fragmentType,
  QueryResourceTest2Fragment$data,
>*/);
