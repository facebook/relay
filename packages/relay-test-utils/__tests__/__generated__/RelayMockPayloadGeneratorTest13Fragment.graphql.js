/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4ef5d99248bed451fb59a3a2349e908f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
export type PersonalityTraits = "CHEERFUL" | "DERISIVE" | "HELPFUL" | "SNARKY" | "%future added value";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest13Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest13Fragment$data = {|
  +actor: ?{|
    +id?: string,
    +name?: ?string,
    +profile_picture?: ?{|
      +height: ?number,
      +uri: ?string,
    |},
    +traits?: ?$ReadOnlyArray<?PersonalityTraits>,
    +websites?: ?$ReadOnlyArray<?string>,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest13Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest13Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest13Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest13Fragment$fragmentType,
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
  "name": "RelayMockPayloadGeneratorTest13Fragment",
  "selections": [
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
            (v0/*: any*/),
            (v1/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "traits",
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
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "uri",
                  "storageKey": null
                },
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
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/),
            (v1/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "websites",
              "storageKey": null
            }
          ],
          "type": "Page",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Viewer",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "332df3c74993ca1c29f668545faa608a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest13Fragment$fragmentType,
  RelayMockPayloadGeneratorTest13Fragment$data,
>*/);
