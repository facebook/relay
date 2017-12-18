/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayFlowGenerator
 * @flow
 * @format
 */

'use strict';

const PatchedBabelGenerator = require('./PatchedBabelGenerator');
const RelayMaskTransform = require('RelayMaskTransform');
const RelayRelayDirectiveTransform = require('RelayRelayDirectiveTransform');

const nullthrows = require('nullthrows');
const t = require('babel-types');

const {
  anyTypeAlias,
  exactObjectTypeAnnotation,
  exportType,
  importTypes,
  intersectionTypeAnnotation,
  lineComments,
  readOnlyArrayOfType,
  readOnlyObjectTypeProperty,
  stringLiteralTypeAnnotation,
  unionTypeAnnotation,
} = require('./RelayFlowBabelFactories');
const {
  transformScalarType,
  transformInputType,
} = require('./RelayFlowTypeTransformers');
const {GraphQLNonNull} = require('graphql');
const {
  FlattenTransform,
  IRVisitor,
  Profiler,
  SchemaUtils,
} = require('graphql-compiler');

import type {ScalarTypeMapping} from './RelayFlowTypeTransformers';
import type {IRTransform, Fragment, Root} from 'graphql-compiler';
import type {GraphQLEnumType} from 'graphql';

const {isAbstractType} = SchemaUtils;

type Options = {|
  +customScalars: ScalarTypeMapping,
  +useHaste: boolean,
  +enumsHasteModule: ?string,
  +existingFragmentNames: Set<string>,
  +inputFieldWhiteList: $ReadOnlyArray<string>,
  +relayRuntimeModule: string,
|};

export type State = {|
  ...Options,
  +usedEnums: {[name: string]: GraphQLEnumType},
  +usedFragments: Set<string>,
|};

function generate(node: Root | Fragment, options: Options): string {
  const ast = IRVisitor.visit(node, createVisitor(options));
  return PatchedBabelGenerator.generate(ast);
}

type Selection = {
  key: string,
  schemaName?: string,
  value?: any,
  nodeType?: any,
  conditional?: boolean,
  concreteType?: string,
  ref?: string,
  nodeSelections?: ?SelectionMap,
};
type SelectionMap = Map<string, Selection>;

function makeProp(
  {key, schemaName, value, conditional, nodeType, nodeSelections}: Selection,
  state: State,
  concreteType?: string,
) {
  if (nodeType) {
    value = transformScalarType(
      nodeType,
      state,
      selectionsToBabel(
        [Array.from(nullthrows(nodeSelections).values())],
        state,
      ),
    );
  }
  if (schemaName === '__typename' && concreteType) {
    value = stringLiteralTypeAnnotation(concreteType);
  }
  const typeProperty = readOnlyObjectTypeProperty(key, value);
  if (conditional) {
    typeProperty.optional = true;
  }
  return typeProperty;
}

const isTypenameSelection = selection => selection.schemaName === '__typename';
const hasTypenameSelection = selections => selections.some(isTypenameSelection);
const onlySelectsTypename = selections => selections.every(isTypenameSelection);

function selectionsToBabel(selections, state: State, refTypeName?: string) {
  const baseFields = new Map();
  const byConcreteType = {};

  flattenArray(selections).forEach(selection => {
    const {concreteType} = selection;
    if (concreteType) {
      byConcreteType[concreteType] = byConcreteType[concreteType] || [];
      byConcreteType[concreteType].push(selection);
    } else {
      const previousSel = baseFields.get(selection.key);

      baseFields.set(
        selection.key,
        previousSel ? mergeSelection(selection, previousSel) : selection,
      );
    }
  });

  const types = [];

  if (
    Object.keys(byConcreteType).length &&
    onlySelectsTypename(Array.from(baseFields.values())) &&
    (hasTypenameSelection(Array.from(baseFields.values())) ||
      Object.keys(byConcreteType).every(type =>
        hasTypenameSelection(byConcreteType[type]),
      ))
  ) {
    for (const concreteType in byConcreteType) {
      types.push(
        groupRefs([
          ...Array.from(baseFields.values()),
          ...byConcreteType[concreteType],
        ]).map(selection => makeProp(selection, state, concreteType)),
      );
    }
    // It might be some other type then the listed concrete types. Ideally, we
    // would set the type to diff(string, set of listed concrete types), but
    // this doesn't exist in Flow at the time.
    const otherProp = readOnlyObjectTypeProperty(
      '__typename',
      stringLiteralTypeAnnotation('%other'),
    );
    otherProp.leadingComments = lineComments(
      "This will never be '%other', but we need some",
      'value in case none of the concrete values match.',
    );
    types.push([otherProp]);
  } else {
    let selectionMap = selectionsToMap(Array.from(baseFields.values()));
    for (const concreteType in byConcreteType) {
      selectionMap = mergeSelections(
        selectionMap,
        selectionsToMap(
          byConcreteType[concreteType].map(sel => ({
            ...sel,
            conditional: true,
          })),
        ),
      );
    }
    const selectionMapValues = groupRefs(Array.from(selectionMap.values())).map(
      sel =>
        isTypenameSelection(sel) && sel.concreteType
          ? makeProp({...sel, conditional: false}, state, sel.concreteType)
          : makeProp(sel, state),
    );
    types.push(selectionMapValues);
  }

  return unionTypeAnnotation(
    types.map(props => {
      if (refTypeName) {
        props.push(
          readOnlyObjectTypeProperty('$refType', t.identifier(refTypeName)),
        );
      }
      return exactObjectTypeAnnotation(props);
    }),
  );
}

function mergeSelection(a: ?Selection, b: Selection): Selection {
  if (!a) {
    return {
      ...b,
      conditional: true,
    };
  }
  return {
    ...a,
    nodeSelections: a.nodeSelections
      ? mergeSelections(a.nodeSelections, nullthrows(b.nodeSelections))
      : null,
    conditional: a.conditional && b.conditional,
  };
}

function mergeSelections(a: SelectionMap, b: SelectionMap): SelectionMap {
  const merged = new Map();
  for (const [key, value] of a.entries()) {
    merged.set(key, value);
  }
  for (const [key, value] of b.entries()) {
    merged.set(key, mergeSelection(a.get(key), value));
  }
  return merged;
}

function isPlural(node: Fragment): boolean {
  return Boolean(node.metadata && node.metadata.plural);
}

function createVisitor(options: Options) {
  const state = {
    customScalars: options.customScalars,
    enumsHasteModule: options.enumsHasteModule,
    existingFragmentNames: options.existingFragmentNames,
    inputFieldWhiteList: options.inputFieldWhiteList,
    relayRuntimeModule: options.relayRuntimeModule,
    usedEnums: {},
    usedFragments: new Set(),
    useHaste: options.useHaste,
  };

  return {
    leave: {
      Root(node) {
        const inputVariablesType = generateInputVariablesType(node, state);
        const responseType = exportType(
          `${node.name}Response`,
          selectionsToBabel(node.selections, state),
        );
        return t.program([
          ...getFragmentImports(state),
          ...getEnumDefinitions(state),
          inputVariablesType,
          responseType,
        ]);
      },

      Fragment(node) {
        let selections = flattenArray(node.selections);
        const numConecreteSelections = selections.filter(s => s.concreteType)
          .length;
        selections = selections.map(selection => {
          if (
            numConecreteSelections <= 1 &&
            isTypenameSelection(selection) &&
            !isAbstractType(node.type)
          ) {
            return [
              {
                ...selection,
                concreteType: node.type.toString(),
              },
            ];
          }
          return [selection];
        });
        const refTypeName = getRefTypeName(node.name);
        const refType = t.expressionStatement(
          t.identifier(
            `export opaque type ${refTypeName}: FragmentReference = FragmentReference`,
          ),
        );
        const baseType = selectionsToBabel(selections, state, refTypeName);
        const type = isPlural(node) ? readOnlyArrayOfType(baseType) : baseType;
        return t.program([
          ...getFragmentImports(state),
          ...getEnumDefinitions(state),
          importTypes(['FragmentReference'], state.relayRuntimeModule),
          refType,
          exportType(node.name, type),
        ]);
      },

      InlineFragment(node) {
        const typeCondition = node.typeCondition;
        return flattenArray(node.selections).map(typeSelection => {
          return isAbstractType(typeCondition)
            ? {
                ...typeSelection,
                conditional: true,
              }
            : {
                ...typeSelection,
                concreteType: typeCondition.toString(),
              };
        });
      },
      Condition(node) {
        return flattenArray(node.selections).map(selection => {
          return {
            ...selection,
            conditional: true,
          };
        });
      },
      ScalarField(node) {
        return [
          {
            key: node.alias || node.name,
            schemaName: node.name,
            value: transformScalarType(node.type, state),
          },
        ];
      },
      LinkedField(node) {
        return [
          {
            key: node.alias || node.name,
            schemaName: node.name,
            nodeType: node.type,
            nodeSelections: selectionsToMap(flattenArray(node.selections)),
          },
        ];
      },
      FragmentSpread(node) {
        state.usedFragments.add(node.name);
        return [
          {
            key: '__fragments_' + node.name,
            ref: node.name,
          },
        ];
      },
    },
  };
}

function selectionsToMap(selections: Array<Selection>): SelectionMap {
  const map = new Map();
  selections.forEach(selection => {
    const previousSel = map.get(selection.key);
    map.set(
      selection.key,
      previousSel ? mergeSelection(previousSel, selection) : selection,
    );
  });
  return map;
}

function flattenArray<T>(arrayOfArrays: Array<Array<T>>): Array<T> {
  const result = [];
  arrayOfArrays.forEach(array => result.push(...array));
  return result;
}

function generateInputVariablesType(node: Root, state: State) {
  return exportType(
    `${node.name}Variables`,
    exactObjectTypeAnnotation(
      node.argumentDefinitions.map(arg => {
        const property = t.objectTypeProperty(
          t.identifier(arg.name),
          transformInputType(arg.type, state),
        );
        if (!(arg.type instanceof GraphQLNonNull)) {
          property.optional = true;
        }
        return property;
      }),
    ),
  );
}

function groupRefs(props): Array<Selection> {
  const result = [];
  const refs = [];
  props.forEach(prop => {
    if (prop.ref) {
      refs.push(prop.ref);
    } else {
      result.push(prop);
    }
  });
  if (refs.length > 0) {
    const value = intersectionTypeAnnotation(
      refs.map(ref => t.identifier(getRefTypeName(ref))),
    );
    result.push({
      key: '__fragments',
      conditional: false,
      value,
    });
  }
  return result;
}

function getFragmentImports(state: State) {
  const imports = [];
  if (state.usedFragments.size > 0) {
    const usedFragments = Array.from(state.usedFragments).sort();
    for (const usedFragment of usedFragments) {
      const refTypeName = getRefTypeName(usedFragment);
      if (state.useHaste && state.existingFragmentNames.has(usedFragment)) {
        // TODO(T22653277) support non-haste environments when importing
        // fragments
        imports.push(importTypes([refTypeName], usedFragment + '.graphql'));
      } else {
        imports.push(anyTypeAlias(refTypeName));
      }
    }
  }
  return imports;
}

function getEnumDefinitions({enumsHasteModule, usedEnums}: State) {
  const enumNames = Object.keys(usedEnums).sort();
  if (enumNames.length === 0) {
    return [];
  }
  if (enumsHasteModule) {
    return [importTypes(enumNames, enumsHasteModule)];
  }
  return enumNames.map(name => {
    const values = usedEnums[name].getValues().map(({value}) => value);
    values.sort();
    values.push('%future added value');
    return exportType(
      name,
      t.unionTypeAnnotation(
        values.map(value => stringLiteralTypeAnnotation(value)),
      ),
    );
  });
}

function getRefTypeName(name: string): string {
  return `${name}$ref`;
}

const FLOW_TRANSFORMS: Array<IRTransform> = [
  RelayRelayDirectiveTransform.transform,
  RelayMaskTransform.transform,
  FlattenTransform.transformWithOptions({}),
];

module.exports = {
  generate: Profiler.instrument(generate, 'RelayFlowGenerator.generate'),
  flowTransforms: FLOW_TRANSFORMS,
};
