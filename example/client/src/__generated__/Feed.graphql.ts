/**
 * @generated SignedSource<<bb316154ceff68bac7a448e09045299d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type Feed$data = {
  readonly posts: ReadonlyArray<{
    readonly __id: string;
    readonly " $fragmentSpreads": FragmentRefs<"Post">;
  }>;
  readonly " $fragmentType": "Feed";
};
export type Feed$key = {
  readonly " $data"?: Feed$data;
  readonly " $fragmentSpreads": FragmentRefs<"Feed">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "throwOnFieldError": true
  },
  "name": "Feed",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Post",
      "kind": "LinkedField",
      "name": "posts",
      "plural": true,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "Post"
        },
        {
          "kind": "ClientExtension",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "__id",
              "storageKey": null
            }
          ]
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Feed",
  "abstractKey": null
};

(node as any).hash = "f24583038715d529eaf3ad71e7f388e4";

export default node;
