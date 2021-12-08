/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3e582874ab58807f4eb3a704959a10eb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest10Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest10Fragment$ref = RelayMockPayloadGeneratorTest10Fragment$fragmentType;
export type RelayMockPayloadGeneratorTest10Fragment$data = {|
  +name: ?string,
  +actor: ?{|
    +id?: string,
    +name?: ?string,
    +profile_picture?: ?{|
      +uri: ?string,
      +height: ?number,
    |},
  |},
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest10Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest10Fragment = RelayMockPayloadGeneratorTest10Fragment$data;
export type RelayMockPayloadGeneratorTest10Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest10Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest10Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uri",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest10Fragment",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "id",
              "storageKey": null
            },
            (v0/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "Image",
              "kind": "LinkedField",
              "name": "profile_picture",
              "plural": false,
              "selections": [
                (v1/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "height",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "type": "User",
          "abstractKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profile_picture",
      "plural": false,
      "selections": [
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
  (node/*: any*/).hash = "ec0c12ef5340739f0ea25f1d9fd89a50";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest10Fragment$fragmentType,
  RelayMockPayloadGeneratorTest10Fragment$data,
>*/);
