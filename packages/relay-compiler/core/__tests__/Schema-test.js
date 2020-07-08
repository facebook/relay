/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const Schema = require('../Schema');

const nullthrows = require('../../util/nullthrowsOSS');

const {Source, parse, parseType} = require('graphql');

describe('Schema: RelayCompiler Internal GraphQL Schema Interface', () => {
  describe('getTypeFromString | expectTypeFromString | getTypeString ', () => {
    it('should return type by name', () => {
      const schema = Schema.create(new Source('type MyType { id: String }'));
      const myType = schema.getTypeFromString('MyType');
      expect(myType).toBeDefined();
      const unknownType = schema.getTypeFromString('UnknownType');
      expect(unknownType).not.toBeDefined();
      expect(schema.getTypeString(schema.expectTypeFromString('MyType'))).toBe(
        'MyType',
      );
    });

    it('should throw if type is not available', () => {
      const schema = Schema.create(new Source('type MyType { id: String }'));
      expect(() => schema.expectTypeFromString('UnknownType')).toThrow(
        "Unknown type: 'UnknownType'",
      );
    });

    it('should find default GraphQL types', () => {
      const schema = Schema.create(
        new Source('type MyType { field: ID scale: Float size: Int }'),
      );
      expect(schema.getTypeString(schema.expectTypeFromString('ID'))).toBe(
        'ID',
      );
      expect(schema.getTypeString(schema.expectTypeFromString('String'))).toBe(
        'String',
      );
      expect(schema.getTypeString(schema.expectTypeFromString('Float'))).toBe(
        'Float',
      );
      expect(schema.getTypeString(schema.expectTypeFromString('Int'))).toBe(
        'Int',
      );
      expect(schema.getTypeString(schema.expectTypeFromString('Boolean'))).toBe(
        'Boolean',
      );
    });

    it('should have special methods for default GraphQL scalars', () => {
      const schema = Schema.create(
        new Source('type MyType { field: ID scale: Float size: Int }'),
      );
      expect(schema.expectTypeFromString('ID')).toBe(schema.expectIdType());
      expect(schema.expectTypeFromString('String')).toBe(
        schema.expectStringType(),
      );
      expect(schema.expectTypeFromString('Float')).toBe(
        schema.expectFloatType(),
      );
      expect(schema.expectTypeFromString('Int')).toBe(schema.expectIntType());
      expect(schema.expectTypeFromString('Boolean')).toBe(
        schema.expectBooleanType(),
      );
    });

    it('should find custom scalar type', () => {
      const schema = Schema.create(new Source('scalar MyType'), [], []);
      expect(schema.getTypeString(schema.expectTypeFromString('MyType'))).toBe(
        'MyType',
      );
    });

    it('should find input type', () => {
      const schema = Schema.create(
        new Source('input MyType { value: String }'),
      );
      expect(schema.getTypeString(schema.expectTypeFromString('MyType'))).toBe(
        'MyType',
      );
    });

    it('should find interface type', () => {
      const schema = Schema.create(new Source('interface Node { id: ID }'));
      expect(schema.getTypeString(schema.expectTypeFromString('Node'))).toBe(
        'Node',
      );
    });

    it('should find enum type', () => {
      const schema = Schema.create(new Source('enum MyEnum { OK NOT_OK } '));
      expect(schema.getTypeString(schema.expectTypeFromString('MyEnum'))).toBe(
        'MyEnum',
      );
    });

    it('should find union type', () => {
      const schema = Schema.create(
        new Source(
          `
            type A { field: String }
            type B { value: Int }
            union MyUnion = A | B
          `,
        ),
      );
      expect(schema.getTypeString(schema.expectTypeFromString('MyUnion'))).toBe(
        'MyUnion',
      );
    });

    it('should find non-null type', () => {
      const schema = Schema.create(new Source('type MyType { id: String }'));
      expect(schema.getTypeString(schema.expectTypeFromString('MyType!'))).toBe(
        'MyType!',
      );
    });

    it('should find list type', () => {
      const schema = Schema.create(new Source('type MyType { id: String }'));
      expect(
        schema.getTypeString(schema.expectTypeFromString('[MyType]')),
      ).toBe('[MyType]');
    });

    it('should find non-null list type', () => {
      const schema = Schema.create(new Source('type MyType { id: String }'));
      expect(
        schema.getTypeString(schema.expectTypeFromString('[MyType]!')),
      ).toBe('[MyType]!');
    });

    it('should find non-null list of non-null items', () => {
      const schema = Schema.create(new Source('type MyType { id: String }'));
      expect(
        schema.getTypeString(schema.expectTypeFromString('[MyType!]!')),
      ).toBe('[MyType!]!');
    });

    it('should find non-null list of non-null lists', () => {
      const schema = Schema.create(new Source('type MyType { id: String }'));
      expect(
        schema.getTypeString(schema.expectTypeFromString('[[MyType]!]!')),
      ).toBe('[[MyType]!]!');
    });

    test('getTypeFromAST', () => {
      const schema = Schema.create(new Source('type MyType { id: String }'));
      const typeAST = parseType('MyType');
      const unknownTypeAST = parseType('UnknownType');
      const typeId = schema.getTypeFromAST(typeAST);
      expect(typeId ? schema.getTypeString(typeId) : 'UnknownType').toBe(
        'MyType',
      );
      expect(schema.getTypeFromAST(unknownTypeAST)).not.toBeDefined();
    });

    test('expectTypeFromAST', () => {
      const schema = Schema.create(new Source('type MyType { id: String }'));
      const fragment = parse('fragment F on MyType { id }');
      expect(
        schema.getTypeString(
          // $FlowExpectedError[prop-missing]
          schema.expectTypeFromAST(fragment.definitions[0]?.typeCondition),
        ),
      ).toBe('MyType');
    });
  });

  describe('getNonNullType | getNullableType | ofType | getUnwrappedType ', () => {
    it('should return non-null type', () => {
      const schema = Schema.create(
        new Source(
          `
            type MyType { field: String }
          `,
        ),
      );
      expect(
        schema.getTypeString(
          schema.getNonNullType(schema.expectTypeFromString('MyType')),
        ),
      ).toBe('MyType!');
      expect(
        schema.getTypeString(
          schema.getNonNullType(schema.expectTypeFromString('MyType!')),
        ),
      ).toBe('MyType!');
      expect(
        schema.getTypeString(
          schema.getNonNullType(schema.expectTypeFromString('[MyType]')),
        ),
      ).toBe('[MyType]!');
    });

    it('should return nullable type', () => {
      const schema = Schema.create(
        new Source(
          `
            type MyType { field: String }
          `,
        ),
      );
      expect(
        schema.getTypeString(
          schema.getNullableType(schema.expectTypeFromString('MyType!')),
        ),
      ).toBe('MyType');
      expect(
        schema.getTypeString(
          schema.getNullableType(schema.expectTypeFromString('MyType')),
        ),
      ).toBe('MyType');
      expect(
        schema.getTypeString(
          schema.getNullableType(schema.expectTypeFromString('[MyType]')),
        ),
      ).toBe('[MyType]');
      expect(
        schema.getTypeString(
          schema.getNullableType(schema.expectTypeFromString('[MyType]!')),
        ),
      ).toBe('[MyType]');
    });

    it('should unwrap top layer of the type using ofType', () => {
      const schema = Schema.create(
        new Source(
          `
            type MyType { field: String }
          `,
        ),
      );
      expect(
        schema.getTypeString(
          schema.getNullableType(schema.expectTypeFromString('MyType!')),
        ),
      ).toBe('MyType');
      expect(
        schema.getTypeString(
          schema.getListItemType(schema.expectTypeFromString('[MyType]')),
        ),
      ).toBe('MyType');
      expect(
        schema.getTypeString(
          schema.getNullableType(schema.expectTypeFromString('[MyType]!')),
        ),
      ).toBe('[MyType]');
      expect(
        schema.getTypeString(
          schema.getListItemType(schema.expectTypeFromString('[MyType!]')),
        ),
      ).toBe('MyType!');
      expect(
        schema.getTypeString(
          schema.getListItemType(schema.expectTypeFromString('[MyType!]')),
        ),
      ).toBe('MyType!');
      expect(
        schema.getTypeString(
          schema.getNullableType(schema.expectTypeFromString('[MyType!]!')),
        ),
      ).toBe('[MyType!]');
    });

    it('should unwrap the type', () => {
      const schema = Schema.create(
        new Source(
          `
            type MyType { field: String }
          `,
        ),
      );
      expect(
        schema.getTypeString(
          schema.getNullableType(schema.expectTypeFromString('MyType!')),
        ),
      ).toBe('MyType');
      expect(
        schema.getTypeString(
          schema.getListItemType(schema.expectTypeFromString('[MyType]')),
        ),
      ).toBe('MyType');
      expect(
        schema.getTypeString(
          schema.getNullableType(schema.expectTypeFromString('MyType')),
        ),
      ).toBe('MyType');

      expect(
        schema.getTypeString(
          schema.getListItemType(schema.expectTypeFromString('MyType')),
        ),
      ).toBe('MyType');
    });
  });

  describe('isTypeSubTypeOf', () => {
    test('equal types', () => {
      const schema = Schema.create(
        new Source(
          `
            type MyType { field: String }
          `,
        ),
      );
      const myType = schema.expectTypeFromString('MyType');
      const nonNullMyType = schema.getNonNullType(myType);
      const myTypeList = schema.expectTypeFromString('[MyType]');
      expect(schema.isTypeSubTypeOf(myType, myType)).toBe(true);
      expect(schema.isTypeSubTypeOf(nonNullMyType, myType)).toBe(true);
      expect(schema.isTypeSubTypeOf(myType, nonNullMyType)).toBe(false);
      expect(schema.isTypeSubTypeOf(myTypeList, myType)).toBe(false);
      expect(schema.isTypeSubTypeOf(myType, myTypeList)).toBe(false);
    });

    test('with interfaces', () => {
      const schema = Schema.create(
        new Source(
          `
            interface Node { id: ID }
            type MyType implements Node { id: ID field: String }
          `,
        ),
      );
      expect(
        schema.isTypeSubTypeOf(
          schema.expectTypeFromString('MyType'),
          schema.expectTypeFromString('Node'),
        ),
      ).toBe(true);
      expect(
        schema.isTypeSubTypeOf(
          schema.expectTypeFromString('MyType!'),
          schema.expectTypeFromString('Node'),
        ),
      ).toBe(true);
      expect(
        schema.isTypeSubTypeOf(
          schema.expectTypeFromString('[MyType]'),
          schema.expectTypeFromString('[Node]'),
        ),
      ).toBe(true);
      expect(
        schema.isTypeSubTypeOf(
          schema.expectTypeFromString('[MyType]'),
          schema.expectTypeFromString('Node'),
        ),
      ).toBe(false);
      expect(
        schema.isTypeSubTypeOf(
          schema.expectTypeFromString('Node'),
          schema.expectTypeFromString('MyType'),
        ),
      ).toBe(false);
    });
  });

  describe('Type fields', () => {
    test('hasField', () => {
      const schema = Schema.create(new Source('type A { myField: ID }'));
      const type = schema.assertCompositeType(schema.expectTypeFromString('A'));
      expect(schema.hasField(type, 'myField')).toBe(true);
      expect(schema.hasField(type, '__typename')).toBe(true);
      expect(schema.hasField(type, '__id')).toBe(true);
      expect(schema.hasField(type, 'unknownField')).toBe(false);
    });

    test('hasId', () => {
      const schema = Schema.create(
        new Source(`
          type A { id: String }
          type B { id: ID }
          type C { name: ID }
        `),
      );
      expect(
        schema.hasId(
          schema.assertCompositeType(schema.expectTypeFromString('A')),
        ),
      ).toBe(false);
      expect(
        schema.hasId(
          schema.assertCompositeType(schema.expectTypeFromString('B')),
        ),
      ).toBe(true);
      expect(
        schema.hasId(
          schema.assertCompositeType(schema.expectTypeFromString('C')),
        ),
      ).toBe(false);
    });

    describe('getFieldByName | getFieldConfig | getFieldName | getFieldType', () => {
      let schema;
      beforeEach(() => {
        schema = Schema.create(
          new Source(`
            type A {
              field: ID
              fieldWithArgs(
                param: String
                listOfParams: [String]
                requiredArg: Float!
                input: I
                status: Status = OK
              ): B
            }
            type B { id: ID }
            input I { value: Int }
            enum Status {
              OK
              NOT_OK
            }
          `),
        );
      });

      test('get field', () => {
        const type = schema.assertCompositeType(
          schema.expectTypeFromString('A'),
        );
        const idType = schema.expectTypeFromString('ID');
        const field = schema.expectField(type, 'field');
        const fieldConfig = schema.getFieldConfig(field);
        expect(fieldConfig).toEqual({
          args: [],
          type: idType,
        });
        expect(schema.getFieldName(field)).toBe('field');
        expect(schema.getFieldType(field)).toBe(idType);
        expect(schema.getFieldArgs(field)).toEqual([]);
        expect(schema.getFieldParentType(field)).toBe(type);
      });

      test('get filed with args', () => {
        const type = schema.assertCompositeType(
          schema.expectTypeFromString('A'),
        );
        const field = schema.expectField(type, 'fieldWithArgs');
        expect(schema.getFieldConfig(field)).toEqual({
          args: [
            {
              name: 'param',
              type: schema.expectTypeFromString('String'),
              defaultValue: undefined,
            },
            {
              name: 'listOfParams',
              type: schema.expectTypeFromString('[String]'),
              defaultValue: undefined,
            },
            {
              name: 'requiredArg',
              type: schema.expectTypeFromString('Float!'),
              defaultValue: undefined,
            },
            {
              name: 'input',
              type: schema.expectTypeFromString('I'),
              defaultValue: undefined,
            },
            {
              name: 'status',
              type: schema.expectTypeFromString('Status'),
              defaultValue: 'OK',
            },
          ],
          type: schema.expectTypeFromString('B'),
        });
      });

      test('getArgByName should return argument config by name', () => {
        const type = schema.assertCompositeType(
          schema.expectTypeFromString('A'),
        );
        const field = schema.expectField(type, 'fieldWithArgs');
        const requiredArg = schema.getFieldArgByName(field, 'requiredArg');
        expect(requiredArg).toEqual({
          name: 'requiredArg',
          type: schema.expectTypeFromString('Float!'),
          defaultValue: undefined,
        });
      });

      test('getArgByName - unknown argument', () => {
        const type = schema.assertCompositeType(
          schema.expectTypeFromString('A'),
        );
        const field = schema.expectField(type, 'fieldWithArgs');
        const unknownArg = schema.getFieldArgByName(field, 'unknown_arg');
        expect(unknownArg).not.toBeDefined();
      });
    });

    test('getFieldByName for unknown field', () => {
      const schema = Schema.create(new Source('type A { myField: ID }'));
      const type = schema.assertCompositeType(schema.expectTypeFromString('A'));
      const field = schema.getFieldByName(type, 'unknown_field');
      expect(field).not.toBeDefined();
      expect(() => {
        schema.expectField(type, 'unknown_field');
      }).toThrow('Unknown field');
    });

    test('getFieldByName for __typename', () => {
      const schema = Schema.create(new Source('type A { myField: ID }'));
      const type = schema.assertCompositeType(schema.expectTypeFromString('A'));
      const field = schema.expectField(type, '__typename');
      const fieldConfig = schema.getFieldConfig(field);
      expect(fieldConfig).toEqual({
        args: [],
        type: schema.expectTypeFromString('String!'),
      });
    });
  });

  describe('enum | union | interface', () => {
    test('get enum values', () => {
      const schema = Schema.create(new Source('enum A { OK NOT_OK }'));
      const type = schema.assertEnumType(schema.expectTypeFromString('A'));
      expect(schema.getEnumValues(type)).toEqual(['OK', 'NOT_OK']);
    });

    test('get union types', () => {
      const schema = Schema.create(
        new Source('type A { id: ID } type B { id: ID } union AB = A | B'),
      );
      const type = schema.expectTypeFromString('AB');
      expect(
        schema
          .getUnionTypes(schema.assertUnionType(type))
          .map(typeInUnion => schema.getTypeString(typeInUnion)),
      ).toEqual(['A', 'B']);
    });

    it('should throw when getUnionTypes on invalid type', () => {
      const schema = Schema.create(new Source('type A { id: ID }'));
      const type = schema.expectTypeFromString('A');
      expect(() =>
        schema
          .getUnionTypes(schema.assertUnionType(type))
          .map(typeInUnion => schema.getTypeString(typeInUnion)),
      ).toThrow();
    });

    test('get interfaces', () => {
      const schema = Schema.create(
        new Source(
          'interface A { id: ID } interface B { value: String } type AB implements A & B { id: ID value: String }',
        ),
      );
      const type = schema.expectTypeFromString('AB');
      expect(
        schema
          .getInterfaces(schema.assertCompositeType(type))
          .map(interfaceType => schema.getTypeString(interfaceType)),
      ).toEqual(['A', 'B']);
    });

    test('get possible types for interface', () => {
      const schema = Schema.create(
        new Source(
          'interface A { id: ID } interface B { value: String } type A1 implements A { id: ID } type A2 implements A & B { id: ID value: String }',
        ),
      );
      const type = schema.assertAbstractType(schema.expectTypeFromString('A'));
      expect(
        Array.from(schema.getPossibleTypes(type)).map(possibleType =>
          schema.getTypeString(possibleType),
        ),
      ).toEqual(['A1', 'A2']);
    });

    test('get possible types for union', () => {
      const schema = Schema.create(
        new Source('type A { id: ID } type B { id: ID } union AB = A | B'),
      );
      const type = schema.assertAbstractType(schema.expectTypeFromString('AB'));
      expect(
        Array.from(schema.getPossibleTypes(type)).map(possibleType =>
          schema.getTypeString(possibleType),
        ),
      ).toEqual(['A', 'B']);
    });
  });

  describe('serialize | parseValue | parseLiteral', () => {
    test('serialize scalar value', () => {
      const schema = Schema.create(new Source('scalar Float'));
      const type = schema.expectFloatType();
      expect(schema.serialize(type, '1')).toBe(1);
      expect(schema.serialize(type, '4.2')).toBe(4.2);
      expect(() => {
        schema.serialize(type, 'Invalid Float');
      }).toThrow();
    });

    test('serialize enum value', () => {
      const schema = Schema.create(new Source('enum A { OK NOT_OK }'));
      const type = schema.assertEnumType(schema.expectTypeFromString('A'));
      expect(schema.serialize(type, 'OK')).toBe('OK');
      expect(schema.serialize(type, 'NOT_OK')).toBe('NOT_OK');
      expect(schema.serialize(type, 'invalid_value')).not.toBeDefined();
    });

    test('parse scalar value', () => {
      const schema = Schema.create(new Source('scalar Float'));
      const type = schema.expectFloatType();
      expect(schema.parseValue(type, 1)).toBe(1);
      expect(schema.parseValue(type, 4.2)).toBe(4.2);
      expect(() => {
        schema.parseValue(type, '1');
      }).toThrow('Float cannot represent non numeric value: "1"');
      expect(() => {
        schema.parseValue(type, 'Invalid Float');
      }).toThrow('Float cannot represent non numeric value: "Invalid Float"');
    });

    test('parse enum value', () => {
      const schema = Schema.create(new Source('enum A { OK NOT_OK }'));
      const type = schema.assertEnumType(schema.expectTypeFromString('A'));
      expect(schema.parseValue(type, 'OK')).toBe('OK');
      expect(schema.parseValue(type, 'NOT_OK')).toBe('NOT_OK');
      expect(schema.parseValue(type, 'invalid_value')).not.toBeDefined();
    });

    test('parse scalar literal', () => {
      const schema = Schema.create(new Source('scalar Float'));
      const type = schema.expectFloatType();
      expect(
        schema.parseLiteral(type, {
          kind: 'FloatValue',
          value: '4.2',
        }),
      ).toBe(4.2);
      expect(
        schema.parseLiteral(type, {
          kind: 'FloatValue',
          value: 'Invalid Value',
        }),
      ).toBe(NaN);
    });

    test('parse enum literal', () => {
      const schema = Schema.create(new Source('enum A { OK NOT_OK }'));
      const type = schema.assertEnumType(schema.expectTypeFromString('A'));
      expect(
        schema.parseLiteral(type, {
          kind: 'EnumValue',
          value: 'OK',
        }),
      ).toBe('OK');
      expect(
        schema.parseLiteral(type, {
          kind: 'EnumValue',
          value: 'Invalid Value',
        }),
      ).toBe(undefined);
    });
  });

  describe('directives', () => {
    it('should return a list of all directives', () => {
      const schema = Schema.create(
        new Source('directive @my_directive on QUERY'),
      );
      const directives = schema.getDirectives();
      expect(directives.map(directive => directive.name).sort()).toEqual([
        'deprecated',
        'include',
        'my_directive',
        'skip',
      ]);
    });

    it('should return directive by name', () => {
      const schema = Schema.create(
        new Source('directive @my_directive on QUERY'),
      );
      const myDirective = schema.getDirective('my_directive');
      expect(myDirective).toEqual({
        name: 'my_directive',
        locations: ['QUERY'],
        args: [],
        isClient: false,
      });
    });

    it('should return directive with args by name', () => {
      const schema = Schema.create(
        new Source(
          'directive @my_directive(if: Boolean, intValue: Int = 42) on QUERY',
        ),
      );
      const myDirective = schema.getDirective('my_directive');
      expect(myDirective).toEqual({
        name: 'my_directive',
        locations: ['QUERY'],
        args: [
          {
            defaultValue: undefined,
            name: 'if',
            type: schema.expectTypeFromString('Boolean'),
          },
          {
            defaultValue: 42,
            name: 'intValue',
            type: schema.expectTypeFromString('Int'),
          },
        ],
        isClient: false,
      });
    });
  });

  describe('distinguish between server and client fields', () => {
    it('it should check if type is server defined type', () => {
      const schema = Schema.create(new Source('type User { name: String }'));
      const userTypeID = schema.expectTypeFromString('User');
      expect(schema.isServerType(userTypeID)).toBe(true);
    });

    it('it should check if type is client defined type', () => {
      const schema = Schema.create(
        new Source('type User { name: String }'),
        [],
        ['type ClientUser { name: String }'],
      );
      const userTypeID = schema.expectTypeFromString('ClientUser');
      expect(schema.isServerType(userTypeID)).toBe(false);
    });

    it('it should check client/server type of a field ', () => {
      const schema = Schema.create(
        new Source('type User { name: String}'),
        [],
        ['extend type User { client_id: ID }'],
      );
      const userType = schema.assertCompositeType(
        schema.expectTypeFromString('User'),
      );
      expect(schema.isServerField(schema.expectField(userType, 'name'))).toBe(
        true,
      );
      expect(
        schema.isServerField(schema.expectField(userType, 'client_id')),
      ).toBe(false);
    });

    it('should check if directive is client only', () => {
      const schema = Schema.create(
        new Source('type User { name: String } directive @strong on FIELD'),
        [],
        ['directive @my_directive on QUERY'],
      );
      expect(schema.isServerDirective('strong')).toBe(true);
      expect(schema.isServerDirective('my_directive')).toBe(false);
    });
  });

  describe('is checks', () => {
    test.each([
      ['isNonNull', 'String!', true],
      ['isNonNull', 'String', false],
      ['isList', '[String]', true],
      ['isList', 'String', false],
      ['isList', 'String!', false],
      ['isScalar', 'String', true],
      ['isScalar', 'Float', true],
      ['isScalar', 'Int', true],
      ['isScalar', 'Boolean', true],
      ['isScalar', 'JSON', true],
      ['isScalar', 'A', false],
      ['isScalar', 'B', false],
      ['isScalar', 'AB', false],
      ['isScalar', 'E', false],
      ['isScalar', 'Node', false],
      ['isScalar', 'I', false],

      ['isObject', 'String', false],
      ['isObject', 'Float', false],
      ['isObject', 'Int', false],
      ['isObject', 'Boolean', false],
      ['isObject', 'JSON', false],
      ['isObject', 'A', true],
      ['isObject', 'B', true],
      ['isObject', 'AB', false],
      ['isObject', 'E', false],
      ['isObject', 'Node', false],
      ['isObject', 'I', false],

      ['isEnum', 'String', false],
      ['isEnum', 'Float', false],
      ['isEnum', 'Int', false],
      ['isEnum', 'Boolean', false],
      ['isEnum', 'JSON', false],
      ['isEnum', 'A', false],
      ['isEnum', 'B', false],
      ['isEnum', 'AB', false],
      ['isEnum', 'E', true],
      ['isEnum', 'Node', false],
      ['isEnum', 'I', false],

      ['isUnion', 'String', false],
      ['isUnion', 'Float', false],
      ['isUnion', 'Int', false],
      ['isUnion', 'Boolean', false],
      ['isUnion', 'JSON', false],
      ['isUnion', 'A', false],
      ['isUnion', 'B', false],
      ['isUnion', 'AB', true],
      ['isUnion', 'E', false],
      ['isUnion', 'Node', false],
      ['isUnion', 'I', false],

      ['isInputObject', 'String', false],
      ['isInputObject', 'Float', false],
      ['isInputObject', 'Int', false],
      ['isInputObject', 'Boolean', false],
      ['isInputObject', 'JSON', false],
      ['isInputObject', 'A', false],
      ['isInputObject', 'B', false],
      ['isInputObject', 'AB', false],
      ['isInputObject', 'E', false],
      ['isInputObject', 'Node', false],
      ['isInputObject', 'I', true],

      ['isInterface', 'String', false],
      ['isInterface', 'Float', false],
      ['isInterface', 'Int', false],
      ['isInterface', 'Boolean', false],
      ['isInterface', 'JSON', false],
      ['isInterface', 'A', false],
      ['isInterface', 'B', false],
      ['isInterface', 'AB', false],
      ['isInterface', 'E', false],
      ['isInterface', 'Node', true],
      ['isInterface', 'I', false],

      ['isAbstractType', 'String', false],
      ['isAbstractType', 'Float', false],
      ['isAbstractType', 'Int', false],
      ['isAbstractType', 'Boolean', false],
      ['isAbstractType', 'JSON', false],
      ['isAbstractType', 'A', false],
      ['isAbstractType', 'B', false],
      ['isAbstractType', 'AB', true],
      ['isAbstractType', 'E', false],
      ['isAbstractType', 'Node', true],
      ['isAbstractType', 'Node!', false],
      ['isAbstractType', '[Node]', false],
      ['isAbstractType', '[Node]!', false],
      ['isAbstractType', '[Node!]!', false],
      ['isAbstractType', 'I', false],

      ['isLeafType', 'String', true],
      ['isLeafType', 'Float', true],
      ['isLeafType', 'Int', true],
      ['isLeafType', 'Boolean', true],
      ['isLeafType', 'JSON', true],
      ['isLeafType', 'A', false],
      ['isLeafType', 'B', false],
      ['isLeafType', 'AB', false],
      ['isLeafType', 'E', true],
      ['isLeafType', 'Node', false],
      ['isLeafType', 'I', false],

      ['isInputType', 'String', true],
      ['isInputType', 'Float', true],
      ['isInputType', 'Int', true],
      ['isInputType', 'Int!', true],
      ['isInputType', '[Int!]', true],
      ['isInputType', '[Int!]!', true],
      ['isInputType', 'Boolean', true],
      ['isInputType', 'JSON', true],
      ['isInputType', 'A', false],
      ['isInputType', 'B', false],
      ['isInputType', 'AB', false],
      ['isInputType', 'E', true],
      ['isInputType', 'Node', false],
      ['isInputType', 'I', true],
      ['isInputType', '[I]', true],

      ['isCompositeType', 'String', false],
      ['isCompositeType', 'Float', false],
      ['isCompositeType', 'Int', false],
      ['isCompositeType', 'Boolean', false],
      ['isCompositeType', 'JSON', false],
      ['isCompositeType', 'A', true],
      ['isCompositeType', 'B', true],
      ['isCompositeType', 'AB', true],
      ['isCompositeType', 'E', false],
      ['isCompositeType', 'Node', true],
      ['isCompositeType', 'I', false],

      // TypeChecks
      ['isId', 'ID', true],
      ['isString', 'String', true],
      ['isInt', 'Int', true],
      ['isFloat', 'Float', true],
      ['isBoolean', 'Boolean', true],
    ])('schema.%s(%s) = %s', (method, typeName, expected) => {
      const schema = Schema.create(
        new Source(`
          interface Node { id: ID }
          type A { value: Float }
          type B implements Node { id: ID }
          union AB = A | B
          enum E { OK NOT_OK }
          scalar JSON
          input I {
            value: Int
            flag: Boolean
          }
      `),
      );
      // $FlowExpectedError[incompatible-use]
      expect(schema[method](schema.expectTypeFromString(typeName))).toBe(
        expected,
      );
    });
  });

  test('areEqualTypes', () => {
    const schema = Schema.create(
      new Source('type A { id: ID } type B { value: String }'),
    );
    const typeA = schema.expectTypeFromString('A');
    const typeB = schema.expectTypeFromString('B');
    const listOfA = schema.expectTypeFromString('[A]');
    expect(schema.areEqualTypes(typeA, schema.getListItemType(listOfA))).toBe(
      true,
    );
    expect(schema.areEqualTypes(typeA, typeB)).toBe(false);
  });

  test('implementsInterface', () => {
    const schema = Schema.create(
      new Source(`
        interface Node { id: ID }
        interface Actor { name: String }
        type A implements Node { id: ID }
        type B implements Node & Actor { id: ID name: String }
      `),
    );
    expect(
      schema.implementsInterface(
        schema.assertCompositeType(schema.expectTypeFromString('A')),
        schema.assertInterfaceType(schema.expectTypeFromString('Node')),
      ),
    ).toBe(true);
    expect(
      schema.implementsInterface(
        schema.assertCompositeType(schema.expectTypeFromString('A')),
        schema.assertInterfaceType(schema.expectTypeFromString('Actor')),
      ),
    ).toBe(false);
    expect(
      schema.implementsInterface(
        schema.assertCompositeType(schema.expectTypeFromString('B')),
        schema.assertInterfaceType(schema.expectTypeFromString('Node')),
      ),
    ).toBe(true);
    expect(
      schema.implementsInterface(
        schema.assertCompositeType(schema.expectTypeFromString('B')),
        schema.assertInterfaceType(schema.expectTypeFromString('Actor')),
      ),
    ).toBe(true);
  });

  test('mayImplement', () => {
    const schema = Schema.create(
      new Source(`
        interface Node { id: ID }
        interface Actor { name: String }
        type A implements Node { id: ID }
        type B implements Node & Actor { id: ID name: String }
      `),
    );
    expect(
      schema.mayImplement(
        schema.assertCompositeType(schema.expectTypeFromString('A')),
        schema.assertInterfaceType(schema.expectTypeFromString('Node')),
      ),
    ).toBe(true);
    expect(
      schema.mayImplement(
        schema.assertCompositeType(schema.expectTypeFromString('B')),
        schema.assertInterfaceType(schema.expectTypeFromString('Node')),
      ),
    ).toBe(true);
    expect(
      schema.mayImplement(
        schema.assertCompositeType(schema.expectTypeFromString('A')),
        schema.assertInterfaceType(schema.expectTypeFromString('Actor')),
      ),
    ).toBe(false);
    expect(
      schema.mayImplement(
        schema.assertCompositeType(schema.expectTypeFromString('B')),
        schema.assertInterfaceType(schema.expectTypeFromString('Actor')),
      ),
    ).toBe(true);
    expect(
      schema.mayImplement(
        schema.assertCompositeType(schema.expectTypeFromString('Node')),
        schema.assertInterfaceType(schema.expectTypeFromString('Actor')),
      ),
    ).toBe(true);
    expect(
      schema.mayImplement(
        schema.assertCompositeType(schema.expectTypeFromString('Actor')),
        schema.assertInterfaceType(schema.expectTypeFromString('Node')),
      ),
    ).toBe(true);
  });

  test('canHaveSelections', () => {
    const schema = Schema.create(
      new Source(`
      enum E { OK NOT_OK }
      interface Node { id: ID }
      type A implements Node { id: ID }
      type B { value: Int}
      union AB = A | B
      input I {value: String}
    `),
    );
    expect(schema.canHaveSelections(schema.expectTypeFromString('Node'))).toBe(
      true,
    );
    expect(schema.canHaveSelections(schema.expectTypeFromString('A'))).toBe(
      true,
    );
    expect(schema.canHaveSelections(schema.expectTypeFromString('B'))).toBe(
      true,
    );
    expect(schema.canHaveSelections(schema.expectTypeFromString('AB'))).toBe(
      false,
    );
    expect(schema.canHaveSelections(schema.expectTypeFromString('A!'))).toBe(
      false,
    );
    expect(schema.canHaveSelections(schema.expectTypeFromString('[A]'))).toBe(
      false,
    );
    expect(schema.canHaveSelections(schema.expectTypeFromString('[A]!'))).toBe(
      false,
    );
    expect(schema.canHaveSelections(schema.expectTypeFromString('E'))).toBe(
      false,
    );
    expect(schema.canHaveSelections(schema.expectTypeFromString('I'))).toBe(
      false,
    );
  });

  describe('test assertions', () => {
    function testValidTypeNames(
      assertion: string,
      types: $ReadOnlyArray<string>,
    ) {
      types.forEach(type =>
        expect(() => {
          // $FlowExpectedError[incompatible-use]
          schema[assertion](schema.expectTypeFromString(type));
        }).not.toThrow(),
      );
    }

    function testInvalidTypeNames(
      assertion: string,
      types: $ReadOnlyArray<string>,
    ) {
      types.forEach(type =>
        expect(() => {
          // $FlowExpectedError[incompatible-use]
          schema[assertion](schema.expectTypeFromString(type));
        }).toThrow(),
      );
    }

    const schema = Schema.create(
      new Source(`
        scalar Int
        scalar Boolean
        scalar Float
        enum E { OK NOT_OK }
        interface Node { id: ID }
        type A implements Node { id: ID }
        type B { key: Float }
        union AB = A | B
        input I {value: String}
    `),
      [],
      ['type ClientUser { client_id: ID }'],
    );

    test('assert scalar type', () => {
      testValidTypeNames('assertScalarType', ['String']);
      testInvalidTypeNames('assertScalarType', [
        'String!',
        '[String]',
        'E',
        'A',
        'B',
        'A!',
        '[B]',
        'I',
        'Node',
        'AB',
      ]);
    });

    test('assert object type', () => {
      testValidTypeNames('assertObjectType', ['A', 'B']);
      testInvalidTypeNames('assertObjectType', [
        '[A]',
        'B!',
        'E',
        'I',
        'AB',
        'String',
        'Node',
        'AB',
      ]);
    });

    test('assert input type', () => {
      testValidTypeNames('assertInputType', [
        'String',
        'String!',
        '[String]',
        'I',
        'E',
      ]);
      testInvalidTypeNames('assertInputType', [
        'A',
        'B',
        'A!',
        '[B]',
        'Node',
        'AB',
      ]);
    });

    test('assert interface type', () => {
      testValidTypeNames('assertInterfaceType', ['Node']);
      testInvalidTypeNames('assertInterfaceType', [
        'A',
        'B',
        'A!',
        '[B]',
        'Node!',
        'AB',
      ]);
    });

    test('assert union type', () => {
      testValidTypeNames('assertUnionType', ['AB']);
      testInvalidTypeNames('assertUnionType', [
        'A',
        'B',
        'A!',
        '[B]',
        'Node!',
        '[AB]',
      ]);
    });

    test('assert enum type', () => {
      testValidTypeNames('assertEnumType', ['E']);
      testInvalidTypeNames('assertEnumType', [
        'A',
        'B',
        'A!',
        'E!',
        '[B]',
        'Node!',
        '[AB]',
      ]);
    });

    test('assert composite type', () => {
      testValidTypeNames('assertCompositeType', ['A', 'B', 'AB', 'Node']);
      testInvalidTypeNames('assertCompositeType', [
        'A!',
        '[B]',
        'I',
        'E',
        'String',
        'String!',
        '[E]',
      ]);
    });

    test('assert abstract type', () => {
      testValidTypeNames('assertAbstractType', ['AB', 'Node']);
      testInvalidTypeNames('assertAbstractType', [
        'AB!',
        '[Node]',
        'A',
        'B',
        'I',
        'E',
        'String',
        'String!',
        '[E]',
      ]);
    });

    test('assert leaf type', () => {
      testValidTypeNames('assertLeafType', ['String', 'E']);
      testInvalidTypeNames('assertLeafType', [
        'String!',
        '[E]',
        'A',
        'B',
        'I',
        'Node',
        'AB',
        'A!',
      ]);
    });

    test('assert id type', () => {
      testValidTypeNames('assertIdType', ['ID']);
      testInvalidTypeNames('assertIdType', ['String', 'ID!']);
    });

    test('assert string type', () => {
      testValidTypeNames('assertStringType', ['String']);
      testInvalidTypeNames('assertStringType', ['String!', 'ID']);
    });

    test('assert int type', () => {
      testValidTypeNames('assertIntType', ['Int']);
      testInvalidTypeNames('assertIntType', ['String!', 'ID']);
    });

    test('assert float type', () => {
      testValidTypeNames('assertFloatType', ['Float']);
      testInvalidTypeNames('assertFloatType', ['Float!', 'ID']);
    });

    test('assert boolean type', () => {
      testValidTypeNames('assertBooleanType', ['Boolean']);
      testInvalidTypeNames('assertBooleanType', ['Float!', 'ID']);
    });
  });

  test('getQueryType should return `undefined` if no Query type is available on the schema ', () => {
    const schema = Schema.create(
      new Source(`
        interface Node { id: ID }
        type A implements Node { id: ID }
      `),
    );
    const queryType = schema.getQueryType();
    expect(queryType).not.toBeDefined();
  });

  test('getQueryType should return Query', () => {
    const schema = Schema.create(
      new Source(`
        type Query {
          node(id: ID!): Node
        }
        interface Node { id: ID }
        type A implements Node { id: ID }
      `),
    );
    const queryType = schema.getQueryType();
    expect(queryType).toBe(schema.getTypeFromString('Query'));
  });

  test('getMutationType should return Mutation', () => {
    const schema = Schema.create(
      new Source(`
        type Mutation {
          updateNode(id: ID!): Node
        }
        interface Node { id: ID }
      `),
    );
    const mutationType = schema.getMutationType();
    expect(mutationType).toBe(schema.getTypeFromString('Mutation'));
  });

  test('getSubscriptionType should return Subscription', () => {
    const schema = Schema.create(
      new Source(`
        type Subscription {
          updateNode(id: ID!): Node
        }
        interface Node { id: ID }
      `),
    );
    const subscriptionType = schema.getSubscriptionType();
    expect(subscriptionType).toBe(schema.getTypeFromString('Subscription'));
  });

  test('isPossibleType', () => {
    const schema = Schema.create(
      new Source(`
        interface Node { id: ID }
        type A implements Node { id: ID }
        type B { id: ID }
        type C { value: String }
        union AB = A | B
      `),
    );
    const A = schema.assertObjectType(schema.expectTypeFromString('A'));
    const B = schema.assertObjectType(schema.expectTypeFromString('B'));
    const C = schema.assertObjectType(schema.expectTypeFromString('C'));
    const AB = schema.assertAbstractType(schema.expectTypeFromString('AB'));
    const Node = schema.assertAbstractType(schema.expectTypeFromString('Node'));

    expect(schema.isPossibleType(AB, A)).toBe(true);
    expect(schema.isPossibleType(AB, B)).toBe(true);
    expect(schema.isPossibleType(AB, C)).toBe(false);
    expect(schema.isPossibleType(Node, A)).toBe(true);
    expect(schema.isPossibleType(Node, B)).toBe(false);
    expect(schema.isPossibleType(Node, C)).toBe(false);
  });

  test('doTypesOverlap', () => {
    const schema = Schema.create(
      new Source(`
        schema {
          query: MyQueries
        }
        type MyQueries {
          node: Node
        }
        interface Node {
          id: ID
        }
        type User implements Node {
          id: ID
        }
        type Actor {
          name: String
        }

        union ActorUser = Actor | User
      `),
    );
    const myQuery = schema.assertCompositeType(
      schema.expectTypeFromString('MyQueries'),
    );
    const query = schema.expectQueryType();
    const node = schema.assertCompositeType(
      schema.expectTypeFromString('Node'),
    );
    const user = schema.assertCompositeType(
      schema.expectTypeFromString('User'),
    );
    const actor = schema.assertCompositeType(
      schema.expectTypeFromString('Actor'),
    );
    const actorUser = schema.assertCompositeType(
      schema.expectTypeFromString('ActorUser'),
    );

    expect(schema.doTypesOverlap(myQuery, query)).toBe(true);
    expect(schema.doTypesOverlap(node, user)).toBe(true);
    expect(schema.doTypesOverlap(user, node)).toBe(true);
    expect(schema.doTypesOverlap(actor, node)).toBe(false);
    expect(schema.doTypesOverlap(actor, user)).toBe(false);
    expect(schema.doTypesOverlap(query, user)).toBe(false);
    expect(schema.doTypesOverlap(actorUser, user)).toBe(true);
    expect(schema.doTypesOverlap(actorUser, actor)).toBe(true);
    expect(schema.doTypesOverlap(actorUser, node)).toBe(true);
  });

  test('extend', () => {
    let schema = Schema.create(
      new Source(`
        directive @my_server_directive on QUERY
        type User {
          name: String
        }
    `),
    );
    expect(schema.getDirective('my_server_directive')).toBeDefined();
    expect(schema.getDirective('my_client_directive')).not.toBeDefined();
    schema = schema.extend(
      parse(`
      directive @my_client_directive on QUERY
      type ClientType {
        value: String
      }
      extend type User {
        lastName: String
      }
    `),
    );
    expect(schema.getDirective('my_client_directive')).toBeDefined();
    const user = schema.assertCompositeType(
      schema.expectTypeFromString('User'),
    );
    expect(
      schema.isServerField(nullthrows(schema.getFieldByName(user, 'name'))),
    ).toBe(true);
    expect(
      schema.isServerField(nullthrows(schema.getFieldByName(user, 'lastName'))),
    ).toBe(false);
    expect(schema.getTypeFromString('ClientType')).toBeDefined();
  });
});
