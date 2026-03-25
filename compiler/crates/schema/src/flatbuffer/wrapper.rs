/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::BTreeMap;
use std::collections::HashMap;
use std::collections::HashSet;
use std::fmt;
use std::hash::Hash;

use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::Location;
use common::ObjectName;
use common::ScalarName;
use common::SourceLocationKey;
use common::WithLocation;
use dashmap::DashMap;
use fnv::FnvBuildHasher;
use graphql_syntax::ConstantDirective;
use graphql_syntax::DirectiveLocation;
use graphql_syntax::FieldDefinition;
use graphql_syntax::Identifier;
use graphql_syntax::InputValueDefinition;
use graphql_syntax::InterfaceTypeExtension;
use graphql_syntax::List;
use graphql_syntax::ObjectTypeDefinition;
use graphql_syntax::ObjectTypeExtension;
use graphql_syntax::ScalarTypeDefinition;
use graphql_syntax::TypeAnnotation;
use intern::Lookup;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use ouroboros::self_referencing;
use rayon::iter::IntoParallelIterator;
use rayon::iter::IntoParallelRefIterator;
use rayon::iter::ParallelIterator;

use super::FlatBufferSchema;
use crate::Argument;
use crate::ArgumentDefinitions;
use crate::ArgumentValue;
use crate::Directive;
use crate::DirectiveValue;
use crate::Enum;
use crate::EnumID;
use crate::Field;
use crate::FieldID;
use crate::InputObject;
use crate::InputObjectID;
use crate::Interface;
use crate::InterfaceID;
use crate::Object;
use crate::ObjectID;
use crate::Scalar;
use crate::ScalarID;
use crate::Schema;
use crate::Type;
use crate::TypeReference;
use crate::Union;
use crate::UnionID;
use crate::errors::SchemaError;
use crate::field_descriptions::CLIENT_ID_DESCRIPTION;

#[self_referencing]
struct OwnedFlatBufferSchema {
    #[allow(dead_code)]
    data: Vec<u8>,

    #[borrows(data)]
    #[covariant]
    pub schema: FlatBufferSchema<'this>,
}

const CLIENTID_FIELD_ID: FieldID = FieldID(10_000_000);
const TYPENAME_FIELD_ID: FieldID = FieldID(10_000_001);
const FETCH_TOKEN_FIELD_ID: FieldID = FieldID(10_000_002);
const STRONGID_FIELD_ID: FieldID = FieldID(10_000_003);
const IS_FULFILLED_FIELD_ID: FieldID = FieldID(10_000_004);

fn extend_without_duplicates<T: Eq + Hash>(vec: &mut Vec<T>, items: Vec<T>) {
    let existing: HashSet<&T> = vec.iter().collect();
    let new_items: Vec<T> = items
        .into_iter()
        .filter(|item| !existing.contains(item))
        .collect();
    vec.extend(new_items);
}

fn len_of_option_list<T>(list: &Option<List<T>>) -> usize {
    list.as_ref().map_or(0, |l| l.items.len())
}

pub struct SchemaWrapper {
    clientid_field_name: StringKey,
    strongid_field_name: StringKey,
    typename_field_name: StringKey,
    fetch_token_field_name: StringKey,
    is_fulfilled_field_name: StringKey,
    unchecked_argument_type_sentinel: Option<TypeReference<Type>>,

    directives: Cache<DirectiveName, Option<Directive>>,
    interfaces: Cache<InterfaceID, Interface>,
    unions: Cache<UnionID, Union>,
    input_objects: Cache<InputObjectID, InputObject>,
    enums: Cache<EnumID, Enum>,
    scalars: Cache<ScalarID, Scalar>,
    fields: Cache<FieldID, Field>,
    objects: Cache<ObjectID, Object>,
    type_map: Cache<(), Vec<(StringKey, Type)>>,
    fb: OwnedFlatBufferSchema,

    // Overlay for docblock-injected types and fields
    overlay_type_map: HashMap<StringKey, Type>,
    overlay_objects: Vec<Object>,
    overlay_scalars: Vec<Scalar>,
    overlay_fields: Vec<Field>,
    overlay_interfaces: Vec<Interface>,
    // Base entity counts from flatbuffer (for ID offsetting)
    fb_object_count: u32,
    fb_scalar_count: u32,
    fb_field_count: u32,
    fb_interface_count: u32,
}
impl fmt::Debug for SchemaWrapper {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("Schema").finish()
    }
}

fn _assert_send_sync(_: impl Send + Sync) {}
fn _assert_send_sync2(s: &SchemaWrapper) {
    _assert_send_sync(s)
}

impl SchemaWrapper {
    pub fn from_vec(data: Vec<u8>) -> Self {
        let fb = OwnedFlatBufferSchemaBuilder {
            data,
            schema_builder: |data| FlatBufferSchema::build(data),
        }
        .build();

        Self::init(fb)
    }

    pub fn from_vec_unchecked(data: Vec<u8>) -> Self {
        let fb = OwnedFlatBufferSchemaBuilder {
            data,
            schema_builder: |data| FlatBufferSchema::build_unchecked(data),
        }
        .build();

        Self::init(fb)
    }

    fn init(fb: OwnedFlatBufferSchema) -> Self {
        let fb_schema = fb.borrow_schema();
        let fb_object_count = fb_schema.objects.len() as u32;
        let fb_scalar_count = fb_schema.scalars.len() as u32;
        let fb_field_count = fb_schema.fields.len() as u32;
        let fb_interface_count = fb_schema.interfaces.len() as u32;

        let mut result = Self {
            clientid_field_name: "__id".intern(),
            strongid_field_name: "strong_id__".intern(),
            typename_field_name: "__typename".intern(),
            fetch_token_field_name: "__token".intern(),
            is_fulfilled_field_name: "is_fulfilled__".intern(),
            unchecked_argument_type_sentinel: None,
            directives: Cache::new(),
            unions: Cache::new(),
            interfaces: Cache::new(),
            input_objects: Cache::new(),
            enums: Cache::new(),
            scalars: Cache::new(),
            fields: Cache::new(),
            objects: Cache::new(),
            type_map: Cache::new(),
            fb,
            overlay_type_map: HashMap::new(),
            overlay_objects: Vec::new(),
            overlay_scalars: Vec::new(),
            overlay_fields: Vec::new(),
            overlay_interfaces: Vec::new(),
            fb_object_count,
            fb_scalar_count,
            fb_field_count,
            fb_interface_count,
        };

        // prepopulate special fields
        result.fields.get(TYPENAME_FIELD_ID, || Field {
            name: WithLocation::generated(result.typename_field_name),
            is_extension: false,
            arguments: ArgumentDefinitions::new(Default::default()),
            type_: TypeReference::NonNull(Box::new(TypeReference::Named(
                result.get_type("String".intern()).unwrap(),
            ))),
            directives: Vec::new(),
            parent_type: None,
            description: None,
            hack_source: None,
        });
        result.fields.get(CLIENTID_FIELD_ID, || -> Field {
            Field {
                name: WithLocation::generated(result.clientid_field_name),
                is_extension: true,
                arguments: ArgumentDefinitions::new(Default::default()),
                type_: TypeReference::NonNull(Box::new(TypeReference::Named(
                    result.get_type("ID".intern()).unwrap(),
                ))),
                directives: Vec::new(),
                parent_type: None,
                description: Some(*CLIENT_ID_DESCRIPTION),
                hack_source: None,
            }
        });
        result.fields.get(STRONGID_FIELD_ID, || Field {
            name: WithLocation::generated(result.strongid_field_name),
            is_extension: true,
            arguments: ArgumentDefinitions::new(Default::default()),
            type_: TypeReference::Named(result.get_type("ID".intern()).unwrap()),
            directives: Vec::new(),
            parent_type: None,
            description: None,
            hack_source: None,
        });
        result.fields.get(FETCH_TOKEN_FIELD_ID, || Field {
            name: WithLocation::generated(result.fetch_token_field_name),
            is_extension: false,
            arguments: ArgumentDefinitions::new(Default::default()),
            type_: TypeReference::NonNull(Box::new(TypeReference::Named(
                result.get_type("ID".intern()).unwrap(),
            ))),
            directives: Vec::new(),
            parent_type: None,
            description: None,
            hack_source: None,
        });
        result.fields.get(IS_FULFILLED_FIELD_ID, || Field {
            name: WithLocation::generated(result.is_fulfilled_field_name),
            is_extension: true,
            arguments: ArgumentDefinitions::new(vec![Argument {
                name: WithLocation::generated(ArgumentName("name".intern())),
                type_: TypeReference::NonNull(Box::new(TypeReference::Named(
                    result.get_type("String".intern()).unwrap(),
                ))),
                default_value: None,
                description: None,
                directives: Default::default(),
            }]),
            type_: TypeReference::NonNull(Box::new(TypeReference::Named(
                result.get_type("Boolean".intern()).unwrap(),
            ))),
            directives: Vec::new(),
            parent_type: None,
            description: None,
            hack_source: None,
        });

        result.unchecked_argument_type_sentinel = Some(TypeReference::Named(
            result.get_type("Boolean".intern()).unwrap(),
        ));

        result
    }

    pub fn has_type(&self, type_name: StringKey) -> bool {
        self.overlay_type_map.contains_key(&type_name)
            || self.flatbuffer_schema().has_type(type_name)
    }

    pub fn has_directive(&self, name: DirectiveName) -> bool {
        self.get_directive(name).is_some()
    }

    pub fn get_directives(&self) -> Vec<&Directive> {
        let fb = self.flatbuffer_schema();
        (0..fb.directives.len())
            .filter_map(|i| {
                let name = DirectiveName(fb.directives.get(i).name().intern());
                self.get_directive(name)
            })
            .collect()
    }

    pub fn get_type_map(&self) -> impl Iterator<Item = (&StringKey, &Type)> {
        let overlay_ref = &self.overlay_type_map;
        let type_map = self.type_map.get((), || {
            let fb = self.flatbuffer_schema();
            (0..fb.types.len())
                .filter_map(|i| {
                    let entry = fb.types.get(i);
                    let name = entry.name().intern();
                    let type_ = fb.parse_type(entry.value()?);
                    Some((name, type_))
                })
                .collect()
        });
        type_map
            .iter()
            .map(|(k, v)| (k, v))
            .chain(overlay_ref.iter())
    }

    pub fn get_type_map_par_iter(&self) -> impl ParallelIterator<Item = (&StringKey, &Type)> {
        let type_map = self.type_map.get((), || {
            let fb = self.flatbuffer_schema();
            (0..fb.types.len())
                .filter_map(|i| {
                    let entry = fb.types.get(i);
                    let name = entry.name().intern();
                    let type_ = fb.parse_type(entry.value()?);
                    Some((name, type_))
                })
                .collect()
        });
        let overlay_vec: Vec<(&StringKey, &Type)> = self.overlay_type_map.iter().collect();
        type_map
            .par_iter()
            .map(|(k, v)| (k, v))
            .chain(overlay_vec.into_par_iter())
    }

    pub fn directives_for_location(&self, location: DirectiveLocation) -> Vec<&Directive> {
        let fb = self.flatbuffer_schema();
        (0..fb.directives.len())
            .filter_map(|i| {
                let name = DirectiveName(fb.directives.get(i).name().intern());
                self.get_directive(name)
            })
            .filter(|directive| directive.locations.contains(&location))
            .collect()
    }

    pub fn get_enums_par_iter(&self) -> impl ParallelIterator<Item = &Enum> {
        let fb = self.flatbuffer_schema();
        if self.enums.map.len() < fb.enums.len() {
            for i in 0..fb.enums.len() {
                self.enum_(EnumID(i.try_into().unwrap()));
            }
        }
        let enums: Vec<&Enum> = self.enums.map.iter().map(|ref_| *ref_.value()).collect();
        enums.into_par_iter()
    }

    fn flatbuffer_schema(&self) -> &FlatBufferSchema<'_> {
        self.fb.borrow_schema()
    }

    // --- Parsing helpers (modeled after InMemorySchema) ---

    fn build_type_reference(
        &self,
        ast_type: &TypeAnnotation,
        source_location: SourceLocationKey,
    ) -> DiagnosticsResult<TypeReference<Type>> {
        Ok(match ast_type {
            TypeAnnotation::Named(named_type) => {
                TypeReference::Named(self.get_type(named_type.name.value).ok_or_else(|| {
                    vec![Diagnostic::error(
                        SchemaError::UndefinedType(named_type.name.value),
                        Location::new(source_location, named_type.name.span),
                    )]
                })?)
            }
            TypeAnnotation::NonNull(of_type) => TypeReference::NonNull(Box::new(
                self.build_type_reference(&of_type.type_, source_location)?,
            )),
            TypeAnnotation::List(of_type) => TypeReference::List(Box::new(
                self.build_type_reference(&of_type.type_, source_location)?,
            )),
        })
    }

    fn build_input_object_reference(
        &self,
        ast_type: &TypeAnnotation,
    ) -> DiagnosticsResult<TypeReference<Type>> {
        Ok(match ast_type {
            TypeAnnotation::Named(named_type) => {
                let type_ = self.get_type(named_type.name.value).ok_or_else(|| {
                    vec![Diagnostic::error(
                        SchemaError::UndefinedType(named_type.name.value),
                        Location::new(SourceLocationKey::generated(), named_type.name.span),
                    )]
                })?;
                if !(type_.is_enum() || type_.is_scalar() || type_.is_input_object()) {
                    return Err(vec![Diagnostic::error(
                        SchemaError::ExpectedInputType(named_type.name.value),
                        Location::new(SourceLocationKey::generated(), named_type.name.span),
                    )]);
                }
                TypeReference::Named(type_)
            }
            TypeAnnotation::NonNull(of_type) => {
                TypeReference::NonNull(Box::new(self.build_input_object_reference(&of_type.type_)?))
            }
            TypeAnnotation::List(of_type) => {
                TypeReference::List(Box::new(self.build_input_object_reference(&of_type.type_)?))
            }
        })
    }

    fn build_arguments(
        &self,
        arg_defs: &Option<List<InputValueDefinition>>,
        source_location_key: SourceLocationKey,
    ) -> DiagnosticsResult<ArgumentDefinitions> {
        if let Some(arg_defs) = arg_defs {
            let arg_defs: DiagnosticsResult<Vec<Argument>> = arg_defs
                .items
                .iter()
                .map(|arg_def| {
                    let argument_location = Location::new(source_location_key, arg_def.name.span);
                    Ok(Argument {
                        name: WithLocation::new(
                            argument_location,
                            ArgumentName(arg_def.name.value),
                        ),
                        type_: self.build_input_object_reference(&arg_def.type_)?,
                        default_value: arg_def
                            .default_value
                            .as_ref()
                            .map(|default_value| default_value.value.clone()),
                        description: None,
                        directives: self.build_directive_values(&arg_def.directives),
                    })
                })
                .collect();
            Ok(ArgumentDefinitions(arg_defs?))
        } else {
            Ok(ArgumentDefinitions(Vec::new()))
        }
    }

    fn build_directive_values(&self, directives: &[ConstantDirective]) -> Vec<DirectiveValue> {
        directives
            .iter()
            .map(|directive| {
                let arguments = if let Some(arguments) = &directive.arguments {
                    arguments
                        .items
                        .iter()
                        .map(|argument| ArgumentValue {
                            name: ArgumentName(argument.name.value),
                            value: argument.value.clone(),
                        })
                        .collect()
                } else {
                    Vec::new()
                };
                DirectiveValue {
                    name: DirectiveName(directive.name.value),
                    arguments,
                }
            })
            .collect()
    }

    fn build_interface_id(
        &self,
        name: &Identifier,
        location_key: &SourceLocationKey,
    ) -> DiagnosticsResult<InterfaceID> {
        match self.get_type(name.value) {
            Some(Type::Interface(id)) => Ok(id),
            Some(non_interface_type) => Err(vec![Diagnostic::error(
                SchemaError::ExpectedInterfaceReference(
                    name.value,
                    non_interface_type.get_variant_name().to_string(),
                ),
                Location::new(*location_key, name.span),
            )]),
            None => Err(vec![Diagnostic::error(
                SchemaError::UndefinedType(name.value),
                Location::new(*location_key, name.span),
            )]),
        }
    }

    fn build_field(&mut self, field: Field) -> FieldID {
        let field_index = self.fb_field_count + self.overlay_fields.len() as u32;
        self.overlay_fields.push(field);
        FieldID(field_index)
    }

    fn build_extend_fields(
        &mut self,
        field_defs: &Option<List<FieldDefinition>>,
        existing_fields: &mut HashMap<StringKey, Location>,
        source_location_key: SourceLocationKey,
        parent_type: Option<Type>,
    ) -> DiagnosticsResult<Vec<FieldID>> {
        if let Some(field_defs) = field_defs {
            let mut field_ids: Vec<FieldID> = Vec::with_capacity(field_defs.items.len());
            for field_def in &field_defs.items {
                let field_name = field_def.name.value;
                let field_location = Location::new(source_location_key, field_def.name.span);
                if let Some(prev_location) = existing_fields.insert(field_name, field_location) {
                    return Err(vec![
                        Diagnostic::error(SchemaError::DuplicateField(field_name), field_location)
                            .annotate("previously defined here", prev_location),
                    ]);
                }
                let arguments = self.build_arguments(&field_def.arguments, source_location_key)?;
                let directives = self.build_directive_values(&field_def.directives);
                let type_ = self.build_type_reference(&field_def.type_, source_location_key)?;
                let description = field_def.description.as_ref().map(|desc| desc.value);
                let hack_source = field_def
                    .hack_source
                    .as_ref()
                    .map(|hack_source| hack_source.value);
                field_ids.push(self.build_field(Field {
                    name: WithLocation::new(field_location, field_name),
                    is_extension: true,
                    arguments,
                    type_,
                    directives,
                    parent_type,
                    description,
                    hack_source,
                }));
            }
            Ok(field_ids)
        } else {
            Ok(Vec::new())
        }
    }

    // --- Mutation methods ---

    pub fn add_extension_scalar(
        &mut self,
        scalar: ScalarTypeDefinition,
        location_key: SourceLocationKey,
    ) -> DiagnosticsResult<()> {
        let scalar_name = scalar.name.name_with_location(location_key);

        if self.overlay_type_map.contains_key(&scalar_name.item)
            || self.flatbuffer_schema().has_type(scalar_name.item)
        {
            return Err(vec![Diagnostic::error(
                SchemaError::DuplicateType(scalar_name.item),
                scalar_name.location,
            )]);
        }

        let scalar_id = ScalarID(self.fb_scalar_count + self.overlay_scalars.len() as u32);
        self.overlay_type_map
            .insert(scalar_name.item, Type::Scalar(scalar_id));

        let directives = self.build_directive_values(&scalar.directives);
        let description = scalar.description.as_ref().map(|desc| desc.value);

        self.overlay_scalars.push(Scalar {
            name: WithLocation::new(scalar_name.location, ScalarName(scalar_name.item)),
            is_extension: true,
            directives,
            description,
            hack_source: None,
        });

        Ok(())
    }

    pub fn add_extension_object(
        &mut self,
        object: ObjectTypeDefinition,
        location_key: SourceLocationKey,
    ) -> DiagnosticsResult<()> {
        let obj_name = object.name.name_with_location(location_key);

        if self.overlay_type_map.contains_key(&obj_name.item)
            || self.flatbuffer_schema().has_type(obj_name.item)
        {
            return Err(vec![Diagnostic::error(
                SchemaError::DuplicateType(obj_name.item),
                obj_name.location,
            )]);
        }

        let object_id = ObjectID(self.fb_object_count + self.overlay_objects.len() as u32);
        let object_type = Type::Object(object_id);
        self.overlay_type_map.insert(obj_name.item, object_type);

        let interfaces = object
            .interfaces
            .iter()
            .map(|name| self.build_interface_id(name, &location_key))
            .collect::<DiagnosticsResult<Vec<_>>>()?;

        for interface_id in &interfaces {
            if interface_id.0 < self.fb_interface_count {
                let mut iface = self.interface(*interface_id).clone();
                if !iface.implementing_objects.contains(&object_id) {
                    iface.implementing_objects.push(object_id);
                }
                self.interfaces.set(*interface_id, iface);
            } else {
                let idx = (interface_id.0 - self.fb_interface_count) as usize;
                if !self.overlay_interfaces[idx]
                    .implementing_objects
                    .contains(&object_id)
                {
                    self.overlay_interfaces[idx]
                        .implementing_objects
                        .push(object_id);
                }
            }
        }

        let mut existing_fields = HashMap::new();
        let fields = self.build_extend_fields(
            &object.fields,
            &mut existing_fields,
            location_key,
            Some(object_type),
        )?;

        let directives = self.build_directive_values(&object.directives);
        let description = object.description.as_ref().map(|desc| desc.value);

        self.overlay_objects.push(Object {
            name: WithLocation::new(obj_name.location, ObjectName(obj_name.item)),
            is_extension: true,
            fields,
            interfaces,
            directives,
            description,
            hack_source: None,
        });

        Ok(())
    }

    pub fn add_object_type_extension(
        &mut self,
        ext: ObjectTypeExtension,
        location_key: SourceLocationKey,
    ) -> DiagnosticsResult<()> {
        let type_ = self.get_type(ext.name.value).ok_or_else(|| {
            vec![Diagnostic::error(
                SchemaError::ExtendUndefinedType(ext.name.value),
                Location::new(location_key, ext.name.span),
            )]
        })?;

        let id = type_.get_object_id().ok_or_else(|| {
            vec![Diagnostic::error(
                SchemaError::ExpectedObjectReference(
                    ext.name.value,
                    type_.get_variant_name().to_string(),
                ),
                Location::new(location_key, ext.name.span),
            )]
        })?;

        // Clone the object to release the borrow on self
        let mut obj = self.object(id).clone();

        // Collect existing field names
        let mut existing_fields =
            HashMap::with_capacity(obj.fields.len() + len_of_option_list(&ext.fields));
        for field_id in &obj.fields {
            let field = self.field(*field_id);
            existing_fields.insert(field.name.item, field.name.location);
        }

        // Build new fields in overlay
        let new_field_ids = self.build_extend_fields(
            &ext.fields,
            &mut existing_fields,
            location_key,
            Some(Type::Object(id)),
        )?;
        obj.fields.extend(new_field_ids);

        // Resolve interfaces
        let built_interfaces = ext
            .interfaces
            .iter()
            .map(|name| self.build_interface_id(name, &location_key))
            .collect::<DiagnosticsResult<Vec<_>>>()?;

        for interface_id in &built_interfaces {
            if interface_id.0 < self.fb_interface_count {
                let mut iface = self.interface(*interface_id).clone();
                if !iface.implementing_objects.contains(&id) {
                    iface.implementing_objects.push(id);
                }
                self.interfaces.set(*interface_id, iface);
            } else {
                let idx = (interface_id.0 - self.fb_interface_count) as usize;
                if !self.overlay_interfaces[idx]
                    .implementing_objects
                    .contains(&id)
                {
                    self.overlay_interfaces[idx].implementing_objects.push(id);
                }
            }
        }

        extend_without_duplicates(&mut obj.interfaces, built_interfaces);

        let built_directives = self.build_directive_values(&ext.directives);
        extend_without_duplicates(&mut obj.directives, built_directives);

        // Update the object (in cache or overlay)
        if id.0 < self.fb_object_count {
            self.objects.set(id, obj);
        } else {
            let idx = (id.0 - self.fb_object_count) as usize;
            self.overlay_objects[idx] = obj;
        }

        Ok(())
    }

    pub fn add_interface_type_extension(
        &mut self,
        ext: InterfaceTypeExtension,
        location_key: SourceLocationKey,
    ) -> DiagnosticsResult<()> {
        let type_ = self.get_type(ext.name.value).ok_or_else(|| {
            vec![Diagnostic::error(
                SchemaError::ExtendUndefinedType(ext.name.value),
                Location::new(location_key, ext.name.span),
            )]
        })?;

        let id = type_.get_interface_id().ok_or_else(|| {
            vec![Diagnostic::error(
                SchemaError::ExpectedInterfaceReference(
                    ext.name.value,
                    type_.get_variant_name().to_string(),
                ),
                Location::new(location_key, ext.name.span),
            )]
        })?;

        // Clone the interface to release the borrow on self
        let mut iface = self.interface(id).clone();

        // Collect existing field names
        let mut existing_fields =
            HashMap::with_capacity(iface.fields.len() + len_of_option_list(&ext.fields));
        for field_id in &iface.fields {
            let field = self.field(*field_id);
            existing_fields.insert(field.name.item, field.name.location);
        }

        // Build new fields in overlay
        let new_field_ids = self.build_extend_fields(
            &ext.fields,
            &mut existing_fields,
            location_key,
            Some(Type::Interface(id)),
        )?;
        iface.fields.extend(new_field_ids);

        // Resolve parent interfaces
        let built_interfaces = ext
            .interfaces
            .iter()
            .map(|name| self.build_interface_id(name, &location_key))
            .collect::<DiagnosticsResult<Vec<_>>>()?;
        extend_without_duplicates(&mut iface.interfaces, built_interfaces);

        let built_directives = self.build_directive_values(&ext.directives);
        extend_without_duplicates(&mut iface.directives, built_directives);

        // Update the interface (in cache or overlay)
        if id.0 < self.fb_interface_count {
            self.interfaces.set(id, iface);
        } else {
            let idx = (id.0 - self.fb_interface_count) as usize;
            self.overlay_interfaces[idx] = iface;
        }

        Ok(())
    }
}

impl Schema for SchemaWrapper {
    fn query_type(&self) -> Option<Type> {
        Some(self.flatbuffer_schema().query_type())
    }

    fn mutation_type(&self) -> Option<Type> {
        self.flatbuffer_schema().mutation_type()
    }

    fn subscription_type(&self) -> Option<Type> {
        self.flatbuffer_schema().subscription_type()
    }

    fn clientid_field(&self) -> FieldID {
        CLIENTID_FIELD_ID
    }

    fn strongid_field(&self) -> FieldID {
        STRONGID_FIELD_ID
    }

    fn typename_field(&self) -> FieldID {
        TYPENAME_FIELD_ID
    }

    fn fetch_token_field(&self) -> FieldID {
        FETCH_TOKEN_FIELD_ID
    }

    fn is_fulfilled_field(&self) -> FieldID {
        IS_FULFILLED_FIELD_ID
    }

    fn get_type(&self, type_name: StringKey) -> Option<Type> {
        self.overlay_type_map
            .get(&type_name)
            .copied()
            .or_else(|| self.flatbuffer_schema().get_type(type_name))
    }

    fn get_directive(&self, name: DirectiveName) -> Option<&Directive> {
        self.directives
            .get(name, || self.flatbuffer_schema().get_directive(name))
            .as_ref()
    }

    fn input_object(&self, id: InputObjectID) -> &InputObject {
        self.input_objects
            .get(id, || self.flatbuffer_schema().input_object(id))
    }

    fn enum_(&self, id: EnumID) -> &Enum {
        self.enums.get(id, || self.flatbuffer_schema().enum_(id))
    }

    fn scalar(&self, id: ScalarID) -> &Scalar {
        if id.0 >= self.fb_scalar_count {
            let overlay_idx = (id.0 - self.fb_scalar_count) as usize;
            if overlay_idx < self.overlay_scalars.len() {
                return &self.overlay_scalars[overlay_idx];
            }
        }
        self.scalars.get(id, || self.flatbuffer_schema().scalar(id))
    }

    fn field(&self, id: FieldID) -> &Field {
        if id.0 >= self.fb_field_count && id.0 < 10_000_000 {
            let overlay_idx = (id.0 - self.fb_field_count) as usize;
            if overlay_idx < self.overlay_fields.len() {
                return &self.overlay_fields[overlay_idx];
            }
        }
        self.fields.get(id, || self.flatbuffer_schema().field(id))
    }

    fn object(&self, id: ObjectID) -> &Object {
        if id.0 >= self.fb_object_count {
            let overlay_idx = (id.0 - self.fb_object_count) as usize;
            if overlay_idx < self.overlay_objects.len() {
                return &self.overlay_objects[overlay_idx];
            }
        }
        self.objects.get(id, || self.flatbuffer_schema().object(id))
    }

    fn union(&self, id: UnionID) -> &Union {
        self.unions.get(id, || self.flatbuffer_schema().union(id))
    }

    fn interface(&self, id: InterfaceID) -> &Interface {
        if id.0 >= self.fb_interface_count {
            let overlay_idx = (id.0 - self.fb_interface_count) as usize;
            if overlay_idx < self.overlay_interfaces.len() {
                return &self.overlay_interfaces[overlay_idx];
            }
        }
        self.interfaces
            .get(id, || self.flatbuffer_schema().interface(id))
    }

    fn get_type_name(&self, type_: Type) -> StringKey {
        match type_ {
            Type::Enum(id) => self.enum_(id).name.item.0,
            Type::InputObject(id) => self.input_object(id).name.item.0,
            Type::Interface(id) => self.interface(id).name.item.0,
            Type::Object(id) => self.object(id).name.item.0,
            Type::Scalar(id) => self.scalar(id).name.item.0,
            Type::Union(id) => self.union(id).name.item.0,
        }
    }

    fn is_extension_type(&self, type_: Type) -> bool {
        match type_ {
            Type::Enum(id) => self.enum_(id).is_extension,
            Type::Interface(id) => self.interface(id).is_extension,
            Type::Object(id) => self.object(id).is_extension,
            Type::Scalar(id) => self.scalar(id).is_extension,
            Type::Union(id) => self.union(id).is_extension,
            Type::InputObject(_) => false,
        }
    }

    fn is_string(&self, type_: Type) -> bool {
        match type_ {
            Type::Scalar(id) => self.scalar(id).name.item.lookup() == "String",
            _ => false,
        }
    }

    fn is_id(&self, type_: Type) -> bool {
        match type_ {
            Type::Scalar(id) => self.scalar(id).name.item.lookup() == "ID",
            _ => false,
        }
    }

    fn named_field(&self, parent_type: Type, name: StringKey) -> Option<FieldID> {
        // Special case for __typename and __id fields, which should not be in the list of type fields
        // but should be fine to select.
        let can_have_typename = matches!(
            parent_type,
            Type::Object(_) | Type::Interface(_) | Type::Union(_)
        );
        if can_have_typename {
            if name == self.typename_field_name {
                return Some(TYPENAME_FIELD_ID);
            }
            // TODO(inanc): Also check if the parent type is fetchable?
            if name == self.fetch_token_field_name {
                return Some(FETCH_TOKEN_FIELD_ID);
            }
            if name == self.clientid_field_name {
                return Some(CLIENTID_FIELD_ID);
            }
            if name == self.strongid_field_name {
                return Some(STRONGID_FIELD_ID);
            }
            if name == self.is_fulfilled_field_name {
                return Some(IS_FULFILLED_FIELD_ID);
            }
        }

        let fields = match parent_type {
            Type::Object(id) => {
                let object = self.object(id);
                &object.fields
            }
            Type::Interface(id) => {
                let interface = self.interface(id);
                &interface.fields
            }
            // Unions don't have any fields, but can have selections like __typename
            // or a field with @fixme_fat_interface
            Type::Union(_) => return None,
            _ => panic!(
                "Cannot get field {} on type '{:?}', this type does not have fields",
                name,
                self.get_type_name(parent_type)
            ),
        };
        fields
            .iter()
            .find(|field_id| {
                let field = self.field(**field_id);
                field.name.item == name
            })
            .cloned()
    }

    fn unchecked_argument_type_sentinel(&self) -> &TypeReference<Type> {
        self.unchecked_argument_type_sentinel.as_ref().unwrap()
    }

    fn snapshot_print(&self) -> String {
        let query_type = self.query_type();
        let mutation_type = self.mutation_type();
        let subscription_type = self.subscription_type();
        let mut ordered_directives = self.get_directives();
        ordered_directives.sort_by_key(|dir| dir.name.item.0.lookup());
        let ordered_type_map: BTreeMap<_, _> = self.get_type_map().collect();
        let enums: Vec<_> = self.enums().collect();
        let fields: Vec<_> = self.fields().collect();
        let input_objects: Vec<_> = self.input_objects().collect();
        let interfaces: Vec<_> = self.interfaces().collect();
        let objects: Vec<_> = self.objects().collect();
        let scalars: Vec<_> = self.scalars().collect();
        let unions: Vec<_> = self.unions().collect();
        format!(
            r#"Schema {{
  query_type: {query_type:#?}
  mutation_type: {mutation_type:#?}
  subscription_type: {subscription_type:#?}
  directives: {ordered_directives:#?}
  type_map: {ordered_type_map:#?}
  enums: {enums:#?}
  fields: {fields:#?}
  input_objects: {input_objects:#?}
  interfaces: {interfaces:#?}
  objects: {objects:#?}
  scalars: {scalars:#?}
  unions: {unions:#?}
  }}"#,
        )
    }

    fn input_objects<'a>(&'a self) -> Box<dyn Iterator<Item = &'a InputObject> + 'a> {
        if self.input_objects.map.len() < self.flatbuffer_schema().input_objects.len() {
            for i in 0..self.flatbuffer_schema().input_objects.len() {
                let id = InputObjectID(i.try_into().unwrap());
                self.input_object(id);
            }
        }

        Box::new(self.input_objects.map.iter().map(|ref_| *ref_.value()))
    }

    fn enums<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Enum> + 'a> {
        if self.enums.map.len() < self.flatbuffer_schema().enums.len() {
            for i in 0..self.flatbuffer_schema().enums.len() {
                let id = EnumID(i.try_into().unwrap());
                self.enum_(id);
            }
        }

        Box::new(self.enums.map.iter().map(|ref_| *ref_.value()))
    }

    fn scalars<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Scalar> + 'a> {
        if self.scalars.map.len() < self.flatbuffer_schema().scalars.len() {
            for i in 0..self.flatbuffer_schema().scalars.len() {
                let id = ScalarID(i.try_into().unwrap());
                self.scalar(id);
            }
        }

        Box::new(
            self.scalars
                .map
                .iter()
                .map(|ref_| *ref_.value())
                .chain(self.overlay_scalars.iter()),
        )
    }

    fn fields<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Field> + 'a> {
        if self.fields.map.len() < self.flatbuffer_schema().fields.len() {
            for i in 0..self.flatbuffer_schema().fields.len() {
                let id = FieldID(i.try_into().unwrap());
                self.field(id);
            }
        }

        Box::new(
            self.fields
                .map
                .iter()
                .map(|ref_| *ref_.value())
                .chain(self.overlay_fields.iter()),
        )
    }

    fn objects<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Object> + 'a> {
        if self.objects.map.len() < self.flatbuffer_schema().objects.len() {
            for i in 0..self.flatbuffer_schema().objects.len() {
                let id = ObjectID(i.try_into().unwrap());
                self.object(id);
            }
        }

        Box::new(
            self.objects
                .map
                .iter()
                .map(|ref_| *ref_.value())
                .chain(self.overlay_objects.iter()),
        )
    }

    fn unions<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Union> + 'a> {
        if self.unions.map.len() < self.flatbuffer_schema().unions.len() {
            for i in 0..self.flatbuffer_schema().unions.len() {
                let id = UnionID(i.try_into().unwrap());
                self.union(id);
            }
        }

        Box::new(self.unions.map.iter().map(|ref_| *ref_.value()))
    }

    fn interfaces<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Interface> + 'a> {
        if self.interfaces.map.len() < self.flatbuffer_schema().interfaces.len() {
            for i in 0..self.flatbuffer_schema().interfaces.len() {
                let id = InterfaceID(i.try_into().unwrap());
                self.interface(id);
            }
        }

        Box::new(
            self.interfaces
                .map
                .iter()
                .map(|ref_| *ref_.value())
                .chain(self.overlay_interfaces.iter()),
        )
    }
}

struct Cache<K: Hash + Eq, V: 'static> {
    map: DashMap<K, &'static V, FnvBuildHasher>,
}
impl<K: Hash + Eq, V> Cache<K, V> {
    fn new() -> Self {
        Self {
            map: DashMap::with_hasher(FnvBuildHasher::default()),
        }
    }

    fn get(&self, key: K, f: impl FnOnce() -> V) -> &V {
        *self
            .map
            .entry(key)
            .or_insert_with(|| Box::leak(Box::new(f())))
    }

    /// Overwrites the cached value for `key`. Like `get`, the value is
    /// `Box::leak`-ed so we can hand out `&'static` references. When an
    /// existing entry is overwritten the old leaked allocation is *not* freed,
    /// but the leak is bounded: at most one allocation per extended
    /// flatbuffer-range type per compilation.
    fn set(&self, key: K, value: V) {
        let leaked: &'static V = Box::leak(Box::new(value));
        self.map.insert(key, leaked);
    }
}

#[cfg(test)]
mod tests {
    use common::DiagnosticsResult;
    use common::SourceLocationKey;
    use common::Span;
    use graphql_syntax::Identifier;
    use graphql_syntax::List;
    use graphql_syntax::NamedTypeAnnotation;
    use graphql_syntax::Token;
    use graphql_syntax::TokenKind;
    use graphql_syntax::TypeAnnotation;
    use intern::string_key::Intern;

    use super::*;
    use crate::build_schema;
    use crate::flatbuffer::serialize::serialize_as_flatbuffer;

    #[test]
    fn all_scalars() -> DiagnosticsResult<()> {
        let sdl = "
        type Query { id: ID }
        ";
        let sdl_schema = build_schema(sdl)?;
        let bytes = serialize_as_flatbuffer(&sdl_schema);
        let fb_schema = SchemaWrapper::from_vec(bytes);

        let mut scalar_names = fb_schema
            .scalars()
            .map(|scalar| scalar.name.item.0.lookup())
            .collect::<Vec<&str>>();
        scalar_names.sort();
        assert_eq!(
            scalar_names,
            vec!["Boolean", "Float", "ID", "Int", "String"]
        );

        Ok(())
    }

    #[test]
    fn all_scalars_with_lookup() -> DiagnosticsResult<()> {
        let sdl = "
        type Query { id: ID }
        ";
        let sdl_schema = build_schema(sdl)?;
        let bytes = serialize_as_flatbuffer(&sdl_schema);
        let fb_schema = SchemaWrapper::from_vec(bytes);

        // Look up a scalar type to populate cache
        let user_type = fb_schema.get_type("String".intern()).unwrap();
        fb_schema.scalar(user_type.get_scalar_id().unwrap());

        let mut scalar_names = fb_schema
            .scalars()
            .map(|scalar| scalar.name.item.0.lookup())
            .collect::<Vec<&str>>();
        scalar_names.sort();
        assert_eq!(
            scalar_names,
            vec!["Boolean", "Float", "ID", "Int", "String"]
        );

        Ok(())
    }

    #[test]
    fn all_types() -> DiagnosticsResult<()> {
        let sdl = "
        type Query { id: ID }
        type User { id: ID }
        type MailingAddress { id: ID }
        type Country { id: ID }
        ";
        let sdl_schema = build_schema(sdl)?;
        let bytes = serialize_as_flatbuffer(&sdl_schema);
        let fb_schema = SchemaWrapper::from_vec(bytes);

        let mut object_names = fb_schema
            .objects()
            .map(|object| object.name.item.0.lookup())
            .collect::<Vec<&str>>();
        object_names.sort();
        assert_eq!(
            object_names,
            vec!["Country", "MailingAddress", "Query", "User"]
        );

        Ok(())
    }

    #[test]
    fn all_types_with_lookup() -> DiagnosticsResult<()> {
        let sdl = "
        type Query { id: ID }
        type User { id: ID }
        type MailingAddress { id: ID }
        type Country { id: ID }
        ";
        let sdl_schema = build_schema(sdl)?;
        let bytes = serialize_as_flatbuffer(&sdl_schema);
        let fb_schema = SchemaWrapper::from_vec(bytes);

        // Look up User type to populate cache
        let user_type = fb_schema.get_type("User".intern()).unwrap();
        fb_schema.object(user_type.get_object_id().unwrap());

        let mut object_names = fb_schema
            .objects()
            .map(|object| object.name.item.0.lookup())
            .collect::<Vec<&str>>();
        object_names.sort();
        assert_eq!(
            object_names,
            vec!["Country", "MailingAddress", "Query", "User"]
        );

        Ok(())
    }

    fn make_identifier(name: &str) -> Identifier {
        Identifier {
            span: Span::empty(),
            token: Token {
                span: Span::empty(),
                kind: TokenKind::Identifier,
            },
            value: name.intern(),
        }
    }

    /// Verifies that `add_extension_object` makes the new type visible
    /// through `has_type`, `get_type`, `objects()`, and `field()`.
    #[test]
    fn overlay_extension_object() -> DiagnosticsResult<()> {
        let sdl = "type Query { id: ID }";
        let sdl_schema = build_schema(sdl)?;
        let bytes = serialize_as_flatbuffer(&sdl_schema);
        let mut fb_schema = SchemaWrapper::from_vec(bytes);

        let object_def = ObjectTypeDefinition {
            name: make_identifier("Resolver"),
            interfaces: vec![],
            directives: vec![],
            fields: Some(List::generated(vec![FieldDefinition {
                name: make_identifier("greeting"),
                type_: TypeAnnotation::Named(NamedTypeAnnotation {
                    name: make_identifier("String"),
                }),
                arguments: None,
                directives: vec![],
                description: None,
                hack_source: None,
                span: Span::empty(),
            }])),
            description: None,
            span: Span::empty(),
        };

        fb_schema
            .add_extension_object(object_def, SourceLocationKey::Generated)
            .unwrap();

        // The new type is visible via has_type / get_type
        assert!(
            fb_schema.has_type("Resolver".intern()),
            "overlay type should be discoverable via has_type"
        );
        let type_ = fb_schema
            .get_type("Resolver".intern())
            .expect("get_type should return the overlay type");
        let object_id = type_
            .get_object_id()
            .expect("type should be Object variant");

        // objects() includes the new overlay object
        let object_names: Vec<&str> = fb_schema
            .objects()
            .map(|o| o.name.item.0.lookup())
            .collect();
        assert!(
            object_names.contains(&"Resolver"),
            "objects() should include the overlay object"
        );

        // The object's fields are accessible
        let obj = fb_schema.object(object_id);
        assert_eq!(obj.fields.len(), 1, "object should have one field");
        let field = fb_schema.field(obj.fields[0]);
        assert_eq!(field.name.item.lookup(), "greeting");

        Ok(())
    }
}
