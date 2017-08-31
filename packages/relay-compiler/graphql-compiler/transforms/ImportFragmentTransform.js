'use strict';

const path = require('path');
const resolve = require('resolve');
const RelayIRTransformer = require('../core/RelayIRTransformer');
const RelayCompilerContext = require('../core/RelayCompilerContext');

import type {FragmentSpread} from '../core/RelayIR';
import type {GraphQLSchema, GraphQLType} from 'graphql';

type State = {
  schema: GraphQLSchema,
  parentType: GraphQLType,
};

const SCHEMA_EXTENSION = `
  # allows importing fragments from another module
  directive @import(
    # module to import fragment from
    from: String!,
    
    # name of the fragment in the module being imported from
    name: String
  ) on FRAGMENT_SPREAD`;

function transform(
  context: RelayCompilerContext,
  schema: GraphQLSchema,
): RelayCompilerContext {
  return RelayIRTransformer.transform(
    context,
    {
      FragmentSpread: visitFragmentSpread,
    },
    () => schema,
  );
}

function visitFragmentSpread(
  spread: FragmentSpread,
  state: State,
): ?FragmentSpread {
  const context = this.getContext();
  const importDirective = spread.directives.find(d => d.name === 'import');
  let document;
  if (importDirective) {
    const fromArg = importDirective.args.find(a => a.name === 'from');
    const nameArg = importDirective.args.find(a => a.name === 'name');
    const name = nameArg ? nameArg.value.value : spread.name;
    const module = resolve.sync(fromArg.value.value, {
      extensions: ['.js', '.jsx', '.mjs'],
      basedir: path.dirname(spread.metadata.filePath),
    });
    document = context
      .documents()
      .find(
        d =>
          d.metadata &&
          d.metadata.originalName === name &&
          d.metadata.filePath === module,
      );
  } else {
    const matchingDocuments = context
      .documents()
      .filter(d => d.metadata && d.metadata.originalName === spread.name);

    document = matchingDocuments[0];
    if (matchingDocuments.length > 1) {
      console.warn(
        `Ambiguous fragment spread ${spread.name} found in ${spread.metadata.filePath}. \n` +
          `  Using ${document.metadata.filePath}.`,
      );
    }
  }
  const nextSpread = this.traverse(spread, state);
  return {
    ...nextSpread,
    name: document.name,
  };
}

module.exports = {
  transform,
  SCHEMA_EXTENSION,
};
