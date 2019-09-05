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

import type {FormatModule} from '../RelayLanguagePluginInterface';

// ESModule support is achieved via a regex replacement of the require statements.
// this is super hacky but this was the simplest solution with the current compiler
// architecture
const requireRegex = /require\('(.*)'\)/g;

const getImportedQueryTargets = concreteText => {
  let matches;
  let output = [];
  while ((matches = requireRegex.exec(concreteText))) {
    output.push(matches[1]);
  }
  return output;
};

const buildModuleIdentifierMap = importPaths => {
  const result = {};
  importPaths.forEach(path => {
    const identifier = path.replace(/[^a-zA-Z]/g, '_');
    result[path] = identifier;
  });
  return result;
};

const printExternalQueryImports = moduleIdentifierMap => {
  let result = [];
  Object.keys(moduleIdentifierMap).forEach(path => {
    const id = moduleIdentifierMap[path];
    result.push(`import ${id} from '${path}';`);
  });
  return result.join('\n');
};

const replaceRequiresWithImportIdentifiers = (
  concreteText,
  moduleIdentifierMap,
) => {
  return concreteText.replace(requireRegex, (_, path) => {
    return moduleIdentifierMap[path];
  });
};

const formatGeneratedModule: FormatModule = ({
  moduleName,
  documentType,
  docText,
  concreteText,
  typeText,
  hash,
  sourceHash,
  esmodules,
}) => {
  const documentTypeImport = documentType
    ? `import type { ${documentType} } from 'relay-runtime';`
    : '';
  const docTextComment = docText ? '\n/*\n' + docText.trim() + '\n*/\n' : '';
  const hashText = hash ? `\n * ${hash}` : '';

  let exportText = 'module.exports = node';
  let topLevelQueryImport = undefined;
  if (esmodules) {
    const importPaths = getImportedQueryTargets(concreteText);
    const moduleIdentifierMap = buildModuleIdentifierMap(importPaths);

    exportText = 'export default node;';
    topLevelQueryImport = printExternalQueryImports(moduleIdentifierMap);
    concreteText = replaceRequiresWithImportIdentifiers(
      concreteText,
      moduleIdentifierMap,
    );
  }

  return `/**
 * ${'@'}flow${hashText}
 */

/* eslint-disable */

'use strict';

/*::
${documentTypeImport}
${typeText || ''}
*/
${topLevelQueryImport || ''}
${docTextComment}
const node/*: ${documentType || 'empty'}*/ = ${concreteText};
// prettier-ignore
(node/*: any*/).hash = '${sourceHash}';
${exportText}
`;
};

module.exports = formatGeneratedModule;
