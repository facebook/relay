/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use ::intern::string_key::Intern;
use ::intern::string_key::StringKey;
use graphql_ir::FragmentDefinitionName;
use indexmap::IndexMap;
use relay_config::SchemaConfig;
use relay_transforms::TypeConditionInfo;
use schema::Type;
use schema::TypeReference;

use crate::writer::AST;
use crate::JS_FIELD_NAME;
use crate::KEY_CLIENTID;
use crate::KEY_TYPENAME;
use crate::SPREAD_KEY;

#[derive(Debug, Clone)]
pub(crate) enum TypeSelection {
    RawResponseFragmentSpread(RawResponseFragmentSpread),
    ModuleDirective(ModuleDirective),
    LinkedField(TypeSelectionLinkedField),
    ScalarField(TypeSelectionScalarField),
    InlineFragment(TypeSelectionInlineFragment),
    FragmentSpread(TypeSelectionFragmentSpread),
}

impl TypeSelection {
    pub(crate) fn set_concrete_type(&mut self, type_: Type) {
        match self {
            TypeSelection::LinkedField(l) => l.concrete_type = Some(type_),
            TypeSelection::ScalarField(s) => s.concrete_type = Some(type_),
            TypeSelection::InlineFragment(f) => f.concrete_type = Some(type_),
            TypeSelection::FragmentSpread(f) => f.concrete_type = Some(type_),
            TypeSelection::ModuleDirective(m) => m.concrete_type = Some(type_),
            TypeSelection::RawResponseFragmentSpread(f) => f.concrete_type = Some(type_),
        }
    }

    pub(crate) fn set_conditional(&mut self, conditional: bool) {
        match self {
            TypeSelection::LinkedField(l) => l.conditional = conditional,
            TypeSelection::ScalarField(s) => s.conditional = conditional,
            TypeSelection::InlineFragment(f) => f.conditional = conditional,
            TypeSelection::FragmentSpread(f) => f.conditional = conditional,
            TypeSelection::ModuleDirective(m) => m.conditional = conditional,
            TypeSelection::RawResponseFragmentSpread(f) => f.conditional = conditional,
        }
    }

    pub(crate) fn is_conditional(&self) -> bool {
        match self {
            TypeSelection::LinkedField(l) => l.conditional,
            TypeSelection::ScalarField(s) => s.conditional,
            TypeSelection::FragmentSpread(f) => f.conditional,
            TypeSelection::InlineFragment(f) => f.conditional,
            TypeSelection::ModuleDirective(m) => m.conditional,
            TypeSelection::RawResponseFragmentSpread(f) => f.conditional,
        }
    }

    pub(crate) fn get_enclosing_concrete_type(&self) -> Option<Type> {
        match self {
            TypeSelection::LinkedField(l) => l.concrete_type,
            TypeSelection::ScalarField(s) => s.concrete_type,
            TypeSelection::FragmentSpread(f) => f.concrete_type,
            TypeSelection::InlineFragment(f) => f.concrete_type,
            TypeSelection::ModuleDirective(m) => m.concrete_type,
            TypeSelection::RawResponseFragmentSpread(f) => f.concrete_type,
        }
    }

    pub(crate) fn is_typename(&self) -> bool {
        matches!(
            self,
            TypeSelection::ScalarField(TypeSelectionScalarField {
                special_field: Some(ScalarFieldSpecialSchemaField::TypeName),
                ..
            }),
        )
    }

    pub(crate) fn is_js_field(&self) -> bool {
        matches!(
            self,
            TypeSelection::ScalarField(TypeSelectionScalarField {
                special_field: Some(ScalarFieldSpecialSchemaField::JS),
                ..
            }),
        )
    }

    pub(crate) fn get_field_name_or_alias(&self) -> Option<StringKey> {
        match self {
            TypeSelection::LinkedField(l) => Some(l.field_name_or_alias),
            TypeSelection::ScalarField(s) => Some(s.field_name_or_alias),
            _ => None,
        }
    }

    pub(crate) fn get_string_key(&self) -> StringKey {
        match self {
            TypeSelection::LinkedField(l) => l.field_name_or_alias,
            TypeSelection::ScalarField(s) => s.field_name_or_alias,
            TypeSelection::FragmentSpread(i) => format!("__fragments_{}", i.fragment_name).intern(),
            TypeSelection::InlineFragment(i) => format!("__fragments_{}", i.fragment_name).intern(),
            TypeSelection::ModuleDirective(md) => md.fragment_name.0,
            TypeSelection::RawResponseFragmentSpread(_) => *SPREAD_KEY,
        }
    }
}

#[derive(Debug, Clone)]
pub(crate) struct RawResponseFragmentSpread {
    pub(crate) value: StringKey,
    pub(crate) conditional: bool,
    pub(crate) concrete_type: Option<Type>,
}

#[derive(Debug, Clone)]
pub(crate) struct ModuleDirective {
    pub(crate) fragment_name: FragmentDefinitionName,
    pub(crate) document_name: StringKey,
    pub(crate) conditional: bool,
    pub(crate) concrete_type: Option<Type>,
}

#[derive(Debug, Clone)]
pub(crate) struct TypeSelectionLinkedField {
    pub(crate) field_name_or_alias: StringKey,
    pub(crate) node_type: TypeReference<Type>,
    pub(crate) node_selections: TypeSelectionMap,
    pub(crate) conditional: bool,
    pub(crate) concrete_type: Option<Type>,
    pub(crate) is_result_type: bool,
}

#[derive(Debug, Clone)]
pub(crate) struct TypeSelectionScalarField {
    pub(crate) field_name_or_alias: StringKey,
    pub(crate) special_field: Option<ScalarFieldSpecialSchemaField>,
    pub(crate) value: AST,
    pub(crate) conditional: bool,
    pub(crate) concrete_type: Option<Type>,
    pub(crate) is_result_type: bool,
}

#[derive(Debug, Clone)]
pub(crate) struct TypeSelectionInlineFragment {
    pub(crate) fragment_name: FragmentDefinitionName,
    pub(crate) conditional: bool,
    pub(crate) concrete_type: Option<Type>,
}

#[derive(Debug, Clone)]
pub(crate) struct TypeSelectionFragmentSpread {
    pub(crate) fragment_name: FragmentDefinitionName,
    pub(crate) conditional: bool,
    pub(crate) concrete_type: Option<Type>,
    // Why are we using TypeSelectionInfo instead of re-using concrete_type?
    // Because concrete_type is poorly named and does not refer to the concrete
    // type of the fragment spread.
    pub(crate) type_condition_info: Option<TypeConditionInfo>,
    pub(crate) is_updatable_fragment_spread: bool,
}

pub(crate) type TypeSelectionMap = IndexMap<TypeSelectionKey, TypeSelection>;

#[derive(Eq, Hash, PartialEq, Clone, Copy, Debug)]
pub(crate) struct TypeSelectionKey {
    pub(crate) key: StringKey,
    pub(crate) concrete_type: Option<Type>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) enum ScalarFieldSpecialSchemaField {
    JS,
    TypeName,
    Id,
    ClientId,
}

impl ScalarFieldSpecialSchemaField {
    pub(crate) fn from_schema_name(key: StringKey, schema_config: &SchemaConfig) -> Option<Self> {
        if key == *JS_FIELD_NAME {
            Some(ScalarFieldSpecialSchemaField::JS)
        } else if key == *KEY_TYPENAME {
            Some(ScalarFieldSpecialSchemaField::TypeName)
        } else if key == *KEY_CLIENTID {
            Some(ScalarFieldSpecialSchemaField::ClientId)
        } else if key == schema_config.node_interface_id_field {
            Some(ScalarFieldSpecialSchemaField::Id)
        } else {
            None
        }
    }
}
