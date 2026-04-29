/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DiagnosticsResult;

use crate::SchemaSet;
use crate::SetDirective;
use crate::SetEnum;
use crate::SetField;
use crate::SetInputObject;
use crate::SetInterface;
use crate::SetObject;
use crate::SetType;
use crate::SetUnion;
use crate::schema_set::CanBeClientDefinition;
use crate::schema_set::CanHaveDirectives;
use crate::schema_set::HasArguments;
use crate::schema_set::HasFields;
use crate::schema_set::HasInterfaces;

pub fn partition_schema_set_base_and_extensions(
    schema_set: &SchemaSet,
) -> DiagnosticsResult<(SchemaSet, SchemaSet)> {
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
            let (base_directive, extension_directive) = directive.partition_base_extension();
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
            extensions.add_or_merge_type(type_.clone())?;
        } else {
            let (base_type, extension_type) = type_.partition_base_extension();
            base.add_or_merge_type(base_type)?;
            if let Some(extension_type) = extension_type {
                extensions.add_or_merge_type(extension_type)?;
            }
        }
    }

    Ok((base, extensions))
}

pub trait PartitionsBaseExtension: CanBeClientDefinition + Sized + Clone {
    // Implement this: will only be called if the type is not a fully client type
    fn partition_base_extension(&self) -> (Self, Option<Self>);
}

fn partition_object_or_interface<T: CanHaveDirectives + HasFields + HasInterfaces + Clone>(
    item: &T,
) -> (T, Option<T>) {
    let (base_fields, extension_fields) = item.partition_extension_fields();
    let (base_interfaces, extension_interfaces) = item.partition_extension_interfaces();
    let (base_directives, extension_directives) = item.partition_extension_directives();

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
    fn partition_base_extension(&self) -> (Self, Option<Self>) {
        match self {
            SetType::Object(t) => {
                let (base, extension) = t.partition_base_extension();
                (SetType::Object(base), extension.map(SetType::Object))
            }
            SetType::Interface(t) => {
                let (base, extension) = t.partition_base_extension();
                (SetType::Interface(base), extension.map(SetType::Interface))
            }
            SetType::Union(t) => {
                let (base, extension) = t.partition_base_extension();
                (SetType::Union(base), extension.map(SetType::Union))
            }
            SetType::Enum(t) => {
                let (base, extension) = t.partition_base_extension();
                (SetType::Enum(base), extension.map(SetType::Enum))
            }
            SetType::Scalar(t) => {
                let (base, extension) = t.partition_base_extension();
                (SetType::Scalar(base), extension.map(SetType::Scalar))
            }
            SetType::InputObject(t) => {
                let (base, extension) = t.partition_base_extension();
                (
                    SetType::InputObject(base),
                    extension.map(SetType::InputObject),
                )
            }
        }
    }
}

impl PartitionsBaseExtension for SetObject {
    fn partition_base_extension(&self) -> (Self, Option<Self>) {
        partition_object_or_interface(self)
    }
}

impl PartitionsBaseExtension for SetInterface {
    fn partition_base_extension(&self) -> (Self, Option<Self>) {
        partition_object_or_interface(self)
    }
}

impl PartitionsBaseExtension for SetUnion {
    fn partition_base_extension(&self) -> (Self, Option<Self>) {
        let (base_members, extension_members) = self
            .members
            .iter()
            .map(|(name, member)| (*name, member.clone()))
            .partition(|(_, member)| !member.is_extension);
        let (base_directives, extension_directives) = self.partition_extension_directives();

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

impl PartitionsBaseExtension for SetEnum {
    fn partition_base_extension(&self) -> (Self, Option<Self>) {
        let (base_values, extension_values) = self
            .values
            .iter()
            .map(|(name, enum_value)| (*name, enum_value.clone()))
            .partition(|(_, enum_value)| !enum_value.is_client_definition());
        let (base_directives, extension_directives) = self.partition_extension_directives();

        let base = Self {
            values: base_values,
            directives: base_directives,
            ..self.clone()
        };

        let extension = if extension_values.is_empty() && extension_directives.is_empty() {
            None
        } else {
            Some(Self {
                values: extension_values,
                directives: extension_directives,
                ..self.clone()
            })
        };
        (base, extension)
    }
}

impl PartitionsBaseExtension for SetInputObject {
    fn partition_base_extension(&self) -> (Self, Option<Self>) {
        let (base_fields, extension_fields) = self.partition_extension_arguments();
        let (base_directives, extension_directives) = self.partition_extension_directives();

        let base = Self {
            fields: base_fields,
            directives: base_directives,
            ..self.clone()
        };

        let extension = if extension_fields.is_empty() && extension_directives.is_empty() {
            None
        } else {
            Some(Self {
                fields: extension_fields,
                directives: extension_directives,
                ..self.clone()
            })
        };
        (base, extension)
    }
}

impl PartitionsBaseExtension for SetDirective {
    // Though the *spec* does not yet allow extending a directive definition,
    // we can support directive definition extensions natively by, for instance, merging
    // an extension directive with a base directive of the same name (to, for instance, add an argument).
    fn partition_base_extension(&self) -> (Self, Option<Self>) {
        let (base_args, extension_args) = self.partition_extension_arguments();
        let base = Self {
            arguments: base_args,
            ..self.clone()
        };

        let extension = if extension_args.is_empty() {
            None
        } else {
            Some(Self {
                arguments: extension_args,
                ..self.clone()
            })
        };
        (base, extension)
    }
}

impl PartitionsBaseExtension for SetField {
    // Though the *spec* does not yet allow extending a field definition,
    // we can support field definition extensions natively by, for instance, merging
    // an extension field with a base field of the same name.
    fn partition_base_extension(&self) -> (Self, Option<Self>) {
        let (base_args, extension_args) = self.partition_extension_arguments();
        let (base_directives, extension_directives) = self.partition_extension_directives();

        let base = Self {
            arguments: base_args,
            directives: base_directives,
            ..self.clone()
        };

        let extension = if extension_args.is_empty() && extension_directives.is_empty() {
            None
        } else {
            Some(Self {
                arguments: extension_args,
                directives: extension_directives,
                ..self.clone()
            })
        };
        (base, extension)
    }
}

#[cfg(test)]
mod tests {
    use common::SourceLocationKey;
    use graphql_syntax::parse_schema_document;

    use super::*;
    use crate::ToSDLDefinition;

    fn set_from_sdl(sdl: &str) -> SchemaSet {
        SchemaSet::from_schema_documents(&[parse_schema_document(
            sdl,
            SourceLocationKey::generated(),
        )
        .unwrap()])
        .unwrap()
    }

    #[test]
    fn test_server_directive_on_base_not_in_extensions() {
        let original_base = set_from_sdl(
            r#"
                directive @serverDirective on OBJECT

                type Query {
                    viewer: Viewer
                }

                type Viewer @serverDirective {
                    name: String
                }
            "#,
        );
        let original_extensions = set_from_sdl(
            r#"
                extend type Query {
                    extensionField: ID
                }
            "#,
        );

        let merged = original_base
            .union_set(&original_extensions, &Default::default())
            .unwrap();

        let (base, extensions) = partition_schema_set_base_and_extensions(&merged).unwrap();

        assert_eq!(
            format!("{}", base.to_sdl_definition()),
            format!("{}", original_base.to_sdl_definition())
        );
        assert_eq!(
            format!("{}", extensions.to_sdl_definition()),
            format!("{}", original_extensions.to_sdl_definition())
        );
    }

    #[test]
    fn test_server_directive_on_extension_not_lost_by_partition() {
        let original_base = set_from_sdl(
            r#"
                directive @serverDirective on OBJECT

                type Query {
                    viewer: Viewer
                }

                type Viewer {
                    name: String
                }
            "#,
        );
        let original_extensions = set_from_sdl(
            r#"
                extend type Viewer @serverDirective {
                    extensionField: ID
                }
            "#,
        );

        let merged = original_base
            .union_set(&original_extensions, &Default::default())
            .unwrap();

        let (base, extensions) = partition_schema_set_base_and_extensions(&merged).unwrap();

        assert_eq!(
            format!("{}", base.to_sdl_definition()),
            format!("{}", original_base.to_sdl_definition())
        );
        assert_eq!(
            format!("{}", extensions.to_sdl_definition()),
            format!("{}", original_extensions.to_sdl_definition())
        );
    }

    // Ensures that an enum with a client extension directive
    // does NOT duplicate enum values into the extension partition.
    #[test]
    fn test_enum_extension_directive_does_not_duplicate_values() {
        let original_base = set_from_sdl(
            r#"
                directive @serverDirective on ENUM

                enum ServerEnum {
                    VALUE
                }
            "#,
        );
        let original_extensions = set_from_sdl(
            r#"
                extend enum ServerEnum @serverDirective
            "#,
        );

        let merged = original_base
            .union_set(&original_extensions, &Default::default())
            .unwrap();

        let (base, extensions) = partition_schema_set_base_and_extensions(&merged).unwrap();

        assert_eq!(
            format!("{}", base.to_sdl_definition()),
            format!("{}", original_base.to_sdl_definition())
        );
        assert_eq!(
            format!("{}", extensions.to_sdl_definition()),
            format!("{}", original_extensions.to_sdl_definition())
        );
    }

    #[test]
    fn test_enum_extension_values_partitioned_correctly() {
        let original_base = set_from_sdl(
            r#"
                enum Color {
                    RED
                    GREEN
                    BLUE
                }
            "#,
        );
        let original_extensions = set_from_sdl(
            r#"
                extend enum Color {
                    YELLOW
                }
            "#,
        );

        let merged = original_base
            .union_set(&original_extensions, &Default::default())
            .unwrap();

        let (base, extensions) = partition_schema_set_base_and_extensions(&merged).unwrap();

        assert_eq!(
            format!("{}", base.to_sdl_definition()),
            format!("{}", original_base.to_sdl_definition())
        );
        assert_eq!(
            format!("{}", extensions.to_sdl_definition()),
            format!("{}", original_extensions.to_sdl_definition())
        );
    }

    #[test]
    fn test_input_object_extension_directive_does_not_duplicate_fields() {
        let original_base = set_from_sdl(
            r#"
                directive @serverDirective on INPUT_OBJECT

                input SomeInput {
                    field1: String
                }
            "#,
        );
        let original_extensions = set_from_sdl(
            r#"
                extend input SomeInput @serverDirective
            "#,
        );

        let merged = original_base
            .union_set(&original_extensions, &Default::default())
            .unwrap();

        let (base, extensions) = partition_schema_set_base_and_extensions(&merged).unwrap();

        assert_eq!(
            format!("{}", base.to_sdl_definition()),
            format!("{}", original_base.to_sdl_definition())
        );
        assert_eq!(
            format!("{}", extensions.to_sdl_definition()),
            format!("{}", original_extensions.to_sdl_definition())
        );
    }

    #[test]
    fn test_input_object_extension_fields_partitioned_correctly() {
        let original_base = set_from_sdl(
            r#"
                input SomeInput {
                    field1: String
                }
            "#,
        );
        let original_extensions = set_from_sdl(
            r#"
                extend input SomeInput {
                    field2: Boolean
                }
            "#,
        );

        let merged = original_base
            .union_set(&original_extensions, &Default::default())
            .unwrap();

        let (base, extensions) = partition_schema_set_base_and_extensions(&merged).unwrap();

        assert_eq!(
            format!("{}", base.to_sdl_definition()),
            format!("{}", original_base.to_sdl_definition())
        );
        assert_eq!(
            format!("{}", extensions.to_sdl_definition()),
            format!("{}", original_extensions.to_sdl_definition())
        );
    }
}
