/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @providesModule GraphQLCompilerContext
 * @format
 */

'use strict';

const immutable = require('immutable');
const invariant = require('invariant');

const {createUserError} = require('./GraphQLCompilerUserError');

import type {Fragment, Root} from './GraphQLIR';
import type {GraphQLSchema} from 'graphql';

const {
  List: ImmutableList,
  OrderedMap: ImmutableOrderedMap,
  Record,
} = immutable;

type Document_ = {
  errors: ?ImmutableList<Error>,
  name: ?string, // In practice, documents always have a name
  node: ?(Fragment | Root), // In practice, documents always have a node
};

const Document = Record(
  ({
    errors: null,
    name: null,
    node: null,
  }: Document_),
);

// Currently no easy way to get the actual flow type of a generated record :(
// It's theoretically RecordInstance<T> & T, but flow seems to disagree, and
// that's really an implementation detail anyway.
const exemplar = Document({});
type DocumentT = typeof exemplar;

/**
 * An immutable representation of a corpus of documents being compiled together.
 * For each document, the context stores the IR and any validation errors.
 */
class GraphQLCompilerContext {
  _documents: ImmutableOrderedMap<string, DocumentT>;
  schema: GraphQLSchema;

  constructor(schema: GraphQLSchema) {
    this._documents = new ImmutableOrderedMap();
    this.schema = schema;
  }

  /**
   * Returns the documents for the context in the order they were added.
   */
  documents(): Array<Fragment | Root> {
    return this._documents
      .valueSeq()
      .map(doc => {
        const node = doc.get('node');
        invariant(
          node,
          'GraphQLCompilerContext: Documents secretly always have nodes',
        );
        return node;
      })
      .toArray();
  }

  updateSchema(schema: GraphQLSchema): GraphQLCompilerContext {
    const context = new GraphQLCompilerContext(schema);
    context._documents = this._documents;
    return context;
  }

  add(node: Fragment | Root): GraphQLCompilerContext {
    invariant(
      !this._documents.has(node.name),
      'GraphQLCompilerContext: Duplicate document named `%s`. GraphQL ' +
        'fragments and roots must have unique names.',
      node.name,
    );
    return this._update(
      (this._documents.set(
        node.name,
        new Document({
          name: node.name,
          node,
        }),
      ): $FlowFixMe),
    );
  }

  addAll(nodes: Array<Fragment | Root>): GraphQLCompilerContext {
    return nodes.reduce(
      (ctx: GraphQLCompilerContext, definition: Fragment | Root) =>
        ctx.add(definition),
      this,
    );
  }

  addError(name: string, error: Error): GraphQLCompilerContext {
    const record = this._get(name);
    let errors = record.get('errors');
    if (errors) {
      errors = errors.push(error);
    } else {
      errors = ImmutableList([error]);
    }
    return this._update(
      (this._documents.set(name, record.set('errors', errors)): $FlowFixMe),
    );
  }

  get(name: string): ?(Fragment | Root) {
    const record = this._documents.get(name);
    return record ? record.get('node') : null;
  }

  getFragment(name: string): Fragment {
    const record = this._documents.get(name);
    const node = record ? record.get('node') : null;
    if (!(node && node.kind === 'Fragment')) {
      const childModule = name.substring(0, name.lastIndexOf('_'));
      throw createUserError(
        'GraphQLCompilerContext: Cannot find fragment `%s`.' +
          ' Please make sure the fragment exists in `%s`.',
        name,
        childModule,
      );
    }
    return node;
  }

  getRoot(name: string): Root {
    const record = this._documents.get(name);
    const node = record ? record.get('node') : null;
    invariant(
      node && node.kind === 'Root',
      'GraphQLCompilerContext: Expected `%s` to be a root, got `%s`.',
      name,
      node && node.kind,
    );
    return node;
  }

  getErrors(name: string): ?ImmutableList<Error> {
    return this._get(name).get('errors');
  }

  remove(name: string): GraphQLCompilerContext {
    return this._update(this._documents.delete(name));
  }

  _get(name: string): DocumentT {
    const record = this._documents.get(name);
    invariant(record, 'GraphQLCompilerContext: Unknown document `%s`.', name);
    return record;
  }

  _update(
    documents: ImmutableOrderedMap<string, DocumentT>,
  ): GraphQLCompilerContext {
    const context = new GraphQLCompilerContext(this.schema);
    context._documents = documents;
    return context;
  }
}

module.exports = GraphQLCompilerContext;
