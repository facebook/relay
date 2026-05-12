/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::BTreeMap;
use std::fmt;

use common::DiagnosticsResult;
use common::DirectiveName;
use common::EnumName;
use common::InputObjectName;
use common::InterfaceName;
use common::Location;
use common::ObjectName;
use common::ScalarName;
use common::SourceLocationKey;
use common::UnionName;
use errors::try_all;
use graphql_ir::Visitor;
use graphql_syntax::ConstantValue;
use graphql_syntax::DirectiveLocation;
use graphql_syntax::ExtensionIntoDefinition;
use graphql_syntax::SchemaDocument;
use graphql_syntax::TypeSystemDefinition;
use intern::Lookup;
use intern::impl_lookup;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use intern::string_key::StringKeyIndexMap;
use intern::string_key::StringKeyMap;
use intern::string_key::StringKeySet;
use lazy_static::lazy_static;
use program_with_dependencies::ProgramWithDependencies;
use schema::ArgumentValue;
use schema::DirectiveValue;
use schema::EnumValue;
use schema::SDLSchema;
use schema::Schema;
use schema::TypeReference;

use crate::OutputTypeReference;
use crate::SchemaDefault;
use crate::SchemaInsertField;
use crate::UsedSchemaCollectionOptions;
use crate::impl_can_have_directives;
use crate::impl_has_arguments;
use crate::impl_has_definition_item;
use crate::impl_has_description;
use crate::impl_has_fields;
use crate::impl_has_interfaces;
use crate::impl_string_key_named_raw;
use crate::impl_string_key_named_with_location;
use crate::impl_traits;
use crate::ir_collector::UsedSchemaIRCollector;
use crate::merge_sdl_document::ToSetDefinition;
use crate::merge_sdl_document::merge_def_into;
use crate::merge_sdl_document::merge_ext_into;
use crate::partition_base_extensions::PartitionsBaseExtension;
use crate::set_exclude::CanBeEmpty;
use crate::set_exclude::SafeExclusionOptions;
use crate::set_exclude::SetExclude;
use crate::set_merges::Merges;
use crate::set_merges::MergesFromAbstractDefinition;

lazy_static! {
    static ref QUERY: StringKey = "Query".intern();
    static ref SUBSCRIPTION: StringKey = "Subscription".intern();
    static ref MUTATION: StringKey = "Mutation".intern();
}

#[derive(Clone, Debug, Default, Eq, PartialEq)]
pub struct SchemaSet {
    pub root_schema: SetRootSchema,
    pub types: StringKeyMap<SetType>,
    pub directives: StringKeyMap<SetDirective>,
}

impl SchemaSet {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn is_empty(&self) -> bool {
        self.is_set_empty()
    }

    pub fn union_set(
        &self,
        to_union: &SchemaSet,
        _subset_directives: &StringKeySet,
    ) -> DiagnosticsResult<SchemaSet> {
        // We don't currently use the subset_directives, which tells me the union logic used by merge
        // is *probably* subtly wrong. Need tests to verify.
        let mut union_set = self.clone();
        union_set.merge(to_union.clone())?;
        Ok(union_set)
    }

    pub fn exclude_set(
        &self,
        to_exclude: &SchemaSet,
        subset_directives: &StringKeySet,
        base_restricted_directives: &StringKeySet,
    ) -> SchemaSet {
        self.exclude(
            to_exclude,
            &SafeExclusionOptions {
                subset_directives: subset_directives.clone(),
                base_restricted_directives: base_restricted_directives.clone(),
                ..Default::default()
            },
        )
    }

    pub fn intersect_set(
        &self,
        to_intersect: &SchemaSet,
        subset_directives: &StringKeySet,
    ) -> DiagnosticsResult<SchemaSet> {
        // An intersect is the same as:
        //  A.exclude( A.exclude(B).union(B.exclude(A)) )
        //
        // Is this algorithm more expensive than a purpose-written intersect? Definitely!
        // We end up fully visiting each element in A ~2 times and B ~1 times,
        // instead of only visting the elements in both ~1 time. Plus we ~2x the memory,
        // as we hold in place a full second set of A+B (the exclude + intersect).
        //
        // But it's much less work to write and probably is fast enough for what we need.
        // Plus it'll reduces total bugs, as testing intersect tests both exclude.
        let a = self;
        let b = to_intersect;

        let empty = StringKeySet::default();
        let a_exclude_b = a.exclude_set(b, subset_directives, &empty);
        let b_exclude_a = b.exclude_set(a, subset_directives, &empty);

        let everything_except_the_intersect =
            a_exclude_b.union_set(&b_exclude_a, subset_directives)?;

        // arbitrarily picking A, but could be B instead.
        // Exclude everything-except-the-intersect from A to get the intersect.
        Ok(a.exclude_set(&everything_except_the_intersect, subset_directives, &empty))
    }

    // We don't want to make custom logic for "expanding" the SchemaSet at IR collection time,
    // otherwise we can more easily get out-of-sync with our actual transform logic.
    // For iOS GraphServices, the runtime schema requires *every* type be explicitly defined
    // if that type is used by any used interface/union.
    pub fn from_ir(
        program: &ProgramWithDependencies,
        used_schema_options: UsedSchemaCollectionOptions,
    ) -> DiagnosticsResult<SchemaSet> {
        SchemaSet::from_ir_with_used_type_definitions(program, None, used_schema_options)
    }

    pub fn from_ir_with_used_type_definitions(
        program: &ProgramWithDependencies,
        type_definitions_doc: Option<SchemaDocument>,
        used_schema_options: UsedSchemaCollectionOptions,
    ) -> DiagnosticsResult<SchemaSet> {
        let mut used_schema = SchemaSet::new();
        let mut used_schema_collector =
            UsedSchemaIRCollector::new(&mut used_schema, program, used_schema_options);

        used_schema_collector.visit_program(&program.into());
        if let Some(type_definitions_doc) = type_definitions_doc {
            used_schema_collector.add_used_type_definitions(type_definitions_doc)?;
        }

        Ok(used_schema)
    }

    pub fn from_base_schema_documents(
        schema_documents: &[SchemaDocument],
    ) -> DiagnosticsResult<Self> {
        Self::from_schema_documents_with_extensions(schema_documents, &[])
    }

    pub fn from_schema_documents_with_extensions(
        schema_documents: &[SchemaDocument],
        extension_documents: &[SchemaDocument],
    ) -> DiagnosticsResult<Self> {
        let mut used_schema = SchemaSet::new();
        try_all(
            schema_documents
                .iter()
                .map(|document| (document, false))
                .chain(extension_documents.iter().map(|document| (document, true)))
                .map(|(document, is_ext)| used_schema.merge_sdl_document(document, is_ext)),
        )?;
        Ok(used_schema)
    }

    /// Add another IR program's used definitions to an existing SetSchema's definitions.
    pub fn add_ir(
        &mut self,
        program: &ProgramWithDependencies,
        used_schema_options: UsedSchemaCollectionOptions,
    ) {
        let mut used_schema_collector =
            UsedSchemaIRCollector::new(self, program, used_schema_options);
        used_schema_collector.visit_program(&program.into());
    }

    pub fn printed_base_and_client_schema(&self) -> DiagnosticsResult<(String, String)> {
        let (base_definitions, client_definitions) = self.print_base_and_client_definitions()?;
        Ok((
            base_definitions.join("\n\n") + "\n",
            client_definitions.join("\n\n") + "\n",
        ))
    }

    pub fn add_or_merge_type(&mut self, type_: SetType) -> DiagnosticsResult<()> {
        if let Some(existing) = self.types.get_mut(&type_.string_key_name()) {
            existing.merge(type_)?;
        } else {
            self.types.insert(type_.string_key_name(), type_);
        }
        Ok(())
    }

    pub fn merge_sdl_document(
        &mut self,
        document: &SchemaDocument,
        is_ext_document: bool,
    ) -> DiagnosticsResult<()> {
        let source = document.location.source_location();
        for definition in &document.definitions {
            self.merge_type_system_definition(definition, source, is_ext_document)?;
        }
        Ok(())
    }

    pub fn merge_type_system_definition(
        &mut self,
        definition: &TypeSystemDefinition,
        source: SourceLocationKey,
        is_ext_document: bool,
    ) -> DiagnosticsResult<()> {
        match definition {
            TypeSystemDefinition::SchemaDefinition(schema_def) => self
                .root_schema
                .merge(schema_def.to_set_definition(source, is_ext_document, false)),
            TypeSystemDefinition::SchemaExtension(schema_ext) => self.root_schema.merge(
                schema_ext
                    .clone()
                    .into_definition()
                    .to_set_definition(source, true, true),
            ),
            TypeSystemDefinition::EnumTypeDefinition(def) => {
                merge_def_into(&mut self.types, def, source, is_ext_document)
            }
            TypeSystemDefinition::EnumTypeExtension(ext) => {
                merge_ext_into(&mut self.types, ext, source)
            }
            TypeSystemDefinition::InterfaceTypeDefinition(def) => {
                merge_def_into(&mut self.types, def, source, is_ext_document)
            }
            TypeSystemDefinition::InterfaceTypeExtension(ext) => {
                merge_ext_into(&mut self.types, ext, source)
            }
            TypeSystemDefinition::ObjectTypeDefinition(def) => {
                merge_def_into(&mut self.types, def, source, is_ext_document)
            }
            TypeSystemDefinition::ObjectTypeExtension(ext) => {
                merge_ext_into(&mut self.types, ext, source)
            }
            TypeSystemDefinition::UnionTypeDefinition(def) => {
                merge_def_into(&mut self.types, def, source, is_ext_document)
            }
            TypeSystemDefinition::UnionTypeExtension(ext) => {
                merge_ext_into(&mut self.types, ext, source)
            }
            TypeSystemDefinition::InputObjectTypeDefinition(def) => {
                merge_def_into(&mut self.types, def, source, is_ext_document)
            }
            TypeSystemDefinition::InputObjectTypeExtension(ext) => {
                merge_ext_into(&mut self.types, ext, source)
            }
            TypeSystemDefinition::ScalarTypeDefinition(def) => {
                merge_def_into(&mut self.types, def, source, is_ext_document)
            }
            TypeSystemDefinition::ScalarTypeExtension(ext) => {
                merge_ext_into(&mut self.types, ext, source)
            }
            TypeSystemDefinition::DirectiveDefinition(def) => {
                merge_def_into(&mut self.directives, def, source, is_ext_document)
            }
        }
    }

    pub fn type_or_inserted<'a>(
        &'a mut self,
        type_: schema::Type,
        schema: &SDLSchema,
    ) -> &'a mut SetType {
        let type_name = schema.get_type_name(type_);
        self.types.entry(type_name).or_insert_with(|| match type_ {
            schema::Type::Scalar(id) => SetType::Scalar(SetScalar::schema_default(id, schema)),
            schema::Type::Enum(id) => SetType::Enum(SetEnum::schema_default(id, schema)),
            schema::Type::Object(id) => SetType::Object(SetObject::schema_default(id, schema)),
            schema::Type::Interface(id) => {
                SetType::Interface(SetInterface::schema_default(id, schema))
            }
            schema::Type::Union(id) => SetType::Union(SetUnion::schema_default(id, schema)),
            schema::Type::InputObject(id) => {
                SetType::InputObject(SetInputObject::schema_default(id, schema))
            }
        })
    }

    /// Fixes types from a potentially-invalid SchemaSet, to make it all spec compliant.
    /// This should be run before printing a binary-level, must-be-valid used schema,
    /// but should NOT be run to produce partial, library-level used schemas.
    pub fn fix_all_types(&mut self) -> DiagnosticsResult<()> {
        self.fix_all_types_impl(None)
    }

    pub fn fix_all_types_with_schema(
        &mut self,
        original_schema: &SchemaSet,
    ) -> DiagnosticsResult<()> {
        self.fix_all_types_impl(Some(original_schema))
    }

    fn fix_all_types_impl(&mut self, original_schema: Option<&SchemaSet>) -> DiagnosticsResult<()> {
        let defined_interfaces: StringKeyMap<SetInterface> = self
            .types
            .iter()
            .filter_map(|(k, t)| {
                if let SetType::Interface(t) = t {
                    Some((k.clone(), t.clone()))
                } else {
                    None
                }
            })
            .collect();

        // Set any unset `schema` types to be the default schema types.

        if self.root_schema.query_type.is_none() {
            self.root_schema.query_type = self
                .types
                .get(&"Query".intern())
                .map(|op_type| op_type.string_key_name());
        }
        if self.root_schema.mutation_type.is_none() {
            self.root_schema.mutation_type = self
                .types
                .get(&"Mutation".intern())
                .map(|op_type| op_type.string_key_name());
        }
        if self.root_schema.subscription_type.is_none() {
            self.root_schema.subscription_type = self
                .types
                .get(&"Subscription".intern())
                .map(|op_type| op_type.string_key_name());
        }

        let existing_objects: StringKeySet = self
            .types
            .values()
            .filter_map(|t| {
                if let SetType::Object(t) = t {
                    Some(t.name.0)
                } else {
                    None
                }
            })
            .collect();
        for set_type in self.types.values_mut() {
            match set_type {
                SetType::Object(set_object) => {
                    // For objects: remove unknown interfaces that the type implements, and add all fields defined by known interfaces
                    let included_interfaces: StringKeyIndexMap<SetMemberType> = set_object
                        .interfaces
                        .iter()
                        .filter_map(|(implemented_name, implemented)| {
                            if defined_interfaces.contains_key(implemented_name) {
                                Some((*implemented_name, implemented.clone()))
                            } else {
                                None
                            }
                        })
                        .collect();

                    for included_interface in included_interfaces.keys() {
                        if let Some(interface_to_merge) = defined_interfaces.get(included_interface)
                        {
                            set_object.merge_from_abstract_definition(
                                interface_to_merge.clone(),
                                original_schema.and_then(|s| {
                                    if let Some(SetType::Object(o)) =
                                        s.types.get(&set_object.name.0)
                                    {
                                        Some(o)
                                    } else {
                                        None
                                    }
                                }),
                                &set_object.name.to_string(),
                            )?;
                        }
                    }
                    set_object.interfaces = included_interfaces;
                }
                SetType::Interface(set_interface) => {
                    // For interfaces: remove unknown interfaces that the interface implements, and add all fields defined by known interfaces
                    let included_interfaces: StringKeyIndexMap<SetMemberType> = set_interface
                        .interfaces
                        .iter()
                        .filter_map(|(implemented_name, implemented)| {
                            if defined_interfaces.contains_key(implemented_name) {
                                Some((*implemented_name, implemented.clone()))
                            } else {
                                None
                            }
                        })
                        .collect();

                    for included_interface in included_interfaces.keys() {
                        if let Some(interface_to_merge) = defined_interfaces.get(included_interface)
                        {
                            set_interface.merge_from_abstract_definition(
                                interface_to_merge.clone(),
                                original_schema.and_then(|s| {
                                    if let Some(SetType::Interface(i)) =
                                        s.types.get(&set_interface.name.0)
                                    {
                                        Some(i)
                                    } else {
                                        None
                                    }
                                }),
                                &set_interface.name.to_string(),
                            )?;
                        }
                    }
                    set_interface.interfaces = included_interfaces;
                }
                SetType::Union(set_union) => {
                    let included_members: StringKeyIndexMap<SetMemberType> = set_union
                        .members
                        .iter()
                        .filter_map(|(obj_name, obj)| {
                            if existing_objects.contains(obj_name) {
                                Some((*obj_name, obj.clone()))
                            } else {
                                None
                            }
                        })
                        .collect();
                    set_union.members = included_members;
                }
                _ => {}
            }
        }

        //
        Ok(())
    }
}

/// Describes what *state* a specific definition is in, plus location and metadata.
///
/// When None, it means that the parent Set<Object|Interface|...> is
/// purely extending some otherwise-not-present base type.
///
/// For top-level types, the None case can be represented in SDL as
/// `extend type Foo @extensionDirective implements ExtensionImplements { extensionField: String }`
/// In the above case, if that is ALL the SchemaSet holds, then the SetObject will *not* have a SchemaDefinitionItem,
/// but the SetDirectiveValue, SetMemberType, and SetField all will have a SchemaDefinitionItem.
///
/// This means that SchemaSet(`type A { fieldA: String }`).exclude(SchemaSet(`type A`))
/// ends up as a SchemaSet represented as `extend type A { fieldA: String }`: the underlying definition is gone,
/// but we still need to represent the existence of `A.fieldA`.
///
/// `is_client_definition` represents something different: whether this specific definition was *only* present
/// in a document meant for consumption outside the base set. So for example in Relay, client resolvers
/// would be represented with is_client_definition: true on the field.
/// Likewise, client-only types will be is_client_definition, despite being defined in SDL using `type ClientOnly { ... }`.
///
/// A Set item with a None SchemaDefinitionItem, and *no* child items, is considered fully excluded.
/// There should be no reason to extend an item if there's nothing in that extension.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SchemaDefinitionItem {
    pub name: StringKey,
    pub locations: Vec<Location>,
    pub is_client_definition: bool,
    pub description: Option<StringKey>,
    pub hack_source: Option<StringKey>,
}
impl SchemaDefinitionItem {
    pub fn default(name: StringKey) -> Self {
        Self {
            name,
            locations: Vec::new(),
            is_client_definition: false,
            description: None,
            hack_source: None,
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum SetType {
    Scalar(SetScalar),
    Enum(SetEnum),
    Object(SetObject),
    Interface(SetInterface),
    Union(SetUnion),
    InputObject(SetInputObject),
}

impl StringKeyNamed for SetType {
    fn string_key_name(&self) -> StringKey {
        match self {
            SetType::Scalar(s) => s.string_key_name(),
            SetType::Enum(s) => s.string_key_name(),
            SetType::Object(s) => s.string_key_name(),
            SetType::Interface(s) => s.string_key_name(),
            SetType::Union(s) => s.string_key_name(),
            SetType::InputObject(s) => s.string_key_name(),
        }
    }
}

impl HasDefinitionItem for SetType {
    fn definition_item(&self) -> Option<&SchemaDefinitionItem> {
        match self {
            SetType::Scalar(t) => t.definition_item(),
            SetType::Enum(t) => t.definition_item(),
            SetType::Object(t) => t.definition_item(),
            SetType::Interface(t) => t.definition_item(),
            SetType::Union(t) => t.definition_item(),
            SetType::InputObject(t) => t.definition_item(),
        }
    }

    fn is_client_definition(&self) -> bool {
        match self {
            SetType::Scalar(t) => t.is_client_definition(),
            SetType::Enum(t) => t.is_client_definition(),
            SetType::Object(t) => t.is_client_definition(),
            SetType::Interface(t) => t.is_client_definition(),
            SetType::Union(t) => t.is_client_definition(),
            SetType::InputObject(t) => t.is_client_definition(),
        }
    }

    fn remove_definition_item(&mut self) {
        match self {
            SetType::Scalar(t) => t.remove_definition_item(),
            SetType::Enum(t) => t.remove_definition_item(),
            SetType::Object(t) => t.remove_definition_item(),
            SetType::Interface(t) => t.remove_definition_item(),
            SetType::Union(t) => t.remove_definition_item(),
            SetType::InputObject(t) => t.remove_definition_item(),
        }
    }
}

impl SetType {
    // Note the return type needs to be an option, which is why it doesn't implement SchemaInsertField
    pub fn field_definition_or_inserted<'a>(
        &'a mut self,
        field_id: schema::FieldID,
        schema: &SDLSchema,
    ) -> Option<&'a mut SetField> {
        match self {
            SetType::Object(obj) => Some(obj.field_definition_or_inserted(field_id, schema)),
            SetType::Interface(iface) => Some(iface.field_definition_or_inserted(field_id, schema)),
            _ => None,
        }
    }

    pub fn definition_item(&self) -> Option<&SchemaDefinitionItem> {
        match self {
            SetType::Scalar(t) => t.definition.as_ref(),
            SetType::Enum(t) => t.definition.as_ref(),
            SetType::Object(t) => t.definition.as_ref(),
            SetType::Interface(t) => t.definition.as_ref(),
            SetType::Union(t) => t.definition.as_ref(),
            SetType::InputObject(t) => t.definition.as_ref(),
        }
    }
}

impl CanHaveDirectives for SetType {
    fn directives(&self) -> &Vec<SetDirectiveValue> {
        match self {
            SetType::Scalar(t) => t.directives(),
            SetType::Enum(t) => t.directives(),
            SetType::Object(t) => t.directives(),
            SetType::Interface(t) => t.directives(),
            SetType::Union(t) => t.directives(),
            SetType::InputObject(t) => t.directives(),
        }
    }

    fn directives_mut(&mut self) -> &mut Vec<SetDirectiveValue> {
        match self {
            SetType::Scalar(t) => t.directives_mut(),
            SetType::Enum(t) => t.directives_mut(),
            SetType::Object(t) => t.directives_mut(),
            SetType::Interface(t) => t.directives_mut(),
            SetType::Union(t) => t.directives_mut(),
            SetType::InputObject(t) => t.directives_mut(),
        }
    }

    fn set_directives(&mut self, directives: Vec<SetDirectiveValue>) {
        match self {
            SetType::Scalar(t) => t.set_directives(directives),
            SetType::Enum(t) => t.set_directives(directives),
            SetType::Object(t) => t.set_directives(directives),
            SetType::Interface(t) => t.set_directives(directives),
            SetType::Union(t) => t.set_directives(directives),
            SetType::InputObject(t) => t.set_directives(directives),
        }
    }
}

#[derive(Clone, Debug, Default, Eq, PartialEq)]
pub struct SetRootSchema {
    pub definition: Option<SchemaDefinitionItem>,
    pub directives: Vec<SetDirectiveValue>,
    pub query_type: Option<StringKey>,
    pub mutation_type: Option<StringKey>,
    pub subscription_type: Option<StringKey>,
}
impl SetRootSchema {
    pub fn is_empty(&self) -> bool {
        // Default operation types do not "contribute" to the root schema being non-empty.
        self.directives.is_empty()
            && self.query_type.is_none_or(|t| t == *QUERY)
            && self.mutation_type.is_none_or(|t| t == *MUTATION)
            && self.subscription_type.is_none_or(|t| t == *SUBSCRIPTION)
    }
}
impl_traits!(
    SetRootSchema,
    impl_has_definition_item,
    impl_can_have_directives,
    impl_has_description
);

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SetScalar {
    pub definition: Option<SchemaDefinitionItem>,
    pub name: ScalarName,
    pub directives: Vec<SetDirectiveValue>,
}
impl_traits!(
    SetScalar,
    impl_string_key_named_with_location,
    impl_has_definition_item,
    impl_can_have_directives,
    impl_has_description
);

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SetObject {
    pub definition: Option<SchemaDefinitionItem>,
    pub name: ObjectName,
    pub interfaces: StringKeyIndexMap<SetMemberType>,
    pub directives: Vec<SetDirectiveValue>,
    pub fields: StringKeyMap<SetField>,
}
impl_traits!(
    SetObject,
    impl_has_fields,
    impl_has_interfaces,
    impl_string_key_named_with_location,
    impl_has_definition_item,
    impl_can_have_directives,
    impl_has_description
);
impl SetObject {
    pub fn default(name: StringKey) -> Self {
        Self {
            definition: Some(SchemaDefinitionItem::default(name)),
            name: ObjectName(name),
            interfaces: StringKeyIndexMap::default(),
            directives: Vec::new(),
            fields: StringKeyMap::default(),
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SetInterface {
    pub definition: Option<SchemaDefinitionItem>,
    pub name: InterfaceName,
    pub interfaces: StringKeyIndexMap<SetMemberType>,
    pub directives: Vec<SetDirectiveValue>,
    pub fields: StringKeyMap<SetField>,
}

impl_traits!(
    SetInterface,
    impl_has_fields,
    impl_has_interfaces,
    impl_string_key_named_with_location,
    impl_has_definition_item,
    impl_can_have_directives,
    impl_has_description
);

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SetInputObject {
    pub definition: Option<SchemaDefinitionItem>,
    pub name: InputObjectName,
    pub directives: Vec<SetDirectiveValue>,
    pub fields: StringKeyIndexMap<SetArgument>,

    // Input objects may need to be fully visited, if used as a variable for instance.
    // And they are recursive structures. So we need to know whether we can skip recursively
    // collecting a SetInputObject if we've already fully collected it.
    pub fully_recursively_visited: bool,
}
impl_traits!(
    SetInputObject,
    impl_string_key_named_with_location,
    impl_has_definition_item,
    impl_can_have_directives,
    impl_has_description
);
impl HasArguments for SetInputObject {
    fn arguments(&self) -> &StringKeyIndexMap<SetArgument> {
        &self.fields
    }
    fn arguments_mut(&mut self) -> &mut StringKeyIndexMap<SetArgument> {
        &mut self.fields
    }
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SetEnum {
    pub definition: Option<SchemaDefinitionItem>,
    pub name: EnumName,
    pub directives: Vec<SetDirectiveValue>,
    // If used as a const input value, the explicit values used.
    // Otherwise when used as an input variable or as an output,
    // all possible values.
    // We keep them sorted in their insertion order
    pub values: BTreeMap<StringKey, SetEnumValue>,
}
impl_traits!(
    SetEnum,
    impl_string_key_named_with_location,
    impl_has_definition_item,
    impl_can_have_directives,
    impl_has_description
);

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SetUnion {
    pub definition: Option<SchemaDefinitionItem>,
    pub name: UnionName,
    pub directives: Vec<SetDirectiveValue>,
    pub members: StringKeyIndexMap<SetMemberType>,
}

impl_traits!(
    SetUnion,
    impl_string_key_named_with_location,
    impl_has_definition_item,
    impl_can_have_directives,
    impl_has_description
);

#[derive(Clone, Copy, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct FieldName(pub StringKey);

impl fmt::Display for FieldName {
    fn fmt(&self, fmt: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(fmt, "{}", self.0)
    }
}

impl_lookup!(FieldName);

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SetField {
    pub definition: Option<SchemaDefinitionItem>,
    pub name: FieldName,
    pub arguments: StringKeyIndexMap<SetArgument>,
    pub type_: OutputTypeReference<StringKey>,
    pub directives: Vec<SetDirectiveValue>,
}
impl_traits!(
    SetField,
    impl_has_arguments,
    impl_string_key_named_with_location,
    impl_has_definition_item,
    impl_can_have_directives,
    impl_has_description
);

// For implements references on objects and interfaces,
// or for union member types.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SetMemberType {
    pub name: StringKey,
    // It is an extension when either:
    //  - the member is added via an `extend type Foo implements This`
    //  - the type itself is a client-only type definition
    // Basically the same rules as for SetField is_extension.
    pub is_extension: bool,
}
impl_traits!(SetMemberType, impl_string_key_named_raw);

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SetDirective {
    pub definition: Option<SchemaDefinitionItem>,
    pub name: DirectiveName,
    pub arguments: StringKeyIndexMap<SetArgument>,
    pub repeatable: bool,
    // Keep locations ordered by input order
    pub locations: Vec<DirectiveLocation>,
}
impl_traits!(
    SetDirective,
    impl_has_arguments,
    impl_has_definition_item,
    impl_string_key_named_with_location,
    impl_has_description
);

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SetArgument {
    pub definition: Option<SchemaDefinitionItem>,
    pub name: StringKey,
    pub type_: TypeReference<StringKey>,
    pub default_value: Option<ConstantValue>,
    pub directives: Vec<SetDirectiveValue>,
}
impl_traits!(
    SetArgument,
    impl_has_definition_item,
    impl_string_key_named_raw,
    impl_can_have_directives,
    impl_has_description
);

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SetDirectiveValue {
    pub definition: Option<SchemaDefinitionItem>,
    pub name: DirectiveName,
    pub arguments: Vec<SetArgumentValue>,
}
impl_traits!(
    SetDirectiveValue,
    impl_has_definition_item,
    impl_string_key_named_with_location
);

impl common::Named for SetDirectiveValue {
    type Name = DirectiveName;
    fn name(&self) -> DirectiveName {
        self.name
    }
}

impl SetDirectiveValue {
    pub fn to_directive_value(&self) -> DirectiveValue {
        DirectiveValue {
            name: self.name,
            arguments: self
                .arguments
                .iter()
                .map(|a| a.to_argument_value())
                .collect(),
        }
    }

    pub fn from_schema_value(dv: &DirectiveValue, is_client_definition: bool) -> Self {
        Self {
            definition: Some(SchemaDefinitionItem {
                name: dv.name.0,
                locations: Vec::new(),
                is_client_definition,
                description: None,
                hack_source: None,
            }),
            name: dv.name,
            arguments: dv
                .arguments
                .iter()
                .map(|a| SetArgumentValue::from_schema_value(a, is_client_definition))
                .collect(),
        }
    }
}

/// A value for used, constant arguments.
/// In example: `type X @foo(arg: "some_value")`
/// This represents the `arg: "some_value"` part.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SetArgumentValue {
    pub definition: Option<SchemaDefinitionItem>,
    pub name: common::ArgumentName,
    pub value: ConstantValue,
}

impl_traits!(SetArgumentValue, impl_has_definition_item);

impl common::Named for SetArgumentValue {
    type Name = common::ArgumentName;
    fn name(&self) -> common::ArgumentName {
        self.name
    }
}

impl SetArgumentValue {
    pub fn to_argument_value(&self) -> ArgumentValue {
        ArgumentValue {
            name: self.name,
            value: self.value.clone(),
        }
    }

    pub fn from_schema_value(av: &ArgumentValue, is_client_definition: bool) -> Self {
        Self {
            definition: Some(SchemaDefinitionItem {
                name: av.name.0,
                locations: Vec::new(),
                is_client_definition,
                description: None,
                hack_source: None,
            }),
            name: av.name,
            value: av.value.clone(),
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SetEnumValue {
    pub definition: Option<SchemaDefinitionItem>,
    pub value: StringKey,
    pub directives: Vec<SetDirectiveValue>,
    pub description: Option<StringKey>,
}
impl_traits!(
    SetEnumValue,
    impl_has_definition_item,
    impl_can_have_directives,
    impl_has_description
);

impl common::Named for SetEnumValue {
    type Name = StringKey;
    fn name(&self) -> StringKey {
        self.value
    }
}

impl SetEnumValue {
    pub fn to_enum_value(&self) -> EnumValue {
        EnumValue {
            value: self.value,
            directives: self
                .directives
                .iter()
                .map(|d| d.to_directive_value())
                .collect(),
            description: self.description,
        }
    }

    pub fn from_schema_value(ev: &EnumValue, is_client_definition: bool) -> Self {
        Self {
            definition: Some(SchemaDefinitionItem::default(ev.value)),
            value: ev.value,
            directives: ev
                .directives
                .iter()
                .map(|dv| SetDirectiveValue::from_schema_value(dv, is_client_definition))
                .collect(),
            description: ev.description,
        }
    }
}

pub trait StringKeyNamed {
    fn string_key_name(&self) -> StringKey;
}

pub trait HasDefinitionItem {
    fn definition_item(&self) -> Option<&SchemaDefinitionItem>;

    fn is_client_definition(&self) -> bool {
        self.definition_item()
            .as_ref()
            .is_none_or(|definition| definition.is_client_definition)
    }

    /// Make this definition represent an undefined type.
    /// Usually represented by `extend ...` in the SDL, but can also represent
    /// any pass-through schema coordinate that isn't explicitly defined in the SchemaSet.
    fn remove_definition_item(&mut self);
}

pub trait CanHaveDirectives {
    fn directives(&self) -> &Vec<SetDirectiveValue>;
    fn directives_mut(&mut self) -> &mut Vec<SetDirectiveValue>;

    fn set_directives(&mut self, directives: Vec<SetDirectiveValue>);

    fn partition_extension_directives(&self) -> (Vec<SetDirectiveValue>, Vec<SetDirectiveValue>) {
        self.directives()
            .iter()
            .cloned()
            .partition(|directive_value| !directive_value.is_client_definition())
    }
}
pub trait HasFields {
    fn fields(&self) -> &StringKeyMap<SetField>;
    fn fields_mut(&mut self) -> &mut StringKeyMap<SetField>;
    fn set_fields(&mut self, fields: StringKeyMap<SetField>);

    fn partition_extension_fields(&self) -> (StringKeyMap<SetField>, StringKeyMap<SetField>) {
        let mut base_fields = StringKeyMap::default();
        let mut extension_fields = StringKeyMap::default();

        for (field_name, field_value) in self.fields() {
            if field_value.is_client_definition() {
                // The whole thing is an extension so insert it
                extension_fields.insert(*field_name, field_value.clone());
            } else {
                let (base_field, extension_field) = field_value.partition_base_extension();
                base_fields.insert(*field_name, base_field);
                if let Some(extension_field) = extension_field {
                    extension_fields.insert(*field_name, extension_field);
                }
            }
        }
        (base_fields, extension_fields)
    }
}
#[allow(dead_code)]
pub trait HasArguments {
    fn arguments(&self) -> &StringKeyIndexMap<SetArgument>;
    fn arguments_mut(&mut self) -> &mut StringKeyIndexMap<SetArgument>;

    fn partition_extension_arguments(
        &self,
    ) -> (
        StringKeyIndexMap<SetArgument>,
        StringKeyIndexMap<SetArgument>,
    ) {
        let mut base_arguments = StringKeyIndexMap::default();
        let mut extension_arguments = StringKeyIndexMap::default();
        for (arg_name, arg_value) in self.arguments() {
            if arg_value.is_client_definition() {
                extension_arguments.insert(*arg_name, arg_value.clone());
            } else {
                base_arguments.insert(*arg_name, arg_value.clone());
            }
        }
        (base_arguments, extension_arguments)
    }
}
pub trait HasInterfaces {
    fn interfaces(&self) -> &StringKeyIndexMap<SetMemberType>;

    fn interfaces_mut(&mut self) -> &mut StringKeyIndexMap<SetMemberType>;

    fn set_interfaces(&mut self, interfaces: StringKeyIndexMap<SetMemberType>);

    fn partition_extension_interfaces(
        &self,
    ) -> (
        StringKeyIndexMap<SetMemberType>,
        StringKeyIndexMap<SetMemberType>,
    ) {
        self.interfaces()
            .iter()
            .map(|(name, value)| (*name, value.clone()))
            .partition(|(_, member)| !member.is_extension)
    }
}

pub trait HasDescription {
    fn description(&self) -> Option<StringKey>;
}

#[cfg(test)]
mod tests {
    use std::collections::VecDeque;

    use common::SourceLocationKey;
    use graphql_syntax::parse_schema_document;
    use indoc::indoc;

    use super::*;

    // Testing fix_all_types
    #[test]
    fn fix_empty_schema() {
        let mut schema = SchemaSet::default();
        schema.fix_all_types().unwrap();
        assert!(schema.root_schema.is_empty());
        assert!(schema.types.is_empty());
    }

    /// Ported from graphql_build_infra/schema_set/tests/merge_schemas/
    /// Tests merge_sdl_document, fix_all_types, and printed_base_and_client_schema
    /// across multiple schema parts with both base and client schemas.
    #[test]
    fn test_merge_schemas() {
        let fixture_content = indoc! {r#"
            # Schema-Part
            # PART 1

            type Query {
              name: String
            }

            enum ThingsToCount {
              ONE
              THREE
              EIGHT
            }

            type Name implements HasShortName {
              short_name: String
            }

            # Client-Schema

            extend type Query {
              extension: Int
            }

            extend type Frog implements HasShortName & Bug

            # Schema-Part
            # PART 2

            type Frog implements HasShortName @some_directive {
              frog_name: Name
              short_name: String!
            }

            type Toad implements HasShortName

            interface HasShortName {
              short_name: String
            }

            type Name implements HasShortName {
              short_name: String!
            }
            scalar Point

            enum ThingsToCount

            directive @some_directive(x: String) on OBJECT

            # Schema-Part
            # PART 3

            type Frog implements Amphibian

            union Many = Name | Query

            interface Amphibian {
              name: Name
            }

            scalar Point @some_directive(y: 3)

            enum ThingsToCount {
              TWO
              THREE
              SEVEN
            }

            interface Bug implements INotPresent @some_directive {
              name: Name
              bug_id: ID!
            }

            directive @some_directive(y: Int) on INTERFACE

            # Client-Schema

            directive @some_client_directive on INTERFACE

            extend interface Bug @some_client_directive {
              bug_id: ID!
            }

            extend type Toad implements Bug {
              bug_id: ID!
            }

            extend type Frog {
              other_name: String
            }

            # Schema-Part
            # PART 4

            interface Amphibian implements HasShortName {
              short_name: String!
            }
        "#};

        let mut merging_schema = SchemaSet::new();

        let library_schemas = fixture_content
            .split("# Schema-Part")
            .filter(|x| !x.trim().is_empty())
            .collect::<Vec<_>>();

        for (part_number, both_schemas) in (1..).zip(library_schemas) {
            let mut split_schemas = both_schemas
                .split("# Client-Schema")
                .collect::<VecDeque<_>>();
            if let Some(base_schema) = split_schemas.pop_front() {
                if !base_schema.trim().is_empty() {
                    let base_source_location = SourceLocationKey::standalone(&format!(
                        "merge-schemas_Part-{}_base",
                        part_number
                    ));
                    let base_document =
                        parse_schema_document(base_schema, base_source_location).unwrap();
                    merging_schema
                        .merge_sdl_document(&base_document, false)
                        .unwrap();
                }
            }
            if let Some(client_schema) = split_schemas.pop_front() {
                if !client_schema.trim().is_empty() {
                    let client_source_location = SourceLocationKey::standalone(&format!(
                        "merge-schemas_Part-{}_client",
                        part_number
                    ));
                    let client_document =
                        parse_schema_document(client_schema, client_source_location).unwrap();
                    merging_schema
                        .merge_sdl_document(&client_document, true)
                        .unwrap();
                }
            }
        }

        merging_schema.fix_all_types().unwrap();

        let (printed_base_schema, printed_client_schema) =
            merging_schema.printed_base_and_client_schema().unwrap();

        // Verify the result can be parsed back as a valid schema
        schema::build_schema_with_extensions_parallel(
            &[(&printed_base_schema, SourceLocationKey::generated())],
            &[(&printed_client_schema, SourceLocationKey::generated())],
        )
        .expect("Merged schema should be parseable");

        // Verify expected base schema output
        let expected_base = indoc! {r#"
            directive @some_directive(x: String, y: Int) on OBJECT | INTERFACE

            scalar Point @some_directive(y: 3)

            enum ThingsToCount {
              EIGHT
              ONE
              SEVEN
              THREE
              TWO
            }

            type Frog implements Amphibian & HasShortName @some_directive {
              bug_id: ID!
              frog_name: Name
              name: Name
              short_name: String!
            }

            type Name implements HasShortName {
              short_name: String
            }

            type Query {
              name: String
            }

            type Toad implements HasShortName {
              name: Name
              short_name: String
            }

            interface Amphibian implements HasShortName {
              name: Name
              short_name: String!
            }

            interface Bug @some_directive {
              bug_id: ID!
              name: Name
            }

            interface HasShortName {
              short_name: String
            }

            union Many =
              | Name
              | Query
        "#};

        let expected_client = indoc! {r#"
            directive @some_client_directive on INTERFACE

            extend type Frog implements Bug {
              other_name: String
            }

            extend type Query {
              extension: Int
            }

            extend type Toad implements Bug {
              bug_id: ID!
            }

            extend interface Bug @some_client_directive
        "#};

        assert_eq!(
            printed_base_schema.trim(),
            expected_base.trim(),
            "Base schema mismatch.\nActual:\n{}\nExpected:\n{}",
            printed_base_schema,
            expected_base,
        );

        assert_eq!(
            printed_client_schema.trim(),
            expected_client.trim(),
            "Client schema mismatch.\nActual:\n{}\nExpected:\n{}",
            printed_client_schema,
            expected_client,
        );
    }

    fn set_from_sdl(sdl: &str) -> SchemaSet {
        SchemaSet::from_base_schema_documents(&[parse_schema_document(
            sdl,
            SourceLocationKey::generated(),
        )
        .unwrap()])
        .unwrap()
    }

    // --- is_empty ---

    #[test]
    fn test_is_empty_new() {
        assert!(SchemaSet::new().is_empty());
    }

    #[test]
    fn test_is_empty_with_type() {
        let set = set_from_sdl("type Foo { id: ID! }");
        assert!(!set.is_empty());
    }

    // --- from_base_schema_documents ---

    #[test]
    fn test_from_schema_documents_single() {
        let doc = parse_schema_document(
            "type Query { name: String }",
            SourceLocationKey::generated(),
        )
        .unwrap();
        let set = SchemaSet::from_base_schema_documents(&[doc]).unwrap();
        assert!(!set.is_empty());
        assert!(set.types.contains_key(&"Query".intern()));
    }

    #[test]
    fn test_from_schema_documents_multiple() {
        let doc1 = parse_schema_document(
            "type Query { name: String }",
            SourceLocationKey::generated(),
        )
        .unwrap();
        let doc2 =
            parse_schema_document("type User { id: ID! }", SourceLocationKey::generated()).unwrap();
        let set = SchemaSet::from_base_schema_documents(&[doc1, doc2]).unwrap();
        assert!(set.types.contains_key(&"Query".intern()));
        assert!(set.types.contains_key(&"User".intern()));
    }

    // --- union_set ---

    #[test]
    fn test_union_set() {
        let a = set_from_sdl("type Foo { id: ID! }");
        let b = set_from_sdl("type Bar { name: String }");
        let empty_directives = intern::string_key::StringKeySet::default();
        let union = a.union_set(&b, &empty_directives).unwrap();
        assert!(union.types.contains_key(&"Foo".intern()));
        assert!(union.types.contains_key(&"Bar".intern()));
    }

    #[test]
    fn test_union_set_with_overlapping_types() {
        let a = set_from_sdl("type Foo { id: ID! }");
        let b = set_from_sdl("type Foo { name: String }");
        let empty_directives = intern::string_key::StringKeySet::default();
        let union = a.union_set(&b, &empty_directives).unwrap();
        // Foo should be merged with both fields
        assert!(union.types.contains_key(&"Foo".intern()));
        if let SetType::Object(obj) = union.types.get(&"Foo".intern()).unwrap() {
            assert!(
                obj.fields.contains_key(&"id".intern()),
                "Should contain id field"
            );
            assert!(
                obj.fields.contains_key(&"name".intern()),
                "Should contain name field"
            );
        } else {
            panic!("Expected Object type");
        }
    }

    // --- exclude_set ---

    #[test]
    fn test_exclude_set() {
        let a = set_from_sdl("type Foo { id: ID! } type Bar { name: String }");
        let b = set_from_sdl("type Foo { id: ID! }");
        let empty_directives = intern::string_key::StringKeySet::default();
        let excluded = a.exclude_set(&b, &empty_directives, &empty_directives);
        // Foo should be excluded, Bar should remain
        assert!(!excluded.types.contains_key(&"Foo".intern()));
        assert!(excluded.types.contains_key(&"Bar".intern()));
    }

    // --- intersect_set ---

    #[test]
    fn test_intersect_set() {
        let a = set_from_sdl("type Foo { id: ID! } type Bar { name: String }");
        let b = set_from_sdl("type Foo { id: ID! } type Baz { age: Int }");
        let empty_directives = intern::string_key::StringKeySet::default();
        let intersected = a.intersect_set(&b, &empty_directives).unwrap();
        // Only Foo should be in the intersection
        assert!(
            intersected.types.contains_key(&"Foo".intern()),
            "Foo should be in intersection"
        );
        assert!(
            !intersected.types.contains_key(&"Bar".intern()),
            "Bar should not be in intersection"
        );
        assert!(
            !intersected.types.contains_key(&"Baz".intern()),
            "Baz should not be in intersection"
        );
    }

    fn set_from_base_and_extensions(base_sdl: &str, ext_sdl: &str) -> SchemaSet {
        let base_doc = parse_schema_document(base_sdl, SourceLocationKey::generated()).unwrap();
        let ext_doc = parse_schema_document(ext_sdl, SourceLocationKey::generated()).unwrap();
        SchemaSet::from_schema_documents_with_extensions(&[base_doc], &[ext_doc]).unwrap()
    }

    /// Asserts the base/client printed output of `actual_set` equals what you
    /// would get by parsing `expected_base_sdl` + `expected_ext_sdl` through
    /// `from_schema_documents_with_extensions` and printing it.
    macro_rules! assert_base_and_extensions_eq {
        ($actual_set:expr, $expected_base:expr, $expected_ext:expr $(,)?) => {
            let (actual_base_defs, actual_client_defs) =
                $actual_set.print_base_and_client_definitions().unwrap();
            let expected = set_from_base_and_extensions($expected_base, $expected_ext);
            let (expected_base_defs, expected_client_defs) =
                expected.print_base_and_client_definitions().unwrap();
            assert_eq!(
                actual_base_defs.join("\n\n"),
                expected_base_defs.join("\n\n"),
                "base printed schema does not match expected"
            );
            assert_eq!(
                actual_client_defs.join("\n\n"),
                expected_client_defs.join("\n\n"),
                "extensions printed schema does not match expected"
            );
        };
    }

    #[test]
    fn test_from_schema_documents_with_extensions_partitions_definitions() {
        // A type defined in a base document and an `extend type` from an extension
        // document should land on opposite sides of the base/client split.
        let set = set_from_base_and_extensions(
            "type Query { name: String }",
            "extend type Query { client_field: Int }",
        );

        assert_base_and_extensions_eq!(
            set,
            "type Query { name: String }",
            "extend type Query { client_field: Int }",
        );
    }

    #[test]
    fn test_intersect_set_with_extensions() {
        // Both `a` and `b` have base + extensions for Query, but only `client_field`
        // is common to the extension halves. `Foo` (base-only in `a`) and `Bar`
        // (base-only in `b`) drop out, as does `extra_client` (only in b).
        let a = set_from_base_and_extensions(
            "type Query { name: String } type Foo { id: ID! }",
            "extend type Query { client_field: Int }",
        );
        let b = set_from_base_and_extensions(
            "type Query { name: String } type Bar { id: ID! }",
            "extend type Query { client_field: Int extra_client: String }",
        );

        let empty_directives = intern::string_key::StringKeySet::default();
        let intersected = a.intersect_set(&b, &empty_directives).unwrap();

        assert_base_and_extensions_eq!(
            intersected,
            "type Query { name: String }",
            "extend type Query { client_field: Int }",
        );
    }

    #[test]
    fn test_union_set_with_extensions() {
        // Union should preserve base/extension sourcing of the inputs.
        let a = set_from_base_and_extensions(
            "type Query { name: String }",
            "extend type Query { client_a: Int }",
        );
        let b = set_from_base_and_extensions(
            "type Query { age: Int }",
            "extend type Query { client_b: String }",
        );

        let empty_directives = intern::string_key::StringKeySet::default();
        let unioned = a.union_set(&b, &empty_directives).unwrap();

        assert_base_and_extensions_eq!(
            unioned,
            "type Query { name: String age: Int }",
            "extend type Query { client_a: Int client_b: String }",
        );
    }

    // --- add_or_merge_type ---

    #[test]
    fn test_add_or_merge_type_new() {
        let mut set = SchemaSet::new();
        let obj = SetType::Object(SetObject::default("Foo".intern()));
        set.add_or_merge_type(obj).unwrap();
        assert!(set.types.contains_key(&"Foo".intern()));
    }

    #[test]
    fn test_add_or_merge_type_existing() {
        let mut set = set_from_sdl("type Foo { id: ID! }");
        let additional = set_from_sdl("type Foo { name: String }");
        let foo_type = additional.types.get(&"Foo".intern()).unwrap().clone();
        set.add_or_merge_type(foo_type).unwrap();
        if let SetType::Object(obj) = set.types.get(&"Foo".intern()).unwrap() {
            assert!(obj.fields.contains_key(&"id".intern()));
            assert!(obj.fields.contains_key(&"name".intern()));
        } else {
            panic!("Expected Object type");
        }
    }

    // --- merge_type_system_definition ---

    #[test]
    fn test_merge_type_system_definition_object() {
        let mut set = SchemaSet::new();
        let doc = parse_schema_document(
            "type Query { name: String }",
            SourceLocationKey::generated(),
        )
        .unwrap();
        for def in &doc.definitions {
            set.merge_type_system_definition(def, SourceLocationKey::generated(), false)
                .unwrap();
        }
        assert!(set.types.contains_key(&"Query".intern()));
    }

    #[test]
    fn test_merge_type_system_definition_directive() {
        let mut set = SchemaSet::new();
        let doc = parse_schema_document("directive @foo on OBJECT", SourceLocationKey::generated())
            .unwrap();
        for def in &doc.definitions {
            set.merge_type_system_definition(def, SourceLocationKey::generated(), false)
                .unwrap();
        }
        assert!(set.directives.contains_key(&"foo".intern()));
    }

    // --- fix_all_types ---

    #[test]
    fn test_fix_all_types_sets_default_query() {
        let mut set = set_from_sdl("type Query { name: String }");
        set.fix_all_types().unwrap();
        assert_eq!(set.root_schema.query_type, Some("Query".intern()));
    }

    #[test]
    fn test_fix_all_types_removes_unknown_interfaces() {
        let mut set = set_from_sdl(indoc! {r#"
            type Foo implements UnknownInterface {
              id: ID!
            }
        "#});
        set.fix_all_types().unwrap();
        if let SetType::Object(obj) = set.types.get(&"Foo".intern()).unwrap() {
            assert!(
                obj.interfaces.is_empty(),
                "Unknown interface should be removed"
            );
        } else {
            panic!("Expected Object type");
        }
    }

    #[test]
    fn test_fix_all_types_propagates_interface_fields() {
        let mut set = set_from_sdl(indoc! {r#"
            interface HasName {
              name: String
            }
            type User implements HasName {
              id: ID!
            }
        "#});
        set.fix_all_types().unwrap();
        if let SetType::Object(obj) = set.types.get(&"User".intern()).unwrap() {
            assert!(
                obj.fields.contains_key(&"name".intern()),
                "Interface field 'name' should be propagated to User. Fields: {:?}",
                obj.fields.keys().collect::<Vec<_>>()
            );
        } else {
            panic!("Expected Object type");
        }
    }

    #[test]
    fn test_fix_all_types_removes_unknown_union_members() {
        let mut set = set_from_sdl(indoc! {r#"
            type Cat { name: String }
            union Animal = Cat | NonExistent
        "#});
        set.fix_all_types().unwrap();
        if let SetType::Union(u) = set.types.get(&"Animal".intern()).unwrap() {
            assert!(u.members.contains_key(&"Cat".intern()));
            assert!(
                !u.members.contains_key(&"NonExistent".intern()),
                "Non-existent members should be removed"
            );
        } else {
            panic!("Expected Union type");
        }
    }

    #[test]
    fn test_fix_all_types_retains_field_with_arg_referencing_missing_input_object() {
        let mut set = set_from_sdl(indoc! {r#"
            type Query {
              search(filter: MissingInput!): String
            }
        "#});
        set.fix_all_types().unwrap();
        if let SetType::Object(obj) = set.types.get(&"Query".intern()).unwrap() {
            assert!(
                obj.fields.contains_key(&"search".intern()),
                "Field with arg referencing missing input object should not be removed by fix_all_types"
            );
            let search_field = obj.fields.get(&"search".intern()).unwrap();
            assert!(
                !search_field.arguments.is_empty(),
                "Arguments referencing missing input object should not be removed by fix_all_types"
            );
        } else {
            panic!("Expected Object type");
        }
    }

    // --- fix_all_types_with_schema ---

    #[test]
    fn test_fix_all_types_with_schema() {
        let original = set_from_sdl(indoc! {r#"
            interface HasName {
              name: String
            }
            type User implements HasName {
              id: ID!
              name: String
            }
        "#});

        let mut subset = set_from_sdl(indoc! {r#"
            interface HasName {
              name: String
            }
            type User implements HasName {
              id: ID!
            }
        "#});

        subset.fix_all_types_with_schema(&original).unwrap();
        if let SetType::Object(obj) = subset.types.get(&"User".intern()).unwrap() {
            assert!(
                obj.fields.contains_key(&"name".intern()),
                "Interface field 'name' should be added from HasName"
            );
        } else {
            panic!("Expected Object type");
        }
    }
}
