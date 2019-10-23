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
  TYPENAME_KEY,
  RelayConcreteNode,
  getModuleComponentKey,
  getModuleOperationKey,
} = require('relay-runtime');

const {
  CLIENT_EXTENSION,
  CONDITION,
  CONNECTION,
  DEFER,
  INLINE_FRAGMENT,
  LINKED_FIELD,
  LINKED_HANDLE,
  MODULE_IMPORT,
  SCALAR_FIELD,
  SCALAR_HANDLE,
  STREAM,
} = RelayConcreteNode;

import type {
  Variables,
  NormalizationField,
  NormalizationOperation,
  NormalizationSelection,
  NormalizationLinkedField,
  NormalizationScalarField,
  OperationDescriptor,
  GraphQLResponse,
  NormalizationSplitOperation,
} from 'relay-runtime';

type ValueResolver = (
  typeName: ?string,
  context: MockResolverContext,
  plural: ?boolean,
  defaultValue?: mixed,
) => mixed;
type Traversable = {|
  +selections: $ReadOnlyArray<NormalizationSelection>,
  +typeName: ?string,
  +isAbstractType: ?boolean,
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

type SelectionMetadata = {
  [selectionPath: string]: {|
    +type: string,
    +plural: boolean,
    +nullable: boolean,
    +enumValues: $ReadOnlyArray<string> | null,
  |},
};

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
  const generateValue = (possibleDefaultValue: mixed) => {
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
        possibleDefaultValue ??
        (typeName === 'ID'
          ? DEFAULT_MOCK_RESOLVERS.ID(context, generateId)
          : `<mock-value-for-field-"${context.alias ??
              context.name ??
              'undefined'}">`);
    }
    return mockValue;
  };

  return plural === true
    ? generateMockList(
        Array.isArray(defaultValue) ? defaultValue : Array(1).fill(),
        generateValue,
      )
    : generateValue(defaultValue);
}

function createValueResolver(mockResolvers: ?MockResolvers): ValueResolver {
  const generateId = createIdGenerator();
  return (...args) => {
    return valueResolver(generateId, mockResolvers, ...args);
  };
}

function generateMockList<T>(
  placeholderArray: $ReadOnlyArray<mixed>,
  generateListItem: (defaultValue: mixed) => T,
): $ReadOnlyArray<T> {
  return placeholderArray.map(possibleDefaultValue =>
    generateListItem(possibleDefaultValue),
  );
}

class RelayMockPayloadGenerator {
  _variables: Variables;
  _resolveValue: ValueResolver;
  _mockResolvers: MockResolvers;
  _selectionMetadata: SelectionMetadata;

  constructor(options: {|
    +variables: Variables,
    +mockResolvers: MockResolvers | null,
    +selectionMetadata: SelectionMetadata | null,
  |}) {
    this._variables = options.variables;
    this._mockResolvers = {
      ...DEFAULT_MOCK_RESOLVERS,
      ...(options.mockResolvers ?? {}),
    };
    this._selectionMetadata = options.selectionMetadata ?? {};
    this._resolveValue = createValueResolver(this._mockResolvers);
  }

  generate(
    selections: $ReadOnlyArray<NormalizationSelection>,
    operationType: string,
  ): MockData {
    const defaultValues = this._getDefaultValuesForObject(
      operationType,
      null,
      null,
      [], // path
      {},
    );
    return this._traverse(
      {
        selections,
        typeName: operationType,
        isAbstractType: false,
        name: null,
        alias: null,
        args: null,
      },
      [], // path
      null, // prevData
      defaultValues,
    );
  }

  _traverse(
    traversable: Traversable,
    path: $ReadOnlyArray<string>,
    prevData: ?MockData,
    defaultValues: ?MockData,
  ): MockData {
    const {selections, typeName, isAbstractType} = traversable;

    return this._traverseSelections(
      selections,
      typeName,
      isAbstractType,
      path,
      prevData,
      defaultValues,
    );
  }

  /**
   * Generate mock values for selection of fields
   */
  _traverseSelections(
    selections: $ReadOnlyArray<NormalizationSelection>,
    typeName: ?string,
    isAbstractType: ?boolean,
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
        case CONNECTION: {
          mockData = this._traverseSelections(
            [selection.edges, selection.pageInfo],
            typeName,
            isAbstractType,
            path,
            prevData,
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
              isAbstractType,
              path,
              mockData,
              defaultValues,
            );
          }
          break;

        case CLIENT_EXTENSION:
        case DEFER:
        case STREAM: {
          mockData = this._traverseSelections(
            selection.selections,
            typeName,
            isAbstractType,
            path,
            mockData,
            defaultValues,
          );
          break;
        }

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
          // Now, we need to make sure that we don't select abstract type
          // for inline fragments
          if (
            isAbstractType === true &&
            mockData != null &&
            mockData[TYPENAME_KEY] === typeName
          ) {
            mockData[TYPENAME_KEY] = selection.type;
          }
          if (mockData != null && mockData[TYPENAME_KEY] === selection.type) {
            // This will get default values for current selection type
            const defaults = this._getDefaultValuesForObject(
              selection.type,
              path[path.length - 1],
              null,
              path,
            );

            // Also, if the selection has an abstract type
            // we may have mock resolvers for it
            const defaultsForAbstractType =
              typeName !== selection.type
                ? this._getDefaultValuesForObject(
                    typeName,
                    path[path.length - 1],
                    null,
                    path,
                  )
                : defaults;

            // Now let's select which defaults we're going to use
            // for the selections
            let defaultValuesForSelection = defaults; // First, defaults for
            // concrete type of the selection
            if (defaultValuesForSelection === undefined) {
              // Second, defaults for abstract type of the selection
              defaultValuesForSelection = defaultsForAbstractType;
            }
            // And last, values from the parent mock resolver
            if (defaultValuesForSelection === undefined) {
              defaultValuesForSelection = defaultValues;
            }
            // Now, if the default value for the type is explicit null,
            // we may skip traversing child selection
            if (defaultValuesForSelection === null) {
              mockData = null;
              break;
            }

            mockData = this._traverseSelections(
              selection.selections,
              selection.type,
              isAbstractType,
              path,
              mockData,
              defaultValuesForSelection,
            );

            if (mockData[TYPENAME_KEY] != null) {
              mockData[TYPENAME_KEY] = selection.type;
            }

            // Make sure we're using id form the default values, an
            // ID may be referenced in the same selection as InlineFragment
            if (
              mockData.id != null &&
              defaults != null &&
              defaults.id != null
            ) {
              mockData.id = defaults.id;
            }
          }
          break;
        }

        case MODULE_IMPORT:
          // Explicit `null` of `defaultValues` handled in the INLINE_FRAGMENT
          if (defaultValues != null) {
            if (defaultValues.__typename !== typeName) {
              break;
            }
            // In order to mock 3d payloads, we need to receive an object with
            // the type `NormalizationSplitOperation` from mock resolvers.
            // In this case, we can traverse into its selection
            // and generated payloads for it.
            const operation = defaultValues.__module_operation;

            // Basic sanity checks of the provided default value.
            // It should look like NormalizationSplitOperation
            invariant(
              typeof operation === 'object' &&
                operation !== null &&
                operation.kind === 'SplitOperation' &&
                Array.isArray(operation.selections) &&
                typeof operation.name === 'string',
              'RelayMockPayloadGenerator(): Unexpected default value for ' +
                'a field `__module_operation` in the mock resolver for ' +
                '@module dependency. Provided value is "%s" and we\'re ' +
                'expecting an object of a type `NormalizationSplitOperation`. ' +
                'Please adjust mock resolver for the type "%s". ' +
                'Typically it should require a file "%s$normalization.graphql".',
              JSON.stringify(operation),
              typeName,
              selection.fragmentName,
            );

            const splitOperation: NormalizationSplitOperation = (operation: $FlowFixMe);
            const {documentName} = selection;
            if (mockData == null) {
              mockData = {};
            }
            mockData = {
              ...mockData,
              [TYPENAME_KEY]: typeName,
              [getModuleOperationKey(documentName)]: operation.name,
              [getModuleComponentKey(
                documentName,
              )]: defaultValues.__module_component,
              ...this._traverseSelections(
                splitOperation.selections,
                typeName,
                false,
                path,
                null,
                null,
              ),
            };
          }
          break;
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
   * Generate default enum value
   * @private
   */
  _getCorrectDefaultEnum(
    enumValues: $ReadOnlyArray<string>,
    value: mixed | Array<mixed>,
    path: $ReadOnlyArray<string>,
    applicationName: string,
  ) {
    if (value === undefined) {
      return value;
    }

    if (value === null) {
      // null is a valid enum value
      return value;
    }

    const valueToValidate = Array.isArray(value)
      ? value.map(v => String(v).toUpperCase())
      : [String(value).toUpperCase()];
    const enumValuesNormalized = enumValues.map(s => s.toUpperCase());

    // Let's validate the correctness of the provided enum value
    // We will throw if value provided by mock resolvers is invalid
    const correctValues = valueToValidate.filter(v =>
      enumValuesNormalized.includes(v),
    );

    if (correctValues.length !== valueToValidate.length) {
      invariant(
        false,
        'RelayMockPayloadGenerator: Invalid value "%s" provided for enum ' +
          'field "%s" via MockResolver.' +
          'Expected one of the following values: %s.',
        value,
        `${path.join('.')}.${applicationName}`,
        enumValues.map(v => `"${v}"`).join(', '),
      );
    }

    // But missing case should be acceptable, we will just use
    // a correct spelling from enumValues
    const correctSpellingValues = valueToValidate.map(v => {
      const correctSpellingEnumIndex = enumValuesNormalized.indexOf(
        String(v).toUpperCase(),
      );

      return enumValues[correctSpellingEnumIndex];
    });

    return Array.isArray(value)
      ? correctSpellingValues
      : correctSpellingValues[0];
  }

  /**
   * Generate mock value for a scalar field in the selection
   */
  _mockScalar(
    field: NormalizationScalarField,
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

    const selectionPath = [...path, applicationName];
    const {type, plural, enumValues} = this._getScalarFieldTypeDetails(
      field,
      typeName,
      selectionPath,
    );

    // We may have an object with default values (generated in _mockLink(...))
    // let's check if we have a possible default value there for our field
    if (
      defaultValues != null &&
      defaultValues.hasOwnProperty(applicationName)
    ) {
      value = defaultValues[applicationName];

      if (enumValues != null) {
        value = this._getCorrectDefaultEnum(
          enumValues,
          value,
          path,
          applicationName,
        );
      }

      // And if it's a plural field, we need to return an array
      if (value !== undefined && plural && !Array.isArray(value)) {
        value = [value];
      }
    }

    // If the value has not been generated yet (__id, __typename fields, or defaults)
    // then we need to generate mock value for a scalar type
    if (value === undefined) {
      // Get basic type information: type of the field (Int, Float, String, etc..)
      // And check if it's a plural type
      const defaultValue = enumValues != null ? enumValues[0] : undefined;

      value = this._resolveValue(
        // If we don't have schema let's assume that fields with name (id, __id)
        // have type ID
        type,
        {
          parentType: typeName,
          name: field.name,
          alias: field.alias,
          path: selectionPath,
          args: this._getFieldArgs(field),
        },
        plural,
        defaultValue,
      );
    }
    data[applicationName] = value;
    return data;
  }

  /**
   * Generate mock data for linked fields in the selection
   */
  _mockLink(
    field: NormalizationLinkedField,
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
    const selectionPath = [...path, applicationName];
    const typeFromSelection = this._selectionMetadata[
      selectionPath.join('.')
    ] ?? {
      type: DEFAULT_MOCK_TYPENAME,
    };

    let defaults;
    if (
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
        : typeFromSelection.type);

    // Let's assume, that if the concrete type is null and selected type name is
    // different from type information form selection, most likely this type
    // information came from mock resolver __typename value and it was
    // an intentional selection of the specific type
    const isAbstractType =
      field.concreteType === null && typeName === typeFromSelection.type;

    const generateDataForField = possibleDefaultValue => {
      const fieldDefaultValue =
        this._getDefaultValuesForObject(
          field.concreteType ?? typeFromSelection.type,
          field.name,
          field.alias,
          selectionPath,
          args,
        ) ?? possibleDefaultValue;

      if (fieldDefaultValue === null) {
        return null;
      }
      return this._traverse(
        {
          selections: field.selections,
          typeName,
          isAbstractType: isAbstractType,
          name: field.name,
          alias: field.alias,
          args,
        },
        [...path, applicationName],
        /* $FlowFixMe(>=0.98.0 site=react_native_fb,oss,www,mobile) This comment suppresses an
         * error found when Flow v0.98 was deployed. To see the error delete
         * this comment and run Flow. */
        typeof data[applicationName] === 'object'
          ? data[applicationName]
          : null,
        /* $FlowFixMe(>=0.98.0 site=react_native_fb,oss,www,mobile) This comment suppresses an
         * error found when Flow v0.98 was deployed. To see the error delete
         * this comment and run Flow. */
        fieldDefaultValue,
      );
    };
    data[applicationName] =
      field.kind === 'LinkedField' && field.plural
        ? generateMockList(
            Array.isArray(defaults) ? defaults : Array(1).fill(),
            generateDataForField,
          )
        : generateDataForField(defaults);

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
      /* $FlowFixMe(>=0.98.0 site=react_native_fb,oss,www,mobile) This comment suppresses an
       * error found when Flow v0.98 was deployed. To see the error delete this
       * comment and run Flow. */
      return data;
    }
  }

  /**
   * Get object with variables for field
   */
  _getFieldArgs(
    field: NormalizationField,
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
   * Helper function to get field type information (name of the type, plural)
   */
  _getScalarFieldTypeDetails(
    field: NormalizationScalarField,
    typeName: ?string,
    selectionPath: $ReadOnlyArray<string>,
  ): {|
    +type: string,
    +plural: boolean,
    +enumValues: $ReadOnlyArray<string> | null,
    +nullable: boolean,
  |} {
    return (
      this._selectionMetadata[selectionPath.join('.')] ?? {
        type: field.name === 'id' ? 'ID' : 'String',
        plural: false,
        enumValues: null,
        nullable: false,
      }
    );
  }
}

/**
 * Generate mock data for NormalizationOperation selection
 */
function generateData(
  node: NormalizationOperation,
  variables: Variables,
  mockResolvers: MockResolvers | null,
  selectionMetadata: SelectionMetadata | null,
): MockData {
  const mockGenerator = new RelayMockPayloadGenerator({
    variables,
    mockResolvers,
    selectionMetadata,
  });
  let operationType;
  if (node.name.endsWith('Mutation')) {
    operationType = 'Mutation';
  } else if (node.name.endsWith('Subscription')) {
    operationType = 'Subscription';
  } else {
    operationType = 'Query';
  }
  return mockGenerator.generate(node.selections, operationType);
}

/**
 * Type refinement for selection metadata
 */
function getSelectionMetadataFromOperation(
  operation: OperationDescriptor,
): SelectionMetadata | null {
  const selectionTypeInfo =
    operation.request.node.params.metadata?.relayTestingSelectionTypeInfo;
  if (
    selectionTypeInfo != null &&
    !Array.isArray(selectionTypeInfo) &&
    typeof selectionTypeInfo === 'object'
  ) {
    const selectionMetadata: SelectionMetadata = {};
    Object.keys(selectionTypeInfo).forEach(path => {
      const item = selectionTypeInfo[path];
      if (item != null && !Array.isArray(item) && typeof item === 'object') {
        if (
          typeof item.type === 'string' &&
          typeof item.plural === 'boolean' &&
          typeof item.nullable === 'boolean' &&
          (item.enumValues === null || Array.isArray(item.enumValues))
        ) {
          selectionMetadata[path] = {
            type: item.type,
            plural: item.plural,
            nullable: item.nullable,
            enumValues: Array.isArray(item.enumValues)
              ? item.enumValues.map(String)
              : null,
          };
        }
      }
    });
    return selectionMetadata;
  }
  return null;
}

function generateDataForOperation(
  operation: OperationDescriptor,
  mockResolvers: ?MockResolvers,
): GraphQLResponse {
  const data = generateData(
    operation.request.node.operation,
    operation.request.variables,
    mockResolvers ?? null,
    getSelectionMetadataFromOperation(operation),
  );
  return {data};
}

module.exports = {
  generate: generateDataForOperation,
};
