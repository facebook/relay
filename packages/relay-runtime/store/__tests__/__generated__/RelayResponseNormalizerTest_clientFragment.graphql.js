/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f1791a5ed2953e1571b6942136860ba6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest_clientFragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest_clientFragment$ref = RelayResponseNormalizerTest_clientFragment$fragmentType;
export type RelayResponseNormalizerTest_clientFragment$data = {|
  +name: ?string,
  +body: ?{|
    +text: ?string,
  |},
  +$fragmentType: RelayResponseNormalizerTest_clientFragment$fragmentType,
|};
export type RelayResponseNormalizerTest_clientFragment = RelayResponseNormalizerTest_clientFragment$data;
export type RelayResponseNormalizerTest_clientFragment$key = {
  +$data?: RelayResponseNormalizerTest_clientFragment$data,
  +$fragmentSpreads: RelayResponseNormalizerTest_clientFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest_clientFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Text",
      "kind": "LinkedField",
      "name": "body",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Story",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "4e927d138eadf9425e552317ba807e5b";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResponseNormalizerTest_clientFragment$fragmentType,
  RelayResponseNormalizerTest_clientFragment$data,
>*/);
