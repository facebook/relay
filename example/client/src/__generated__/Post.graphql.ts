/**
 * @generated SignedSource<<efad4483e4cd35d03e62bd1b1ed94e1f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type Post$data = {
  readonly content: string;
  readonly title: string;
  readonly " $fragmentType": "Post";
};
export type Post$key = {
  readonly " $data"?: Post$data;
  readonly " $fragmentSpreads": FragmentRefs<"Post">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "throwOnFieldError": true
  },
  "name": "Post",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "title",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "content",
      "storageKey": null
    }
  ],
  "type": "Post",
  "abstractKey": null
};

(node as any).hash = "bb5f29f0280c0a5f0009a537c36ec945";

export default node;
