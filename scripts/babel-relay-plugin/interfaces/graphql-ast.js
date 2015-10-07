/* @flow */
/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

declare module GraphQLAST {

  /**
   * Contains a range of UTF-8 character offsets that identify
   * the region of the source from which the AST derived.
   */
  declare type Location = {
    start: number;
    end: number;
    source?: any
  }

  /**
   * The list of all possible AST node types.
   */
  declare type Node = Name
                   | Document
                   | OperationDefinition
                   | VariableDefinition
                   | Variable
                   | SelectionSet
                   | Field
                   | Argument
                   | FragmentSpread
                   | InlineFragment
                   | FragmentDefinition
                   | IntValue
                   | FloatValue
                   | StringValue
                   | BooleanValue
                   | EnumValue
                   | ListValue
                   | ObjectValue
                   | ObjectField
                   | Directive
                   | ListType
                   | NonNullType
                   | ObjectTypeDefinition
                   | FieldDefinition
                   | InputValueDefinition
                   | InterfaceTypeDefinition
                   | UnionTypeDefinition
                   | ScalarTypeDefinition
                   | EnumTypeDefinition
                   | EnumValueDefinition
                   | InputObjectTypeDefinition
                   | TypeExtensionDefinition

  // Name

  declare type Name = {
    kind: 'Name';
    loc?: ?Location;
    value: string;
  }

  // Document

  declare type Document = {
    kind: 'Document';
    loc?: ?Location;
    definitions: Array<Definition>;
  }

  declare type Definition = OperationDefinition
                         | FragmentDefinition
                         | TypeDefinition

  declare type OperationDefinition = {
    kind: 'OperationDefinition';
    loc?: ?Location;
    // Note: subscription is an experimental non-spec addition.
    operation: 'query' | 'mutation' | 'subscription';
    name?: ?Name;
    variableDefinitions?: ?Array<VariableDefinition>;
    directives?: ?Array<Directive>;
    selectionSet: SelectionSet;
  }

  declare type VariableDefinition = {
    kind: 'VariableDefinition';
    loc?: ?Location;
    variable: Variable;
    type: Type;
    defaultValue?: ?Value;
  }

  declare type Variable = {
    kind: 'Variable';
    loc?: ?Location;
    name: Name;
  }

  declare type SelectionSet = {
    kind: 'SelectionSet';
    loc?: ?Location;
    selections: Array<Selection>;
  }

  declare type Selection = Field
                        | FragmentSpread
                        | InlineFragment

  declare type Field = {
    kind: 'Field';
    loc?: ?Location;
    alias?: ?Name;
    name: Name;
    arguments?: ?Array<Argument>;
    directives?: ?Array<Directive>;
    selectionSet?: ?SelectionSet;
  }

  declare type Argument = {
    kind: 'Argument';
    loc?: ?Location;
    name: Name;
    value: Value;
  }


  // Fragments

  declare type FragmentSpread = {
    kind: 'FragmentSpread';
    loc?: ?Location;
    name: Name;
    directives?: ?Array<Directive>;
  }

  declare type InlineFragment = {
    kind: 'InlineFragment';
    loc?: ?Location;
    typeCondition?: ?NamedType;
    directives?: ?Array<Directive>;
    selectionSet: SelectionSet;
  }

  declare type FragmentDefinition = {
    kind: 'FragmentDefinition';
    loc?: ?Location;
    name: Name;
    typeCondition: NamedType;
    directives?: ?Array<Directive>;
    selectionSet: SelectionSet;
  }


  // Values

  declare type Value = Variable
                    | IntValue
                    | FloatValue
                    | StringValue
                    | BooleanValue
                    | EnumValue
                    | ListValue
                    | ObjectValue

  declare type IntValue = {
    kind: 'IntValue';
    loc?: ?Location;
    value: string;
  }

  declare type FloatValue = {
    kind: 'FloatValue';
    loc?: ?Location;
    value: string;
  }

  declare type StringValue = {
    kind: 'StringValue';
    loc?: ?Location;
    value: string;
  }

  declare type BooleanValue = {
    kind: 'BooleanValue';
    loc?: ?Location;
    value: boolean;
  }

  declare type EnumValue = {
    kind: 'EnumValue';
    loc?: ?Location;
    value: string;
  }

  declare type ListValue = {
    kind: 'ListValue';
    loc?: ?Location;
    values: Array<Value>;
  }

  declare type ObjectValue = {
    kind: 'ObjectValue';
    loc?: ?Location;
    fields: Array<ObjectField>;
  }

  declare type ObjectField = {
    kind: 'ObjectField';
    loc?: ?Location;
    name: Name;
    value: Value;
  }


  // Directives

  declare type Directive = {
    kind: 'Directive';
    loc?: ?Location;
    name: Name;
    arguments?: ?Array<Argument>;
  }


  // Type Reference

  declare type Type = NamedType
                   | ListType
                   | NonNullType

  declare type NamedType = {
    kind: 'NamedType';
    loc?: ?Location;
    name: Name;
  };

  declare type ListType = {
    kind: 'ListType';
    loc?: ?Location;
    type: Type;
  }

  declare type NonNullType = {
    kind: 'NonNullType';
    loc?: ?Location;
    type: NamedType | ListType;
  }

  // Type Definition

  declare type TypeDefinition = ObjectTypeDefinition
                             | InterfaceTypeDefinition
                             | UnionTypeDefinition
                             | ScalarTypeDefinition
                             | EnumTypeDefinition
                             | InputObjectTypeDefinition
                             | TypeExtensionDefinition

  declare type ObjectTypeDefinition = {
    kind: 'ObjectTypeDefinition';
    loc?: ?Location;
    name: Name;
    interfaces?: ?Array<NamedType>;
    fields: Array<FieldDefinition>;
  }

  declare type FieldDefinition = {
    kind: 'FieldDefinition';
    loc?: ?Location;
    name: Name;
    arguments: Array<InputValueDefinition>;
    type: Type;
  }

  declare type InputValueDefinition = {
    kind: 'InputValueDefinition';
    loc?: ?Location;
    name: Name;
    type: Type;
    defaultValue?: ?Value;
  }

  declare type InterfaceTypeDefinition = {
    kind: 'InterfaceTypeDefinition';
    loc?: ?Location;
    name: Name;
    fields: Array<FieldDefinition>;
  }

  declare type UnionTypeDefinition = {
    kind: 'UnionTypeDefinition';
    loc?: ?Location;
    name: Name;
    types: Array<NamedType>;
  }

  declare type ScalarTypeDefinition = {
    kind: 'ScalarTypeDefinition';
    loc?: ?Location;
    name: Name;
  }

  declare type EnumTypeDefinition = {
    kind: 'EnumTypeDefinition';
    loc?: ?Location;
    name: Name;
    values: Array<EnumValueDefinition>;
  }

  declare type EnumValueDefinition = {
    kind: 'EnumValueDefinition';
    loc?: ?Location;
    name: Name;
  }

  declare type InputObjectTypeDefinition = {
    kind: 'InputObjectTypeDefinition';
    loc?: ?Location;
    name: Name;
    fields: Array<InputValueDefinition>;
  }

  declare type TypeExtensionDefinition = {
    kind: 'TypeExtensionDefinition';
    loc?: ?Location;
    definition: ObjectTypeDefinition;
  }

}
