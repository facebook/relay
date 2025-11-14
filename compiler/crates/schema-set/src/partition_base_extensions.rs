/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::SchemaSet;
use crate::SetDirective;
use crate::SetInterface;
use crate::SetObject;
use crate::SetType;
use crate::SetUnion;
use crate::schema_set::CanBeClientDefinition;
use crate::schema_set::CanHaveDirectives;
use crate::schema_set::HasFields;
use crate::schema_set::HasInterfaces;

pub fn partition_schema_set_base_and_extensions(schema_set: &SchemaSet) -> (SchemaSet, SchemaSet) {
    let mut base = SchemaSet::new();
    let mut extensions = SchemaSet::new();

    // No current mechanism to partition a root schema definition into client vs. server (or extension vs base).
    base.root_schema = schema_set.root_schema.clone();

    for directive in schema_set.directives.values() {
        if directive.is_client_definition() {
            extensions
                .directives
                .insert(directive.name.0, directive.clone());
        } else {
            let (base_directive, extension_directive) =
                directive.partition_base_extension(schema_set);
            base.directives.insert(directive.name.0, base_directive);
            if let Some(extension_directive) = extension_directive {
                extensions
                    .directives
                    .insert(directive.name.0, extension_directive);
            }
        }
    }

    for type_ in schema_set.types.values() {
        if type_.is_client_definition() {
            extensions.add_or_merge_type(type_.clone());
        } else {
            let (base_type, extension_type) = type_.partition_base_extension(schema_set);
            base.add_or_merge_type(base_type);
            if let Some(extension_type) = extension_type {
                extensions.add_or_merge_type(extension_type);
            }
        }
    }

    (base, extensions)
}

pub trait PartitionsBaseExtension: CanBeClientDefinition + Sized + Clone {
    // Implement this: will only be called if the type is not a fully client type
    fn partition_base_extension(&self, schema_set: &SchemaSet) -> (Self, Option<Self>);
}

fn partition_object_or_interface<T: CanHaveDirectives + HasFields + HasInterfaces + Clone>(
    item: &T,
    schema_set: &SchemaSet,
) -> (T, Option<T>) {
    let (base_fields, extension_fields) = item.partition_extension_fields();
    let (base_interfaces, extension_interfaces) = item.partition_extension_interfaces();
    let (base_directives, extension_directives) = item.partition_extension_directives(schema_set);

    let mut base = item.clone();
    base.set_fields(base_fields);
    base.set_interfaces(base_interfaces);
    base.set_directives(base_directives);

    let extension = if extension_fields.is_empty()
        && extension_interfaces.is_empty()
        && extension_directives.is_empty()
    {
        None
    } else {
        let mut ext = item.clone();
        ext.set_fields(extension_fields);
        ext.set_interfaces(extension_interfaces);
        ext.set_directives(extension_directives);
        Some(ext)
    };
    (base, extension)
}

impl PartitionsBaseExtension for SetType {
    fn partition_base_extension(&self, schema_set: &SchemaSet) -> (Self, Option<Self>) {
        match self {
            SetType::Object(t) => {
                let (base, extension) = t.partition_base_extension(schema_set);
                (SetType::Object(base), extension.map(SetType::Object))
            }
            SetType::Interface(t) => {
                let (base, extension) = t.partition_base_extension(schema_set);
                (SetType::Interface(base), extension.map(SetType::Interface))
            }
            SetType::Union(t) => {
                let (base, extension) = t.partition_base_extension(schema_set);
                (SetType::Union(base), extension.map(SetType::Union))
            }
            SetType::Enum(t) => {
                let (base, extension) = t.partition_base_extension(schema_set);
                (SetType::Enum(base), extension.map(SetType::Enum))
            }
            SetType::Scalar(t) => {
                let (base, extension) = t.partition_base_extension(schema_set);
                (SetType::Scalar(base), extension.map(SetType::Scalar))
            }
            SetType::InputObject(t) => {
                let (base, extension) = t.partition_base_extension(schema_set);
                (
                    SetType::InputObject(base),
                    extension.map(SetType::InputObject),
                )
            }
        }
    }
}

impl PartitionsBaseExtension for SetObject {
    fn partition_base_extension(&self, schema_set: &SchemaSet) -> (Self, Option<Self>) {
        partition_object_or_interface(self, schema_set)
    }
}

impl PartitionsBaseExtension for SetInterface {
    fn partition_base_extension(&self, schema_set: &SchemaSet) -> (Self, Option<Self>) {
        partition_object_or_interface(self, schema_set)
    }
}

impl PartitionsBaseExtension for SetUnion {
    fn partition_base_extension(&self, schema_set: &SchemaSet) -> (Self, Option<Self>) {
        let (base_members, extension_members) = self
            .members
            .iter()
            .map(|(name, member)| (*name, member.clone()))
            .partition(|(_, member)| !member.is_extension);
        let (base_directives, extension_directives) =
            self.partition_extension_directives(schema_set);

        let base = Self {
            members: base_members,
            directives: base_directives,
            ..self.clone()
        };

        let extension = if extension_members.is_empty() && extension_directives.is_empty() {
            None
        } else {
            Some(Self {
                members: extension_members,
                directives: extension_directives,
                ..self.clone()
            })
        };
        (base, extension)
    }
}

impl PartitionsBaseExtension for SetDirective {
    fn partition_base_extension(&self, _schema: &SchemaSet) -> (Self, Option<Self>) {
        // It's impossible to extend a directive definition right now, BUT a directive
        // definition could be a client-only directive, so we want to implement the partitioning
        // that is just a no-op.
        (self.clone(), None)
    }
}
