/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const Profiler = require('./GraphQLCompilerProfiler');

const invariant = require('invariant');

const {DEFAULT_HANDLE_KEY} = require('../util/DefaultHandleKey');
const {
  getNullableType,
  getRawType,
  getTypeFromAST,
  isExecutableDefinitionAST,
} = require('./GraphQLSchemaUtils');
const {
  assertCompositeType,
  assertInputType,
  assertOutputType,
  extendSchema,
  getNamedType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLUnionType,
  isLeafType,
  isTypeSubTypeOf,
  parse,
  parseType,
  SchemaMetaFieldDef,
  Source,
  TypeMetaFieldDef,
  TypeNameMetaFieldDef,
} = require('graphql');

import type {
  Argument,
  ArgumentDefinition,
  ArgumentValue,
  Condition,
  Directive,
  Field,
  Fragment,
  FragmentSpread,
  Handle,
  InlineFragment,
  LocalArgumentDefinition,
  Root,
  ScalarFieldType,
  Selection,
  Variable,
} from './GraphQLIR';
import type {
  ArgumentNode,
  DirectiveNode,
  FieldNode,
  FragmentDefinitionNode,
  FragmentSpreadNode,
  InlineFragmentNode,
  OperationDefinitionNode,
  SelectionSetNode,
  ValueNode,
  VariableDefinitionNode,
  VariableNode,
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLSchema,
  GraphQLArgument,
  GraphQLField,
} from 'graphql';

const ARGUMENT_DEFINITIONS = 'argumentDefinitions';
const ARGUMENTS = 'arguments';

/**
 * @internal
 *
 * This directive is not intended for use by developers directly. To set a field
 * handle in product code use a compiler plugin.
 */
const CLIENT_FIELD = '__clientField';
const CLIENT_FIELD_HANDLE = 'handle';
const CLIENT_FIELD_KEY = 'key';
const CLIENT_FIELD_FILTERS = 'filters';

const INCLUDE = 'include';
const SKIP = 'skip';
const IF = 'if';

class GraphQLParser {
  _definition: OperationDefinitionNode | FragmentDefinitionNode;
  _referencedVariableTypesByName: {[name: string]: ?GraphQLInputType};
  _schema: GraphQLSchema;

  static parse(
    schema: GraphQLSchema,
    text: string,
    filename?: string,
  ): Array<Root | Fragment> {
    const ast = parse(new Source(text, filename));
    const nodes = [];
    // TODO T24511737 figure out if this is dangerous
    schema = extendSchema(schema, ast, {assumeValid: true});
    ast.definitions.forEach(definition => {
      if (isExecutableDefinitionAST(definition)) {
        nodes.push(this.transform(schema, definition));
      }
    }, this);
    return nodes;
  }

  /**
   * Transforms a raw GraphQL AST into a simpler representation with type
   * information.
   */
  static transform(
    schema: GraphQLSchema,
    definition: OperationDefinitionNode | FragmentDefinitionNode,
  ): Root | Fragment {
    return Profiler.run('GraphQLParser.transform', () => {
      const parser = new this(schema, definition);
      return parser.transform();
    });
  }

  constructor(
    schema: GraphQLSchema,
    definition: OperationDefinitionNode | FragmentDefinitionNode,
  ) {
    this._definition = definition;
    this._referencedVariableTypesByName = {};
    this._schema = schema;
  }

  /**
   * Find the definition of a field of the specified type.
   */
  getFieldDefinition(
    parentType: GraphQLOutputType,
    fieldName: string,
    fieldAST: FieldNode,
  ): ?GraphQLField<*, *> {
    const type = getRawType(parentType);
    const isQueryType = type === this._schema.getQueryType();
    const hasTypeName =
      type instanceof GraphQLObjectType ||
      type instanceof GraphQLInterfaceType ||
      type instanceof GraphQLUnionType;

    let schemaFieldDef;
    if (isQueryType && fieldName === SchemaMetaFieldDef.name) {
      schemaFieldDef = SchemaMetaFieldDef;
    } else if (isQueryType && fieldName === TypeMetaFieldDef.name) {
      schemaFieldDef = TypeMetaFieldDef;
    } else if (hasTypeName && fieldName === TypeNameMetaFieldDef.name) {
      schemaFieldDef = TypeNameMetaFieldDef;
    } else if (
      type instanceof GraphQLInterfaceType ||
      type instanceof GraphQLObjectType
    ) {
      schemaFieldDef = type.getFields()[fieldName];
    }
    return schemaFieldDef;
  }

  _getErrorContext(): string {
    let message = `document \`${getName(this._definition)}\``;
    if (this._definition.loc && this._definition.loc.source) {
      message += ` file: \`${this._definition.loc.source.name}\``;
    }
    return message;
  }

  _recordAndVerifyVariableReference(
    name: string,
    usedAsType: ?GraphQLInputType,
  ): void {
    const previousType = this._referencedVariableTypesByName[name];

    if (!previousType) {
      // No previous usage, current type is strongest
      this._referencedVariableTypesByName[name] = usedAsType;
    } else if (usedAsType) {
      invariant(
        isTypeSubTypeOf(this._schema, usedAsType, previousType) ||
          isTypeSubTypeOf(this._schema, previousType, usedAsType),
        'GraphQLParser: Variable `$%s` was used in locations expecting ' +
          'the conflicting types `%s` and `%s`. Source: %s.',
        name,
        previousType,
        usedAsType,
        this._getErrorContext(),
      );

      // If the new used type has stronger requirements, use that type as reference,
      // otherwise keep referencing the previous type
      this._referencedVariableTypesByName[name] = isTypeSubTypeOf(
        this._schema,
        usedAsType,
        previousType,
      )
        ? usedAsType
        : previousType;
    }
  }

  transform(): Root | Fragment {
    switch (this._definition.kind) {
      case 'OperationDefinition':
        return this._transformOperation(this._definition);
      case 'FragmentDefinition':
        return this._transformFragment(this._definition);
      default:
        invariant(
          false,
          'GraphQLParser: Unknown AST kind `%s`. Source: %s.',
          this._definition.kind,
          this._getErrorContext(),
        );
    }
  }

  _transformFragment(fragment: FragmentDefinitionNode): Fragment {
    const argumentDefinitions = this._buildArgumentDefinitions(fragment);
    const directives = this._transformDirectives(
      (fragment.directives || []).filter(
        directive => getName(directive) !== ARGUMENT_DEFINITIONS,
      ),
    );
    const type = assertCompositeType(
      getTypeFromAST(this._schema, fragment.typeCondition),
    );
    const selections = this._transformSelections(fragment.selectionSet, type);
    for (const name in this._referencedVariableTypesByName) {
      if (this._referencedVariableTypesByName.hasOwnProperty(name)) {
        const variableType = this._referencedVariableTypesByName[name];
        const localArgument = argumentDefinitions.find(
          argDef => argDef.name === name,
        );
        if (localArgument) {
          invariant(
            variableType == null ||
              isTypeSubTypeOf(this._schema, localArgument.type, variableType),
            'GraphQLParser: Variable `$%s` was defined as type `%s`, but used ' +
              'in a location that expects type `%s`. Source: %s.',
            name,
            localArgument.type,
            variableType,
            this._getErrorContext(),
          );
        } else {
          argumentDefinitions.push({
            kind: 'RootArgumentDefinition',
            metadata: null,
            name,
            // $FlowFixMe - could be null
            type: variableType,
          });
        }
      }
    }
    return {
      kind: 'Fragment',
      directives,
      metadata: null,
      name: getName(fragment),
      selections,
      type,
      argumentDefinitions,
    };
  }

  /**
   * Polyfills suport for fragment variable definitions via the
   * @argumentDefinitions directive. Returns the equivalent AST
   * to the `argumentDefinitions` property on queries/mutations/etc.
   */
  _buildArgumentDefinitions(
    fragment: FragmentDefinitionNode,
  ): Array<ArgumentDefinition> {
    const variableDirectives = (fragment.directives || []).filter(
      directive => getName(directive) === ARGUMENT_DEFINITIONS,
    );
    if (!variableDirectives.length) {
      return [];
    }
    invariant(
      variableDirectives.length === 1,
      'GraphQLParser: Directive %s may be defined at most once on fragment ' +
        '`%s`. Source: %s.',
      ARGUMENT_DEFINITIONS,
      getName(fragment),
      this._getErrorContext(),
    );
    const variableDirective = variableDirectives[0];
    // $FlowIssue: refining directly on `variableDirective.arguments` doesn't
    // work, below accesses all report arguments could still be null/undefined.
    const args = variableDirective.arguments;
    if (variableDirective == null || !Array.isArray(args)) {
      return [];
    }
    invariant(
      args.length,
      'GraphQLParser: Directive %s requires arguments: remove the directive ' +
        'to skip defining local variables for this fragment `%s`. Source: %s.',
      ARGUMENT_DEFINITIONS,
      getName(fragment),
      this._getErrorContext(),
    );
    return args.map(arg => {
      const argName = getName(arg);
      const argValue = this._transformValue(arg.value);
      invariant(
        argValue.kind === 'Literal',
        'GraphQLParser: Expected definition for variable `%s` to be an ' +
          'object with the following shape: `{type: string, defaultValue?: ' +
          'mixed}`, got `%s`. Source: %s.',
        argValue,
        this._getErrorContext(),
      );
      const value = argValue.value;
      invariant(
        !Array.isArray(value) &&
          typeof value === 'object' &&
          value !== null &&
          typeof value.type === 'string',
        'GraphQLParser: Expected definition for variable `%s` to be an ' +
          'object with the following shape: `{type: string, defaultValue?: ' +
          'mixed, nonNull?: boolean, list?: boolean}`, got `%s`. Source: %s.',
        argName,
        argValue,
        this._getErrorContext(),
      );

      const valueType = value.type;

      const unknownKeys = Object.keys(value).filter(
        key =>
          key !== 'type' &&
          key !== 'defaultValue' &&
          key !== 'nonNull' &&
          key !== 'list',
      );
      invariant(
        unknownKeys.length === 0,
        'GraphQLParser: Expected definition for variable `%s` to be an ' +
          'object with the following shape: `{type: string, defaultValue?: ' +
          'mixed, nonNull?: boolean, list?: boolean}`, got unknown key(s) ' +
          '`%s`. Source: %s.',
        argName,
        unknownKeys.join('`, `'),
        this._getErrorContext(),
      );

      const typeAST = parseType(valueType);
      const type = assertInputType(getTypeFromAST(this._schema, typeAST));
      return {
        kind: 'LocalArgumentDefinition',
        defaultValue: value.defaultValue != null ? value.defaultValue : null,
        metadata: null,
        name: argName,
        type,
      };
    });
  }

  _transformOperation(definition: OperationDefinitionNode): Root {
    const name = getName(definition);
    const argumentDefinitions = this._transformArgumentDefinitions(
      definition.variableDefinitions || [],
    );
    const directives = this._transformDirectives(definition.directives || []);
    let type;
    let operation;
    switch (definition.operation) {
      case 'query':
        operation = 'query';
        type = assertCompositeType(this._schema.getQueryType());
        break;
      case 'mutation':
        operation = 'mutation';
        type = assertCompositeType(this._schema.getMutationType());
        break;
      case 'subscription':
        operation = 'subscription';
        type = assertCompositeType(this._schema.getSubscriptionType());
        break;
      default:
        invariant(
          false,
          'GraphQLParser: Unknown AST kind `%s`. Source: %s.',
          definition.operation,
          this._getErrorContext(),
        );
    }
    invariant(
      definition.selectionSet,
      'GraphQLParser: Expected %s `%s` to have selections. Source: %s.',
      operation,
      name,
      this._getErrorContext(),
    );
    const selections = this._transformSelections(definition.selectionSet, type);
    return {
      kind: 'Root',
      operation,
      metadata: null,
      name,
      dependentRequests: [],
      argumentDefinitions,
      directives,
      selections,
      type,
    };
  }

  _transformArgumentDefinitions(
    argumentDefinitions: $ReadOnlyArray<VariableDefinitionNode>,
  ): Array<LocalArgumentDefinition> {
    return argumentDefinitions.map(def => {
      const name = getName(def.variable);
      const type = assertInputType(getTypeFromAST(this._schema, def.type));
      const defaultLiteral = def.defaultValue
        ? this._transformValue(def.defaultValue)
        : null;
      if (this._referencedVariableTypesByName.hasOwnProperty(name)) {
        const variableType = this._referencedVariableTypesByName[name];
        invariant(
          variableType == null ||
            isTypeSubTypeOf(this._schema, type, variableType),
          'GraphQLParser: Variable `$%s` was defined as type `%s`, but used ' +
            'in a location that expects type `%s`. Source: %s.',
          name,
          type,
          variableType,
          this._getErrorContext(),
        );
      }
      invariant(
        defaultLiteral === null || defaultLiteral.kind === 'Literal',
        'GraphQLParser: Expected null or Literal default value, got: `%s`. ' +
          'Source: %s.',
        defaultLiteral && defaultLiteral.kind,
        this._getErrorContext(),
      );
      return {
        kind: 'LocalArgumentDefinition',
        metadata: null,
        name,
        defaultValue: defaultLiteral ? defaultLiteral.value : null,
        type,
      };
    });
  }

  _transformSelections(
    selectionSet: SelectionSetNode,
    parentType: GraphQLOutputType,
  ): Array<Selection> {
    return selectionSet.selections.map(selection => {
      let node;
      if (selection.kind === 'Field') {
        node = this._transformField(selection, parentType);
      } else if (selection.kind === 'FragmentSpread') {
        node = this._transformFragmentSpread(selection, parentType);
      } else if (selection.kind === 'InlineFragment') {
        node = this._transformInlineFragment(selection, parentType);
      } else {
        invariant(
          false,
          'GraphQLParser: Unexpected AST kind `%s`. Source: %s.',
          selection.kind,
          this._getErrorContext(),
        );
      }
      const [conditions, directives] = this._splitConditions(node.directives);
      const conditionalNodes = applyConditions(
        conditions,
        // $FlowFixMe(>=0.28.0)
        [{...node, directives}],
      );
      invariant(
        conditionalNodes.length === 1,
        'GraphQLParser: Expected exactly one conditional node, got `%s`. ' +
          'Source: %s.',
        conditionalNodes.length,
        this._getErrorContext(),
      );
      return conditionalNodes[0];
    });
  }

  _transformInlineFragment(
    fragment: InlineFragmentNode,
    parentType: GraphQLOutputType,
  ): InlineFragment {
    const typeCondition = assertCompositeType(
      fragment.typeCondition
        ? getTypeFromAST(this._schema, fragment.typeCondition)
        : parentType,
    );
    const directives = this._transformDirectives(fragment.directives || []);
    const selections = this._transformSelections(
      fragment.selectionSet,
      typeCondition,
    );
    return {
      kind: 'InlineFragment',
      directives,
      metadata: null,
      selections,
      typeCondition,
    };
  }

  _transformFragmentSpread(
    fragment: FragmentSpreadNode,
    parentType: GraphQLOutputType,
  ): FragmentSpread {
    const fragmentName = getName(fragment);
    const [otherDirectives, argumentDirectives] = partitionArray(
      fragment.directives || [],
      directive => getName(directive) !== ARGUMENTS,
    );
    invariant(
      argumentDirectives.length <= 1,
      'GraphQLParser: Directive %s may be used at most once in fragment ' +
        'spread `...%s`. Source: %s.',
      ARGUMENTS,
      fragmentName,
      this._getErrorContext(),
    );
    let args;
    if (argumentDirectives.length) {
      args = (argumentDirectives[0].arguments || []).map(arg => {
        const argValue = arg.value;
        invariant(
          argValue.kind === 'Variable',
          'GraphQLParser: All @arguments() args must be variables, got %s. ' +
            'Source: %s.',
          argValue.kind,
          this._getErrorContext(),
        );

        return {
          kind: 'Argument',
          metadata: null,
          name: getName(arg),
          value: this._transformVariable(argValue),
          type: null, // TODO: can't get type until referenced fragment is defined
        };
      });
    }
    const directives = this._transformDirectives(otherDirectives);
    return {
      kind: 'FragmentSpread',
      args: args || [],
      metadata: null,
      name: fragmentName,
      directives,
    };
  }

  _transformField(field: FieldNode, parentType: GraphQLOutputType): Field {
    const name = getName(field);
    const fieldDef = this.getFieldDefinition(parentType, name, field);

    invariant(
      fieldDef,
      'GraphQLParser: Unknown field `%s` on type `%s`. Source: %s.',
      name,
      parentType,
      this._getErrorContext(),
    );
    const alias = field.alias ? field.alias.value : null;
    const args = this._transformArguments(field.arguments || [], fieldDef.args);
    const [otherDirectives, clientFieldDirectives] = partitionArray(
      field.directives || [],
      directive => getName(directive) !== CLIENT_FIELD,
    );
    const directives = this._transformDirectives(otherDirectives);
    const type = assertOutputType(fieldDef.type);
    const handles = this._transformHandle(name, args, clientFieldDirectives);
    if (isLeafType(getNamedType(type))) {
      invariant(
        !field.selectionSet ||
          !field.selectionSet.selections ||
          !field.selectionSet.selections.length,
        'GraphQLParser: Expected no selections for scalar field `%s` on type ' +
          '`%s`. Source: %s.',
        name,
        this._getErrorContext(),
      );
      return {
        kind: 'ScalarField',
        alias,
        args,
        directives,
        handles,
        metadata: null,
        name,
        type: assertScalarFieldType(type),
      };
    } else {
      const selections = field.selectionSet
        ? this._transformSelections(field.selectionSet, type)
        : null;
      invariant(
        selections && selections.length,
        'GraphQLParser: Expected at least one selection for non-scalar field ' +
          '`%s` on type `%s`. Source: %s.',
        name,
        type,
        this._getErrorContext(),
      );
      return {
        kind: 'LinkedField',
        alias,
        args,
        directives,
        handles,
        metadata: null,
        name,
        selections,
        type,
      };
    }
  }

  _transformHandle(
    fieldName: string,
    fieldArgs: Array<Argument>,
    clientFieldDirectives: Array<DirectiveNode>,
  ): ?Array<Handle> {
    let handles: ?Array<Handle>;
    clientFieldDirectives.forEach(clientFieldDirective => {
      const handleArgument = (clientFieldDirective.arguments || []).find(
        arg => getName(arg) === CLIENT_FIELD_HANDLE,
      );
      if (handleArgument) {
        let name = null;
        let key = DEFAULT_HANDLE_KEY;
        let filters = null;
        const maybeHandle = this._transformValue(handleArgument.value);
        invariant(
          maybeHandle.kind === 'Literal' &&
            typeof maybeHandle.value === 'string',
          'GraphQLParser: Expected the %s argument to @%s to be a literal ' +
            'string, got `%s` on field `%s`. Source: %s.',
          CLIENT_FIELD_HANDLE,
          CLIENT_FIELD,
          maybeHandle,
          fieldName,
          this._getErrorContext(),
        );
        name = maybeHandle.value;

        const keyArgument = (clientFieldDirective.arguments || []).find(
          arg => getName(arg) === CLIENT_FIELD_KEY,
        );
        if (keyArgument) {
          const maybeKey = this._transformValue(keyArgument.value);
          invariant(
            maybeKey.kind === 'Literal' && typeof maybeKey.value === 'string',
            'GraphQLParser: Expected %s argument to @%s to be a literal ' +
              'string, got `%s` on field `%s`. Source: %s.',
            CLIENT_FIELD_KEY,
            CLIENT_FIELD,
            maybeKey,
            fieldName,
            this._getErrorContext(),
          );
          key = maybeKey.value;
        }
        const filtersArgument = (clientFieldDirective.arguments || []).find(
          arg => getName(arg) === CLIENT_FIELD_FILTERS,
        );
        if (filtersArgument) {
          const maybeFilters = this._transformValue(filtersArgument.value);
          invariant(
            maybeFilters.kind === 'Literal' &&
              Array.isArray(maybeFilters.value) &&
              maybeFilters.value.every(filter =>
                fieldArgs.some(fieldArg => fieldArg.name === filter),
              ),
            'GraphQLParser: Expected %s argument to @%s to be an array of ' +
              'argument names on field `%s`, but get %s. Source: %s.',
            CLIENT_FIELD_FILTERS,
            CLIENT_FIELD,
            fieldName,
            maybeFilters,
            this._getErrorContext(),
          );
          // $FlowFixMe
          filters = (maybeFilters.value: Array<string>);
        }
        handles = handles || [];
        handles.push({name, key, filters});
      }
    });
    return handles;
  }

  _transformDirectives(
    directives: $ReadOnlyArray<DirectiveNode>,
  ): Array<Directive> {
    return directives.map(directive => {
      const name = getName(directive);
      const directiveDef = this._schema.getDirective(name);
      invariant(
        directiveDef,
        'GraphQLParser: Unknown directive `@%s`. Source: %s.',
        name,
        this._getErrorContext(),
      );
      const args = this._transformArguments(
        directive.arguments || [],
        directiveDef.args,
      );
      return {
        kind: 'Directive',
        metadata: null,
        name,
        args,
      };
    });
  }

  _transformArguments(
    args: $ReadOnlyArray<ArgumentNode>,
    argumentDefinitions: Array<GraphQLArgument>,
  ): Array<Argument> {
    return args.map(arg => {
      const argName = getName(arg);
      const argDef = argumentDefinitions.find(def => def.name === argName);
      invariant(
        argDef,
        'GraphQLParser: Unknown argument `%s`. Source: %s.',
        argName,
        this._getErrorContext(),
      );
      const value = this._transformValue(arg.value, argDef.type);
      return {
        kind: 'Argument',
        metadata: null,
        name: argName,
        value,
        type: argDef.type,
      };
    });
  }

  _splitConditions(
    mixedDirectives: Array<Directive>,
  ): [Array<Condition>, Array<Directive>] {
    const conditions = [];
    const directives = [];
    mixedDirectives.forEach(directive => {
      if (directive.name === INCLUDE || directive.name === SKIP) {
        const passingValue = directive.name === INCLUDE;
        const arg = directive.args[0];
        invariant(
          arg && arg.name === IF,
          'GraphQLParser: Expected an `if` argument to @%s. Source: %s.',
          directive.name,
          this._getErrorContext(),
        );
        invariant(
          arg.value.kind === 'Variable' || arg.value.kind === 'Literal',
          'GraphQLParser: Expected the `if` argument to @%s to be a variable. ' +
            'Source: %s.',
          directive.name,
          this._getErrorContext(),
        );
        conditions.push({
          kind: 'Condition',
          condition: arg.value,
          metadata: null,
          passingValue,
          selections: [],
        });
      } else {
        directives.push(directive);
      }
    });
    const sortedConditions = [...conditions].sort((a, b) => {
      if (a.condition.kind === 'Variable' && b.condition.kind === 'Variable') {
        return a.condition.variableName < b.condition.variableName
          ? -1
          : a.condition.variableName > b.condition.variableName
            ? 1
            : 0;
      } else {
        // sort literals earlier, variables later
        return a.condition.kind === 'Variable'
          ? 1
          : b.condition.kind === 'Variable'
            ? -1
            : 0;
      }
    });
    return [sortedConditions, directives];
  }

  _transformVariable(ast: VariableNode, type?: ?GraphQLInputType): Variable {
    const variableName = getName(ast);
    this._recordAndVerifyVariableReference(variableName, type);
    return {
      kind: 'Variable',
      metadata: null,
      variableName,
      type,
    };
  }

  /**
   * Transforms AST values into IR values, extracting the literal JS values of any
   * subtree of the AST that does not contain a variable.
   */
  _transformValue(ast: ValueNode, type?: ?GraphQLInputType): ArgumentValue {
    switch (ast.kind) {
      case 'IntValue':
        return {
          kind: 'Literal',
          metadata: null,
          value: parseInt(ast.value, 10),
        };
      case 'FloatValue':
        return {
          kind: 'Literal',
          metadata: null,
          value: parseFloat(ast.value),
        };
      case 'StringValue':
        return {
          kind: 'Literal',
          metadata: null,
          value: ast.value,
        };
      case 'BooleanValue':
        // Note: duplicated because Flow does not understand fall-through cases
        return {
          kind: 'Literal',
          metadata: null,
          value: ast.value,
        };
      case 'EnumValue':
        // Note: duplicated because Flow does not understand fall-through cases
        return {
          kind: 'Literal',
          metadata: null,
          value: ast.value,
        };
      case 'ListValue':
        let itemType;
        if (type) {
          const listType = getNullableType(type);
          // The user entered a list, a `type` was expected; this is only valid
          // if `type` is a List.
          invariant(
            listType instanceof GraphQLList,
            'GraphQLParser: Expected a value matching type `%s`, but ' +
              'got a list value. Source: %s.',
            type,
            this._getErrorContext(),
          );
          itemType = assertInputType(listType.ofType);
        }
        const literalList = [];
        const items = [];
        let areAllItemsScalar = true;
        ast.values.forEach(item => {
          const itemValue = this._transformValue(item, itemType);
          if (itemValue.kind === 'Literal') {
            literalList.push(itemValue.value);
          }
          items.push(itemValue);
          areAllItemsScalar = areAllItemsScalar && itemValue.kind === 'Literal';
        });
        if (areAllItemsScalar) {
          return {
            kind: 'Literal',
            metadata: null,
            value: literalList,
          };
        } else {
          return {
            kind: 'ListValue',
            metadata: null,
            items,
          };
        }
      case 'NullValue':
        return {
          kind: 'Literal',
          metadata: null,
          value: null,
        };
      case 'ObjectValue':
        const literalObject = {};
        const fields = [];
        let areAllFieldsScalar = true;
        ast.fields.forEach(field => {
          const fieldName = getName(field);
          let fieldType;
          if (type) {
            const objectType = getNullableType(type);
            // The user entered an object, a `type` was expected; this is only
            // valid if `type` is an Object.
            invariant(
              objectType instanceof GraphQLInputObjectType,
              'GraphQLParser: Expected a value matching type `%s`, but ' +
                'got an object value. Source: %s.',
              type,
              this._getErrorContext(),
            );
            const fieldConfig = objectType.getFields()[fieldName];
            invariant(
              fieldConfig,
              'GraphQLParser: Unknown field `%s` on type `%s`. Source: %s.',
              fieldName,
              type,
              this._getErrorContext(),
            );
            fieldType = assertInputType(fieldConfig.type);
          }
          const fieldValue = this._transformValue(field.value, fieldType);
          if (fieldValue.kind === 'Literal') {
            literalObject[field.name.value] = fieldValue.value;
          }
          fields.push({
            kind: 'ObjectFieldValue',
            metadata: null,
            name: fieldName,
            value: fieldValue,
          });
          areAllFieldsScalar =
            areAllFieldsScalar && fieldValue.kind === 'Literal';
        });
        if (areAllFieldsScalar) {
          return {
            kind: 'Literal',
            metadata: null,
            value: literalObject,
          };
        } else {
          return {
            kind: 'ObjectValue',
            metadata: null,
            fields,
          };
        }
      case 'Variable':
        return this._transformVariable(ast, type);
      default:
        invariant(
          false,
          'GraphQLParser: Unknown ast kind: %s. Source: %s.',
          (ast.kind: empty),
          this._getErrorContext(),
        );
    }
  }
}

function isScalarFieldType(type: GraphQLOutputType): boolean {
  const namedType = getNamedType(type);
  return (
    namedType instanceof GraphQLScalarType ||
    namedType instanceof GraphQLEnumType
  );
}

function assertScalarFieldType(type: GraphQLOutputType): ScalarFieldType {
  invariant(
    isScalarFieldType(type),
    'Expected %s to be a Scalar Field type.',
    type,
  );
  return (type: any);
}

function applyConditions(
  conditions: Array<Condition>,
  selections: Array<Selection>,
): Array<Condition | Selection> {
  let nextSelections = selections;
  conditions.forEach(condition => {
    nextSelections = [
      {
        ...condition,
        selections: nextSelections,
      },
    ];
  });
  return nextSelections;
}

function getName(ast): string {
  const name = ast.name ? ast.name.value : null;
  invariant(
    typeof name === 'string',
    'GraphQLParser: Expected ast node `%s` to have a name.',
    ast,
  );
  return name;
}

/**
 * Partitions an array given a predicate. All elements satisfying the predicate
 * are part of the first returned array, and all elements that don't are in the
 * second.
 */
function partitionArray<Tv>(
  array: $ReadOnlyArray<Tv>,
  predicate: (value: Tv, index: number, array: $ReadOnlyArray<Tv>) => boolean,
  context?: any,
): [Array<Tv>, Array<Tv>] {
  var first = [];
  var second = [];
  array.forEach((element, index) => {
    if (predicate.call(context, element, index, array)) {
      first.push(element);
    } else {
      second.push(element);
    }
  });
  return [first, second];
}

module.exports = GraphQLParser;
