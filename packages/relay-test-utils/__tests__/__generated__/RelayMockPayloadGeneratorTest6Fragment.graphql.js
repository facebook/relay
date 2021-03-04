/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ad492f68bcc6dc7b243381e5ed4134de>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest6Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest6Fragment$fragmentType: RelayMockPayloadGeneratorTest6Fragment$ref;
export type RelayMockPayloadGeneratorTest6Fragment = {|
  +id: string,
  +name: ?string,
  +author: ?{|
    +id: string,
    +name: ?string,
  |},
  +$refType: RelayMockPayloadGeneratorTest6Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest6Fragment$data = RelayMockPayloadGeneratorTest6Fragment;
export type RelayMockPayloadGeneratorTest6Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest6Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest6Fragment$ref,
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
    (v0/*: any*/),
    (v1/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "author",
      "plural": false,
      "selections": [
        (v0/*: any*/),
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
  (node/*: any*/).hash = "1e280daa71370d7df24f3518c24dfcb7";
}

module.exports = node;
