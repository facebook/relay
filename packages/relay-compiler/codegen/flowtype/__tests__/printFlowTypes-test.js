/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @fullSyntaxTransform
 * @format
 * @emails oncall+relay
 */

'use strict';

const dedent = require('dedent');

let RelayTestSchema;
let printFlowTypes;
let parse;

describe('printFlowTypes', () => {
  beforeEach(() => {
    jest.resetModules();
    RelayTestSchema = require('RelayTestSchema');
    printFlowTypes = require('printFlowTypes');
    parse = require('RelayFlowParser').parse;
  });

  it('does not print queries', () => {
    const IR = parse(
      `
      query myQuery {
        viewer {
          actor {
            id
          }
        }
      }
      `,
      RelayTestSchema,
    );

    expect(printFlowTypes(IR[0])).toBe(undefined);
  });

  describe('fragments', () => {
    it('prints scalar literals', () => {
      const IR = parse(
        `
        fragment myFragment on User {
          id
          name
        }
        `,
        RelayTestSchema,
      );

      const expected = `
        export type myFragment = {
          id: string;
          name?: ?string;
        };
      `;

      expect(printFlowTypes(IR[0]).trim()).toBe(dedent(expected));
    });

    it('prints non-nested arrays', () => {
      const IR = parse(
        `
        fragment myFragment on User {
          websites
        }
        `,
        RelayTestSchema,
      );

      const expected = `
        export type myFragment = {
          websites?: ?Array<?string>;
        };
      `;

      expect(printFlowTypes(IR[0]).trim()).toBe(dedent(expected));
    });

    // TODO: Test nested arrays: Array<Array<string>>

    it('prints non-nested objects', () => {
      const IR = parse(
        `
        fragment myFragment on User {
          profilePicture {
            uri
            width
            height
          }
        }
        `,
        RelayTestSchema,
      );

      /*
      Denormalized type:
      export type myFragment = {
        profilePicture?: ?{
          uri?: ?string;
          width?: ?number;
          height?: ?number;
        };
      };
      */
      const expected = `
        export type myFragment = {
          profilePicture?: ?myFragment_profilePicture;
        };

        export type myFragment_profilePicture = {
          uri?: ?string;
          width?: ?number;
          height?: ?number;
        };
      `;

      expect(printFlowTypes(IR[0]).trim()).toBe(dedent(expected));
    });

    it('ignores object arguments', () => {
      const IR = parse(
        `
        fragment myFragment on User {
          profilePicture(size: $size) {
            uri
            width
            height
          }
        }
        `,
        RelayTestSchema,
      );

      /*
      Denormalized type:
      export type myFragment = {
        profilePicture?: ?{
          uri?: ?string;
          width?: ?number;
          height?: ?number;
        };
      };
      */
      const expected = `
        export type myFragment = {
          profilePicture?: ?myFragment_profilePicture;
        };

        export type myFragment_profilePicture = {
          uri?: ?string;
          width?: ?number;
          height?: ?number;
        };
      `;

      expect(printFlowTypes(IR[0]).trim()).toBe(dedent(expected));
    });

    it('prints enum types', () => {
      const IR = parse(
        `
        fragment myFragment on User {
          traits
        }
        `,
        RelayTestSchema,
      );

      const expected = `
        export type myFragment = {
          traits?: ?Array<?"CHEERFUL" | "DERISIVE" | "HELPFUL" | "SNARKY">;
        };
      `;

      expect(printFlowTypes(IR[0]).trim()).toBe(dedent(expected));
    });

    it('prints connections', () => {
      const IR = parse(
        `
        fragment myFragment on User {
          likers {
            count
            edges {
              node {
                id
              }
            }
          }
        }
        `,
        RelayTestSchema,
      );

      /*
      Denormalized type:
      export type myFragment = {
        likers?: ?{
          count?: ?number;
          edges?: ?Array<?{
            node?: ?{
              id: string;
            };
          }>;
        };
      };
      */
      const expected = `
        export type myFragment = {
          likers?: ?myFragment_likers;
        };

        export type myFragment_likers_edges_node = {
          id: string;
        };

        export type myFragment_likers_edges = {
          node?: ?myFragment_likers_edges_node;
        };

        export type myFragment_likers = {
          count?: ?number;
          edges?: ?Array<?myFragment_likers_edges>;
        };
      `;

      expect(printFlowTypes(IR[0]).trim()).toBe(dedent(expected));
    });

    it('prints `any` when no children besides fragment spread', () => {
      const IR = parse(
        `
        fragment myFragment on User {
          id
          likers {
            ...myFragmentSpread
          }
        }
        `,
        RelayTestSchema,
      );

      const expected = `
        export type myFragment = {
          id: string;
          likers?: ?any;
        };
      `;

      expect(printFlowTypes(IR[0]).trim()).toBe(dedent(expected));
    });

    it('prints inline fragments', () => {
      const IR = parse(
        `
        fragment myFragment on Node {
          id
          ... on User {
            firstName
          }
          ... on Comment {
            websites
          }
        }
        `,
        RelayTestSchema,
      );

      const expected = `
        export type myFragment = {
          id: string;
          firstName?: ?string;
          websites?: ?Array<?string>;
        };
      `;

      expect(printFlowTypes(IR[0]).trim()).toBe(dedent(expected));
    });

    it('prints using aliases', () => {
      const IR = parse(
        `
        fragment myFragment on User {
          id
          lovers: likers {
            count
          }
        }
        `,
        RelayTestSchema,
      );

      /*
      Denormalized type:
      export type myFragment = {
        id: string;
        lovers?: ?{
          count?: ?number;
        };
      };
      */
      const expected = `
        export type myFragment = {
          id: string;
          lovers?: ?myFragment_lovers;
        };

        export type myFragment_lovers = {
          count?: ?number;
        };
      `;

      expect(printFlowTypes(IR[0]).trim()).toBe(dedent(expected));
    });
  });

  it('prints mutation arguments', () => {
    const IR = parse(
      `
      mutation {
        unfriend(input: $input)
      }
      `,
      RelayTestSchema,
    );

    const expected = `
      export type UnfriendInput = {
        friendId?: ?string;
      };
    `;

    expect(printFlowTypes(IR[0]).trim()).toBe(dedent(expected));
  });

  it('prints mutation payload', () => {
    const IR = parse(
      `
      mutation CommentCreateMutation(
        $input: CommentCreateInput!
      ) {
        commentCreate(input: $input) {
          comment {
            id
            name
          }
        }
      }
      `,
      RelayTestSchema,
    );
    const expected = `
      export type CommentCreateInput = {
        feedbackId?: ?string;
      };

      export type CommentCreateMutationResponse = {
        comment?: ?CommentCreateMutationResponse_comment;
      };

      export type CommentCreateMutationResponse_comment = {
        id: string;
        name?: ?string;
      };
    `;

    expect(printFlowTypes(IR[0]).trim()).toBe(dedent(expected));
  });

  describe('directives', () => {
    it('verify id is usually nonnullable', () => {
      const IR = parse(
        `
        fragment myFragment on User {
          id
        }
        `,
        RelayTestSchema,
      );

      const expected = `
        export type myFragment = {
          id: string;
        };
      `;

      expect(printFlowTypes(IR[0]).trim()).toBe(dedent(expected));
    });

    it('prints @skip as nullable', () => {
      const IR = parse(
        `
        fragment myFragment on User {
          id
          firstName @skip(if: $condition)
        }
        `,
        RelayTestSchema,
      );

      const expected = `
        export type myFragment = {
          id: string;
          firstName?: ?string;
        };
      `;

      expect(printFlowTypes(IR[0]).trim()).toBe(dedent(expected));
    });

    it('prints @include as nullable', () => {
      const IR = parse(
        `
        fragment myFragment on User {
          id @include(if: $condition)
        }
        `,
        RelayTestSchema,
      );

      // Note that `id` is usually NonNullable!
      const expected = `
        export type myFragment = {
          id?: ?string;
        };
      `;

      expect(printFlowTypes(IR[0]).trim()).toBe(dedent(expected));
    });
  });
});
