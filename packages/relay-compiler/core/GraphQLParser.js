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
  GraphQLID,
  GraphQLError,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLScalarType,
  isLeafType,
  isTypeSubTypeOf,
  parse,
  parseType,
  Source,
} = require('graphql');

import type {
  Argument,
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
  ASTNode,
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
  VariableNode,
  IntValueNode,
  FloatValueNode,
  StringValueNode,
  BooleanValueNode,
  EnumValueNode,
  ListValueNode,
  ObjectValueNode,
} from 'graphql';

type ASTDefinitionNode = FragmentDefinitionNode | OperationDefinitionNode;
type NonNullLiteralValueNode =
  | IntValueNode
  | FloatValueNode
  | StringValueNode
  | BooleanValueNode
  | EnumValueNode
  | ListValueNode
  | ObjectValueNode;
type GetFieldDefinitionFn = (
  schema: GraphQLSchema,
  parentType: GraphQLOutputType,
  fieldName: string,
  fieldAST: FieldNode,
) => ?GraphQLField<mixed, mixed>;

type VariableDefinitions = Map<string, VariableDefinition>;
type VariableDefinition = {|
  ast: ASTNode,
  name: string,
  defaultValue: mixed,
  type: GraphQLInputType,
  defined: boolean,
|};

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
    const entries = new Map();
    // Construct a mapping of name to definition ast + variable definitions.
    // This allows the subsequent AST -> IR tranformation to reference the
    // defined arguments of referenced fragments.
    for (const [name, definition] of this._definitions) {
      try {
        const variableDefinitions = this._buildArgumentDefinitions(definition);
        entries.set(name, {definition, variableDefinitions});
      } catch (error) {
        if (error instanceof GraphQLError) {
          errors.push(error);
        } else {
          // Fail fast for non-user errors
          throw error;
        }
      }
    }
    // Convert the ASTs to IR.
    if (errors.length === 0) {
      for (const {definition, variableDefinitions} of entries.values()) {
        try {
          const node = parseDefinition(
            this._schema,
            this._getFieldDefinition,
            entries,
            definition,
            variableDefinitions,
          );
          nodes.push(node);
        } catch (error) {
          if (error instanceof GraphQLError) {
            errors.push(error);
          } else {
            // Fail fast for non-user errors
            throw error;
          }
        }
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

  /**
   * Constructs a mapping of variable names to definitions for the given
   * operation/fragment definition.
   */
  _buildArgumentDefinitions(
    definition: ASTDefinitionNode,
  ): VariableDefinitions {
    switch (definition.kind) {
      case 'OperationDefinition':
        return this._buildOperationArgumentDefinitions(definition);
      case 'FragmentDefinition':
        return this._buildFragmentArgumentDefinitions(definition);
      default:
        (definition: empty);
        throw createCompilerError(`Unexpected ast kind '${definition.kind}'.`, [
          definition,
        ]);
    }
  }

  /**
   * Constructs a mapping of variable names to definitions using the
   * variables defined in `@argumentDefinitions`.
   */
  _buildFragmentArgumentDefinitions(
    fragment: FragmentDefinitionNode,
  ): VariableDefinitions {
    const variableDirectives = (fragment.directives || []).filter(
      directive => getName(directive) === ARGUMENT_DEFINITIONS,
    );
    if (!variableDirectives.length) {
      return new Map();
    }
    if (variableDirectives.length !== 1) {
      throw new GraphQLError(
        `Directive @${ARGUMENT_DEFINITIONS} may be defined at most once per ` +
          'fragment.',
        variableDirectives,
      );
    }
    const variableDirective = variableDirectives[0];
    // $FlowIssue: refining directly on `variableDirective.arguments` doesn't
    // work, below accesses all report arguments could still be null/undefined.
    const args = variableDirective.arguments;
    if (variableDirective == null || !Array.isArray(args)) {
      return new Map();
    }
    if (!args.length) {
      throw new GraphQLError(
        `Directive @${ARGUMENT_DEFINITIONS} requires arguments: remove the ` +
          'directive to skip defining local variables for this fragment.',
        [variableDirective],
      );
    }
    const variables = new Map();
    args.forEach(arg => {
      const argName = getName(arg);
      const previousVariable = variables.get(argName);
      if (previousVariable != null) {
        throw new GraphQLError(
          `Duplicate definition for variable '\$${argName}'.`,
          [previousVariable.ast, arg],
        );
      }
      const value = transformLiteralValue(arg.value, arg);
      if (
        Array.isArray(value) ||
        typeof value !== 'object' ||
        value === null ||
        typeof value.type !== 'string'
      ) {
        throw new GraphQLError(
          `Expected definition for variable '\$${argName}' to be an object ` +
            "with the shape: '{type: string, defaultValue?: mixed, nonNull?: " +
            "boolean, list?: boolean}'.",
          [arg.value],
        );
      }

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
            `${unknownKeysString}.`,
          [arg],
        );
      }

      const typeAST = parseType(String(value.type));
      const type = assertInputType(getTypeFromAST(this._schema, typeAST));
      variables.set(argName, {
        ast: arg,
        defaultValue: value.defaultValue != null ? value.defaultValue : null,
        defined: true,
        name: argName,
        type,
      });
    });
    return variables;
  }

  /**
   * Constructs a mapping of variable names to definitions using the
   * standard GraphQL syntax for variable definitions.
   */
  _buildOperationArgumentDefinitions(
    operation: OperationDefinitionNode,
  ): VariableDefinitions {
    const variableDefinitions = new Map();
    (operation.variableDefinitions || []).forEach(def => {
      const name = getName(def.variable);
      const type = assertInputType(getTypeFromAST(this._schema, def.type));
      const defaultValue = def.defaultValue
        ? transformLiteralValue(def.defaultValue, def)
        : null;
      const previousDefinition = variableDefinitions.get(name);
      if (previousDefinition != null) {
        throw new GraphQLError(
          `Duplicate definition for variable '\$${name}'.`,
          [previousDefinition.ast, def],
        );
      }
      variableDefinitions.set(name, {
        ast: def,
        defaultValue,
        defined: true,
        name,
        type,
      });
    });
    return variableDefinitions;
  }
}

function parseDefinition(
  schema: GraphQLSchema,
  getFieldDefinition: GetFieldDefinitionFn,
  entries: Map<
    string,
    {|definition: ASTDefinitionNode, variableDefinitions: VariableDefinitions|},
  >,
  definition: ASTDefinitionNode,
  variableDefinitions: VariableDefinitions,
): Fragment | Root {
  const parser = new GraphQLDefinitionParser(
    schema,
    getFieldDefinition,
    entries,
    definition,
    variableDefinitions,
  );
  return parser.transform();
}

/**
 * @private
 */
class GraphQLDefinitionParser {
  _definition: ASTDefinitionNode;
  _entries: Map<
    string,
    {|
      definition: ASTDefinitionNode,
      variableDefinitions: VariableDefinitions,
    |},
  >;
  _getFieldDefinition: GetFieldDefinitionFn;
  _schema: GraphQLSchema;
  _variableDefinitions: VariableDefinitions;
  _unknownVariables: Map<string, {ast: VariableNode, type: ?GraphQLInputType}>;

  constructor(
    schema: GraphQLSchema,
    getFieldDefinition: GetFieldDefinitionFn,
    entries: Map<
      string,
      {|
        definition: ASTDefinitionNode,
        variableDefinitions: VariableDefinitions,
      |},
    >,
    definition: ASTDefinitionNode,
    variableDefinitions: VariableDefinitions,
  ): void {
    this._definition = definition;
    this._entries = entries;
    this._getFieldDefinition = getFieldDefinition;
    this._schema = schema;
    this._variableDefinitions = variableDefinitions;
    this._unknownVariables = new Map();
  }

  transform(): Root | Fragment {
    const definition = this._definition;
    switch (definition.kind) {
      case 'OperationDefinition':
        return this._transformOperation(definition);
      case 'FragmentDefinition':
        return this._transformFragment(definition);
      default:
        (definition: empty);
        throw createCompilerError(
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
    // Special case for variables used in @arguments where we currently
    // aren't guaranteed to be able to resolve the type.
    if (usedAsType == null) {
      if (
        !this._variableDefinitions.has(name) &&
        !this._unknownVariables.has(name)
      ) {
        this._unknownVariables.set(name, {
          ast: variable,
          type: null,
        });
      }
      return;
    }
    const variableDefinition = this._variableDefinitions.get(name);
    if (variableDefinition != null) {
      // If the variable is defined, all usages must be compatible
      let effectiveType = variableDefinition.type;
      if (variableDefinition.defaultValue != null) {
        // If a default value is defined then it is guaranteed to be used
        // at runtime such that the effective type of the variable is non-null
        effectiveType = new GraphQLNonNull(getNullableType(effectiveType));
      }
      if (!isTypeSubTypeOf(this._schema, effectiveType, usedAsType)) {
        throw new GraphQLError(
          `Variable '\$${name}' was defined as type '${String(
            variableDefinition.type,
          )}' but used in a location expecting the type '${String(
            usedAsType,
          )}'`,
          [variableDefinition.ast, variable],
        );
      }
    } else {
      const previous = this._unknownVariables.get(name);

      if (!previous || !previous.type) {
        // No previous usage, current type is strongest
        this._unknownVariables.set(name, {
          ast: variable,
          type: usedAsType,
        });
      } else {
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
            )}' and '${String(
              usedAsType,
            )}'. Source: ${this._getErrorContext()}`,
            [previousVariable, variable],
          );
        }

        // If the new used type has stronger requirements, use that type as reference,
        // otherwise keep referencing the previous type
        if (isTypeSubTypeOf(this._schema, usedAsType, previousType)) {
          this._unknownVariables.set(name, {
            ast: variable,
            type: usedAsType,
          });
        }
      }
    }
  }

  _transformFragment(fragment: FragmentDefinitionNode): Fragment {
    const directives = this._transformDirectives(
      (fragment.directives || []).filter(
        directive => getName(directive) !== ARGUMENT_DEFINITIONS,
      ),
    );
    const type = assertCompositeType(
      getTypeFromAST(this._schema, fragment.typeCondition),
    );
    const selections = this._transformSelections(fragment.selectionSet, type);
    const argumentDefinitions = [
      ...buildArgumentDefinitions(this._variableDefinitions),
    ];
    for (const [name, variableReference] of this._unknownVariables) {
      argumentDefinitions.push({
        kind: 'RootArgumentDefinition',
        metadata: null,
        name,
        // $FlowFixMe - could be null
        type: variableReference.type,
      });
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

  _transformOperation(definition: OperationDefinitionNode): Root {
    const name = getName(definition);
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
        throw createCompilerError(
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
    const argumentDefinitions = buildArgumentDefinitions(
      this._variableDefinitions,
    );
    if (this._unknownVariables.size !== 0) {
      throw new GraphQLError(
        `Query '${name}' references undefined variables.`,
        Array.from(
          this._unknownVariables.values(),
          variableReference => variableReference.ast,
        ),
      );
    }
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
        throw createCompilerError(
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
        throw createCompilerError(
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
    const fragmentDefinitions = this._entries.get(fragmentName);
    const fragmentVariables = fragmentDefinitions?.variableDefinitions;
    let args;
    if (argumentDirectives.length) {
      args = (argumentDirectives[0].arguments || []).map(arg => {
        const argName = getName(arg);
        const argValue = arg.value;
        const argumentDefinition =
          fragmentVariables != null ? fragmentVariables.get(argName) : null;
        const type = argumentDefinition?.type ?? null;

        if (argValue.kind === 'Variable') {
          // TODO: check the type of the variable and use the type
          return {
            kind: 'Argument',
            metadata: null,
            name: argName,
            value: this._transformVariable(argValue, null),
            type: null,
          };
        } else {
          if (type == null) {
            throw new GraphQLError(
              `Literal @${ARGUMENTS} values are only supported when the ` +
                `argument is defined with @${ARGUMENT_DEFINITIONS}. Check ` +
                `the definition of fragment '${fragmentName}'.`,
              [arg.value, this._entries.get(fragmentName)?.definition].filter(
                Boolean,
              ),
            );
          }
          const value = this._transformValue(argValue, type);
          return {
            kind: 'Argument',
            metadata: null,
            name: argName,
            value,
            type,
          };
        }
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
        const maybeHandle = transformLiteralValue(
          handleArgument.value,
          handleArgument,
        );
        if (typeof maybeHandle !== 'string') {
          throw new GraphQLError(
            `Expected a string literal argument for the @${CLIENT_FIELD} directive. ` +
              `Source: ${this._getErrorContext()}`,
            [handleArgument.value],
          );
        }
        name = maybeHandle;

        const keyArgument = (clientFieldDirective.arguments || []).find(
          arg => getName(arg) === CLIENT_FIELD_KEY,
        );
        if (keyArgument) {
          const maybeKey = transformLiteralValue(
            keyArgument.value,
            keyArgument,
          );
          if (typeof maybeKey !== 'string') {
            throw new GraphQLError(
              `Expected a string literal argument for the @${CLIENT_FIELD} directive. ` +
                `Source: ${this._getErrorContext()}`,
              [keyArgument.value],
            );
          }
          key = maybeKey;
        }
        const filtersArgument = (clientFieldDirective.arguments || []).find(
          arg => getName(arg) === CLIENT_FIELD_FILTERS,
        );
        if (filtersArgument) {
          const maybeFilters = transformLiteralValue(
            filtersArgument.value,
            filtersArgument,
          );
          if (
            !(
              Array.isArray(maybeFilters) &&
              maybeFilters.every(
                filter =>
                  typeof filter === 'string' &&
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
          filters = (maybeFilters: Array<string>);
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

  _transformVariable(
    ast: VariableNode,
    usedAsType: ?GraphQLInputType,
  ): Variable {
    const variableName = getName(ast);
    this._recordAndVerifyVariableReference(ast, variableName, usedAsType);
    return {
      kind: 'Variable',
      metadata: null,
      variableName,
      type: usedAsType,
    };
  }

  /**
   * Transforms and validates argument values according to the expected
   * type.
   */
  _transformValue(ast: ValueNode, type: GraphQLInputType): ArgumentValue {
    if (ast.kind === 'Variable') {
      // Special case variables since there is no value to parse
      return this._transformVariable(ast, type);
    } else if (ast.kind === 'NullValue') {
      // Special case null literals since there is no value to parse
      if (type instanceof GraphQLNonNull) {
        throw new GraphQLError(
          `Expected a value matching type '${String(type)}'.`,
          [ast],
        );
      }
      return {
        kind: 'Literal',
        metadata: null,
        value: null,
      };
    } else {
      return this._transformNonNullLiteral(ast, type);
    }
  }

  /**
   * Transforms and validates non-null literal (non-variable) values
   * according to the expected type.
   */
  _transformNonNullLiteral(
    ast: NonNullLiteralValueNode,
    type: GraphQLInputType,
  ): ArgumentValue {
    // Transform the value based on the type without a non-null wrapper.
    // Note that error messages should still use the original `type`
    // since that accurately describes to the user what the expected
    // type is (using nullableType would suggest that `null` is legal
    // even when it may not be, for example).
    const nullableType = getNullableType(type);
    if (nullableType instanceof GraphQLList) {
      if (ast.kind !== 'ListValue') {
        // Parse singular (non-list) values flowing into a list type
        // as scalars, ie without wrapping them in an array.
        return this._transformValue(ast, nullableType.ofType);
      }
      const itemType = assertInputType(nullableType.ofType);
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
    } else if (nullableType instanceof GraphQLInputObjectType) {
      const objectType = nullableType;
      if (ast.kind !== 'ObjectValue') {
        throw new GraphQLError(
          `Expected a value matching type '${String(type)}'.`,
          [ast],
        );
      }
      const literalObject = {};
      const fields = [];
      let areAllFieldsScalar = true;
      ast.fields.forEach(field => {
        const fieldName = getName(field);
        const fieldConfig = objectType.getFields()[fieldName];
        if (fieldConfig == null) {
          throw new GraphQLError(
            `Uknown field '${fieldName}' on type '${String(type)}'.`,
            [field],
          );
        }
        const fieldType = assertInputType(fieldConfig.type);
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
    } else if (nullableType === GraphQLID) {
      // GraphQLID's parseLiteral() always returns the string value. However
      // the int/string distinction may be important at runtime, so this
      // transform parses int/string literals into the corresponding JS types.
      if (ast.kind === 'IntValue') {
        return {
          kind: 'Literal',
          metadata: null,
          value: parseInt(ast.value, 10),
        };
      } else if (ast.kind === 'StringValue') {
        return {
          kind: 'Literal',
          metadata: null,
          value: ast.value,
        };
      } else {
        throw new GraphQLError(
          `Invalid value, expected a value matching type '${String(type)}'.`,
          [ast],
        );
      }
    } else if (
      nullableType instanceof GraphQLScalarType ||
      nullableType instanceof GraphQLEnumType
    ) {
      const value = nullableType.parseLiteral(ast);
      if (value == null) {
        // parseLiteral() should return a non-null JavaScript value
        // if the ast value is valid for the type.
        throw new GraphQLError(
          `Expected a value matching type '${String(type)}'.`,
          [ast],
        );
      }
      return {
        kind: 'Literal',
        metadata: null,
        value,
      };
    } else {
      (nullableType: empty);
      throw createCompilerError(
        `Unsupported type '${String(
          type,
        )}' for input value, expected a GraphQLList, ` +
          'GraphQLInputObjectType, GraphQLEnumType, or GraphQLScalarType.',
        [ast],
      );
    }
  }
}

function transformLiteralValue(ast: ValueNode, context: ASTNode): mixed {
  switch (ast.kind) {
    case 'IntValue':
      return parseInt(ast.value, 10);
    case 'FloatValue':
      return parseFloat(ast.value);
    case 'StringValue':
      return ast.value;
    case 'BooleanValue':
      // Note: duplicated because Flow does not understand fall-through cases
      return ast.value;
    case 'EnumValue':
      // Note: duplicated because Flow does not understand fall-through cases
      return ast.value;
    case 'ListValue':
      return ast.values.map(item => transformLiteralValue(item, context));
    case 'NullValue':
      return null;
    case 'ObjectValue': {
      const objectValue = {};
      ast.fields.forEach(field => {
        const fieldName = getName(field);
        const value = transformLiteralValue(field.value, context);
        objectValue[fieldName] = value;
      });
      return objectValue;
    }
    case 'Variable':
      throw new GraphQLError(
        'Unexpected variable where a literal (static) value is required.',
        [ast, context],
      );
    default:
      (ast.kind: empty);
      throw createCompilerError(`Unknown ast kind '${ast.kind}'.`, [ast]);
  }
}

function buildArgumentDefinitions(
  variables: VariableDefinitions,
): Array<LocalArgumentDefinition> {
  return Array.from(variables.values(), ({name, type, defaultValue}) => {
    return {
      kind: 'LocalArgumentDefinition',
      metadata: null,
      name,
      type,
      defaultValue,
    };
  });
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
    throw createCompilerError("Expected ast node to have a 'name'.", [ast]);
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

function createCompilerError(
  message: string,
  nodes?: ?$ReadOnlyArray<ASTNode>,
): Error {
  // Use GraphQLError to format the source of the error, but return a
  // plain Error to indicate that this is not an expected condition.
  const error = new GraphQLError(message, nodes ?? []);
  return new Error(`Internal Error: ${String(error)}`);
}

module.exports = GraphQLParser;
