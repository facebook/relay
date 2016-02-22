/**
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule stableStringify
 * @flow
 * @typechecks
 */

'use strict';
const invariant = require('invariant');
const RelayProfiler = require('RelayProfiler');

function stringilyObject(arg:any):string{
  return recurStringily(arg);

  function recurStringily(ob:any):string{
    if(ob===null){return 'Null'};
    // must not have undefined,
//    if(ob===undefined){return 'undefined'};
    const obType = typeof ob;
    switch (obType){
      case 'number':
      case 'string':
      case 'boolean':
      case 'symbol':
        return ob.toString();
      case 'object':
        let str='';
        for(let key of Object.keys(ob).sort()){
          let v = recurStringily(ob[key]);
          str=`${str},${key}:{${v}}`;
        }
        return str;

      case 'function':
        // todo should not allow object have functions? throw?
        return '!function';

      default:
      // should not allow the sub-value of arg has another type ?
      // should throw here?
    }

  }
}


function stableStringify(arg: any):string{
  const argType = typeof arg;
  switch (argType) {
    case 'string':
      return arg;
    case 'number':
    case 'boolean':
      return arg.toString();
    case 'object':
      return stringilyObject(arg);
    default:
      invariant(
        false,
        'function stringilyArg() only allow string|number|object' +
        'but shoule not be here' +
        'the Arg is `%s`,type is `%s`',
        arg, argType
      );
  }
}

module.exports = stableStringify;