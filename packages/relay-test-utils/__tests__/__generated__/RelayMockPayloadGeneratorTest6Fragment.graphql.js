/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9ddc8dc73431100de93da0c06c140b40>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest6Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest6Fragment$data = {|
  +author: ?{|
    +id: string,
    +name: ?string,
  |},
  +id: string,
  +name: ?string,
  +$fragmentType: RelayMockPayloadGeneratorTest6Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest6Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest6Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest6Fragment$fragmentType,
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
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest6Fragment",
  "selections": [
    (v0/*:: as any*/),
    (v1/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "author",
      "plural": false,
      "selections": [
        (v0/*:: as any*/),
        (v1/*:: as any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "1e280daa71370d7df24f3518c24dfcb7";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayMockPayloadGeneratorTest6Fragment$fragmentType,
  RelayMockPayloadGeneratorTest6Fragment$data,
>*/);
