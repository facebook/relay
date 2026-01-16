/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::BTreeMap;
use std::fmt;

use common::DirectiveName;
use common::EnumName;
use common::InputObjectName;
use common::InterfaceName;
use common::ObjectName;
use common::ScalarName;
use common::SourceLocationKey;
use common::UnionName;
use common::WithLocation;
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
use schema::DirectiveValue;
use schema::EnumValue;
use schema::SDLSchema;
use schema::Schema;
use schema::TypeReference;

use crate::OutputTypeReference;
use crate::SchemaDefault;
use crate::SchemaInsertField;
use crate::UsedSchemaCollectionOptions;
use crate::impl_can_be_client_definition;
use crate::impl_can_have_directives;
use crate::impl_has_arguments;
use crate::impl_has_description;
use crate::impl_has_fields;
use crate::impl_has_interfaces;
use crate::impl_partitions_only_directives;
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

    pub fn union_set(&self, to_union: &SchemaSet, _subset_directives: &StringKeySet) -> SchemaSet {
        // We don't currently use the subset_directives, which tells me the union logic used by merge
        // is *probably* subtly wrong. Need tests to verify.
        let mut union_set = self.clone();
        union_set.merge(to_union.clone());
        union_set
    }

    pub fn exclude_set(
        &self,
        to_exclude: &SchemaSet,
        subset_directives: &StringKeySet,
    ) -> SchemaSet {
        self.exclude(
            to_exclude,
            &SafeExclusionOptions {
                subset_directives: subset_directives.clone(),
                ..Default::default()
            },
        )
    }

    pub fn intersect_set(
        &self,
        to_intersect: &SchemaSet,
        subset_directives: &StringKeySet,
    ) -> SchemaSet {
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

        let a_exclude_b = a.exclude_set(b, subset_directives);
        let b_exclude_a = b.exclude_set(a, subset_directives);

        let everything_except_the_intersect =
            a_exclude_b.union_set(&b_exclude_a, subset_directives);

        // arbitrarily picking A, but could be B instead.
        // Exclude everything-except-the-intersect from A to get the intersect.
        a.exclude_set(&everything_except_the_intersect, subset_directives)
    }

    // We don't want to make custom logic for "expanding" the SchemaSet at IR collection time,
    // otherwise we can more easily get out-of-sync with our actual transform logic.
    // For iOS GraphServices, the runtime schema requires *every* type be explicitly defined
    // if that type is used by any used interface/union.
    pub fn from_ir(
        program: &ProgramWithDependencies,
        used_schema_options: UsedSchemaCollectionOptions,
    ) -> SchemaSet {
        SchemaSet::from_ir_with_used_type_definitions(program, None, used_schema_options)
    }

    pub fn from_ir_with_used_type_definitions(
        program: &ProgramWithDependencies,
        type_definitions_doc: Option<SchemaDocument>,
        used_schema_options: UsedSchemaCollectionOptions,
    ) -> SchemaSet {
        let mut used_schema = SchemaSet::new();
        let mut used_schema_collector =
            UsedSchemaIRCollector::new(&mut used_schema, program, used_schema_options);

        used_schema_collector.visit_program(&program.into());
        if let Some(type_definitions_doc) = type_definitions_doc {
            used_schema_collector.add_used_type_definitions(type_definitions_doc);
        }

        used_schema
    }

    pub fn from_schema_documents(schema_documents: &[SchemaDocument]) -> Self {
        let mut used_schema = SchemaSet::new();
        for document in schema_documents {
            used_schema.merge_sdl_document(document, false);
        }
        used_schema
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

    pub fn printed_base_and_client_schema(&self) -> (String, String) {
        let (base_definitions, client_definitions) = self.print_base_and_client_definitions();
        (
            base_definitions.join("\n\n") + "\n",
            client_definitions.join("\n\n") + "\n",
        )
    }

    pub fn add_or_merge_type(&mut self, type_: SetType) {
        if let Some(existing) = self.types.get_mut(&type_.string_key_name()) {
            existing.merge(type_);
        } else {
            self.types.insert(type_.string_key_name(), type_);
        }
    }

    pub fn merge_sdl_document(&mut self, document: &SchemaDocument, is_ext_document: bool) {
        let source = document.location.source_location();
        for definition in &document.definitions {
            self.merge_type_system_definition(definition, source, is_ext_document);
        }
    }

    pub fn merge_type_system_definition(
        &mut self,
        definition: &TypeSystemDefinition,
        source: SourceLocationKey,
        is_ext_document: bool,
    ) {
        match definition {
            TypeSystemDefinition::SchemaDefinition(schema_def) => self
                .root_schema
                .merge(schema_def.to_set_definition(source, is_ext_document)),
            TypeSystemDefinition::SchemaExtension(schema_ext) => self.root_schema.merge(
                schema_ext
                    .clone()
                    .into_definition()
                    .to_set_definition(source, true),
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
    pub fn fix_all_types(&mut self) {
        self.fix_all_types_impl(None);
    }

    pub fn fix_all_types_with_schema(&mut self, original_schema: &SchemaSet) {
        self.fix_all_types_impl(Some(original_schema));
    }

    fn fix_all_types_impl(&mut self, original_schema: Option<&SchemaSet>) {
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
            // There MUST be a query type defined, either via schema { .. } or as a default Query type
            self.types
                .entry("Query".intern())
                .or_insert(SetType::Object(SetObject {
                    // Note: When partitioning a schema into server and client
                    // types, types without any definition/fields will be
                    // assumed to be client types (presumably since it's not
                    // valid SDL to have no fields).
                    definition: None,
                    interfaces: StringKeyIndexMap::default(),
                    fields: StringKeyMap::default(),
                    name: ObjectName("Query".intern()),
                    directives: Vec::new(),
                }));
            self.root_schema.query_type = Some("Query".intern());
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
                            );
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
                            );
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
    }
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SchemaDefinitionItem {
    pub name: WithLocation<StringKey>,
    pub is_client_definition: bool,
    pub description: Option<StringKey>,
    pub hack_source: Option<StringKey>,
}
impl SchemaDefinitionItem {
    pub fn default(name: StringKey) -> Self {
        Self {
            name: WithLocation::generated(name),
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

impl CanBeClientDefinition for SetType {
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

    fn set_is_client_definition(&mut self, is_client_definition: bool) {
        match self {
            SetType::Scalar(t) => t.set_is_client_definition(is_client_definition),
            SetType::Enum(t) => t.set_is_client_definition(is_client_definition),
            SetType::Object(t) => t.set_is_client_definition(is_client_definition),
            SetType::Interface(t) => t.set_is_client_definition(is_client_definition),
            SetType::Union(t) => t.set_is_client_definition(is_client_definition),
            SetType::InputObject(t) => t.set_is_client_definition(is_client_definition),
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
    fn directives(&self) -> &Vec<DirectiveValue> {
        match self {
            SetType::Scalar(t) => t.directives(),
            SetType::Enum(t) => t.directives(),
            SetType::Object(t) => t.directives(),
            SetType::Interface(t) => t.directives(),
            SetType::Union(t) => t.directives(),
            SetType::InputObject(t) => t.directives(),
        }
    }

    fn directives_mut(&mut self) -> &mut Vec<DirectiveValue> {
        match self {
            SetType::Scalar(t) => t.directives_mut(),
            SetType::Enum(t) => t.directives_mut(),
            SetType::Object(t) => t.directives_mut(),
            SetType::Interface(t) => t.directives_mut(),
            SetType::Union(t) => t.directives_mut(),
            SetType::InputObject(t) => t.directives_mut(),
        }
    }

    fn set_directives(&mut self, directives: Vec<DirectiveValue>) {
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
    pub directives: Vec<DirectiveValue>,
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
    impl_can_have_directives,
    impl_has_description
);

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SetScalar {
    pub definition: Option<SchemaDefinitionItem>,
    pub name: ScalarName,
    pub directives: Vec<DirectiveValue>,
}
impl_traits!(
    SetScalar,
    impl_string_key_named_with_location,
    impl_can_be_client_definition,
    impl_can_have_directives,
    impl_partitions_only_directives,
    impl_has_description
);

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SetObject {
    pub definition: Option<SchemaDefinitionItem>,
    pub name: ObjectName,
    pub interfaces: StringKeyIndexMap<SetMemberType>,
    pub directives: Vec<DirectiveValue>,
    pub fields: StringKeyMap<SetField>,
}
impl_traits!(
    SetObject,
    impl_has_fields,
    impl_has_interfaces,
    impl_string_key_named_with_location,
    impl_can_be_client_definition,
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
    pub directives: Vec<DirectiveValue>,
    pub fields: StringKeyMap<SetField>,
}

impl_traits!(
    SetInterface,
    impl_has_fields,
    impl_has_interfaces,
    impl_string_key_named_with_location,
    impl_can_be_client_definition,
    impl_can_have_directives,
    impl_has_description
);

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SetInputObject {
    pub definition: Option<SchemaDefinitionItem>,
    pub name: InputObjectName,
    pub directives: Vec<DirectiveValue>,
    pub fields: StringKeyIndexMap<SetArgument>,

    // Input objects may need to be fully visited, if used as a variable for instance.
    // And they are recursive structures. So we need to know whether we can skip recursively
    // collecting a SetInputObject if we've already fully collected it.
    pub fully_recursively_visited: bool,
}
impl_traits!(
    SetInputObject,
    impl_string_key_named_with_location,
    impl_can_be_client_definition,
    impl_can_have_directives,
    impl_partitions_only_directives,
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
    pub directives: Vec<DirectiveValue>,
    // If used as a const input value, the explicit values used.
    // Otherwise when used as an input variable or as an output,
    // all possible values.
    // We keep them sorted in their insertion order
    pub values: BTreeMap<StringKey, EnumValue>,
}
impl_traits!(
    SetEnum,
    impl_string_key_named_with_location,
    impl_can_be_client_definition,
    impl_can_have_directives,
    impl_partitions_only_directives,
    impl_has_description
);

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SetUnion {
    pub definition: Option<SchemaDefinitionItem>,
    pub name: UnionName,
    pub directives: Vec<DirectiveValue>,
    pub members: StringKeyIndexMap<SetMemberType>,
}

impl_traits!(
    SetUnion,
    impl_string_key_named_with_location,
    impl_can_be_client_definition,
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
    pub directives: Vec<DirectiveValue>,
}
impl_traits!(
    SetField,
    impl_has_arguments,
    impl_string_key_named_with_location,
    impl_can_be_client_definition,
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
    impl_can_be_client_definition,
    impl_string_key_named_with_location,
    impl_has_description
);

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SetArgument {
    pub definition: Option<SchemaDefinitionItem>,
    pub name: StringKey,
    pub type_: TypeReference<StringKey>,
    pub default_value: Option<ConstantValue>,
    pub directives: Vec<DirectiveValue>,
}
impl_traits!(
    SetArgument,
    impl_string_key_named_raw,
    impl_can_have_directives,
    impl_has_description
);

pub trait StringKeyNamed {
    fn string_key_name(&self) -> StringKey;
}

pub trait CanBeClientDefinition {
    fn is_client_definition(&self) -> bool;
    fn set_is_client_definition(&mut self, is_client_definition: bool);
}

pub trait CanHaveDirectives {
    fn directives(&self) -> &Vec<DirectiveValue>;
    fn directives_mut(&mut self) -> &mut Vec<DirectiveValue>;

    fn set_directives(&mut self, directives: Vec<DirectiveValue>);

    fn partition_extension_directives(
        &self,
        schema_set: &SchemaSet,
    ) -> (Vec<DirectiveValue>, Vec<DirectiveValue>) {
        self.directives()
            .iter()
            .cloned()
            .partition(|directive_value| {
                schema_set
                    .directives
                    .get(&directive_value.name.0)
                    // LHS is base, RHS is extensions
                    .is_some_and(|directive| !directive.is_client_definition())
            })
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
                extension_fields.insert(*field_name, field_value.clone());
            } else {
                base_fields.insert(*field_name, field_value.clone());
            }
        }
        (base_fields, extension_fields)
    }
}
#[allow(dead_code)]
pub trait HasArguments {
    fn arguments(&self) -> &StringKeyIndexMap<SetArgument>;
    fn arguments_mut(&mut self) -> &mut StringKeyIndexMap<SetArgument>;
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
