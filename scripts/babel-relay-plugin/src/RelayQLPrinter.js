/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @fullSyntaxTransform
 */

'use strict';

const {
  RelayQLArgument,
  RelayQLArgumentType,
  RelayQLDefinition,
  RelayQLDirective,
  RelayQLField,
  RelayQLFragment,
  RelayQLFragmentSpread,
  RelayQLInlineFragment,
  RelayQLMutation,
  RelayQLQuery,
  RelayQLType,
} = require('./RelayQLAST');

const find = require('./find');
const invariant = require('./invariant');
const t = require('babel-types/lib/');

export type Printable = Object;
export type Substitution = {
  name: string;
  value: Printable;
};

const NULL = t.nullLiteral();

class RelayQLPrinter {
  documentHash: string;
  tagName: string;
  variableNames: {[variableName: string]: void};

  constructor(
    documentHash: string,
    tagName: string,
    variableNames: {[variableName: string]: void}
  ) {
    this.documentHash = documentHash;
    this.tagName = tagName;
    this.variableNames = variableNames;
  }

  print(
    definition: RelayQLDefinition,
    substitutions: Array<Substitution>
  ): Printable {
    let printedDocument;
    if (definition instanceof RelayQLQuery) {
      printedDocument = this.printQuery(definition);
    } else if (definition instanceof RelayQLFragment) {
      printedDocument = this.printFragment(definition);
    } else if (definition instanceof RelayQLMutation) {
      printedDocument = this.printMutation(definition);
    } else {
      invariant(false, 'Unsupported definition: %s', definition);
    }
    return t.callExpression(
      t.functionExpression(
        null,
        substitutions.map(substitution => t.identifier(substitution.name)),
        t.blockStatement([
          t.returnStatement(printedDocument),
        ])
      ),
      substitutions.map(substitution => substitution.value)
    );
  }

  printQuery(query: RelayQLQuery): Printable {
    const rootFields = query.getFields();
    invariant(
      rootFields.length === 1,
      'There are %d fields supplied to the query named `%s`, but queries ' +
      'must have exactly one field.',
      rootFields.length,
      query.getName()
    );
    const rootField = rootFields[0];
    const rootFieldType = rootField.getType();
    const rootFieldArgs = rootField.getArguments();

    const requisiteFields = {};
    const identifyingFieldDef = rootFieldType.getIdentifyingFieldDefinition();
    if (identifyingFieldDef) {
      requisiteFields[identifyingFieldDef.getName()] = true;
    }
    if (rootFieldType.isAbstract()) {
      requisiteFields.__typename = true;
    }
    const selections = this.printSelections(rootField, requisiteFields);
    const metadata = {};
    if (rootFieldType.isList()) {
      metadata.isPlural = true;
    }
    invariant(
      rootFieldArgs.length <= 1,
      'Invalid root field `%s`; Relay only supports root fields with zero ' +
      'or one argument.',
      rootField.getName()
    );
    let calls = NULL;
    if (rootFieldArgs.length === 1) {
      // Until such time as a root field's 'identifying argument' (one that has
      // a 1-1 correspondence with a Relay record, or null) has a formal type,
      // assume that the lone arg in a root field's call is the identifying one.
      const identifyingArg = rootFieldArgs[0];
      metadata.identifyingArgName = identifyingArg.getName();
      metadata.identifyingArgType =
        this.printArgumentTypeForMetadata(identifyingArg.getType());
      calls = t.arrayExpression([codify({
        kind: t.valueToNode('Call'),
        metadata: objectify({
          type: this.printArgumentTypeForMetadata(identifyingArg.getType()),
        }),
        name: t.valueToNode(identifyingArg.getName()),
        value: this.printArgumentValue(identifyingArg),
      })]);
    }

    return codify({
      calls,
      children: selections,
      directives: this.printDirectives(rootField.getDirectives()),
      fieldName: t.valueToNode(rootField.getName()),
      kind: t.valueToNode('Query'),
      metadata: objectify(metadata),
      name: t.valueToNode(query.getName()),
    });
  }

  printFragment(fragment: RelayQLFragment): Printable {
    const fragmentType = fragment.getType();

    const requisiteFields = {};
    if (fragmentType.hasField('id')) {
      requisiteFields.id = true;
    }
    if (fragmentType.isAbstract()) {
      requisiteFields.__typename = true;
    }
    const selections = this.printSelections(fragment, requisiteFields);
    const metadata = this.printRelayDirectiveMetadata(fragment, {
      isConcrete: !fragmentType.isAbstract(),
    });

    return codify({
      children: selections,
      directives: this.printDirectives(fragment.getDirectives()),
      hash: t.valueToNode(this.documentHash),
      kind: t.valueToNode('Fragment'),
      metadata,
      name: t.valueToNode(fragment.getName()),
      type: t.valueToNode(fragmentType.getName({modifiers: true})),
    });
  }

  printMutation(mutation: RelayQLMutation): Printable {
    const rootFields = mutation.getFields();
    invariant(
      rootFields.length === 1,
      'There are %d fields supplied to the mutation named `%s`, but ' +
      'mutations must have exactly one field.',
      rootFields.length,
      mutation.getName()
    );
    const rootField = rootFields[0];
    const rootFieldType = rootField.getType();
    validateMutationField(rootField);
    const requisiteFields = {clientMutationId: true};
    const selections = this.printSelections(rootField, requisiteFields);
    const metadata = {
      inputType: this.printArgumentTypeForMetadata(
        rootField.getDeclaredArgument('input')
      ),
    };

    return codify({
      calls: t.arrayExpression([
        codify({
          kind: t.valueToNode('Call'),
          metadata: objectify({}),
          name: t.valueToNode(rootField.getName()),
          value: this.printVariable('input'),
        }),
      ]),
      children: selections,
      directives: this.printDirectives(mutation.getDirectives()),
      kind: t.valueToNode('Mutation'),
      metadata: objectify(metadata),
      name: t.valueToNode(mutation.getName()),
      responseType: t.valueToNode(rootFieldType.getName({modifiers: true})),
    });
  }

  printSelections(
    parent: RelayQLField | RelayQLFragment,
    requisiteFields: {[fieldName: string]: boolean}
  ): Printable {
    const fields = [];
    const printedFragments = [];
    parent.getSelections().forEach(selection => {
      if (selection instanceof RelayQLFragmentSpread) {
        // Assume that all spreads exist via template substitution.
        invariant(
          selection.getDirectives().length === 0,
          'Directives are not yet supported for `${fragment}`-style fragment ' +
          'references.'
        );
        printedFragments.push(this.printFragmentReference(selection));
      } else if (selection instanceof RelayQLInlineFragment) {
        printedFragments.push(this.printFragment(selection.getFragment()));
      } else if (selection instanceof RelayQLField) {
        fields.push(selection);
      } else {
        invariant(false, 'Unsupported selection type `%s`.', selection);
      }
    });
    const printedFields = this.printFields(fields, parent, requisiteFields);
    const selections = [...printedFields, ...printedFragments];

    if (selections.length) {
      return t.arrayExpression(selections);
    }
    return NULL;
  }

  printFields(
    fields: Array<RelayQLField>,
    parent: RelayQLField | RelayQLFragment,
    requisiteFields: {[fieldName: string]: boolean}
  ): Array<Printable> {
    const parentType = parent.getType();
    if (parentType.isConnection() &&
        parentType.hasField('pageInfo') &&
        fields.some(field => field.getName() === 'edges')) {
      requisiteFields.pageInfo = true;
    }

    const generatedFields = {...requisiteFields};

    const printedFields = [];
    fields.forEach(field => {
      delete generatedFields[field.getName()];
      printedFields.push(
        this.printField(field, parent, requisiteFields, generatedFields)
      );
    });

    Object.keys(generatedFields).forEach(fieldName => {
      const generatedField = parentType.generateField(fieldName);
      printedFields.push(
        this.printField(
          generatedField,
          parent,
          requisiteFields,
          generatedFields
        )
      );
    });
    return printedFields;
  }

  printField(
    field: RelayQLField,
    parent: RelayQLField | RelayQLFragment,
    requisiteSiblings: {[fieldName: string]: boolean},
    generatedSiblings: {[fieldName: string]: boolean}
  ): Printable {
    const fieldType = field.getType();

    const metadata: {
      inferredPrimaryKey?: ?string;
      inferredRootCallName?: ?string;
      isConnection?: boolean;
      isFindable?: boolean;
      isGenerated?: boolean;
      isPlural?: boolean;
      isRequisite?: boolean;
      isUnionOrInterface?: boolean;
      parentType?: ?string;
    } = {};
    metadata.parentType = parent.getType().getName({modifiers: false});
    const requisiteFields = {};
    if (fieldType.hasField('id')) {
      requisiteFields.id = true;
    }

    validateField(field, parent.getType());

    // TODO: Generalize to non-`Node` types.
    if (fieldType.alwaysImplements('Node')) {
      metadata.inferredRootCallName = 'node';
      metadata.inferredPrimaryKey = 'id';
    }
    if (fieldType.isConnection()) {
      if (field.hasDeclaredArgument('first') ||
          field.hasDeclaredArgument('last')) {
        validateConnectionField(field);
        metadata.isConnection = true;
        if (field.hasDeclaredArgument('find')) {
          metadata.isFindable = true;
        }
      }
    } else if (fieldType.isConnectionPageInfo()) {
      requisiteFields.hasNextPage = true;
      requisiteFields.hasPreviousPage = true;
    } else if (fieldType.isConnectionEdge()) {
      requisiteFields.cursor = true;
      requisiteFields.node = true;
    }
    if (fieldType.isAbstract()) {
      metadata.isUnionOrInterface = true;
      requisiteFields.__typename = true;
    }
    if (fieldType.isList()) {
      metadata.isPlural = true;
    }
    if (generatedSiblings.hasOwnProperty(field.getName())) {
      metadata.isGenerated = true;
    }
    if (requisiteSiblings.hasOwnProperty(field.getName())) {
      metadata.isRequisite = true;
    }

    const selections = this.printSelections(field, requisiteFields);
    const fieldAlias = field.getAlias();
    const args = field.getArguments();
    const calls = args.length ?
      t.arrayExpression(args.map(arg => this.printArgument(arg))) :
      NULL;

    return codify({
      alias: fieldAlias ? t.valueToNode(fieldAlias): NULL,
      calls,
      children: selections,
      directives: this.printDirectives(field.getDirectives()),
      fieldName: t.valueToNode(field.getName()),
      kind: t.valueToNode('Field'),
      metadata: objectify(metadata),
    });
  }

  printFragmentReference(fragmentReference: RelayQLFragmentSpread): Printable {
    return t.callExpression(
      t.memberExpression(
        identify(this.tagName),
        t.identifier('__frag')
      ),
      [t.identifier(fragmentReference.getName())]
    );
  }

  printArgument(arg: RelayQLArgument): Printable {
    const metadata = {};
    const inputType = this.printArgumentTypeForMetadata(arg.getType());
    if (inputType) {
      metadata.type = inputType;
    }
    return codify({
      kind: t.valueToNode('Call'),
      metadata: objectify(metadata),
      name: t.valueToNode(arg.getName()),
      value: this.printArgumentValue(arg),
    });
  }

  printArgumentValue(arg: RelayQLArgument): Printable {
    if (arg.isVariable()) {
      return this.printVariable(arg.getVariableName());
    } else {
      return this.printValue(arg.getValue());
    }
  }

  printVariable(name: string): Printable {
    // Assume that variables named like substitutions are substitutions.
    if (this.variableNames.hasOwnProperty(name)) {
      return t.callExpression(
        t.memberExpression(
          identify(this.tagName),
          t.identifier('__var')
        ),
        [t.identifier(name)]
      );
    }
    return codify({
      kind: t.valueToNode('CallVariable'),
      callVariableName: t.valueToNode(name),
    });
  }

  printValue(value: mixed): Printable {
    if (Array.isArray(value)) {
      return t.arrayExpression(
        value.map(element => this.printArgumentValue(element))
      );
    }
    return codify({
      kind: t.valueToNode('CallValue'),
      callValue: t.valueToNode(value),
    });
  }

  printDirectives(directives: Array<RelayQLDirective>): Printable {
    const printedDirectives = [];
    directives.forEach(directive => {
      if (directive.getName() === 'relay') {
        return;
      }
      printedDirectives.push(
        t.objectExpression([
          property('kind', t.valueToNode('Directive')),
          property('name', t.valueToNode(directive.getName())),
          property('arguments', t.arrayExpression(
            directive.getArguments().map(
              arg => t.objectExpression([
                property('name', t.valueToNode(arg.getName())),
                property('value', this.printArgumentValue(arg)),
              ])
            )
          )),
        ])
      );
    });
    if (printedDirectives.length) {
      return t.arrayExpression(printedDirectives);
    }
    return NULL;
  }

  printRelayDirectiveMetadata(
    node: RelayQLField | RelayQLFragment,
    maybeMetadata?: {[key: string]: mixed}
  ): Printable {
    const properties = [];
    const relayDirective = find(
      node.getDirectives(),
      directive => directive.getName() === 'relay'
    );
    if (relayDirective) {
      relayDirective.getArguments().forEach(arg => {
        if (arg.isVariable()) {
          invariant(
            !arg.isVariable(),
            'You supplied `$%s` as the `%s` argument to the `@relay` ' +
            'directive, but `@relay` require scalar argument values.',
            arg.getVariableName(),
            arg.getName()
          );
        }
        properties.push(property(arg.getName(), t.valueToNode(arg.getValue())));
      });
    }
    if (maybeMetadata) {
      const metadata = maybeMetadata;
      Object.keys(metadata).forEach(key => {
        if (metadata[key]) {
          properties.push(property(key, t.literal(metadata[key])));
        }
      });
    }
    return t.objectExpression(properties);
  }

  /**
   * Prints the type for arguments that are transmitted via variables.
   */
  printArgumentTypeForMetadata(argType: RelayQLArgumentType): ?string {
    // Currently, we always send Enum and Object types as variables.
    if (argType.isEnum() || argType.isObject()) {
      return argType.getName({modifiers: true});
    }
    // Currently, we always inline scalar types.
    if (argType.isScalar()) {
      return null;
    }
    invariant(false, 'Unsupported input type: %s', argType);
  }
}

function validateField(field: RelayQLField, parentType: RelayQLType): void {
  if (field.getName() === 'node') {
    var argTypes = field.getDeclaredArguments();
    var argNames = Object.keys(argTypes);
    invariant(
      argNames.length !== 1 || argNames[0] !== 'id',
      'You defined a `node(id: %s)` field on type `%s`, but Relay requires ' +
      'the `node` field to be defined on the root type. See the Object ' +
      'Identification Guide: \n' +
      'http://facebook.github.io/relay/docs/graphql-object-identification.html',
      argNames[0] && argTypes[argNames[0]].getName({modifiers: true}),
      parentType.getName({modifiers: false})
    );
  }
}

function validateConnectionField(field: RelayQLField): void {
  invariant(
    !field.hasArgument('first') || !field.hasArgument('before'),
    'Connection arguments `%s(before: <cursor>, first: <count>)` are ' +
    'not supported. Use `(first: <count>)`, ' +
    '`(after: <cursor>, first: <count>)`, or ' +
    '`(before: <cursor>, last: <count>)`.',
    field.getName()
  );
  invariant(
    !field.hasArgument('last') || !field.hasArgument('after'),
    'Connection arguments `%s(after: <cursor>, last: <count>)` are ' +
    'not supported. Use `(last: <count>)`, ' +
    '`(before: <cursor>, last: <count>)`, or ' +
    '`(after: <cursor>, first: <count>)`.',
    field.getName()
  );

  // Use `any` because we already check `isConnection` before validating.
  const connectionNodeType = (field: any).getType()
    .getFieldDefinition('edges').getType()
    .getFieldDefinition('node').getType();

  // NOTE: These checks are imperfect because we cannot trace fragment spreads.
  forEachRecursiveField(field, subfield => {
    if (subfield.getName() === 'edges' ||
        subfield.getName() === 'pageInfo') {
      invariant(
        field.isPattern() ||
        field.hasArgument('find') ||
        field.hasArgument('first') ||
        field.hasArgument('last'),
        'You supplied the `%s` field on a connection named `%s`, but you did ' +
        'not supply an argument necessary to do so. Use either the `find`, ' +
        '`first`, or `last` argument.',
        subfield.getName(),
        field.getName()
      );
    } else {
      // Suggest `edges{node{...}}` instead of `nodes{...}`.
      const subfieldType = subfield.getType();
      const isNodesLikeField =
        subfieldType.isList() &&
        subfieldType.getName({modifiers: false}) ===
          connectionNodeType.getName({modifiers: false});
      invariant(
        !isNodesLikeField,
        'You supplied a field named `%s` on a connection named `%s`, but ' +
        'pagination is not supported on connections without using edges. Use ' +
        '`%s{edges{node{...}}}` instead.',
        subfield.getName(),
        field.getName(),
        field.getName()
      );
    }
  });
}

function validateMutationField(rootField: RelayQLField): void {
  const declaredArgs = rootField.getDeclaredArguments();
  const declaredArgNames = Object.keys(declaredArgs);
  invariant(
    declaredArgNames.length === 1,
    'Your schema defines a mutation field `%s` that takes %d arguments, ' +
    'but mutation fields must have exactly one argument named `input`.',
    rootField.getName(),
    declaredArgNames.length
  );
  invariant(
    declaredArgNames[0] === 'input',
    'Your schema defines a mutation field `%s` that takes an argument ' +
    'named `%s`, but mutation fields must have exactly one argument ' +
    'named `input`.',
    rootField.getName(),
    declaredArgNames[0]
  );

  const rootFieldArgs = rootField.getArguments();
  invariant(
    rootFieldArgs.length <= 1,
    'There are %d arguments supplied to the mutation field named `%s`, ' +
    'but mutation fields must have exactly one `input` argument.',
    rootFieldArgs.length,
    rootField.getName()
  );
}

const forEachRecursiveField = function(
  selection: RelayQLField | RelayQLFragment,
  callback: (field: RelayQLField) => void
): void {
  selection.getSelections().forEach(selection => {
    if (selection instanceof RelayQLField) {
      callback(selection);
    } else if (selection instanceof RelayQLInlineFragment) {
      forEachRecursiveField(selection.getFragment(), callback);
    }
    // Ignore `RelayQLFragmentSpread` selections.
  });
};

function codify(obj: {[key: string]: mixed}): Printable {
  const properties = [];
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== NULL) {
      properties.push(property(key, value));
    }
  })
  return t.objectExpression(properties);
}

function identify(str: string): Printable {
  return str.split('.').reduce((acc, name) => {
    if (!acc) {
      return t.identifier(name);
    }
    return t.memberExpression(acc, t.identifier(name));
  }, null);
}

function objectify(obj: {[key: string]: mixed}): Printable {
  const properties = [];
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value) {
      properties.push(property(key, t.valueToNode(value)));
    }
  })
  return t.objectExpression(properties);
}

function property(name: string, value: mixed): Printable {
  return t.objectProperty(t.identifier(name), value);
}

module.exports = RelayQLPrinter;
