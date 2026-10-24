/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {
  NormalizationClientEdgeToClientObject,
  NormalizationClientEdgeToServerObject,
  NormalizationLiveResolverField,
  NormalizationResolverField,
  NormalizationSelection,
} from '../util/NormalizationNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {
  NormalizationSelector,
  OperationLoader,
  RecordSource,
  S2CExecution,
} from './RelayStoreTypes';

const {
  INTERNAL_ACTOR_IDENTIFIER_DO_NOT_USE,
} = require('../multi-actor-environment/ActorIdentifier');
const {DataChecker} = require('./DataChecker');
const defaultGetDataID = require('./defaultGetDataID');
const RelayModernRecord = require('./RelayModernRecord');
const RelayRecordSource = require('./RelayRecordSource');
const invariant = require('invariant');

type S2CSelection =
  | NormalizationClientEdgeToClientObject
  | NormalizationClientEdgeToServerObject
  | NormalizationLiveResolverField
  | NormalizationResolverField;

export type ExecTimeS2CIncompleteReason = 'abstract_refinement' | 'missing';

/**
 * The server-to-client executions a response carrying the store's data would
 * produce, or why the store cannot stand in for that response.
 */
export type ExecTimeS2CWork =
  | Readonly<{executions: ReadonlyArray<S2CExecution>, kind: 'complete'}>
  | Readonly<{kind: 'incomplete', reason: ExecTimeS2CIncompleteReason}>;

/**
 * Collects the exec-time server-to-client (S2C) work of an exec-time
 * operation from `source`: the executions that normalizing a response carrying
 * that data would produce, with what its deferred, streamed and module
 * payloads would bring. Call it once `check()` has found the operation
 * available: it walks only the selections on the way to S2C resolvers, and the
 * work is incomplete when `source` lacks anything there or anything the
 * resolvers' root fragments read. Missing-field handlers are not asked.
 */
function check(
  source: RecordSource,
  selector: NormalizationSelector,
  operationLoader: ?OperationLoader,
): ExecTimeS2CWork {
  const checker = new ExecTimeS2CDataChecker(
    source,
    selector.variables,
    operationLoader == null
      ? null
      : {
          get: reference => {
            const operation = operationLoader.get(reference);
            return operation?.kind === 'SplitOperation'
              ? {...operation, selections: getChecks(operation.selections)}
              : operation;
          },
          load: reference => operationLoader.load(reference),
        },
  );
  const {node} = selector;
  const {status} = checker.check(
    {...node, selections: getChecks(node.selections, false, true)},
    selector.dataID,
  );
  if (status === 'missing') {
    return {kind: 'incomplete', reason: 'missing'};
  }
  return checker.getWork();
}

class ExecTimeS2CDataChecker extends DataChecker {
  // Grouped by record, in the order the normalizer collects them.
  _s2cExecutions: Map<
    DataID,
    {selections: Array<S2CSelection>, typeName: string},
  > = new Map();
  _s2cIncompleteReason: ExecTimeS2CIncompleteReason | null = null;
  _s2cSource: RecordSource;

  constructor(
    source: RecordSource,
    variables: Variables,
    operationLoader: ?OperationLoader,
  ) {
    super(
      () => source,
      // Takes the client abstract types the operation declares, which only
      // this walk reads.
      () => RelayRecordSource.create(),
      INTERNAL_ACTOR_IDENTIFIER_DO_NOT_USE,
      variables,
      [],
      operationLoader,
      defaultGetDataID,
      null,
      true,
    );
    this._s2cSource = source;
  }

  getWork(): ExecTimeS2CWork {
    const reason = this._s2cIncompleteReason;
    if (reason !== null) {
      return {kind: 'incomplete', reason};
    }
    return {
      executions: Array.from(
        this._s2cExecutions,
        ([recordID, {selections, typeName}]) => ({
          recordID,
          selections,
          typeName,
        }),
      ),
      kind: 'complete',
    };
  }

  /**
   * The normalizer's `_collectS2CExecution`. The walk checks the resolver's
   * root fragment just before it (`toChecks`), as the normalizer writes it.
   */
  checkExecTimeResolver(selection: S2CSelection, dataID: DataID): void {
    const record = this._s2cSource.get(dataID);
    invariant(
      record != null,
      'ExecTimeS2CDataChecker: Expected record `%s` to exist.',
      dataID,
    );
    let entry = this._s2cExecutions.get(dataID);
    if (entry == null) {
      entry = {selections: [], typeName: RelayModernRecord.getType(record)};
      this._s2cExecutions.set(dataID, entry);
    }
    entry.selections.push(selection);
  }

  // The normalizer stores `false` for any refinement a response has no hint
  // for, including one another operation left out of its text, so what lies
  // behind a refinement held as `false` may be lost: S2C work, which is all
  // this walk follows, or a root fragment's input.
  onRefinementRuledOut(): void {
    this._s2cIncompleteReason = 'abstract_refinement';
  }
}

// What the walk checks, by the selections it is taken from: an operation's, a
// module operation's or a root fragment's, which is all a selections array is
// ever used as. Kept apart on the root record and below it, where a root
// fragment can be read too. Created on first use: relay-runtime also loads
// where `WeakMap` is missing.
type ChecksCache = WeakMap<
  ReadonlyArray<NormalizationSelection>,
  ReadonlyArray<NormalizationSelection>,
>;
let checksCache: ?{belowRoot: ChecksCache, onRoot: ChecksCache} = null;

function getChecks(
  selections: ReadonlyArray<NormalizationSelection>,
  isRootFragment: boolean = false,
  isRoot: boolean = false,
): ReadonlyArray<NormalizationSelection> {
  if (checksCache == null) {
    checksCache = {belowRoot: new WeakMap(), onRoot: new WeakMap()};
  }
  const cache = isRoot ? checksCache.onRoot : checksCache.belowRoot;
  let checks = cache.get(selections);
  if (checks == null) {
    checks = toChecks(selections, isRootFragment, false, isRoot);
    cache.set(selections, checks);
  }
  return checks;
}

/**
 * What the walk checks: the selections the normalizer collects S2C work on,
 * each resolver or client edge with a root fragment preceded by that fragment,
 * spread in the variables the resolver's arguments bind, when it reads server
 * fields. A root fragment keeps every server selection, a refinement's
 * discriminator included; elsewhere only what leads to S2C work is kept, with
 * no handle copy or actor change, which a response holds none of.
 *
 * Inside a client extension a response holds no data: a link there is a
 * client link, a module there has no operation on a server record, and a
 * refinement there is on a type only client records have (the compiler keeps
 * every server-type refinement out of client extensions). So only resolvers,
 * conditions, `@defer`/`@stream` and fragment spreads are kept there, and the
 * extension is unwrapped so that a miss in a root fragment counts. On the root
 * record, concrete refinements are unwrapped: the normalizer matches them
 * whatever their type.
 */
function toChecks(
  selections: ReadonlyArray<NormalizationSelection>,
  isRootFragment: boolean,
  isClientExtension: boolean,
  isRoot: boolean,
): ReadonlyArray<NormalizationSelection> {
  const checks: Array<NormalizationSelection> = [];
  selections.forEach(selection => {
    switch (selection.kind) {
      case 'ClientEdgeToClientObject':
      case 'ClientEdgeToServerObject':
      case 'RelayLiveResolver':
      case 'RelayResolver': {
        const resolver =
          selection.kind === 'ClientEdgeToClientObject' ||
          selection.kind === 'ClientEdgeToServerObject'
            ? selection.backingField
            : selection;
        const rootFragment = resolver.resolverInfo?.rootFragment;
        if (rootFragment != null) {
          if (rootFragment.metadata?.hasServerField === true) {
            checks.push({
              args: resolver.args,
              fragment: {
                ...rootFragment,
                selections: getChecks(rootFragment.selections, true, isRoot),
              },
              kind: 'FragmentSpread',
            });
          }
          checks.push(selection);
        }
        break;
      }
      case 'ClientExtension':
        checks.push(
          ...toChecks(selection.selections, isRootFragment, true, isRoot),
        );
        break;
      case 'Condition':
      case 'Defer':
      case 'Stream': {
        const children = toChecks(
          selection.selections,
          isRootFragment,
          isClientExtension,
          isRoot,
        );
        if (children.length > 0) {
          checks.push({...selection, selections: children});
        }
        break;
      }
      case 'FragmentSpread': {
        const children = toChecks(
          selection.fragment.selections,
          isRootFragment,
          isClientExtension,
          isRoot,
        );
        if (children.length > 0) {
          checks.push({
            ...selection,
            fragment: {...selection.fragment, selections: children},
          });
        }
        break;
      }
      case 'InlineFragment':
      case 'LinkedField': {
        if (isClientExtension) {
          break;
        }
        const children = toChecks(
          selection.selections,
          isRootFragment,
          false,
          isRoot && selection.kind === 'InlineFragment',
        );
        if (
          isRoot &&
          selection.kind === 'InlineFragment' &&
          selection.abstractKey == null
        ) {
          checks.push(...children);
        } else if (children.length > 0 || isRootFragment) {
          checks.push({...selection, selections: children});
        }
        break;
      }
      case 'ModuleImport':
        if (!isClientExtension) {
          checks.push(selection);
        }
        break;
      case 'ActorChange':
      case 'LinkedHandle':
      case 'ScalarField':
      case 'ScalarHandle':
      case 'TypeDiscriminator':
        if (isRootFragment && !isClientExtension) {
          checks.push(selection);
        }
        break;
      default:
        selection as empty;
    }
  });
  return checks;
}

module.exports = {check};
