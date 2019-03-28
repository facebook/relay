/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

const invariant = require('invariant');

const {
  isObjectType,
  isInterfaceType,
  getNullableType,
  GraphQLList,
} = require('graphql');
const {TYPENAME_KEY, RelayConcreteNode} = require('relay-runtime');

const {
  CONDITION,
  FRAGMENT_SPREAD,
  INLINE_FRAGMENT,
  LINKED_FIELD,
  MODULE_IMPORT,
  SCALAR_FIELD,
  LINKED_HANDLE,
  SCALAR_HANDLE,
  DEFER,
  STREAM,
} = RelayConcreteNode;

import type {
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLSchema,
  GraphQLFieldMap,
} from 'graphql';

import type {
  Variables,
  ReaderFragment,
  ReaderSelection,
  ReaderScalarField,
  ReaderLinkedField,
  NormalizationOperation,
  NormalizationSelection,
  NormalizationLinkedField,
  NormalizationScalarField,
  OperationDescriptor,
  GraphQLResponse,
} from 'relay-runtime';

type ValueResolver = (
  typeName: ?string,
  context: MockResolverContext,
  plural: ?boolean,
  defaultValue?: mixed,
) => mixed;
type Traversable = {|
  +selections: $ReadOnlyArray<ReaderSelection | NormalizationSelection>,
  +typeName: ?string,
  +name: ?string,
  +alias: ?string,
  +args: ?{[string]: mixed},
|};
type MockData = {[string]: mixed};
type MockResolverContext = {|
  +parentType: ?string,
  +name: ?string,
  +alias: ?string,
  +path: ?$ReadOnlyArray<string>,
  +args: ?{[string]: mixed},
|};
type MockResolver = (
  context: MockResolverContext,
  generateId: () => number,
) => mixed;
export type MockResolvers = {[typeName: string]: MockResolver};

function createIdGenerator() {
  let id = 0;
  return () => {
    return ++id;
  };
}

const DEFAULT_MOCK_RESOLVERS = {
  ID(context, generateId: () => number) {
    return `<${
      context.parentType != null && context.parentType !== DEFAULT_MOCK_TYPENAME
        ? context.parentType + '-'
        : ''
    }mock-id-${generateId()}>`;
  },
  Boolean() {
    return false;
  },
  Int() {
    return 42;
  },
  Float() {
    return 4.2;
  },
};

const DEFAULT_MOCK_TYPENAME = '__MockObject';

/**
 * Basic value resolver
 */
function valueResolver(
  generateId: () => number,
  mockResolvers: ?MockResolvers,
  typeName: ?string,
  context: MockResolverContext,
  plural: ?boolean = false,
  defaultValue?: mixed,
): mixed {
  const createValue = () => {
    let mockValue;
    const mockResolver =
      typeName != null && mockResolvers != null
        ? mockResolvers[typeName]
        : null;
    if (mockResolver != null) {
      mockValue = mockResolver(context, generateId);
    }
    if (mockValue === undefined) {
      mockValue =
        defaultValue ??
        `<mock-value-for-field-"${context.alias ??
          context.name ||
          'undefined'}">`;
    }
    return mockValue;
  };

  return plural === true ? generateMockList(createValue) : createValue();
}

function createValueResolver(mockResolvers: ?MockResolvers): ValueResolver {
  const generateId = createIdGenerator();
  return (...args) => {
    return valueResolver(generateId, mockResolvers, ...args);
  };
}

// This is a super simple implementation (later this should be customizable)
function generateMockList<T>(
  generateListItem: (index: number) => T,
  howMany: number = 1,
): $ReadOnlyArray<T> {
  return Array(howMany)
    .fill(null)
    .map((_, index) => generateListItem(index));
}

class RelayMockPayloadGenerator {
  _schema: ?GraphQLSchema;
  _variables: Variables;
  _resolveValue: ValueResolver;
  _mockResolvers: MockResolvers;

  constructor(options: {|
    +variables: Variables,
    +mockResolvers: ?MockResolvers,
    +schema: ?GraphQLSchema,
  |}) {
    this._schema = options.schema;
    this._variables = options.variables;
    this._mockResolvers = {
      ...DEFAULT_MOCK_RESOLVERS,
      ...options.mockResolvers,
    };
    this._resolveValue = createValueResolver(this._mockResolvers);
  }

  generate(
    selections: $ReadOnlyArray<ReaderSelection | NormalizationSelection>,
    typeName: string,
    plural: boolean,
  ): MockData | $ReadOnlyArray<MockData> {
    const generateListItem = () => {
      const defaultValues = this._getDefaultValuesForObject(
        typeName,
        null,
        null,
        [], // path
        {},
      );
      return this._traverse(
        {
          selections,
          typeName,
          name: null,
          alias: null,
          args: null,
        },
        [], // path
        null, // prevData
        defaultValues,
      );
    };
    return plural ? generateMockList(generateListItem) : generateListItem();
  }

  _traverse(
    traversable: Traversable,
    path: $ReadOnlyArray<string>,
    prevData: ?MockData,
    defaultValues: ?MockData,
  ): MockData {
    const {selections, typeName} = traversable;

    return this._traverseSelections(
      selections,
      typeName,
      path,
      prevData,
      defaultValues,
    );
  }

  /**
   * Generate mock values for selection of fields
   */
  _traverseSelections(
    selections: $ReadOnlyArray<ReaderSelection | NormalizationSelection>,
    typeName: ?string,
    path: $ReadOnlyArray<string>,
    prevData: ?MockData,
    defaultValues: ?MockData,
  ): MockData {
    let mockData = prevData ?? {};

    selections.forEach(selection => {
      switch (selection.kind) {
        case SCALAR_FIELD: {
          mockData = this._mockScalar(
            selection,
            typeName,
            path,
            mockData,
            defaultValues,
          );
          break;
        }
        case LINKED_FIELD: {
          mockData = this._mockLink(selection, path, mockData, defaultValues);
          break;
        }
        case CONDITION:
          const conditionValue = this._getVariableValue(selection.condition);
          if (conditionValue === selection.passingValue) {
            mockData = this._traverseSelections(
              selection.selections,
              typeName,
              path,
              mockData,
              defaultValues,
            );
          }
          break;
        case INLINE_FRAGMENT: {
          // If it's the first time we're trying to handle fragment spread
          // on this selection, we will generate data for this type.
          // Next fragment spread on this selection will be added only if the
          // types are matching
          if (
            mockData != null &&
            (mockData[TYPENAME_KEY] == null ||
              mockData[TYPENAME_KEY] === DEFAULT_MOCK_TYPENAME)
          ) {
            mockData[TYPENAME_KEY] =
              defaultValues?.[TYPENAME_KEY] ?? selection.type;
          }
          if (mockData != null && mockData[TYPENAME_KEY] === selection.type) {
            const defaults = this._getDefaultValuesForObject(
              selection.type,
              path[path.length - 1],
              null,
              path,
            );
            mockData = this._traverseSelections(
              selection.selections,
              selection.type,
              path,
              mockData,
              defaults ?? defaultValues,
            );
          }
          break;
        }
        case FRAGMENT_SPREAD:
          if (mockData == null) {
            mockData = {};
          }
          if (mockData[TYPENAME_KEY] == null) {
            mockData[TYPENAME_KEY] = typeName ?? DEFAULT_MOCK_TYPENAME;
          }
          break;

        case DEFER:
        case STREAM:
        case MODULE_IMPORT:
          throw new Error(
            `RelayMockPayloadGenerator(): Mock for ${
              selection.kind
            } is not implemented.`,
          );
        case SCALAR_HANDLE:
        case LINKED_HANDLE:
          break;
        default:
          (selection: empty);
          invariant(
            false,
            'RelayMockPayloadGenerator(): Unexpected AST kind `%s`.',
            selection.kind,
          );
      }
    });
    return mockData;
  }

  /**
   * Generate mock value for a scalar field in the selection
   */
  _mockScalar(
    field: ReaderScalarField,
    typeName: ?string,
    path: $ReadOnlyArray<string>,
    mockData: ?MockData,
    defaultValues: ?MockData,
  ): MockData {
    const data = mockData ?? {};
    const applicationName = field.alias ?? field.name;
    if (data.hasOwnProperty(applicationName) && field.name !== TYPENAME_KEY) {
      return data;
    }

    let value;

    // For __typename fields we are going to return typeName
    if (field.name === TYPENAME_KEY) {
      value = typeName ?? DEFAULT_MOCK_TYPENAME;
    }
    // We may have an object with default values (generated in _mockLink(...))
    // let's check if we have a value there for our field
    if (
      defaultValues != null &&
      defaultValues.hasOwnProperty(applicationName)
    ) {
      value = defaultValues[applicationName];
    }

    // If the value has not been generated yet (__id, __typename fields, or defaults)
    // then we need to generate mock value for a scalar type
    if (value == null) {
      // Get basic type information: type of the field (Int, Float, String, etc..)
      // And check if it's a plural type
      const {type, plural} = this._getSimpleTypeDetails(field, typeName);

      value = this._resolveValue(
        // If we don't have schema let's assume that fields with name (id, __id)
        // have type ID
        type,
        {
          parentType: typeName,
          name: field.name,
          alias: field.alias,
          path: [...path, applicationName],
          args: this._getFieldArgs(field),
        },
        plural,
      );
    }
    data[applicationName] = value;
    return data;
  }

  /**
   * Generate mock data for linked fields in the selection
   */
  _mockLink(
    field: ReaderLinkedField | NormalizationLinkedField,
    path: $ReadOnlyArray<string>,
    prevData: ?MockData,
    defaultValues: ?MockData,
  ): MockData | null {
    const applicationName = field.alias ?? field.name;
    const data = prevData ?? {};
    const args = this._getFieldArgs(field);

    // Let's check if we have a custom mock resolver for the object type
    // We will pass this data down to selection, so _mockScalar(...) can use
    // values from `defaults`
    let defaults = this._getDefaultValuesForObject(
      field.concreteType ?? DEFAULT_MOCK_TYPENAME,
      field.name,
      field.alias,
      [...path, applicationName],
      args,
    );
    if (
      defaults == null &&
      defaultValues != null &&
      typeof defaultValues[applicationName] === 'object'
    ) {
      defaults = defaultValues[applicationName];
    }

    // In cases when we have explicit `null` in the defaults - let's return
    // null for full branch
    if (defaults === null) {
      data[applicationName] = null;
      return data;
    }

    // If concrete type is null, let's try to get if from defaults,
    // and fallback to default object type
    const typeName =
      field.concreteType ??
      (defaults != null && typeof defaults[TYPENAME_KEY] === 'string'
        ? defaults[TYPENAME_KEY]
        : DEFAULT_MOCK_TYPENAME);

    const generateDataForField = () =>
      this._traverse(
        {
          selections: field.selections,
          typeName,
          name: field.name,
          alias: field.alias,
          args,
        },
        [...path, applicationName],
        typeof data[applicationName] === 'object'
          ? data[applicationName]
          : null,
        defaults,
      );

    data[applicationName] = field.plural
      ? generateMockList(generateDataForField)
      : generateDataForField();

    return data;
  }

  /**
   * Get the value for a variable by name
   */
  _getVariableValue(name: string): mixed {
    invariant(
      this._variables.hasOwnProperty(name),
      'RelayMockPayloadGenerator(): Undefined variable `%s`.',
      name,
    );
    return this._variables[name];
  }

  /**
   * This method should call mock resolver for a specific type name
   * and the result of this mock resolver will be passed as a default values for
   * _mock*(...) methods
   */
  _getDefaultValuesForObject(
    typeName: ?string,
    fieldName: ?string,
    fieldAlias: ?string,
    path: $ReadOnlyArray<string>,
    args: ?{
      [string]: mixed,
    },
  ): ?MockData {
    let data;
    if (typeName != null && this._mockResolvers[typeName] != null) {
      data = this._resolveValue(
        typeName,
        {
          parentType: null,
          name: fieldName,
          alias: fieldAlias,
          args,
          path,
        },
        false,
      );
    }
    if (typeof data === 'object') {
      return data;
    }
  }

  /**
   * Get object with variables for field
   */
  _getFieldArgs(
    field:
      | ReaderScalarField
      | ReaderLinkedField
      | NormalizationLinkedField
      | NormalizationScalarField,
  ): {
    [string]: mixed,
  } {
    const args = {};
    if (field.args != null) {
      field.args.forEach(arg => {
        args[arg.name] =
          arg.kind === 'Literal'
            ? arg.value
            : this._getVariableValue(arg.variableName);
      });
    }
    return args;
  }

  /**
   * Get GraphQL Type with fields by name
   */
  _getGraphQLTypeWithFields(
    typeName: ?string,
  ): GraphQLObjectType | GraphQLInterfaceType | null {
    const schemaType =
      this._schema && typeName != null ? this._schema.getType(typeName) : null;
    if (
      schemaType != null &&
      (isObjectType(schemaType) || isInterfaceType(schemaType))
    ) {
      return schemaType;
    }
    return null;
  }

  /**
   * Get fields map of the GraphQL *Object* Type
   */
  _getGraphQLTypeFields(typeName: ?string): ?GraphQLFieldMap<mixed, mixed> {
    const schemaType = this._getGraphQLTypeWithFields(typeName);
    if (schemaType == null) {
      return null;
    }
    return schemaType.getFields();
  }

  /**
   * Helper function to get field type information (name of the type, plural)
   */
  _getSimpleTypeDetails(
    field: ReaderScalarField,
    typeName: ?string,
  ): {|
    type: string,
    plural: boolean,
  |} {
    const defaultSuggestedByName = ['id'].includes(field.alias ?? field.name)
      ? 'ID'
      : 'String';

    const fields = this._getGraphQLTypeFields(typeName);
    const schemaFieldByName = fields != null ? fields[field.name] : null;
    // We need to check field type by alias for fields with handlers
    const schemaFiledByAlias =
      fields != null && field.alias != null ? fields[field.alias] : null;
    const schemaField = schemaFiledByAlias ?? schemaFieldByName;

    if (schemaField == null) {
      return {
        type: defaultSuggestedByName,
        plural: false,
      };
    }

    let typeInfo = getNullableType(schemaField.type);
    let plural = false;
    if (typeInfo instanceof GraphQLList) {
      typeInfo = getNullableType(typeInfo.ofType);
      plural = true;
    }
    return {
      type: typeInfo != null ? typeInfo.toString() : defaultSuggestedByName,
      plural,
    };
  }
}

/**
 * Generate mock variables for ReaderFragment
 */
function generateVariables(
  node: ReaderFragment | NormalizationOperation,
  mockResolvers: ?MockResolvers,
): Variables {
  const variables = {};
  const {argumentDefinitions} = node;
  const argumentValueGenerator = createValueResolver({
    ...DEFAULT_MOCK_RESOLVERS,
    ...mockResolvers,
  });
  for (const arg of argumentDefinitions) {
    const type = arg.type != null ? arg.type : 'String';
    const plural = type.startsWith('[');
    const typeName = type.replace(/[\[\!\]]/g, '');
    const defaultValue =
      arg.kind === 'LocalArgument' ? arg.defaultValue : undefined;
    variables[arg.name] =
      defaultValue ??
      argumentValueGenerator(
        typeName,
        {
          parentType: null,
          name: arg.name,
          alias: null,
          path: null,
          args: null,
        },
        plural,
        null,
      );
  }
  return variables;
}

/**
 * Generate mock data for ReaderFragment selection
 */
function generateData(
  node: ReaderFragment | NormalizationOperation,
  mockResolvers: ?MockResolvers,
  variables?: Variables = generateVariables(node, mockResolvers),
  schema?: ?GraphQLSchema,
): MockData | $ReadOnlyArray<MockData> {
  const mockGenerator = new RelayMockPayloadGenerator({
    variables,
    schema,
    mockResolvers,
  });
  let typeName;
  if (node.kind === 'Operation') {
    if (node.name.endsWith('Mutation')) {
      typeName = 'Mutation';
    } else if (node.name.endsWith('Subscription')) {
      typeName = 'Subscription';
    } else {
      typeName = 'Query';
    }
  } else {
    typeName = node.type;
  }
  const plural =
    node.kind === 'Operation' ? false : node.metadata?.plural ?? false;
  const data = mockGenerator.generate(node.selections, typeName, plural);
  return data;
}

function generateDataForOperation(
  operation: OperationDescriptor,
  mockResolvers: ?MockResolvers,
): GraphQLResponse {
  const data = generateData(
    operation.node.operation,
    mockResolvers,
    operation.variables,
  );
  invariant(
    !Array.isArray(data),
    'RelayMockPayloadGenerator: Invalid generated payload, unexpected array.',
  );
  return {data};
}

module.exports = {
  DEFAULT_MOCK_TYPENAME,
  generateVariables,
  generateData,
  generateDataForOperation,
};
