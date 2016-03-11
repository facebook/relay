/**
 * Copyright (c) 2013-present, Facebook, Inc.
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
  RelayQLSubscription,
  RelayQLType,
} = require('./RelayQLAST');

const find = require('./find');
const invariant = require('./invariant');

export type Printable = Object;
export type Substitution = {
  name: string;
  value: Printable;
};

type PrinterOptions = {
  inputArgumentName: ?string;
  snakeCase: boolean;
};

module.exports = function(t: any, options: PrinterOptions): Function {
  const formatFields = options.snakeCase ?
    function<T: Object>(fields: T): {[keys: $Keys<T>]: string} {
      const formatted = {};
      Object.keys(fields).forEach(name => {
        formatted[name] =
          name.replace(/[A-Z]/g, letter => '_' + letter.toLowerCase());
      });
      return formatted;
    } :
    function<T>(fields: T): T { return fields; };

  const EMPTY_ARRAY = t.arrayExpression([]);
  const FIELDS = formatFields({
    __typename: '__typename',
    clientMutationId: 'clientMutationId',
    clientSubscriptionId: 'clientSubscriptionId',
    cursor: 'cursor',
    edges: 'edges',
    hasNextPage: 'hasNextPage',
    hasPreviousPage: 'hasPreviousPage',
    id: 'id',
    node: 'node',
    pageInfo: 'pageInfo',
  });
  const INPUT_ARGUMENT_NAME = options.inputArgumentName || 'input';
  const NULL = t.nullLiteral();

  class RelayQLPrinter {
    tagName: string;
    variableNames: {[variableName: string]: void};

    constructor(
      tagName: string,
      variableNames: {[variableName: string]: void}
    ) {
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
      } else if (definition instanceof RelayQLSubscription) {
        printedDocument = this.printSubscription(definition);
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
        requisiteFields[FIELDS.__typename] = true;
      }
      const selections = this.printSelections(rootField, requisiteFields);
      const metadata = {};
      if (rootFieldType.isList()) {
        metadata.isPlural = true;
      }
      if (rootFieldType.isAbstract()) {
        metadata.isAbstract = true;
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
        const identifyingArgName = identifyingArg.getName();
        const identifyingArgType =
          identifyingArg.getType().getName({modifiers: true});
        metadata.identifyingArgName = identifyingArgName;
        metadata.identifyingArgType = identifyingArgType;
        calls = t.arrayExpression([codify({
          kind: t.valueToNode('Call'),
          metadata: objectify({
            type: identifyingArgType,
          }),
          name: t.valueToNode(identifyingArgName),
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
        type: t.valueToNode(rootFieldType.getName({modifiers: false})),
      });
    }

    printFragment(fragment: RelayQLFragment): Printable {
      const fragmentType = fragment.getType();

      const requisiteFields = {};
      let idFragment;
      if (fragmentType.hasField(FIELDS.id)) {
        requisiteFields.id = true;
      } else if (shouldGenerateIdFragment(fragment, fragmentType)) {
        idFragment = fragmentType.generateIdFragment();
      }
      if (fragmentType.isAbstract()) {
        requisiteFields[FIELDS.__typename] = true;
      }
      const selections = this.printSelections(
        fragment,
        requisiteFields,
        idFragment ? [idFragment] : null,
        fragment.hasDirective('generated')
      );
      const metadata = this.printRelayDirectiveMetadata(fragment, {
        isAbstract: fragmentType.isAbstract(),
      });

      return codify({
        children: selections,
        directives: this.printDirectives(fragment.getDirectives()),
        id: this.printFragmentID(fragment),
        kind: t.valueToNode('Fragment'),
        metadata,
        name: t.valueToNode(fragment.getName()),
        type: t.valueToNode(fragmentType.getName({modifiers: false})),
      });
    }

    printFragmentID(fragment: RelayQLFragment): Printable {
      const staticFragmentID = fragment.getStaticFragmentID();
      if (staticFragmentID == null) {
        return t.callExpression(
          t.memberExpression(
            identify(this.tagName),
            t.identifier('__id')
          ),
          []
        );
      } else {
        return t.valueToNode(staticFragmentID);
      }
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
      const requisiteFields = {};
      if (rootFieldType.hasField(FIELDS.clientMutationId)) {
        requisiteFields[FIELDS.clientMutationId] = true;
      }
      const selections = this.printSelections(rootField, requisiteFields);
      const metadata = {
        inputType: this.printArgumentTypeForMetadata(
          rootField.getDeclaredArgument(INPUT_ARGUMENT_NAME)
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
        responseType: t.valueToNode(rootFieldType.getName({modifiers: false})),
      });
    }

    printSubscription(subscription: RelayQLSubscription): Printable {
      const rootFields = subscription.getFields();
      invariant(
        rootFields.length === 1,
        'There are %d fields supplied to the subscription named `%s`, but ' +
        'subscriptions must have exactly one field.',
        rootFields.length,
        subscription.getName()
      );
      const rootField = rootFields[0];
      const rootFieldType = rootField.getType();
      validateMutationField(rootField);
      const requisiteFields = {};
      if (rootFieldType.hasField(FIELDS.clientSubscriptionId)) {
        requisiteFields[FIELDS.clientSubscriptionId] = true;
      }
      const selections = this.printSelections(rootField, requisiteFields);
      const metadata = {
        inputType: this.printArgumentTypeForMetadata(
          rootField.getDeclaredArgument(INPUT_ARGUMENT_NAME)
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
        directives: this.printDirectives(subscription.getDirectives()),
        kind: t.valueToNode('Subscription'),
        metadata: objectify(metadata),
        name: t.valueToNode(subscription.getName()),
        responseType: t.valueToNode(rootFieldType.getName({modifiers: false})),
      });
    }

    printSelections(
      parent: RelayQLField | RelayQLFragment,
      requisiteFields: {[fieldName: string]: boolean},
      extraFragments?: ?Array<RelayQLFragment>,
      isGeneratedQuery = false
    ): Printable {
      const fields = [];
      const printedFragments = [];
      let didPrintFragmentReference = false;
      parent.getSelections().forEach(selection => {
        if (selection instanceof RelayQLFragmentSpread) {
          // Assume that all spreads exist via template substitution.
          invariant(
            selection.getDirectives().length === 0,
            'Directives are not yet supported for `${fragment}`-style fragment ' +
            'references.'
          );
          printedFragments.push(this.printFragmentReference(selection));
          didPrintFragmentReference = true;
        } else if (selection instanceof RelayQLInlineFragment) {
          printedFragments.push(this.printFragment(selection.getFragment()));
        } else if (selection instanceof RelayQLField) {
          fields.push(selection);
        } else {
          invariant(false, 'Unsupported selection type `%s`.', selection);
        }
      });
      if (extraFragments) {
        extraFragments.forEach(fragment => {
          printedFragments.push(this.printFragment(fragment));
        });
      }
      const printedFields = this.printFields(
        fields,
        parent,
        requisiteFields,
        isGeneratedQuery
      );
      const selections = [...printedFields, ...printedFragments];

      if (selections.length) {
        const arrayExpressionOfSelections = t.arrayExpression(selections);
        return didPrintFragmentReference ?
          shallowFlatten(arrayExpressionOfSelections) :
          arrayExpressionOfSelections;
      }
      return NULL;
    }

    printFields(
      fields: Array<RelayQLField>,
      parent: RelayQLField | RelayQLFragment,
      requisiteFields: {[fieldName: string]: boolean},
      isGeneratedQuery = false
    ): Array<Printable> {
      const parentType = parent.getType();
      if (parentType.isConnection() &&
          parentType.hasField(FIELDS.pageInfo) &&
          fields.some(field => field.getName() === FIELDS.edges)) {
        requisiteFields[FIELDS.pageInfo] = true;
      }

      const generatedFields = {...requisiteFields};

      const printedFields = [];
      fields.forEach(field => {
        delete generatedFields[field.getName()];
        printedFields.push(
          this.printField(
            field,
            parent,
            requisiteFields,
            generatedFields,
            isGeneratedQuery
          )
        );
      });

      Object.keys(generatedFields).forEach(fieldName => {
        const generatedField = parentType.generateField(fieldName);
        printedFields.push(
          this.printField(
            generatedField,
            parent,
            requisiteFields,
            generatedFields,
            isGeneratedQuery
          )
        );
      });
      return printedFields;
    }

    printField(
      field: RelayQLField,
      parent: RelayQLField | RelayQLFragment,
      requisiteSiblings: {[fieldName: string]: boolean},
      generatedSiblings: {[fieldName: string]: boolean},
      isGeneratedQuery = false
    ): Printable {
      const fieldType = field.getType();

      const metadata: {
        canHaveSubselections?: boolean;
        inferredPrimaryKey?: ?string;
        inferredRootCallName?: ?string;
        isAbstract?: boolean;
        isConnection?: boolean;
        isFindable?: boolean;
        isGenerated?: boolean;
        isPlural?: boolean;
        isRequisite?: boolean;
      } = {};
      const requisiteFields = {};
      let idFragment;
      if (fieldType.hasField(FIELDS.id)) {
        requisiteFields.id = true;
      } else if (shouldGenerateIdFragment(field, fieldType)) {
        idFragment = fieldType.generateIdFragment();
      }

      if (!isGeneratedQuery) {
        validateField(field, parent.getType());
      }

      if (fieldType.canHaveSubselections()) {
        metadata.canHaveSubselections = true;
      }
      // TODO: Generalize to non-`Node` types.
      if (fieldType.alwaysImplements('Node')) {
        metadata.inferredRootCallName = 'node';
        metadata.inferredPrimaryKey = 'id';
      }
      if (fieldType.isConnection()) {
        if (field.hasDeclaredArgument('first') ||
            field.hasDeclaredArgument('last')) {
          if (!isGeneratedQuery) {
            validateConnectionField(field);
          }
          metadata.isConnection = true;
          if (field.hasDeclaredArgument('find')) {
            metadata.isFindable = true;
          }
        }
      } else if (fieldType.isConnectionPageInfo()) {
        requisiteFields[FIELDS.hasNextPage] = true;
        requisiteFields[FIELDS.hasPreviousPage] = true;
      } else if (fieldType.isConnectionEdge()) {
        requisiteFields[FIELDS.cursor] = true;
        requisiteFields[FIELDS.node] = true;
      }
      if (fieldType.isAbstract()) {
        metadata.isAbstract = true;
        requisiteFields[FIELDS.__typename] = true;
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

      const selections = this.printSelections(
        field,
        requisiteFields,
        idFragment ? [idFragment] : null,
        isGeneratedQuery
      );
      const fieldAlias = field.getAlias();
      const args = field.getArguments();
      const calls = args.length ?
        t.arrayExpression(args.map(arg => this.printArgument(arg))) :
        NULL;

      return codify({
        alias: fieldAlias ? t.valueToNode(fieldAlias) : NULL,
        calls,
        children: selections,
        directives: this.printDirectives(field.getDirectives()),
        fieldName: t.valueToNode(field.getName()),
        kind: t.valueToNode('Field'),
        metadata: this.printRelayDirectiveMetadata(field, metadata),
        type: t.valueToNode(fieldType.getName({modifiers: false})),
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
        callValue: printLiteralValue(value),
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
            property('args', t.arrayExpression(
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
            properties.push(property(key, t.valueToNode(metadata[key])));
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

  /**
   * Determine if a `... on Node { id }` fragment should be generated for a
   * field/fragment to allow identification of the response record. This
   * fragment should be added when some/all implementors of the node's type
   * also implement `Node` but a `Node` fragment is not already present. If it
   * is present then `id` would be added as a requisite field.
   */
  function shouldGenerateIdFragment(
    node: RelayQLField | RelayQLFragment
  ): boolean {
    return (
      node.getType().mayImplement('Node') &&
      !node.getSelections().some(selection => (
        selection instanceof RelayQLInlineFragment &&
        selection.getFragment().getType().getName({modifiers: false}) === 'Node'
      ))
    );
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
    let [first, last, before, after] = [
      field.findArgument('first'),
      field.findArgument('last'),
      field.findArgument('before'),
      field.findArgument('after'),
    ]
    invariant(
      (!first || !last) || (first.isVariable() && last.isVariable()),
      'Connection arguments `%s(first: <count>, last: <count>)` are ' +
      'not supported unless both are variables. Use `(first: <count>)`, ' +
      '`(last: <count>)`, or `(first: $<var>, last: $<var>)`.',
      field.getName()
    );
    invariant(
      (!first || !before) || (first.isVariable() && before.isVariable()),
      'Connection arguments `%s(before: <cursor>, first: <count>)` are ' +
      'not supported unless both are variables. Use `(first: <count>)`, ' +
      '`(after: <cursor>, first: <count>)`, `(before: <cursor>, last: <count>)`, ' +
      'or `(before: $<var>, first: $<var>)`.',
      field.getName()
    );
    invariant(
      (!last || !after) || (last.isVariable() && after.isVariable()),
      'Connection arguments `%s(after: <cursor>, last: <count>)` are ' +
      'not supported unless both are variables. Use `(last: <count>)`, ' +
      '`(before: <cursor>, last: <count>)`, `(after: <cursor>, first: <count>)`, ' +
      'or `(after: $<var>, last: $<var>)`.',
      field.getName()
    );

    // Use `any` because we already check `isConnection` before validating.
    const connectionNodeType = (field: any).getType()
      .getFieldDefinition(FIELDS.edges).getType()
      .getFieldDefinition(FIELDS.node).getType();

    // NOTE: These checks are imperfect because we cannot trace fragment spreads.
    forEachRecursiveField(field, subfield => {
      if (subfield.getName() === FIELDS.edges ||
          subfield.getName() === FIELDS.pageInfo) {
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
          'pagination is not supported on connections without using `%s`. ' +
          'Use `%s{%s{%s{...}}}` instead.',
          subfield.getName(),
          field.getName(),
          FIELDS.edges,
          field.getName(),
          FIELDS.edges,
          FIELDS.node
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
      'but mutation fields must have exactly one argument named `%s`.',
      rootField.getName(),
      declaredArgNames.length,
      INPUT_ARGUMENT_NAME
    );
    invariant(
      declaredArgNames[0] === INPUT_ARGUMENT_NAME,
      'Your schema defines a mutation field `%s` that takes an argument ' +
      'named `%s`, but mutation fields must have exactly one argument ' +
      'named `%s`.',
      rootField.getName(),
      declaredArgNames[0],
      INPUT_ARGUMENT_NAME
    );

    const rootFieldArgs = rootField.getArguments();
    invariant(
      rootFieldArgs.length <= 1,
      'There are %d arguments supplied to the mutation field named `%s`, ' +
      'but mutation fields must have exactly one `%s` argument.',
      rootFieldArgs.length,
      rootField.getName(),
      INPUT_ARGUMENT_NAME
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
    });
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
    });
    return t.objectExpression(properties);
  }

  function property(name: string, value: mixed): Printable {
    return t.objectProperty(t.identifier(name), value);
  }

  function printLiteralValue(value: mixed): Printable {
    if (value == null) {
      return NULL;
    } else if (Array.isArray(value)) {
      return t.arrayExpression(value.map(printLiteralValue));
    } else if (typeof value === 'object' && value != null) {
      const objectValue = value;
      return t.objectExpression(Object.keys(objectValue).map(key =>
        property(key, printLiteralValue(objectValue[key]))
      ));
    } else {
      return t.valueToNode(value);
    }
  }

  function shallowFlatten(arr: mixed) {
    return t.callExpression(
      t.memberExpression(
        t.memberExpression(EMPTY_ARRAY, t.identifier('concat')),
        t.identifier('apply')
      ),
      [EMPTY_ARRAY, arr]
    );
  }

  return RelayQLPrinter;
};
