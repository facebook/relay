/**
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRecordUtil
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
        log(`obType:  ${obType} - ${ob.toString()}`);
        return ob.toString();

      case 'function':
        return '!function';//should not allow functions?

      case 'object':
        let str='';
        for(let key of Object.keys(ob).sort()){
          let v = recurStringily(ob[key]);
          str=`${str},${key}:{${v}}`;
        }
        return str;
      default:
      // should not allow the sub-value of arg has another type ?
      // should throw here?
    }

  }
}

var RelayRecordUtil={
  stringifyArg(arg: any):string{
    const argType = typeof arg;
    switch (argType) {
      case 'string':
        return arg;
      case 'number':
        return arg.toString();
      case 'object':
        return stringilyObject(arg);
      default:
        invariant(
          true,
          'function stringilyArg() only allow string|number|object' +
          'but shoule not be here' +
          'the Arg is `%s`,type is `%s`',
          arg, argType
        );
        return '';
    }

  }
};

RelayProfiler.instrumentMethods(RelayRecordUtil, {
  stringifyArg: 'RelayRecordUtil.stringifyArg',
});

module.exports = RelayRecordUtil;