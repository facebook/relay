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

const {createUserError} = require('./GraphQLCompilerUserError');
const {OrderedMap: ImmutableOrderedMap} = require('immutable');

import type {GraphQLReporter} from '../reporters/GraphQLReporter';
import type {Fragment, Root} from './GraphQLIR';
import type {GraphQLSchema} from 'graphql';

export type IRTransform = GraphQLCompilerContext => GraphQLCompilerContext;

/**
 * An immutable representation of a corpus of documents being compiled together.
 * For each document, the context stores the IR and any validation errors.
 */
class GraphQLCompilerContext {
  _isMutable: boolean;
  _documents: ImmutableOrderedMap<string, Fragment | Root>;
  _withTransform: WeakMap<IRTransform, GraphQLCompilerContext>;
  +serverSchema: GraphQLSchema;
  +clientSchema: GraphQLSchema;

  constructor(serverSchema: GraphQLSchema, clientSchema?: GraphQLSchema) {
    this._isMutable = false;
    this._documents = new ImmutableOrderedMap();
    this._withTransform = new WeakMap();
    this.serverSchema = serverSchema;
    // If a separate client schema doesn't exist, use the server schema.
    this.clientSchema = clientSchema || serverSchema;
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
   */
  applyTransforms(
    transforms: Array<IRTransform>,
    reporter?: GraphQLReporter,
  ): GraphQLCompilerContext {
    return Profiler.run('applyTransforms', () =>
      transforms.reduce(
        (ctx, transform) => ctx.applyTransform(transform, reporter),
        this,
      ),
    );
  }

  /**
   * Applies a transform to this context, returning a new context.
   *
   * This is memoized such that applying the same sequence of transforms will
   * not result in duplicated work.
   */
  applyTransform(
    transform: IRTransform,
    reporter?: GraphQLReporter,
  ): GraphQLCompilerContext {
    let transformed = this._withTransform.get(transform);
    if (!transformed) {
      const start = process.hrtime();
      transformed = Profiler.instrument(transform)(this);
      const delta = process.hrtime(start);
      const deltaMs = Math.round((delta[0] * 1e9 + delta[1]) / 1e6);
      reporter && reporter.reportTime(transform.name, deltaMs);
      this._withTransform.set(transform, transformed);
    }
    return transformed;
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
    return this._documents === result._documents ? this : result;
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
      : new GraphQLCompilerContext(this.serverSchema, this.clientSchema);
    context._documents = documents;
    return context;
  }
}

module.exports = GraphQLCompilerContext;
