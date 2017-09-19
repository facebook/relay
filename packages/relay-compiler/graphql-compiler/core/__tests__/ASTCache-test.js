/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const ASTCache = require('ASTCache');
const ImmutableMap = require('immutable').Map;

const existingFragments = ImmutableMap({ ExistingFragmentName: 'some/path' });
const existingOperations = ImmutableMap({ ExistingQueryName: 'some/path' });

describe('ASTCache', () => {
  describe('document validation', () => {
    it('returns updated fragments for valid fragment names', () => {
      const document = {
        definitions: [
          {
            kind: 'FragmentDefinition',
            name: {
              value: 'SomeFragmentName',
            }
          }
        ]
      };
      const result = ASTCache.validateDocument(document, 'path/to/document', existingFragments, existingOperations);
      expect(result.fragments).toEqual(existingFragments.set('SomeFragmentName', 'path/to/document'));
      expect(result.operations).toBe(ImmutableMap(existingOperations));
    });

    it('returns updated operations for valid operation names', () => {
      const document = {
        definitions: [
          {
            kind: 'OperationDefinition',
            name: {
              value: 'SomeQueryName',
            }
          }
        ]
      };
      const result = ASTCache.validateDocument(document, 'path/to/document', existingFragments, existingOperations);
      expect(result.operations).toEqual(existingOperations.set('SomeQueryName', 'path/to/document'));
      expect(result.fragments).toBe(ImmutableMap(existingFragments));
    });

    it('throws for already existing fragment names', () => {
      const document = {
        definitions: [
          {
            kind: 'FragmentDefinition',
            name: {
              value: 'ExistingFragmentName',
            }
          }
        ]
      };

      expect(() => ASTCache.validateDocument(
        document,
        'path/to/document',
        existingFragments,
        existingOperations
      )).toThrow();
    });

    it('throws for duplicate fragment names in document', () => {
      const document = {
        definitions: [
          {
            kind: 'FragmentDefinition',
            name: {
              value: 'NewFragmentName',
            }
          },
          {
            kind: 'FragmentDefinition',
            name: {
              value: 'NewFragmentName',
            }
          }
        ]
      };

      expect(() => ASTCache.validateDocument(
        document,
        'path/to/document',
        existingFragments,
        existingOperations
      )).toThrow();
    });

    it('throws for already existing operation names', () => {
      const document = {
        definitions: [
          {
            kind: 'OperationDefinition',
            name: {
              value: 'ExistingQueryName',
            }
          }
        ]
      };

      expect(() => ASTCache.validateDocument(
        document,
        'path/to/document',
        existingFragments,
        existingOperations
      )).toThrow();
    });

    it('throws for duplicate operation names in document', () => {
      const document = {
        definitions: [
          {
            kind: 'OperationDefinition',
            name: {
              value: 'NewQueryName',
            }
          },
          {
            kind: 'OperationDefinition',
            name: {
              value: 'NewQueryName',
            }
          }
        ]
      };

      expect(() => ASTCache.validateDocument(
        document,
        'path/to/document',
        existingFragments,
        existingOperations
      )).toThrow();
    });
  });
});