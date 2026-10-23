/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

import type {BabelState} from './BabelPluginRelay';
import type {
  ASTNode,
  DocumentNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
} from 'graphql';

// $FlowFixMe[cannot-resolve-module]
const crypto = require('crypto');
const {print} = require('graphql');
const {
  dirname,
  join: joinPath,
  relative: relativePath,
  resolve: resolvePath,
  // $FlowFixMe[cannot-resolve-module]
} = require('path');

const GENERATED = './__generated__/';

function printForHash(node: ASTNode): string {
  return match (node) {
    {kind: 'OperationDefinition', ...} as const current =>
      printOperationForHash(current),
    {kind: 'VariableDefinition', ...} as const current =>
      printForHash(current.variable) +
        ': ' +
        printForHash(current.type) +
        wrap(
          ' = ',
          current.defaultValue == null
            ? ''
            : printForHash(current.defaultValue),
        ) +
        wrap(' ', printNodes(current.directives, ' ')),
    {kind: 'SelectionSet', ...} as const current =>
      wrap(
        '{\n',
        wrap('  ', printNodes(current.selections, '\n').replace(/\n/g, '\n  ')),
        '\n}',
      ),
    {kind: 'Field', ...} as const current =>
      joinStrings(
        [
          wrap('', current.alias?.value, ': ') +
            current.name.value +
            wrap('(', printNodes(current.arguments, ', '), ')'),
          printNodes(current.directives, ' '),
          current.selectionSet == null
            ? ''
            : printForHash(current.selectionSet),
        ],
        ' ',
      ),
    {
      kind: 'Argument' | 'FragmentArgument' | 'ObjectField',
      ...
    } as const current =>
      current.name.value + ': ' + printForHash(current.value),
    {kind: 'FragmentSpread', ...} as const current =>
      '...' +
        current.name.value +
        wrap('(', printNodes(current.arguments, ', '), ')') +
        wrap(' ', printNodes(current.directives, ' ')),
    {kind: 'InlineFragment', ...} as const current =>
      joinStrings(
        [
          '...',
          wrap('on ', current.typeCondition?.name.value),
          printNodes(current.directives, ' '),
          printForHash(current.selectionSet),
        ],
        ' ',
      ),
    {kind: 'FragmentDefinition', ...} as const current =>
      'fragment ' +
        current.name.value +
        wrap('(', printNodes(current.variableDefinitions, ', '), ')') +
        ' on ' +
        current.typeCondition.name.value +
        ' ' +
        wrap('', printNodes(current.directives, ' '), ' ') +
        printForHash(current.selectionSet),
    {kind: 'ListValue', ...} as const current =>
      '[' + printNodes(current.values, ', ') + ']',
    {kind: 'ObjectValue', ...} as const current =>
      '{' + printNodes(current.fields, ', ') + '}',
    {kind: 'Directive', ...} as const current =>
      '@' +
        current.name.value +
        wrap('(', printNodes(current.arguments, ', '), ')'),
    {kind: 'StringValue', ...} as const current =>
      current.block === true
        ? printBlockStringForHash(current.value)
        : (JSON.stringify(current.value) ?? '""'),
    _ as const current => print(current),
  };
}

function printOperationForHash(node: OperationDefinitionNode): string {
  const prefix = joinStrings(
    [
      node.operation,
      joinStrings([
        node.name?.value,
        wrap('(', printNodes(node.variableDefinitions, ', '), ')'),
      ]),
      printNodes(node.directives, ' '),
    ],
    ' ',
  );
  return (
    (prefix === 'query' ? '' : prefix + ' ') + printForHash(node.selectionSet)
  );
}

function printBlockStringForHash(value: string): string {
  const singleLine = !value.includes('\n');
  const multiline = !singleLine || value.endsWith('"') || value.endsWith('\\');
  let result = '';
  if (
    multiline &&
    !(singleLine && (value.startsWith(' ') || value.startsWith('\t')))
  ) {
    result += '\n  ';
  }
  result += value.replace(/\n/g, '\n  ');
  if (multiline) {
    result += '\n';
  }
  return '"""' + result.replace(/"""/g, '\\"""') + '"""';
}

function printNodes(nodes: ?ReadonlyArray<ASTNode>, separator: string): string {
  return nodes?.map(printForHash).join(separator) ?? '';
}

function joinStrings(
  parts: ReadonlyArray<?string>,
  separator: string = '',
): string {
  return parts.filter(part => part != null && part !== '').join(separator);
}

function wrap(start: string, value: ?string, end: string = ''): string {
  if (value == null || value === '') {
    return '';
  }
  return start + value + end;
}

/**
 * Converts backslashes in a path to forward slashes (POSIX style) for
 * cross-platform compatibility.
 */
function posixifyPath(path: string): string {
  // $FlowFixMe[cannot-resolve-name]
  return process.platform === 'win32' ? path.replace(/\\/g, '/') : path;
}

/**
 * Given a graphql`` tagged template literal, replace it with the appropriate
 * runtime artifact.
 */
function compileGraphQLTag(
  t: $FlowFixMe,
  path: any,
  state: BabelState,
  ast: DocumentNode,
): void {
  if (ast.definitions.length !== 1) {
    throw new Error(
      'BabelPluginRelay: Expected exactly one definition per graphql tag.',
    );
  }
  const definition = ast.definitions[0];
  if (
    definition.kind !== 'FragmentDefinition' &&
    definition.kind !== 'OperationDefinition'
  ) {
    throw new Error(
      'BabelPluginRelay: Expected a fragment, mutation, query, or ' +
        'subscription, got `' +
        definition.kind +
        '`.',
    );
  }

  const eagerEsModules = state.opts?.eagerEsModules ?? true;
  const isHasteMode = state.opts?.jsModuleFormat === 'haste';
  const isDevVariable = state.opts?.isDevVariableName;
  const artifactDirectory = state.opts?.artifactDirectory;
  const buildCommand = state.opts?.codegenCommand ?? 'relay-compiler';
  // Fallback is 'true'
  const isDevelopment =
    // $FlowFixMe[cannot-resolve-name]
    (process.env.BABEL_ENV || process.env.NODE_ENV) !== 'production';

  return createNode(t, state, path, definition, {
    artifactDirectory,
    buildCommand,
    eagerEsModules,
    isDevelopment,
    isDevVariable,
    isHasteMode,
  });
}

/**
 * The Relay compiler generates separate modules that contain the compiled code.
 * Here we generate:
 *  - a memoized `require` call for that generated code
 *  - for development mode, runtime validation that the artifacts are up to date
 */
function createNode(
  t: $FlowFixMe,
  state: BabelState,
  path: $FlowFixMe,
  graphqlDefinition: OperationDefinitionNode | FragmentDefinitionNode,
  options: {
    // If an output directory is specified when running relay-compiler this should point to that directory
    artifactDirectory: ?string,
    // Generate eager es modules instead of lazy require
    eagerEsModules: boolean,
    // The command to run to compile Relay files, used for error messages.
    buildCommand: string,
    // Generate extra validation, defaults to true.
    isDevelopment: boolean,
    // Wrap the validation code in a conditional checking this variable.
    isDevVariable: ?string,
    // Use haste style global requires, defaults to false.
    isHasteMode: boolean,
  },
): any {
  const definitionName = graphqlDefinition.name && graphqlDefinition.name.value;
  if (!definitionName) {
    throw new Error('GraphQL operations and fragments must contain names');
  }
  const requiredFile = definitionName + '.graphql';
  const requiredPath = posixifyPath(
    options.isHasteMode
      ? requiredFile
      : options.artifactDirectory
        ? getRelativeImportPath(state, options.artifactDirectory, requiredFile)
        : GENERATED + requiredFile,
  );

  const hash = crypto
    .createHash('md5')
    .update(printForHash(graphqlDefinition), 'utf8')
    .digest('hex');

  let topScope = path.scope;
  while (topScope.parent) {
    topScope = topScope.parent;
  }

  const id = topScope.generateUidIdentifier(definitionName);

  const expHash = t.MemberExpression(t.cloneNode(id), t.Identifier('hash'));
  const expWarn = warnNeedsRebuild(t, definitionName, options.buildCommand);
  const expWarnIfOutdated = t.LogicalExpression(
    '&&',
    t.cloneNode(expHash),
    t.LogicalExpression(
      '&&',
      t.BinaryExpression('!==', expHash, t.StringLiteral(hash)),
      expWarn,
    ),
  );

  if (options.eagerEsModules) {
    const importDeclaration = t.ImportDeclaration(
      [t.ImportDefaultSpecifier(id)],
      t.StringLiteral(requiredPath),
    );
    const program = path.findParent(parent => parent.isProgram());
    program.unshiftContainer('body', importDeclaration);

    const expAssignAndCheck = t.SequenceExpression([
      expWarnIfOutdated,
      t.cloneNode(id),
    ]);

    let expAssign;
    if (options.isDevVariable != null) {
      expAssign = t.ConditionalExpression(
        t.Identifier(options.isDevVariable),
        expAssignAndCheck,
        t.cloneNode(id),
      );
    } else if (options.isDevelopment) {
      expAssign = expAssignAndCheck;
    } else {
      expAssign = t.cloneNode(id);
    }

    path.replaceWith(expAssign);
  } else {
    topScope.push({id: t.cloneNode(id)});

    const requireGraphQLModule = t.CallExpression(t.Identifier('require'), [
      t.StringLiteral(requiredPath),
    ]);

    const expAssignProd = t.AssignmentExpression(
      '=',
      t.cloneNode(id),
      requireGraphQLModule,
    );
    const expAssignAndCheck = t.SequenceExpression([
      expAssignProd,
      expWarnIfOutdated,
      t.cloneNode(id),
    ]);

    let expAssign;
    if (options.isDevVariable != null) {
      expAssign = t.ConditionalExpression(
        t.Identifier(options.isDevVariable),
        expAssignAndCheck,
        expAssignProd,
      );
    } else if (options.isDevelopment) {
      expAssign = expAssignAndCheck;
    } else {
      expAssign = expAssignProd;
    }

    const expVoid0 = t.UnaryExpression('void', t.NumericLiteral(0));
    path.replaceWith(
      t.ConditionalExpression(
        t.BinaryExpression('!==', t.cloneNode(id), expVoid0),
        t.cloneNode(id),
        t.cloneNode(expAssign),
      ),
    );
  }
}

function warnNeedsRebuild(
  t: $FlowFixMe,
  definitionName: string,
  buildCommand: string,
) {
  return t.callExpression(
    t.memberExpression(t.identifier('console'), t.identifier('error')),
    [
      t.stringLiteral(
        `The definition of '${definitionName}' appears to have changed. Run ` +
          '`' +
          buildCommand +
          '` to update the generated files to receive the expected data.',
      ),
    ],
  );
}

function getRelativeImportPath(
  state: BabelState,
  artifactDirectory: string,
  fileToRequire: string,
): string {
  if (state.file == null) {
    throw new Error('Babel state is missing expected file name');
  }
  const filename = state.file.opts.filename;

  const relative = relativePath(
    dirname(filename),
    resolvePath(artifactDirectory),
  );

  const relativeReference =
    relative.length === 0 || !relative.startsWith('.') ? './' : '';

  return relativeReference + joinPath(relative, fileToRequire);
}

module.exports = compileGraphQLTag;
