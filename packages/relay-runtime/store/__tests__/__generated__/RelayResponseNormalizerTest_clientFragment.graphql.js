/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a6377910199d182f2f1df6a615d197e0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest_clientFragment$ref: FragmentReference;
declare export opaque type RelayResponseNormalizerTest_clientFragment$fragmentType: RelayResponseNormalizerTest_clientFragment$ref;
export type RelayResponseNormalizerTest_clientFragment = {|
  +name: ?string,
  +body: ?{|
    +text: ?string,
  |},
  +$refType: RelayResponseNormalizerTest_clientFragment$ref,
|};
export type RelayResponseNormalizerTest_clientFragment$data = RelayResponseNormalizerTest_clientFragment;
export type RelayResponseNormalizerTest_clientFragment$key = {
  +$data?: RelayResponseNormalizerTest_clientFragment$data,
  +$fragmentRefs: RelayResponseNormalizerTest_clientFragment$ref,
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

module.exports = node;
