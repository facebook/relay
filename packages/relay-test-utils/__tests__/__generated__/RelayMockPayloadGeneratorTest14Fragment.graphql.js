/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<421d1048a0fca7c7a0202399a308d457>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest14Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest14Fragment$data = {|
  +bigImage: ?{|
    +uri: ?string,
  |},
  +id: string,
  +name: ?string,
  +smallImage: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayMockPayloadGeneratorTest14Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest14Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest14Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest14Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "uri",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "bigScale"
    },
    {
      "kind": "RootArgument",
      "name": "smallScale"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest14Fragment",
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
      "name": "name",
      "storageKey": null
    },
    {
      "alias": "smallImage",
      "args": [
        {
          "kind": "Variable",
          "name": "scale",
          "variableName": "smallScale"
        }
      ],
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profile_picture",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    },
    {
      "alias": "bigImage",
      "args": [
        {
          "kind": "Variable",
          "name": "scale",
          "variableName": "bigScale"
        }
      ],
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profile_picture",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5617c6db55c34b5c577c3132b1c6db8a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest14Fragment$fragmentType,
  RelayMockPayloadGeneratorTest14Fragment$data,
>*/);
