/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3c1cb5b3cb324b67ad7a898b0de950ea>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type validateMutationTestGroovyFragment_groovygroovy$fragmentType: FragmentType;
export type validateMutationTestGroovyFragment_groovygroovy$ref = validateMutationTestGroovyFragment_groovygroovy$fragmentType;
export type validateMutationTestGroovyFragment_groovygroovy$data = {|
  +doesViewerLike: ?boolean,
  +$refType: validateMutationTestGroovyFragment_groovygroovy$fragmentType,
  +$fragmentType: validateMutationTestGroovyFragment_groovygroovy$fragmentType,
|};
export type validateMutationTestGroovyFragment_groovygroovy = validateMutationTestGroovyFragment_groovygroovy$data;
export type validateMutationTestGroovyFragment_groovygroovy$key = {
  +$data?: validateMutationTestGroovyFragment_groovygroovy$data,
  +$fragmentRefs: validateMutationTestGroovyFragment_groovygroovy$fragmentType,
  +$fragmentSpreads: validateMutationTestGroovyFragment_groovygroovy$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "validateMutationTestGroovyFragment_groovygroovy",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "doesViewerLike",
      "storageKey": null
    }
  ],
  "type": "Feedback",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "83e864f783acac747c40b6b623186a80";
}

module.exports = ((node/*: any*/)/*: Fragment<
  validateMutationTestGroovyFragment_groovygroovy$fragmentType,
  validateMutationTestGroovyFragment_groovygroovy$data,
>*/);
