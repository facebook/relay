/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

const {graphql} = require('../../query/GraphQLTag');
const {isEmpty} = require('../EmptyChecker');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe('EmptyChecker', () => {
  describe('isEmpty()', () => {
    // Case: ScalarField, LinkedField
    it('returns false for query with unconditional fields', () => {
      const query = graphql`
        query EmptyCheckerTestUnconditionalQuery {
          me {
            id
            name
          }
        }
      `;
      const operation = createOperationDescriptor(query, {});
      expect(isEmpty(operation.root)).toBe(false);
    });

    // Case: Condition (with passingValue: true)
    it('handles @include directive correctly', () => {
      const query = graphql`
        query EmptyCheckerTestIncludeQuery($cond: Boolean!) {
          me @include(if: $cond) {
            id
            name
          }
        }
      `;
      const included = createOperationDescriptor(query, {cond: true});
      expect(isEmpty(included.root)).toBe(false);

      const excluded = createOperationDescriptor(query, {cond: false});
      expect(isEmpty(excluded.root)).toBe(true);
    });

    // Case: Condition (with passingValue: false)
    it('handles @skip directive correctly', () => {
      const query = graphql`
        query EmptyCheckerTestSkipQuery($cond: Boolean!) {
          me @skip(if: $cond) {
            id
            name
          }
        }
      `;
      const notSkipped = createOperationDescriptor(query, {cond: false});
      expect(isEmpty(notSkipped.root)).toBe(false);

      const skipped = createOperationDescriptor(query, {cond: true});
      expect(isEmpty(skipped.root)).toBe(true);
    });

    // Case: Multiple selections with Condition
    it('returns false when at least one field is included', () => {
      const query = graphql`
        query EmptyCheckerTestMixedQuery($cond: Boolean!) {
          me {
            id
          }
          viewer @include(if: $cond) {
            actor {
              name
            }
          }
        }
      `;
      // Unconditional 'me' field means query is not empty
      const operation = createOperationDescriptor(query, {cond: false});
      expect(isEmpty(operation.root)).toBe(false);
    });

    // Case: Multiple Condition selections
    it('handles multiple conditional top-level fields', () => {
      const query = graphql`
        query EmptyCheckerTestMultipleConditionsQuery(
          $cond1: Boolean!
          $cond2: Boolean!
        ) {
          me @include(if: $cond1) {
            id
            name
          }
          viewer @include(if: $cond2) {
            actor {
              name
            }
          }
        }
      `;
      // First included, second excluded - not empty
      const op1 = createOperationDescriptor(query, {
        cond1: true,
        cond2: false,
      });
      expect(isEmpty(op1.root)).toBe(false);

      // First excluded, second included - not empty
      const op2 = createOperationDescriptor(query, {
        cond1: false,
        cond2: true,
      });
      expect(isEmpty(op2.root)).toBe(false);

      // Both excluded - query is empty
      const op3 = createOperationDescriptor(query, {
        cond1: false,
        cond2: false,
      });
      expect(isEmpty(op3.root)).toBe(true);
    });

    // Case: InlineFragment
    it('handles top-level inline fragments with conditionals inside', () => {
      const query = graphql`
        query EmptyCheckerTestInlineFragmentQuery($cond: Boolean!) {
          ... on Query {
            me @include(if: $cond) {
              id
            }
          }
        }
      `;
      const included = createOperationDescriptor(query, {cond: true});
      expect(isEmpty(included.root)).toBe(false);

      const excluded = createOperationDescriptor(query, {cond: false});
      expect(isEmpty(excluded.root)).toBe(true);
    });

    // Case: Condition wrapping InlineFragment
    it('handles conditionals on top-level inline fragments', () => {
      const query = graphql`
        query EmptyCheckerTestInlineFragmentConditionalQuery($cond: Boolean!) {
          ... on Query @include(if: $cond) {
            me {
              id
            }
          }
        }
      `;
      const included = createOperationDescriptor(query, {cond: true});
      expect(isEmpty(included.root)).toBe(false);

      const excluded = createOperationDescriptor(query, {cond: false});
      expect(isEmpty(excluded.root)).toBe(true);
    });

    // Case: FragmentSpread with conditional on spread
    it('handles fragment spreads with conditionals on the spread', () => {
      graphql`
        fragment EmptyCheckerTestFragment on Query {
          me {
            id
          }
        }
      `;
      const query = graphql`
        query EmptyCheckerTestFragmentSpreadQuery($cond: Boolean!) {
          ...EmptyCheckerTestFragment @include(if: $cond) @alias
        }
      `;
      const included = createOperationDescriptor(query, {cond: true});
      expect(isEmpty(included.root)).toBe(false);

      const excluded = createOperationDescriptor(query, {cond: false});
      expect(isEmpty(excluded.root)).toBe(true);
    });

    // Case: FragmentSpread with conditional inside fragment
    it('handles fragment spreads with conditionals inside the fragment', () => {
      graphql`
        fragment EmptyCheckerTestConditionalFragment on Query
        @argumentDefinitions(cond: {type: "Boolean!"}) {
          me @include(if: $cond) {
            id
          }
        }
      `;
      const query = graphql`
        query EmptyCheckerTestFragmentConditionalQuery($cond: Boolean!) {
          ...EmptyCheckerTestConditionalFragment @arguments(cond: $cond)
        }
      `;
      const included = createOperationDescriptor(query, {cond: true});
      expect(isEmpty(included.root)).toBe(false);

      const excluded = createOperationDescriptor(query, {cond: false});
      expect(isEmpty(excluded.root)).toBe(true);
    });

    // Case: FragmentSpread with fragment arguments
    it('handles fragment spreads with fragment arguments', () => {
      graphql`
        fragment EmptyCheckerTestArgumentFragment on Query
        @argumentDefinitions(includeMeField: {type: "Boolean!"}) {
          me @include(if: $includeMeField) {
            id
          }
        }
      `;
      const query = graphql`
        query EmptyCheckerTestFragmentArgumentQuery($includeMe: Boolean!) {
          ...EmptyCheckerTestArgumentFragment
            @arguments(includeMeField: $includeMe)
        }
      `;
      const included = createOperationDescriptor(query, {includeMe: true});
      expect(isEmpty(included.root)).toBe(false);

      const excluded = createOperationDescriptor(query, {includeMe: false});
      expect(isEmpty(excluded.root)).toBe(true);
    });

    // Case: Defer
    it('handles @defer directive', () => {
      graphql`
        fragment EmptyCheckerTestDeferFragment on Query {
          me {
            id
          }
        }
      `;
      const query = graphql`
        query EmptyCheckerTestDeferQuery {
          ...EmptyCheckerTestDeferFragment @defer
        }
      `;
      const operation = createOperationDescriptor(query, {});
      expect(isEmpty(operation.root)).toBe(false);
    });

    // Case: Stream
    it('handles @stream directive', () => {
      const query = graphql`
        query EmptyCheckerTestStreamQuery {
          nodes(ids: ["1", "2", "3"]) @stream(initial_count: 1) {
            id
          }
        }
      `;
      const operation = createOperationDescriptor(query, {});
      expect(isEmpty(operation.root)).toBe(false);
    });

    // Case: ClientExtension
    it('returns true for query with only client extensions', () => {
      const query = graphql`
        query EmptyCheckerTestClientExtensionQuery {
          client_root_field
        }
      `;
      // Client-only fields mean the query is empty (no server fields)
      const operation = createOperationDescriptor(query, {});
      expect(isEmpty(operation.root)).toBe(true);
    });

    // Case: RelayResolver without root fragment
    it('returns true for query with only relay resolver without root fragment', () => {
      const query = graphql`
        query EmptyCheckerTestResolverNoFragmentQuery {
          hello(world: "Test")
        }
      `;
      // Resolver without root fragment means query is empty (no server fields)
      const operation = createOperationDescriptor(query, {});
      expect(isEmpty(operation.root)).toBe(true);
    });

    // Case: RelayResolver with root fragment
    it('returns false for query with relay resolver with root fragment', () => {
      const query = graphql`
        query EmptyCheckerTestResolverWithFragmentQuery {
          counter
        }
      `;
      // Resolver with root fragment that reads server fields means query is not empty
      const operation = createOperationDescriptor(query, {});
      expect(isEmpty(operation.root)).toBe(false);
    });
  });
});
