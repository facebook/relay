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

import type {FormatModule} from './writeRelayGeneratedFile';

const formatGeneratedModule: FormatModule = ({
  moduleName,
  documentType,
  docText,
  concreteText,
  flowText,
  hash,
  relayRuntimeModule,
  sourceHash,
}) => {
  const docTextComment = docText ? '\n/*\n' + docText.trim() + '\n*/\n' : '';
  const hashText = hash ? `\n * ${hash}` : '';
  return `/**
 * ${'@'}flow${hashText}
 */

/* eslint-disable */

'use strict';

/*::
import type { ${documentType} } from '${relayRuntimeModule}';
${flowText || ''}
*/

${docTextComment}
const node/*: ${documentType}*/ = ${concreteText};
// prettier-ignore
(node/*: any*/).hash = '${sourceHash}';
module.exports = node;
`;
};

module.exports = formatGeneratedModule;
