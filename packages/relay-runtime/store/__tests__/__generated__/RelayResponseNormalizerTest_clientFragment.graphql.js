/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<17c55683d196941e54ae5a29567c3161>>
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
  +$refType: RelayResponseNormalizerTest_clientFragment$fragmentType,
  +$fragmentType: RelayResponseNormalizerTest_clientFragment$fragmentType,
|};
export type RelayResponseNormalizerTest_clientFragment = RelayResponseNormalizerTest_clientFragment$data;
export type RelayResponseNormalizerTest_clientFragment$key = {
  +$data?: RelayResponseNormalizerTest_clientFragment$data,
  +$fragmentRefs: RelayResponseNormalizerTest_clientFragment$fragmentType,
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
