/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule formatGeneratedModule
 * @flow
 * @format
 */

'use strict';

import type {FormatModule} from 'writeRelayGeneratedFile';

const formatGeneratedModule: FormatModule = ({
  moduleName,
  documentType,
  docText,
  concreteText,
  flowText,
  hash,
  devTextGenerator,
  relayRuntimeModule,
}) => {
  const objectName = documentType === 'ConcreteBatch' ? 'batch' : 'fragment';
  const docTextComment = docText ? '\n/*\n' + docText.trim() + '\n*/\n' : '';
  const hashText = hash ? `\n * ${hash}` : '';
  const devOnlyText = devTextGenerator ? devTextGenerator(objectName) : '';
  return `/**
 * ${'@'}flow${hashText}
 */

/* eslint-disable */

'use strict';

/*::
import type {${documentType}} from '${relayRuntimeModule}';
${flowText || ''}
*/

${docTextComment}
const ${objectName} /*: ${documentType}*/ = ${concreteText};
${devOnlyText}
module.exports = ${objectName};
`;
};

module.exports = formatGeneratedModule;
