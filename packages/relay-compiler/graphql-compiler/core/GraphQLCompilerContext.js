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

const Profiler = require('./GraphQLCompilerProfiler');

const invariant = require('invariant');

const {createUserError} = require('./GraphQLCompilerUserError');
const {OrderedMap: ImmutableOrderedMap} = require('immutable');

import type {GraphQLReporter} from '../reporters/GraphQLReporter';
import type {Fragment, Root} from './GraphQLIR';
import type {GraphQLSchema} from 'graphql';

/**
 * An immutable representation of a corpus of documents being compiled together.
 * For each document, the context stores the IR and any validation errors.
 */
class GraphQLCompilerContext {
  _isMutable: boolean;
  _documents: ImmutableOrderedMap<string, Fragment | Root>;
  schema: GraphQLSchema;

  constructor(schema: GraphQLSchema) {
    this._isMutable = false;
    this._documents = new ImmutableOrderedMap();
    this.schema = schema;
  }

  /**
   * Returns the documents for the context in the order they were added.
   */
  documents(): Array<Fragment | Root> {
    return this._documents.toArray();
  }

  forEachDocument(fn: (Fragment | Root) => void): void {
    this._documents.forEach(fn);
  }

  updateSchema(schema: GraphQLSchema): GraphQLCompilerContext {
    const context = new GraphQLCompilerContext(schema);
    context._documents = this._documents;
    return context;
  }

  replace(node: Fragment | Root): GraphQLCompilerContext {
    return this._update(
      this._documents.update(node.name, existing => {
        invariant(
          existing,
          'GraphQLCompilerContext: Expected to replace existing node %s, but' +
            'one was not found in the context.',
          node.name,
        );
        return node;
      }),
    );
  }

  add(node: Fragment | Root): GraphQLCompilerContext {
    return this._update(
      this._documents.update(node.name, existing => {
        invariant(
          !existing,
          'GraphQLCompilerContext: Duplicate document named `%s`. GraphQL ' +
            'fragments and roots must have unique names.',
          node.name,
        );
        return node;
      }),
    );
  }

  addAll(nodes: Array<Fragment | Root>): GraphQLCompilerContext {
    return this.withMutations(mutable =>
      nodes.reduce((ctx, definition) => ctx.add(definition), mutable),
    );
  }

  /**
   * Apply a list of compiler transforms and return a new compiler context.
   *
   * @param transforms List of transforms
   * @param baseSchema The base schema to pass to each transform. This is not
   *                   the schema from the compiler context which might be
   *                   extended by previous transforms.
   */
  applyTransforms(
    transforms: Array<
      (
        context: GraphQLCompilerContext,
        baseSchema: GraphQLSchema,
      ) => GraphQLCompilerContext,
    >,
    baseSchema: GraphQLSchema,
    reporter?: GraphQLReporter,
  ) {
    return Profiler.run('applyTransforms', () =>
      transforms.reduce((ctx, transform) => {
        const start = process.hrtime();
        const result = Profiler.instrument(transform)(ctx, baseSchema);
        const delta = process.hrtime(start);
        const deltaMs = Math.round((delta[0] * 1e9 + delta[1]) / 1e6);
        reporter && reporter.reportTime(transform.name, deltaMs);
        return result;
      }, this),
    );
  }

  get(name: string): ?(Fragment | Root) {
    return this._documents.get(name);
  }

  getFragment(name: string): Fragment {
    const node = this._get(name);
    if (node.kind !== 'Fragment') {
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
    const node = this._get(name);
    invariant(
      node.kind === 'Root',
      'GraphQLCompilerContext: Expected `%s` to be a root, got `%s`.',
      name,
      node.kind,
    );
    return node;
  }

  remove(name: string): GraphQLCompilerContext {
    return this._update(this._documents.delete(name));
  }

  withMutations(
    fn: GraphQLCompilerContext => GraphQLCompilerContext,
  ): GraphQLCompilerContext {
    const mutableCopy = this._update(this._documents.asMutable());
    mutableCopy._isMutable = true;
    const result = fn(mutableCopy);
    result._isMutable = false;
    result._documents = result._documents.asImmutable();
    return result;
  }

  _get(name: string): Fragment | Root {
    const document = this._documents.get(name);
    invariant(document, 'GraphQLCompilerContext: Unknown document `%s`.', name);
    return document;
  }

  _update(
    documents: ImmutableOrderedMap<string, Fragment | Root>,
  ): GraphQLCompilerContext {
    const context = this._isMutable
      ? this
      : new GraphQLCompilerContext(this.schema);
    context._documents = documents;
    return context;
  }
}

module.exports = GraphQLCompilerContext;
