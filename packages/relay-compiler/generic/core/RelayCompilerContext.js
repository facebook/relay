/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule RelayCompilerContext
 * @format
 */

'use strict';

const immutable = require('immutable');
const invariant = require('invariant');

const {createUserError} = require('RelayCompilerUserError');

import type {Fragment, Root} from 'RelayIR';
import type {GraphQLSchema} from 'graphql';

const {
  List: ImmutableList,
  OrderedMap: ImmutableOrderedMap,
  Record,
} = immutable;

const Document = Record({
  errors: null,
  name: null,
  node: null,
});

/**
 * An immutable representation of a corpus of documents being compiled together.
 * For each document, the context stores the IR and any validation errors.
 */
class RelayCompilerContext {
  _documents: ImmutableOrderedMap<string, Document>;
  schema: GraphQLSchema;

  constructor(schema: GraphQLSchema) {
    this._documents = new ImmutableOrderedMap();
    this.schema = schema;
  }

  /**
   * Returns the documents for the context in the order they were added.
   */
  documents(): Array<Fragment | Root> {
    return this._documents.valueSeq().map(doc => doc.get('node')).toJS();
  }

  updateSchema(schema: GraphQLSchema): RelayCompilerContext {
    const context = new RelayCompilerContext(schema);
    context._documents = this._documents;
    return context;
  }

  add(node: Fragment | Root): RelayCompilerContext {
    invariant(
      !this._documents.has(node.name),
      'RelayCompilerContext: Duplicate document named `%s`. GraphQL ' +
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

  addAll(nodes: Array<Fragment | Root>): RelayCompilerContext {
    return nodes.reduce(
      (ctx: RelayCompilerContext, definition: Fragment | Root) =>
        ctx.add(definition),
      this,
    );
  }

  addError(name: string, error: Error): RelayCompilerContext {
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
    return record && record.get('node');
  }

  getFragment(name: string): Fragment {
    const record = this._documents.get(name);
    const node = record && record.get('node');
    if (!(node && node.kind === 'Fragment')) {
      const childModule = name.substring(0, name.lastIndexOf('_'));
      throw createUserError(
        'Relay cannot find fragment `%s`.' +
          ' Please make sure the fragment exists in `%s`',
        name,
        childModule,
      );
    }
    return node;
  }

  getRoot(name: string): Root {
    const record = this._documents.get(name);
    const node = record && record.get('node');
    invariant(
      node && node.kind === 'Root',
      'RelayCompilerContext: Expected `%s` to be a root, got `%s`.',
      name,
      node && node.kind,
    );
    return node;
  }

  getErrors(name: string): ?ImmutableList<Error> {
    return this._get(name).get('errors');
  }

  remove(name: string): RelayCompilerContext {
    return this._update(this._documents.delete(name));
  }

  _get(name: string): Document {
    const record = this._documents.get(name);
    invariant(record, 'RelayCompilerContext: Unknown document `%s`.', name);
    return record;
  }

  _update(
    documents: ImmutableOrderedMap<string, Document>,
  ): RelayCompilerContext {
    const context = new RelayCompilerContext(this.schema);
    context._documents = documents;
    return context;
  }
}

module.exports = RelayCompilerContext;
