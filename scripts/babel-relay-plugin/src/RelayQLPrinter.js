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
const t = require('babel-core/lib/types');

export type Printable = Object;
export type Substitution = {
  name: string;
  value: Printable;
};

const NULL = t.literal(null);

class RelayQLPrinter {
  tagName: string;

  constructor(tagName: string) {
    this.tagName = tagName;
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
    const callExpression = t.callExpression(
      t.functionExpression(
        null,
        substitutions.map(substitution => t.identifier(substitution.name)),
        t.blockStatement([
          t.variableDeclaration(
            'var',
            [
              t.variableDeclarator(
                t.identifier('GraphQL'),
                t.memberExpression(
                  identify(this.tagName),
                  t.identifier('__GraphQL')
                )
              )
            ]
          ),
          t.returnStatement(printedDocument),
        ])
      ),
      substitutions.map(substitution => substitution.value)
    );

    if (this.tagName === 'Relay.Query') {
      return t.callExpression(
        identify('Relay.createQuery'),
        [
          callExpression,
          t.objectExpression([])
        ]
      );
    }
    return callExpression;
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
    const selection = this.printSelection(rootField, requisiteFields);
    const metadata = {};
    let printedArg;
    invariant(
      rootFieldArgs.length <= 1,
      'Invalid root field `%s`; Relay only supports root fields with zero ' +
      'or one argument.',
      rootField.getName()
    );
    if (rootFieldArgs.length === 1) {
      // Until such time as a root field's 'identifying argument' (one that has
      // a 1-1 correspondence with a Relay record, or null) has a formal type,
      // assume that the lone arg in a root field's call is the identifying one.
      const identifyingArg = rootFieldArgs[0];
      metadata.identifyingArgName = identifyingArg.getName();
      const identifyingArgType =
        this.printArgumentTypeForMetadata(identifyingArg.getType());
      if (identifyingArgType) {
        metadata.identifyingArgType = identifyingArgType;
      }
      printedArg = this.printArgumentValue(identifyingArg);
    } else {
      printedArg = NULL;
    }

    return t.newExpression(
      t.memberExpression(
        t.identifier('GraphQL'),
        t.identifier('Query')
      ),
      trimArguments([
        t.literal(rootField.getName()),
        printedArg,
        selection.fields,
        selection.fragments,
        objectify(metadata),
        t.literal(query.getName()),
        this.printDirectives(rootField.getDirectives())
      ])
    );
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
    const selection = this.printSelection(fragment, requisiteFields);
    const metadata = this.printRelayDirectiveMetadata(fragment);

    return t.newExpression(
      t.memberExpression(
        t.identifier('GraphQL'),
        t.identifier('QueryFragment')
      ),
      trimArguments([
        t.literal(fragment.getName()),
        t.literal(fragmentType.getName({modifiers: true})),
        selection.fields,
        selection.fragments,
        objectify(metadata),
        this.printDirectives(fragment.getDirectives())
      ])
    );
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
    const selection = this.printSelection(rootField, requisiteFields);
    const metadata = {
      inputType: this.printArgumentTypeForMetadata(
        rootField.getDeclaredArgument('input')
      ),
    };

    return t.newExpression(
      t.memberExpression(
        t.identifier('GraphQL'),
        t.identifier('Mutation')
      ),
      trimArguments([
        t.literal(mutation.getName()),
        t.literal(rootFieldType.getName({modifiers: true})),
        t.newExpression(
          t.memberExpression(
            t.identifier('GraphQL'),
            t.identifier('Callv')
          ),
          trimArguments([
            t.literal(rootField.getName()),
            this.printVariable('input')
          ])
        ),
        selection.fields,
        selection.fragments,
        objectify(metadata)
      ])
    );
  }

  printSelection(
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

    return {
      fields: printedFields.length ?
        t.arrayExpression(printedFields) :
        NULL,
      fragments: printedFragments.length ?
        t.arrayExpression(printedFragments) :
        NULL,
    };
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

    const metadata = {};
    metadata.parentType = parent.getType().getName({modifiers: false});
    const requisiteFields = {};
    if (fieldType.hasField('id')) {
      requisiteFields.id = true;
    }

    validateField(field, parent.getType());

    // TODO: Generalize to non-`Node` types.
    if (fieldType.alwaysImplements('Node')) {
      metadata.rootCall = 'node';
      metadata.pk = 'id';
    }
    if (fieldType.isConnection()) {
      if (field.hasDeclaredArgument('first') ||
          field.hasDeclaredArgument('last')) {
        validateConnectionField(field);
        metadata.connection = true;
        if (!field.hasDeclaredArgument('find')) {
          metadata.nonFindable = true;
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
      metadata.dynamic = true;
      requisiteFields.__typename = true;
    }
    if (fieldType.isList()) {
      metadata.plural = true;
    }
    if (generatedSiblings.hasOwnProperty(field.getName())) {
      metadata.generated = true;
    }
    if (requisiteSiblings.hasOwnProperty(field.getName())) {
      metadata.requisite = true;
    }

    const selection = this.printSelection(field, requisiteFields);
    const fieldAlias = field.getAlias();
    const args = field.getArguments();

    return t.newExpression(
      t.memberExpression(
        t.identifier('GraphQL'),
        t.identifier('Field')
      ),
      trimArguments([
        t.literal(field.getName()),
        selection.fields,
        selection.fragments,
        args.length ?
          t.arrayExpression(args.map(arg => this.printArgument(arg))) :
          NULL,
        fieldAlias ?
          t.literal(fieldAlias) :
          NULL,
        NULL,
        objectify(metadata),
        this.printDirectives(field.getDirectives())
      ])
    );
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
    return t.newExpression(
      t.memberExpression(
        t.identifier('GraphQL'),
        t.identifier('Callv')
      ),
      trimArguments([
        t.literal(arg.getName()),
        this.printArgumentValue(arg),
        objectify(metadata)
      ])
    );
  }

  printArgumentValue(arg: RelayQLArgument): Printable {
    if (arg.isVariable()) {
      return this.printVariable(arg.getVariableName());
    } else {
      return this.printValue(arg.getValue());
    }
  }

  printVariable(name: string): Printable {
    return t.newExpression(
      t.memberExpression(
        t.identifier('GraphQL'),
        t.identifier('CallVariable')
      ),
      [t.literal(name)]
    );
  }

  printValue(value: mixed): Printable {
    if (Array.isArray(value)) {
      return t.arrayExpression(
        value.map(element => this.printArgumentValue(element))
      );
    }
    return t.newExpression(
      t.memberExpression(
        t.identifier('GraphQL'),
        t.identifier('CallValue')
      ),
      [t.literal(value)]
    );
  }

  printDirectives(directives: Array<RelayQLDirective>): Printable {
    const printedDirectives = [];
    directives.forEach(directive => {
      if (directive.getName() === 'relay') {
        return;
      }
      printedDirectives.push(
        t.objectExpression([
          property('name', t.literal(directive.getName())),
          property('arguments', t.arrayExpression(
            directive.getArguments().map(
              arg => t.objectExpression([
                property('name', t.literal(arg.getName())),
                property('value', this.printArgumentValue(arg)),
              ])
            )
          )),
        ])
      );
    });
    return printedDirectives.length ?
      t.arrayExpression(printedDirectives) :
      NULL;
  }

  printRelayDirectiveMetadata(
    node: RelayQLField | RelayQLFragment
  ): {[name: string]: mixed} {
    const metadata = {};
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
        metadata[arg.getName()] = arg.getValue();
      });
    }
    return metadata;
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
  field.getFields().forEach(subfield => {
    // Suggest `edges{node{...}}` instead of `nodes{...}`.
    const subfieldType = subfield.getType();
    const isNodesLikeField =
      subfield.getName() !== 'edges' &&
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

function identify(str: string): Printable {
  return str.split('.').reduce((acc, name) => {
    if (!acc) {
      return t.identifier(name);
    }
    return t.memberExpression(acc, t.identifier(name));
  }, null);
}

function objectify(obj: {[key: string]: mixed}): Printable {
  if (obj == null) {
    return NULL;
  }
  const keys = Object.keys(obj);
  if (!keys.length) {
    return NULL;
  }
  return t.objectExpression(
    keys.map(key => property(key, t.literal(obj[key])))
  );
}

function property(name: string, value: mixed): Printable {
  return t.property('init', t.identifier(name), value);
}

function trimArguments(args: Array<Printable>): Array<Printable> {
  let lastIndex = -1;
  for (let ii = args.length - 1; ii >= 0; ii--) {
    invariant(
      args[ii] != null,
      'Use `NULL` to indicate that output should be the literal value `null`.'
    );
    if (args[ii] !== NULL) {
      lastIndex = ii;
      break;
    }
  }
  return args.slice(0, lastIndex + 1);
}

module.exports = RelayQLPrinter;
