/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c6a073fb3d4b7a34ce8847ae8143eb0d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type fetchQueryInternalTestPlain1Fragment_name$ref: FragmentReference;
declare export opaque type fetchQueryInternalTestPlain1Fragment_name$fragmentType: fetchQueryInternalTestPlain1Fragment_name$ref;
export type fetchQueryInternalTestPlain1Fragment_name = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$refType: fetchQueryInternalTestPlain1Fragment_name$ref,
|};
export type fetchQueryInternalTestPlain1Fragment_name$data = fetchQueryInternalTestPlain1Fragment_name;
export type fetchQueryInternalTestPlain1Fragment_name$key = {
  +$data?: fetchQueryInternalTestPlain1Fragment_name$data,
  +$fragmentRefs: fetchQueryInternalTestPlain1Fragment_name$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fetchQueryInternalTestPlain1Fragment_name",
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
  (node/*: any*/).hash = "9139e547ef85f3488c8201562db74a98";
}

module.exports = node;
