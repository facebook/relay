/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const Profiler = require('./GraphQLCompilerProfiler');

const defaultGetFieldDefinition = require('./defaultGetFieldDefinition');
const invariant = require('invariant');

const {DEFAULT_HANDLE_KEY} = require('../util/DefaultHandleKey');
const {
  getNullableType,
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
  GraphQLError,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLScalarType,
  isLeafType,
  isTypeSubTypeOf,
  parse,
  parseType,
  Source,
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
  DefinitionNode,
  GraphQLArgument,
  GraphQLField,
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLSchema,
  InlineFragmentNode,
  OperationDefinitionNode,
  SelectionSetNode,
  ValueNode,
  VariableDefinitionNode,
  VariableNode,
} from 'graphql';

type ASTDefinitionNode = FragmentDefinitionNode | OperationDefinitionNode;
type GetFieldDefinitionFn = (
  schema: GraphQLSchema,
  parentType: GraphQLOutputType,
  fieldName: string,
  fieldAST: FieldNode,
) => ?GraphQLField<mixed, mixed>;

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
  _definitions: Map<string, ASTDefinitionNode>;
  _getFieldDefinition: GetFieldDefinitionFn;
  _schema: GraphQLSchema;

  static parse(
    schema: GraphQLSchema,
    text: string,
    filename?: string,
  ): Array<Root | Fragment> {
    const ast = parse(new Source(text, filename));
    // TODO T24511737 figure out if this is dangerous
    schema = extendSchema(schema, ast, {assumeValid: true});
    const parser = new this(schema, ast.definitions);
    return parser.transform();
  }

  /**
   * Transforms a raw GraphQL AST into a simpler representation with type
   * information.
   */
  static transform(
    schema: GraphQLSchema,
    definitions: $ReadOnlyArray<DefinitionNode>,
  ): $ReadOnlyArray<Root | Fragment> {
    return Profiler.run('GraphQLParser.transform', () => {
      const parser = new this(schema, definitions);
      return parser.transform();
    });
  }

  constructor(
    schema: GraphQLSchema,
    definitions: $ReadOnlyArray<DefinitionNode>,
    getFieldDefinition?: ?GetFieldDefinitionFn,
  ) {
    this._definitions = new Map();
    this._getFieldDefinition = getFieldDefinition || defaultGetFieldDefinition;
    this._schema = schema;

    const duplicated = new Set();
    definitions.forEach(def => {
      if (isExecutableDefinitionAST(def)) {
        const name = getName(def);
        if (this._definitions.has(name)) {
          duplicated.add(name);
          return;
        }
        this._definitions.set(name, def);
      }
    });
    if (duplicated.size) {
      throw new Error(
        'GraphQLParser: Encountered duplicate defintitions for one or more ' +
          'documents: each document must have a unique name. Duplicated documents:\n' +
          Array.from(duplicated, name => `- ${name}`).join('\n'),
      );
    }
  }

  transform(): Array<Root | Fragment> {
    const errors = [];
    const nodes = [];
    for (const definition of this._definitions.values()) {
      try {
        const node = parseDefinition(
          this._schema,
          definition,
          this._getFieldDefinition,
        );
        nodes.push(node);
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length !== 0) {
      throw new Error(
        `GraphQLParser: Encountered ${errors.length} error(s):\n` +
          errors
            .map(error =>
              String(error)
                .split('\n')
                .map((line, index) => (index === 0 ? `- ${line}` : `  ${line}`))
                .join('\n'),
            )
            .join('\n'),
      );
    }
    return nodes;
  }
}

function parseDefinition(
  schema: GraphQLSchema,
  definition: ASTDefinitionNode,
  getFieldDefinition: GetFieldDefinitionFn,
): Fragment | Root {
  const parser = new GraphQLDefinitionParser(
    schema,
    definition,
    getFieldDefinition,
  );
  return parser.transform();
}

/**
 * @private
 */
class GraphQLDefinitionParser {
  _definition: ASTDefinitionNode;
  _getFieldDefinition: GetFieldDefinitionFn;
  _referencedVariableTypesByName: {
    [name: string]: {ast: VariableNode, type: ?GraphQLInputType},
  };
  _schema: GraphQLSchema;

  constructor(
    schema: GraphQLSchema,
    definition: ASTDefinitionNode,
    getFieldDefinition: GetFieldDefinitionFn,
  ): void {
    this._definition = definition;
    this._getFieldDefinition = getFieldDefinition;
    this._referencedVariableTypesByName = {};
    this._schema = schema;
  }

  transform(): Root | Fragment {
    const definition = this._definition;
    switch (definition.kind) {
      case 'OperationDefinition':
        return this._transformOperation(definition);
      case 'FragmentDefinition':
        return this._transformFragment(definition);
      default:
        throw new GraphQLError(
          `Unsupported definition type ${definition.kind}`,
          [definition],
        );
    }
  }

  _getErrorContext(): string {
    let message = `document \`${getName(this._definition)}\``;
    if (this._definition.loc && this._definition.loc.source) {
      message += ` file: \`${this._definition.loc.source.name}\``;
    }
    return message;
  }

  _recordAndVerifyVariableReference(
    variable: VariableNode,
    name: string,
    usedAsType: ?GraphQLInputType,
  ): void {
    const previous = this._referencedVariableTypesByName[name];

    if (!previous || !previous.type) {
      // No previous usage, current type is strongest
      this._referencedVariableTypesByName[name] = {
        ast: variable,
        type: usedAsType,
      };
    } else if (usedAsType) {
      const {type: previousType, ast: previousVariable} = previous;
      if (
        !(
          isTypeSubTypeOf(this._schema, usedAsType, previousType) ||
          isTypeSubTypeOf(this._schema, previousType, usedAsType)
        )
      ) {
        throw new GraphQLError(
          `Variable '\$${name}' was used in locations expecting the conflicting types '${String(
            previousType,
          )}' and '${String(usedAsType)}'. Source: ${this._getErrorContext()}`,
          [previousVariable, variable],
        );
      }

      // If the new used type has stronger requirements, use that type as reference,
      // otherwise keep referencing the previous type
      if (isTypeSubTypeOf(this._schema, usedAsType, previousType)) {
        this._referencedVariableTypesByName[name] = {
          ast: variable,
          type: usedAsType,
        };
      }
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
        const variableReference = this._referencedVariableTypesByName[name];
        const localArgument = argumentDefinitions.find(
          argDef => argDef.name === name,
        );
        if (localArgument) {
          if (
            variableReference != null &&
            variableReference.type != null &&
            !isTypeSubTypeOf(
              this._schema,
              localArgument.type,
              variableReference.type,
            )
          ) {
            throw new GraphQLError(
              `Variable '\$${name}' was defined as type '${String(
                localArgument.type,
              )}' but used in a location that expects type '${String(
                variableReference.type,
              )}'. Source: ${this._getErrorContext()}`,
              [variableReference.ast],
            );
          }
        } else {
          argumentDefinitions.push({
            kind: 'RootArgumentDefinition',
            metadata: null,
            name,
            // $FlowFixMe - could be null
            type: variableReference ? variableReference.type : null,
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
    if (variableDirectives.length !== 1) {
      throw new GraphQLError(
        `Directive @${ARGUMENT_DEFINITIONS} may be defined at most once per ` +
          `fragment. Source: ${this._getErrorContext()}.`,
        variableDirectives,
      );
    }
    const variableDirective = variableDirectives[0];
    // $FlowIssue: refining directly on `variableDirective.arguments` doesn't
    // work, below accesses all report arguments could still be null/undefined.
    const args = variableDirective.arguments;
    if (variableDirective == null || !Array.isArray(args)) {
      return [];
    }
    if (!args.length) {
      throw new GraphQLError(
        `Directive @${ARGUMENT_DEFINITIONS} requires arguments: remove the ` +
          'directive to skip defining local variables for this fragment. ' +
          `Source: ${this._getErrorContext()}.`,
        [variableDirective],
      );
    }
    return args.map(arg => {
      const argName = getName(arg);
      const argValue = this._transformValue(arg.value);
      if (argValue.kind !== 'Literal') {
        throw new GraphQLError(
          `Expected definition for variable '\$${argName}' to be an object ` +
            "with the following shape: '{type: string, defaultValue: mixed}'. " +
            `Source: ${this._getErrorContext()}`,
          [arg.value],
        );
      }
      const value = argValue.value;
      if (
        Array.isArray(value) ||
        typeof value !== 'object' ||
        value === null ||
        typeof value.type !== 'string'
      ) {
        throw new GraphQLError(
          `Expected definition for variable '\$${argName}' to be an object ` +
            "with the shape: '{type: string, defaultValue?: mixed, nonNull?: " +
            `boolean, list?: boolean}'. Source: ${this._getErrorContext()}.`,
          [arg.value],
        );
      }

      const valueType = value.type;

      const unknownKeys = Object.keys(value).filter(
        key =>
          key !== 'type' &&
          key !== 'defaultValue' &&
          key !== 'nonNull' &&
          key !== 'list',
      );
      if (unknownKeys.length !== 0) {
        const unknownKeysString = "'" + unknownKeys.join("', '") + "'";
        throw new GraphQLError(
          `Expected definition for variable '\$${argName}' to be an object ` +
            "with the following shape: '{type: string, defaultValue?: mixed, " +
            "nonNull?: boolean, list?: boolean}', got unknown key(s) " +
            `${unknownKeysString}. Source: ${this._getErrorContext()}.`,
          [arg],
        );
      }

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
        (definition.operation: empty);
        throw new GraphQLError(
          `Unknown ast kind '${
            definition.operation
          }'. Source: ${this._getErrorContext()}.`,
          [definition],
        );
    }
    if (!definition.selectionSet) {
      throw new GraphQLError(
        `Expected operation to have selections. Source: ${this._getErrorContext()}`,
        [definition],
      );
    }
    const selections = this._transformSelections(definition.selectionSet, type);
    return {
      kind: 'Root',
      operation,
      metadata: null,
      name,
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
        ? this._transformValue(def.defaultValue, type)
        : null;
      if (this._referencedVariableTypesByName.hasOwnProperty(name)) {
        const variableReference = this._referencedVariableTypesByName[name];
        if (
          variableReference != null &&
          variableReference.type != null &&
          !isTypeSubTypeOf(this._schema, type, variableReference.type)
        ) {
          throw new GraphQLError(
            `Variable '\$${name}' was defined as type '${String(
              type,
            )}' but used in a location that expects type '${String(
              variableReference.type,
            )}'. Source: ${this._getErrorContext()}`,
            [def, variableReference.ast],
          );
        }
      }
      if (defaultLiteral != null && defaultLiteral.kind !== 'Literal') {
        throw new GraphQLError(
          "Expected argument default value to be a literal or 'null'. " +
            `Source: ${this._getErrorContext()}`,
          [def.defaultValue ?? def],
        );
      }
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
        (selection.kind: empty);
        throw new GraphQLError(
          `Unknown ast kind '${
            selection.kind
          }'. Source: ${this._getErrorContext()}.`,
          [selection],
        );
      }
      const [conditions, directives] = this._splitConditions(node.directives);
      const conditionalNodes = applyConditions(
        conditions,
        // $FlowFixMe(>=0.28.0)
        [{...node, directives}],
      );
      if (conditionalNodes.length !== 1) {
        throw new GraphQLError(
          `Expected exactly one condition node. Source: ${this._getErrorContext()}`,
          selection.directives,
        );
      }
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
    fragmentSpread: FragmentSpreadNode,
    parentType: GraphQLOutputType,
  ): FragmentSpread {
    const fragmentName = getName(fragmentSpread);
    const [otherDirectives, argumentDirectives] = partitionArray(
      fragmentSpread.directives || [],
      directive => getName(directive) !== ARGUMENTS,
    );
    if (argumentDirectives.length > 1) {
      throw new GraphQLError(
        `Directive @${ARGUMENTS} may be used at most once per a fragment spread. ` +
          `Source: ${this._getErrorContext()}`,
        argumentDirectives,
      );
    }
    let args;
    if (argumentDirectives.length) {
      args = (argumentDirectives[0].arguments || []).map(arg => {
        const argName = getName(arg);
        const argValue = arg.value;
        if (argValue.kind !== 'Variable') {
          throw new GraphQLError(
            `All @${ARGUMENTS} values must be variables. Source: ${this._getErrorContext()}`,
            [arg.value],
          );
        }
        return {
          kind: 'Argument',
          metadata: null,
          name: argName,
          value: this._transformVariable(argValue),
          type: null,
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
    const fieldDef = this._getFieldDefinition(
      this._schema,
      parentType,
      name,
      field,
    );

    if (fieldDef == null) {
      throw new GraphQLError(
        `Unknown field '${name}' on type '${String(
          parentType,
        )}'. Source: ${this._getErrorContext()}`,
        [field],
      );
    }
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
      if (
        field.selectionSet &&
        field.selectionSet.selections &&
        field.selectionSet.selections.length
      ) {
        throw new GraphQLError(
          `Expected no selections for scalar field '${name}'. Source: ${this._getErrorContext()}`,
          [field],
        );
      }
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
      if (selections == null || selections.length === 0) {
        throw new GraphQLError(
          `Expected at least one selection for non-scalar field '${name}' on type '${String(
            type,
          )}'. Source: ${this._getErrorContext()}.`,
          [field],
        );
      }
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
    fieldArgs: $ReadOnlyArray<Argument>,
    clientFieldDirectives: $ReadOnlyArray<DirectiveNode>,
  ): ?$ReadOnlyArray<Handle> {
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
        if (
          maybeHandle.kind !== 'Literal' ||
          typeof maybeHandle.value !== 'string'
        ) {
          throw new GraphQLError(
            `Expected a string literal argument for the @${CLIENT_FIELD} directive. ` +
              `Source: ${this._getErrorContext()}`,
            [handleArgument.value],
          );
        }
        name = maybeHandle.value;

        const keyArgument = (clientFieldDirective.arguments || []).find(
          arg => getName(arg) === CLIENT_FIELD_KEY,
        );
        if (keyArgument) {
          const maybeKey = this._transformValue(keyArgument.value);
          if (
            maybeKey.kind !== 'Literal' ||
            typeof maybeKey.value !== 'string'
          ) {
            throw new GraphQLError(
              `Expected a string literal argument for the @${CLIENT_FIELD} directive. ` +
                `Source: ${this._getErrorContext()}`,
              [keyArgument.value],
            );
          }
          key = maybeKey.value;
        }
        const filtersArgument = (clientFieldDirective.arguments || []).find(
          arg => getName(arg) === CLIENT_FIELD_FILTERS,
        );
        if (filtersArgument) {
          const maybeFilters = this._transformValue(filtersArgument.value);
          if (
            !(
              maybeFilters.kind === 'Literal' &&
              Array.isArray(maybeFilters.value) &&
              maybeFilters.value.every(filter =>
                fieldArgs.some(fieldArg => fieldArg.name === filter),
              )
            )
          ) {
            throw new GraphQLError(
              `Expected an array of argument names on field '${fieldName}'. ` +
                `Source: ${this._getErrorContext()}`,
              [filtersArgument.value],
            );
          }
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
      if (directiveDef == null) {
        throw new GraphQLError(
          `Unknown directive '${name}'. Source: ${this._getErrorContext()}`,
          [directive],
        );
      }
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
      if (argDef == null) {
        throw new GraphQLError(
          `Unknown argument '${argName}'. Source: ${this._getErrorContext()}`,
          [arg],
        );
      }
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
    mixedDirectives: $ReadOnlyArray<Directive>,
  ): [$ReadOnlyArray<Condition>, $ReadOnlyArray<Directive>] {
    const [conditionDirectives, otherDirectives] = partitionArray(
      mixedDirectives,
      directive => directive.name === INCLUDE || directive.name === SKIP,
    );
    const conditions = conditionDirectives.map(directive => {
      const passingValue = directive.name === INCLUDE;
      const arg = directive.args[0];
      if (arg == null || arg.name !== IF) {
        throw new GraphQLError(
          `Expected an 'if' argument to @${
            directive.name
          }. Source: ${this._getErrorContext()}`,
          [], // TODO: get DirectiveNode
        );
      }
      if (!(arg.value.kind === 'Variable' || arg.value.kind === 'Literal')) {
        throw new GraphQLError(
          `Expected the 'if' argument to @${
            directive.name
          } to be a variable or literal. Source: ${this._getErrorContext()}`,
          [], // TODO: get DirectiveNode
        );
      }
      return {
        kind: 'Condition',
        condition: arg.value,
        metadata: null,
        passingValue,
        selections: [],
      };
    });
    const sortedConditions = conditions.sort((a, b) => {
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
    return [sortedConditions, otherDirectives];
  }

  _transformVariable(ast: VariableNode, type?: ?GraphQLInputType): Variable {
    const variableName = getName(ast);
    this._recordAndVerifyVariableReference(ast, variableName, type);
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
          if (!(listType instanceof GraphQLList)) {
            throw new GraphQLError(
              `Expected a value matching type '${String(
                type || 'GraphQLList<_>',
              )}'. Source: ${this._getErrorContext()}`,
              [ast],
            );
          }
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
            if (!(objectType instanceof GraphQLInputObjectType)) {
              throw new GraphQLError(
                `Expected a value matching type '${String(
                  type || 'GraphQLInputObjectType<_>',
                )}'. Source: ${this._getErrorContext()}`,
                [ast],
              );
            }
            const fieldConfig = objectType.getFields()[fieldName];
            if (fieldConfig == null) {
              throw new GraphQLError(
                `Uknown field '${fieldName}' on type '${String(
                  type,
                )}'. Source: ${this._getErrorContext()}`,
                [field],
              );
            }
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
        (ast.kind: empty);
        throw new GraphQLError(
          `Unknown ast kind '${ast.kind}'. Source: ${this._getErrorContext()}.`,
          [ast],
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
  if (!isScalarFieldType(type)) {
    throw new GraphQLError(
      `Expected a scalar field type, got type '${String(type)}'.`,
    );
  }
  return (type: any);
}

function applyConditions(
  conditions: $ReadOnlyArray<Condition>,
  selections: $ReadOnlyArray<Selection>,
): $ReadOnlyArray<Condition | Selection> {
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
  const name = ast.name?.value;
  if (typeof name !== 'string') {
    throw new GraphQLError("Expected ast node to have a 'name'.", [ast]);
  }
  return name;
}

/**
 * Partitions an array given a predicate. All elements satisfying the predicate
 * are part of the first returned array, and all elements that don't are in the
 * second.
 */
function partitionArray<Tv>(
  array: $ReadOnlyArray<Tv>,
  predicate: (value: Tv) => boolean,
): [Array<Tv>, Array<Tv>] {
  const first = [];
  const second = [];
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    if (predicate(item)) {
      first.push(item);
    } else {
      second.push(item);
    }
  }
  return [first, second];
}

module.exports = GraphQLParser;
