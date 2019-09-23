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

const ConnectionFieldTransform = require('../../transforms/ConnectionFieldTransform');
const FlattenTransform = require('../../transforms/FlattenTransform');
const IRVisitor = require('../../core/GraphQLIRVisitor');
const Profiler = require('../../core/GraphQLCompilerProfiler');
const RelayMaskTransform = require('../../transforms/RelayMaskTransform');
const RelayMatchTransform = require('../../transforms/RelayMatchTransform');
const RelayRefetchableFragmentTransform = require('../../transforms/RelayRefetchableFragmentTransform');
const RelayRelayDirectiveTransform = require('../../transforms/RelayRelayDirectiveTransform');

const {isAbstractType} = require('../../core/GraphQLSchemaUtils');
const {createUserError} = require('../../core/RelayCompilerError');
const {
  anyTypeAlias,
  declareExportOpaqueType,
  exactObjectTypeAnnotation,
  exportType,
  exportTypes,
  importTypes,
  intersectionTypeAnnotation,
  lineComments,
  readOnlyArrayOfType,
  readOnlyObjectTypeProperty,
  unionTypeAnnotation,
} = require('./RelayFlowBabelFactories');
const {
  transformInputType,
  transformScalarType,
} = require('./RelayFlowTypeTransformers');

import type {IRTransform} from '../../core/GraphQLCompilerContext';
import type {Fragment, Root, Directive, Metadata} from '../../core/GraphQLIR';
import type {TypeGeneratorOptions} from '../RelayLanguagePluginInterface';
import type {GraphQLEnumType} from 'graphql';
const babelGenerator = require('@babel/generator').default;
const t = require('@babel/types');
const {
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
} = require('graphql');
const invariant = require('invariant');
const nullthrows = require('nullthrows');

const MODULE_IMPORT_FIELD = 'MODULE_IMPORT_FIELD';

export type State = {|
  ...TypeGeneratorOptions,
  +generatedFragments: Set<string>,
  +generatedInputObjectTypes: {
    [name: string]: GraphQLInputObjectType | 'pending',
  },
  hasConnectionResolver: boolean,
  +usedEnums: {[name: string]: GraphQLEnumType},
  +usedFragments: Set<string>,
  +matchFields: Map<string, mixed>,
|};

function generate(
  node: Root | Fragment,
  options: TypeGeneratorOptions,
): string {
  const ast = IRVisitor.visit(node, createVisitor(options));
  return babelGenerator(ast).code;
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
  unmasked: boolean,
  concreteType?: string,
) {
  if (nodeType) {
    value = transformScalarType(
      nodeType,
      state,
      selectionsToBabel(
        [Array.from(nullthrows(nodeSelections).values())],
        state,
        unmasked,
      ),
    );
  }
  if (schemaName === '__typename' && concreteType) {
    value = t.stringLiteralTypeAnnotation(concreteType);
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

function selectionsToBabel(
  selections: $ReadOnlyArray<$ReadOnlyArray<Selection>>,
  state: State,
  unmasked: boolean,
  fragmentTypeName?: string,
) {
  const baseFields = new Map();
  const byConcreteType = {};

  flattenArray(selections).forEach(selection => {
    const {concreteType} = selection;
    if (concreteType) {
      byConcreteType[concreteType] = byConcreteType[concreteType] ?? [];
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
    Object.keys(byConcreteType).length > 0 &&
    onlySelectsTypename(Array.from(baseFields.values())) &&
    (hasTypenameSelection(Array.from(baseFields.values())) ||
      Object.keys(byConcreteType).every(type =>
        hasTypenameSelection(byConcreteType[type]),
      ))
  ) {
    const typenameAliases = new Set();
    for (const concreteType in byConcreteType) {
      types.push(
        groupRefs([
          ...Array.from(baseFields.values()),
          ...byConcreteType[concreteType],
        ]).map(selection => {
          if (selection.schemaName === '__typename') {
            typenameAliases.add(selection.key);
          }
          return makeProp(selection, state, unmasked, concreteType);
        }),
      );
    }
    // It might be some other type then the listed concrete types. Ideally, we
    // would set the type to diff(string, set of listed concrete types), but
    // this doesn't exist in Flow at the time.
    types.push(
      Array.from(typenameAliases).map(typenameAlias => {
        const otherProp = readOnlyObjectTypeProperty(
          typenameAlias,
          t.stringLiteralTypeAnnotation('%other'),
        );
        otherProp.leadingComments = lineComments(
          "This will never be '%other', but we need some",
          'value in case none of the concrete values match.',
        );
        return otherProp;
      }),
    );
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
          ? makeProp(
              {...sel, conditional: false},
              state,
              unmasked,
              sel.concreteType,
            )
          : makeProp(sel, state, unmasked),
    );
    types.push(selectionMapValues);
  }

  return unionTypeAnnotation(
    types.map(props => {
      if (fragmentTypeName) {
        props.push(
          readOnlyObjectTypeProperty(
            '$refType',
            t.genericTypeAnnotation(t.identifier(fragmentTypeName)),
          ),
        );
      }
      return unmasked
        ? t.objectTypeAnnotation(props)
        : exactObjectTypeAnnotation(props);
    }),
  );
}

function mergeSelection(
  a: ?Selection,
  b: Selection,
  shouldSetConditional: boolean = true,
): Selection {
  if (!a) {
    if (shouldSetConditional) {
      return {
        ...b,
        conditional: true,
      };
    }
    return b;
  }
  return {
    ...a,
    nodeSelections: a.nodeSelections
      ? mergeSelections(
          a.nodeSelections,
          nullthrows(b.nodeSelections),
          shouldSetConditional,
        )
      : null,
    conditional: a.conditional && b.conditional,
  };
}

function mergeSelections(
  a: SelectionMap,
  b: SelectionMap,
  shouldSetConditional: boolean = true,
): SelectionMap {
  const merged = new Map();
  for (const [key, value] of a.entries()) {
    merged.set(key, value);
  }
  for (const [key, value] of b.entries()) {
    merged.set(key, mergeSelection(a.get(key), value, shouldSetConditional));
  }
  return merged;
}

function isPlural(node: Fragment): boolean {
  return Boolean(node.metadata && node.metadata.plural);
}

function createVisitor(options: TypeGeneratorOptions) {
  const state = {
    customScalars: options.customScalars,
    enumsHasteModule: options.enumsHasteModule,
    existingFragmentNames: options.existingFragmentNames,
    generatedFragments: new Set(),
    generatedInputObjectTypes: {},
    hasConnectionResolver: false,
    optionalInputFields: options.optionalInputFields,
    usedEnums: {},
    usedFragments: new Set(),
    useHaste: options.useHaste,
    useSingleArtifactDirectory: options.useSingleArtifactDirectory,
    noFutureProofEnums: options.noFutureProofEnums,
    matchFields: new Map(),
  };
  return {
    leave: {
      Root(node) {
        const inputVariablesType = generateInputVariablesType(node, state);
        const inputObjectTypes = generateInputObjectTypes(state);
        const responseType = exportType(
          `${node.name}Response`,
          selectionsToBabel(
            /* $FlowFixMe: selections have already been transformed */
            (node.selections: $ReadOnlyArray<$ReadOnlyArray<Selection>>),
            state,
            false,
          ),
        );

        const operationTypes = [
          t.objectTypeProperty(
            t.identifier('variables'),
            t.genericTypeAnnotation(t.identifier(`${node.name}Variables`)),
          ),
          t.objectTypeProperty(
            t.identifier('response'),
            t.genericTypeAnnotation(t.identifier(`${node.name}Response`)),
          ),
        ];

        // Generate raw response type
        let rawResponseType;
        const {normalizationIR} = options;
        if (
          normalizationIR &&
          node.directives.some(d => d.name === DIRECTIVE_NAME)
        ) {
          rawResponseType = IRVisitor.visit(
            normalizationIR,
            createRawResponseTypeVisitor(state),
          );
        }
        const refetchableFragmentName = getRefetchableQueryParentFragmentName(
          state,
          node.metadata,
        );
        let importedTypes: ?Array<string>;
        if (state.hasConnectionResolver) {
          importedTypes = ['ConnectionReference'];
        }
        const babelNodes = [
          ...(refetchableFragmentName
            ? generateFragmentRefsForRefetchable(refetchableFragmentName)
            : getFragmentImports(state)),
          ...(importedTypes ? importTypes(importedTypes, 'relay-runtime') : []),
          ...getEnumDefinitions(state),
          ...inputObjectTypes,
          inputVariablesType,
          responseType,
        ];

        if (rawResponseType) {
          for (const [key, ast] of state.matchFields) {
            babelNodes.push(t.typeAlias(t.identifier(key), null, ast));
          }
          operationTypes.push(
            t.objectTypeProperty(
              t.identifier('rawResponse'),
              t.genericTypeAnnotation(t.identifier(`${node.name}RawResponse`)),
            ),
          );
          babelNodes.push(rawResponseType);
        }

        babelNodes.push(
          exportType(node.name, exactObjectTypeAnnotation(operationTypes)),
        );

        return t.program(babelNodes);
      },
      Fragment(node) {
        let selections = flattenArray(
          /* $FlowFixMe: selections have already been transformed */
          (node.selections: $ReadOnlyArray<$ReadOnlyArray<Selection>>),
        );
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
        state.generatedFragments.add(node.name);
        const fragmentTypes = getFragmentTypes(
          node.name,
          getRefetchableQueryPath(state, node.directives),
        );

        const refTypeName = getRefTypeName(node.name);
        const refTypeDataProperty = readOnlyObjectTypeProperty(
          '$data',
          t.genericTypeAnnotation(t.identifier(`${node.name}$data`)),
        );
        refTypeDataProperty.optional = true;
        const refTypeFragmentRefProperty = readOnlyObjectTypeProperty(
          '$fragmentRefs',
          t.genericTypeAnnotation(
            t.identifier(getOldFragmentTypeName(node.name)),
          ),
        );
        const isPluralFragment = isPlural(node);
        const refType = t.objectTypeAnnotation([
          refTypeDataProperty,
          refTypeFragmentRefProperty,
        ]);

        const dataTypeName = getDataTypeName(node.name);
        const dataType = t.genericTypeAnnotation(t.identifier(node.name));

        const unmasked = node.metadata != null && node.metadata.mask === false;
        const baseType = selectionsToBabel(
          selections,
          state,
          unmasked,
          unmasked ? undefined : getOldFragmentTypeName(node.name),
        );
        const type = isPluralFragment
          ? readOnlyArrayOfType(baseType)
          : baseType;
        const importedTypes = ['FragmentReference'];
        if (state.hasConnectionResolver) {
          importedTypes.push('ConnectionReference');
        }

        return t.program([
          ...getFragmentImports(state),
          ...getEnumDefinitions(state),
          importTypes(importedTypes.sort(), 'relay-runtime'),
          ...fragmentTypes,
          exportType(node.name, type),
          exportType(dataTypeName, dataType),
          exportType(
            refTypeName,
            isPluralFragment ? readOnlyArrayOfType(refType) : refType,
          ),
        ]);
      },
      InlineFragment(node) {
        const typeCondition = node.typeCondition;
        return flattenArray(
          /* $FlowFixMe: selections have already been transformed */
          (node.selections: $ReadOnlyArray<$ReadOnlyArray<Selection>>),
        ).map(typeSelection => {
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
      Condition: visitCondition,
      ScalarField(node) {
        return visitScalarField(node, state);
      },
      Connection(node) {
        return visitConnection(node, state);
      },
      ConnectionField: visitLinkedField,
      LinkedField: visitLinkedField,
      ModuleImport(node) {
        return [
          {
            key: '__fragmentPropName',
            conditional: true,
            value: transformScalarType(GraphQLString, state),
          },
          {
            key: '__module_component',
            conditional: true,
            value: transformScalarType(GraphQLString, state),
          },
          {
            key: '__fragments_' + node.name,
            ref: node.name,
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

function visitCondition(node, state) {
  return flattenArray(
    /* $FlowFixMe: selections have already been transformed */
    (node.selections: $ReadOnlyArray<$ReadOnlyArray<Selection>>),
  ).map(selection => {
    return {
      ...selection,
      conditional: true,
    };
  });
}

function visitScalarField(node, state) {
  return [
    {
      key: node.alias,
      schemaName: node.name,
      value: transformScalarType(node.type, state),
    },
  ];
}

function visitConnection(node, state) {
  state.hasConnectionResolver = true;
  /* $FlowFixMe: selections have already been transformed */
  const babel = selectionsToBabel(node.selections, state, false, null);
  if (
    babel == null ||
    typeof babel !== 'object' ||
    babel.type !== 'ObjectTypeAnnotation' ||
    !Array.isArray(babel.properties)
  ) {
    throw createUserError(
      'Cannot generate flow types for connection field, expected an edges ' +
        'selection.',
      [node.loc],
    );
  }
  const edgesProperty: $FlowFixMe = babel.properties.find(prop => {
    return (
      prop != null &&
      typeof prop === 'object' &&
      prop.type === 'ObjectTypeProperty' &&
      prop.key != null &&
      typeof prop.key === 'object' &&
      prop.key.name === 'edges'
    );
  });
  const edgeTypeParams =
    edgesProperty?.value?.typeAnnotation?.typeParameters?.params;
  const edgeType = Array.isArray(edgeTypeParams) ? edgeTypeParams[0] : null;
  if (edgeType == null) {
    throw createUserError(
      'Cannot generate flow types for connection field, expected an edges ' +
        'selection.',
      [node.loc],
    );
  }
  return [
    {
      key: '__connection',
      conditional: true,
      value: t.genericTypeAnnotation(
        t.identifier('ConnectionReference'),
        t.typeParameterInstantiation([edgeType]),
      ),
    },
  ];
}

function visitLinkedField(node) {
  return [
    {
      key: node.alias,
      schemaName: node.name,
      nodeType: node.type,
      nodeSelections: selectionsToMap(
        flattenArray(
          /* $FlowFixMe: selections have already been transformed */
          (node.selections: $ReadOnlyArray<$ReadOnlyArray<Selection>>),
        ),
        /*
         * append concreteType to key so overlapping fields with different
         * concreteTypes don't get overwritten by each other
         */
        true,
      ),
    },
  ];
}

function makeRawResponseProp(
  {key, schemaName, value, conditional, nodeType, nodeSelections}: Selection,
  state: State,
  concreteType: ?string,
) {
  if (nodeType) {
    if (nodeType === MODULE_IMPORT_FIELD) {
      return t.objectTypeSpreadProperty(
        t.genericTypeAnnotation(t.identifier(key)),
      );
    }
    value = transformScalarType(
      nodeType,
      state,
      selectionsToRawResponseBabel(
        [Array.from(nullthrows(nodeSelections).values())],
        state,
        isAbstractType(nodeType) ? null : nodeType.name,
      ),
    );
  }
  if (schemaName === '__typename' && concreteType) {
    value = t.stringLiteralTypeAnnotation(concreteType);
  }
  const typeProperty = readOnlyObjectTypeProperty(key, value);
  if (conditional) {
    typeProperty.optional = true;
  }
  return typeProperty;
}

// Trasform the codegen IR selections into Babel flow types
function selectionsToRawResponseBabel(
  selections: $ReadOnlyArray<$ReadOnlyArray<Selection>>,
  state: State,
  nodeTypeName: ?string,
) {
  const baseFields = [];
  const byConcreteType = {};

  flattenArray(selections).forEach(selection => {
    const {concreteType} = selection;
    if (concreteType) {
      byConcreteType[concreteType] = byConcreteType[concreteType] ?? [];
      byConcreteType[concreteType].push(selection);
    } else {
      baseFields.push(selection);
    }
  });

  const types = [];
  if (Object.keys(byConcreteType).length) {
    const baseFieldsMap = selectionsToMap(baseFields);
    for (const concreteType in byConcreteType) {
      types.push(
        Array.from(
          mergeSelections(
            baseFieldsMap,
            selectionsToMap(byConcreteType[concreteType]),
            false,
          ).values(),
        ).map(selection => {
          if (isTypenameSelection(selection)) {
            return makeRawResponseProp(
              {...selection, conditional: false},
              state,
              concreteType,
            );
          }
          return makeRawResponseProp(selection, state, concreteType);
        }),
      );
    }
  }
  if (baseFields.length) {
    types.push(
      baseFields.map(selection => {
        if (isTypenameSelection(selection)) {
          return makeRawResponseProp(
            {...selection, conditional: false},
            state,
            nodeTypeName,
          );
        }
        return makeRawResponseProp(selection, state, null);
      }),
    );
  }
  return unionTypeAnnotation(
    types.map(props => exactObjectTypeAnnotation(props)),
  );
}

// Visitor for generating raw reponse type
function createRawResponseTypeVisitor(state: State) {
  const visitor = {
    leave: {
      Root(node) {
        return exportType(
          `${node.name}RawResponse`,
          selectionsToRawResponseBabel(
            /* $FlowFixMe: selections have already been transformed */
            (node.selections: $ReadOnlyArray<$ReadOnlyArray<Selection>>),
            state,
            null,
          ),
        );
      },
      InlineFragment(node) {
        const typeCondition = node.typeCondition;
        return flattenArray(
          /* $FlowFixMe: selections have already been transformed */
          (node.selections: $ReadOnlyArray<$ReadOnlyArray<Selection>>),
        ).map(typeSelection => {
          return isAbstractType(typeCondition)
            ? typeSelection
            : {
                ...typeSelection,
                concreteType: typeCondition.toString(),
              };
        });
      },
      Condition: visitCondition,
      ScalarField(node) {
        return visitScalarField(node, state);
      },
      Connection(node) {
        return visitConnection(node, state);
      },
      ConnectionField: visitLinkedField,
      LinkedField: visitLinkedField,
      ClientExtension(node) {
        return flattenArray(
          /* $FlowFixMe: selections have already been transformed */
          (node.selections: $ReadOnlyArray<$ReadOnlyArray<Selection>>),
        ).map(sel => ({
          ...sel,
          conditional: true,
        }));
      },
      Defer(node) {
        return flattenArray(
          /* $FlowFixMe: selections have already been transformed */
          (node.selections: $ReadOnlyArray<$ReadOnlyArray<Selection>>),
        );
      },
      Stream(node) {
        return flattenArray(
          /* $FlowFixMe: selections have already been transformed */
          (node.selections: $ReadOnlyArray<$ReadOnlyArray<Selection>>),
        );
      },
      ModuleImport(node) {
        return visitRawResposneModuleImport(node, state);
      },
      FragmentSpread(node) {
        invariant(
          false,
          'A fragment spread is found when traversing the AST, ' +
            'make sure you are passing the codegen IR',
        );
      },
    },
  };
  return visitor;
}

// Dedupe the genreated type of module selections to reduce file zie
function visitRawResposneModuleImport(node, state): $ReadOnlyArray<Selection> {
  const {selections, name: key} = node;
  const moduleSelections = selections
    .filter(
      // $FlowFixMe selections have already been transformed
      sel => sel.length && sel[0].schemaName === 'js',
    )
    .map(arr => arr[0]);
  if (!state.matchFields.has(key)) {
    const ast = selectionsToRawResponseBabel(
      /* $FlowFixMe: selections have already been transformed */
      (node.selections: $ReadOnlyArray<$ReadOnlyArray<Selection>>).filter(
        sel => sel.length > 1 || sel[0].schemaName !== 'js',
      ),
      state,
      null,
    );
    state.matchFields.set(key, ast);
  }
  return [
    ...moduleSelections,
    {
      key,
      nodeType: MODULE_IMPORT_FIELD,
    },
  ];
}

function selectionsToMap(
  selections: $ReadOnlyArray<Selection>,
  appendType?: boolean,
): SelectionMap {
  const map = new Map();
  selections.forEach(selection => {
    const key =
      appendType && selection.concreteType
        ? `${selection.key}::${selection.concreteType}`
        : selection.key;
    const previousSel = map.get(key);
    map.set(
      key,
      previousSel ? mergeSelection(previousSel, selection) : selection,
    );
  });
  return map;
}

function flattenArray(
  arrayOfArrays: $ReadOnlyArray<$ReadOnlyArray<Selection>>,
): $ReadOnlyArray<Selection> {
  const result = [];
  arrayOfArrays.forEach(array => {
    result.push(...array);
  });
  return result;
}

function generateInputObjectTypes(state: State) {
  return Object.keys(state.generatedInputObjectTypes).map(typeIdentifier => {
    const inputObjectType = state.generatedInputObjectTypes[typeIdentifier];
    invariant(
      typeof inputObjectType !== 'string',
      'RelayCompilerFlowGenerator: Expected input object type to have been' +
        ' defined before calling `generateInputObjectTypes`',
    );
    return exportType(typeIdentifier, inputObjectType);
  });
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

function groupRefs(props): $ReadOnlyArray<Selection> {
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
      refs.map(ref =>
        t.genericTypeAnnotation(t.identifier(getOldFragmentTypeName(ref))),
      ),
    );
    result.push({
      key: '$fragmentRefs',
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
      const fragmentTypeName = getOldFragmentTypeName(usedFragment);
      if (!state.generatedFragments.has(usedFragment)) {
        if (state.useHaste && state.existingFragmentNames.has(usedFragment)) {
          // TODO(T22653277) support non-haste environments when importing
          // fragments
          imports.push(
            importTypes([fragmentTypeName], usedFragment + '.graphql'),
          );
        } else if (
          state.useSingleArtifactDirectory &&
          state.existingFragmentNames.has(usedFragment)
        ) {
          imports.push(
            importTypes([fragmentTypeName], './' + usedFragment + '.graphql'),
          );
        } else {
          imports.push(anyTypeAlias(fragmentTypeName));
        }
      }
    }
  }
  return imports;
}

function getEnumDefinitions({
  enumsHasteModule,
  usedEnums,
  noFutureProofEnums,
}: State) {
  const enumNames = Object.keys(usedEnums).sort();
  if (enumNames.length === 0) {
    return [];
  }
  if (typeof enumsHasteModule === 'string') {
    return [importTypes(enumNames, enumsHasteModule)];
  }
  if (typeof enumsHasteModule === 'function') {
    return enumNames.map(enumName =>
      importTypes([enumName], enumsHasteModule(enumName)),
    );
  }
  return enumNames.map(name => {
    const values = usedEnums[name].getValues().map(({value}) => value);
    values.sort();
    if (!noFutureProofEnums) {
      values.push('%future added value');
    }
    return exportType(
      name,
      t.unionTypeAnnotation(
        values.map(value => t.stringLiteralTypeAnnotation(value)),
      ),
    );
  });
}

// If it's a @refetchable fragment, we generate the $fragmentRef in generated
// query, and import it in the fragment to avoid circular dependencies
function getRefetchableQueryParentFragmentName(
  state: State,
  metadata: Metadata,
): ?string {
  if (
    !metadata?.isRefetchableQuery ||
    (!state.useHaste && !state.useSingleArtifactDirectory)
  ) {
    return null;
  }
  const derivedFrom = metadata?.derivedFrom;
  if (derivedFrom != null && typeof derivedFrom === 'string') {
    return derivedFrom;
  }
  return null;
}

function getRefetchableQueryPath(
  state: State,
  directives: $ReadOnlyArray<Directive>,
): ?string {
  let refetchableQuery: ?string;
  if (!state.useHaste && !state.useSingleArtifactDirectory) {
    return;
  }
  const refetchableArgs = directives.find(d => d.name === 'refetchable')?.args;
  if (!refetchableArgs) {
    return;
  }
  const argument = refetchableArgs.find(
    arg => arg.kind === 'Argument' && arg.name === 'queryName',
  );
  if (
    argument &&
    argument.value &&
    argument.value.kind === 'Literal' &&
    typeof argument.value.value === 'string'
  ) {
    refetchableQuery = argument.value.value;
    if (!state.useHaste) {
      refetchableQuery = './' + refetchableQuery;
    }
    refetchableQuery += '.graphql';
  }
  return refetchableQuery;
}

function generateFragmentRefsForRefetchable(name: string) {
  const oldFragmentTypeName = getOldFragmentTypeName(name);
  const newFragmentTypeName = getNewFragmentTypeName(name);
  return [
    importTypes(['FragmentReference'], 'relay-runtime'),
    declareExportOpaqueType(oldFragmentTypeName, 'FragmentReference'),
    declareExportOpaqueType(newFragmentTypeName, oldFragmentTypeName),
  ];
}

function getFragmentTypes(name: string, refetchableQueryPath: ?string) {
  const oldFragmentTypeName = getOldFragmentTypeName(name);
  const newFragmentTypeName = getNewFragmentTypeName(name);
  if (refetchableQueryPath) {
    return [
      importTypes(
        [oldFragmentTypeName, newFragmentTypeName],
        refetchableQueryPath,
      ),
      exportTypes([oldFragmentTypeName, newFragmentTypeName]),
    ];
  }
  return [
    declareExportOpaqueType(oldFragmentTypeName, 'FragmentReference'),
    declareExportOpaqueType(newFragmentTypeName, oldFragmentTypeName),
  ];
}

function getOldFragmentTypeName(name: string) {
  return `${name}$ref`;
}

function getNewFragmentTypeName(name: string) {
  return `${name}$fragmentType`;
}

function getRefTypeName(name: string): string {
  return `${name}$key`;
}

function getDataTypeName(name: string): string {
  return `${name}$data`;
}

const FLOW_TRANSFORMS: $ReadOnlyArray<IRTransform> = [
  RelayRelayDirectiveTransform.transform,
  RelayMaskTransform.transform,
  ConnectionFieldTransform.transform,
  RelayMatchTransform.transform,
  FlattenTransform.transformWithOptions({}),
  RelayRefetchableFragmentTransform.transform,
];

const DIRECTIVE_NAME = 'raw_response_type';

module.exports = {
  generate: (Profiler.instrument(generate, 'RelayFlowGenerator.generate'): (
    node: Root | Fragment,
    options: TypeGeneratorOptions,
  ) => string),
  transforms: FLOW_TRANSFORMS,
  SCHEMA_EXTENSION: `directive @${DIRECTIVE_NAME} on QUERY | MUTATION | SUBSCRIPTION`,
};
