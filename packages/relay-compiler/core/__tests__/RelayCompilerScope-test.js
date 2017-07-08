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

describe('scope', () => {
  let GraphQL;
  let RelayCompilerScope;
  let RelayTestSchema;

  let GraphQLNonNull;
  let getFragmentScope;
  let getRootScope;
  let optionalIntType;
  let requiredIntType;

  beforeEach(() => {
    jest.resetModules();

    GraphQL = require('graphql');
    RelayCompilerScope = require('RelayCompilerScope');
    RelayTestSchema = require('RelayTestSchema');

    ({GraphQLNonNull} = GraphQL);
    ({getFragmentScope, getRootScope} = RelayCompilerScope);

    optionalIntType = RelayTestSchema.getType('Int');
    requiredIntType = new GraphQLNonNull(optionalIntType);
  });

  describe('getRootScope()', () => {
    it('creates variables for optional definitions with defaults', () => {
      const definitions = [
        {
          kind: 'LocalArgumentDefinition',
          name: 'size',
          defaultValue: 42,
          type: optionalIntType,
        },
      ];
      const scope = getRootScope(definitions);
      expect(Object.keys(scope).length).toBe(1);
      expect(scope.size.kind).toBe('Variable');
      expect(scope.size.variableName).toBe('size');
    });

    it('creates variables for optional definitions w/o defaults', () => {
      const definitions = [
        {
          kind: 'LocalArgumentDefinition',
          name: 'size',
          defaultValue: null,
          type: optionalIntType,
        },
      ];
      const scope = getRootScope(definitions);
      expect(Object.keys(scope).length).toBe(1);
      expect(scope.size.kind).toBe('Variable');
      expect(scope.size.variableName).toBe('size');
    });

    it('creates variables for required definitions', () => {
      const definitions = [
        {
          kind: 'LocalArgumentDefinition',
          name: 'size',
          defaultValue: null,
          type: requiredIntType,
        },
      ];
      const scope = getRootScope(definitions);
      expect(Object.keys(scope).length).toBe(1);
      expect(scope.size.kind).toBe('Variable');
      expect(scope.size.variableName).toBe('size');
    });
  });

  describe('getFragmentScope()', () => {
    /**
     * defs: size: Int
     * args: size: $outerSize
     * parentScope: outer: $varSize
     * => size: $var
     */
    it('resolves variable arguments in parent scope (variable value)', () => {
      const definitions = [
        {
          kind: 'LocalArgumentDefinition',
          name: 'size',
          defaultValue: null,
          type: optionalIntType,
        },
      ];
      const calls = [
        {
          kind: 'Argument',
          name: 'size',
          value: {kind: 'Variable', variableName: 'outerSize'},
          type: optionalIntType,
        },
      ];
      const outerScope = {
        outerSize: {kind: 'Variable', name: 'var'},
      };
      const innerScope = getFragmentScope(definitions, calls, outerScope);
      expect(innerScope).toEqual({
        size: outerScope.outerSize,
      });
    });

    /**
     * defs: size: Int
     * args: size: $outerSize
     * parentScope: outer: 42Size
     * => size: 42
     */
    it('resolves variable arguments in parent scope (literal value)', () => {
      const definitions = [
        {
          kind: 'LocalArgumentDefinition',
          name: 'size',
          defaultValue: null,
          type: optionalIntType,
        },
      ];
      const calls = [
        {
          kind: 'Argument',
          name: 'size',
          value: {kind: 'Variable', variableName: 'outerSize'},
          type: optionalIntType,
        },
      ];
      const outerScope = {
        outerSize: {kind: 'Literal', value: 42},
      };
      const innerScope = getFragmentScope(definitions, calls, outerScope);
      expect(innerScope).toEqual({
        size: outerScope.outerSize,
      });
    });

    /**
     * defs: size: Int
     * args: size: 42
     * parentScope: n/a
     * => size: 42
     */
    it('sets variables to literal argument values', () => {
      const definitions = [
        {
          kind: 'LocalArgumentDefinition',
          name: 'size',
          defaultValue: null,
          type: optionalIntType,
        },
      ];
      const literal = {kind: 'Literal', value: 42};
      const calls = [
        {
          kind: 'Argument',
          name: 'size',
          value: literal,
          type: optionalIntType,
        },
      ];
      const outerScope = {};
      const innerScope = getFragmentScope(definitions, calls, outerScope);
      expect(innerScope).toEqual({
        size: literal,
      });
    });

    /**
     * defs: size: Int = 42
     * args: (no value)    # not passed, use default if present
     * parentScope: n/a
     * => size: 42
     */
    it('sets variables to default values if defined and no argument', () => {
      const literal = {kind: 'Literal', value: 42};
      const definitions = [
        {
          kind: 'LocalArgumentDefinition',
          name: 'size',
          defaultValue: 42,
          type: optionalIntType,
        },
      ];
      const calls = [];
      const outerScope = {};
      const innerScope = getFragmentScope(definitions, calls, outerScope);
      expect(innerScope).toEqual({
        size: literal,
      });
    });

    /**
     * defs: size: Int!
     * args: (no value)    # not passed, no default, type is non-null
     * parentScope: n/a
     * => Error: no value for required argument `size`
     */
    it('throws for required variables with no argument or default', () => {
      const definitions = [
        {
          kind: 'LocalArgumentDefinition',
          name: 'size',
          defaultValue: null,
          type: requiredIntType,
        },
      ];
      const calls = [];
      const outerScope = {};
      expect(() => {
        getFragmentScope(definitions, calls, outerScope);
      }).toThrow();
    });

    /**
     * defs: implicit usage of global $size
     * args: (no value)
     * parentScope: n/a
     * => size: $size
     */
    it('creates variables for import definitions', () => {
      const definitions = [
        {
          kind: 'RootArgumentDefinition',
          name: 'size',
          type: requiredIntType,
        },
      ];
      const calls = [];
      const outerScope = {};
      const innerScope = getFragmentScope(definitions, calls, outerScope);
      expect(innerScope).toEqual({
        size: {
          kind: 'Variable',
          variableName: 'size',
        },
      });
    });

    /**
     * defs: size: Int = import 'rootSize'
     * args: size: 42
     * parentScope: n/a
     * => Error: cannot pass a value for an imported variable
     */
    it('throws if an argument is provided for an import definition', () => {
      const definitions = [
        {
          kind: 'RootArgumentDefinition',
          name: 'size',
          type: requiredIntType,
        },
      ];
      const calls = [
        {
          kind: 'Argument',
          name: 'size',
          value: {
            kind: 'Literal',
            value: 42,
          },
          type: requiredIntType,
        },
      ];
      const outerScope = {};
      expect(() => {
        getFragmentScope(definitions, calls, outerScope);
      }).toThrow();
    });
  });
});
