/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e591b67799dd9d5d5cafd1340550e9ef>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type fetchQueryInternalTestPlainFragment_name$ref: FragmentReference;
declare export opaque type fetchQueryInternalTestPlainFragment_name$fragmentType: fetchQueryInternalTestPlainFragment_name$ref;
export type fetchQueryInternalTestPlainFragment_name = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$refType: fetchQueryInternalTestPlainFragment_name$ref,
|};
export type fetchQueryInternalTestPlainFragment_name$data = fetchQueryInternalTestPlainFragment_name;
export type fetchQueryInternalTestPlainFragment_name$key = {
  +$data?: fetchQueryInternalTestPlainFragment_name$data,
  +$fragmentRefs: fetchQueryInternalTestPlainFragment_name$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fetchQueryInternalTestPlainFragment_name",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "plaintext",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "PlainUserNameData",
      "kind": "LinkedField",
      "name": "data",
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
  "type": "PlainUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "28987f688adc6c61dc29867c5efdef79";
}

module.exports = node;
