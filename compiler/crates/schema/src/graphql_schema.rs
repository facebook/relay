/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::definitions::{Directive, *};
use intern::string_key::StringKey;
use std::fmt::{Result as FormatResult, Write};

pub trait Schema {
    fn query_type(&self) -> Option<Type>;

    fn mutation_type(&self) -> Option<Type>;

    fn subscription_type(&self) -> Option<Type>;

    fn clientid_field(&self) -> FieldID;

    fn strongid_field(&self) -> FieldID;

    fn typename_field(&self) -> FieldID;

    fn fetch_token_field(&self) -> FieldID;

    fn is_fulfilled_field(&self) -> FieldID;

    fn get_type(&self, type_name: StringKey) -> Option<Type>;

    fn get_directive(&self, name: StringKey) -> Option<&Directive>;

    fn input_object(&self, id: InputObjectID) -> &InputObject;
    fn input_objects<'a>(&'a self) -> Box<dyn Iterator<Item = &'a InputObject> + 'a>;

    fn enum_(&self, id: EnumID) -> &Enum;
    fn enums<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Enum> + 'a>;

    fn scalar(&self, id: ScalarID) -> &Scalar;
    fn scalars<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Scalar> + 'a>;

    fn field(&self, id: FieldID) -> &Field;
    fn fields<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Field> + 'a>;

    fn object(&self, id: ObjectID) -> &Object;
    fn objects<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Object> + 'a>;

    fn union(&self, id: UnionID) -> &Union;
    fn unions<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Union> + 'a>;

    fn interface(&self, id: InterfaceID) -> &Interface;
    fn interfaces<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Interface> + 'a>;

    fn get_type_name(&self, type_: Type) -> StringKey;

    fn is_extension_type(&self, type_: Type) -> bool;

    fn is_string(&self, type_: Type) -> bool;

    fn is_id(&self, type_: Type) -> bool;

    fn named_field(&self, parent_type: Type, name: StringKey) -> Option<FieldID>;

    fn unchecked_argument_type_sentinel(&self) -> &TypeReference;

    fn snapshot_print(&self) -> String;

    // Is `maybe_subtype` usable as — but not equal to — `super_type`.
    // Examples:
    // is_type_strict_subtype_of(Int!, Int) => true, Int! is usable where an Int is expected
    // is_type_strict_subtype_of(Int, Int) => false, same type
    // is_type_strict_subtype_of(InterfaceThatExtendsNode, Node) => true
    // is_type_strict_subtype_of(Node, Node) => false, same type
    fn is_type_strict_subtype_of(
        &self,
        maybe_subtype: &TypeReference,
        super_type: &TypeReference,
    ) -> bool {
        match (maybe_subtype, super_type) {
            (TypeReference::NonNull(of_sub), TypeReference::NonNull(of_super)) => {
                self.is_type_strict_subtype_of(of_sub, of_super)
            }
            // If supertype is non-null, maybeSubType must be non-nullable too
            (_, TypeReference::NonNull(_)) => false,
            // If supertype is nullable, maybeSubType may be non-nullable or nullable
            (TypeReference::NonNull(of_sub), _) => {
                // `T!` is a strict subtype of `U` so long as T is a (non-strict) subtype of U
                self.is_type_subtype_of(of_sub, super_type)
            }
            (TypeReference::List(of_sub), TypeReference::List(of_super)) => {
                self.is_type_strict_subtype_of(of_sub, of_super)
            }
            // If supertype is a list, maybeSubType must be a list too
            (_, TypeReference::List(_)) => false,
            // If supertype is not a list, maybeSubType must also not be a list
            (TypeReference::List(_), _) => false,
            (TypeReference::Named(named_subtype), TypeReference::Named(named_supertype)) => {
                self.is_named_type_strict_subtype_of(*named_subtype, *named_supertype)
            }
        }
    }

    fn is_type_subtype_of(
        &self,
        maybe_subtype: &TypeReference,
        super_type: &TypeReference,
    ) -> bool {
        match (maybe_subtype, super_type) {
            (TypeReference::NonNull(of_sub), TypeReference::NonNull(of_super)) => {
                self.is_type_subtype_of(of_sub, of_super)
            }
            // If supertype is non-null, maybeSubType must be non-nullable too
            (_, TypeReference::NonNull(_)) => false,
            // If supertype is nullable, maybeSubType may be non-nullable or nullable
            (TypeReference::NonNull(of_sub), _) => self.is_type_subtype_of(of_sub, super_type),
            (TypeReference::List(of_sub), TypeReference::List(of_super)) => {
                self.is_type_subtype_of(of_sub, of_super)
            }
            // If supertype is a list, maybeSubType must be a list too
            (_, TypeReference::List(_)) => false,
            // If supertype is not a list, maybeSubType must also not be a list
            (TypeReference::List(_), _) => false,
            (TypeReference::Named(named_subtype), TypeReference::Named(named_supertype)) => {
                self.is_named_type_subtype_of(*named_subtype, *named_supertype)
            }
        }
    }

    // Is `maybe_subtype` usable as — but not equal to — `super_type`.
    // Examples:
    // is_type_strict_subtype_of(InterfaceThatExtendsNode, Node) => true
    // is_type_strict_subtype_of(Node, Node) => false, same type
    fn is_named_type_strict_subtype_of(&self, maybe_subtype: Type, super_type: Type) -> bool {
        match (maybe_subtype, super_type) {
            (Type::Object(sub_id), Type::Interface(super_id)) => {
                // does object implement the interface
                let object = self.object(sub_id);
                object.interfaces.contains(&super_id)
            }
            (Type::Object(sub_id), Type::Union(super_id)) => {
                // is object a member of the union
                let union = self.union(super_id);
                union.members.contains(&sub_id)
            }
            (Type::Interface(sub_id), Type::Interface(super_id)) => {
                // does sub interface implement the super interface
                let interface = self.interface(sub_id);
                interface.interfaces.contains(&super_id)
            }
            _ => false,
        }
    }

    fn is_named_type_subtype_of(&self, maybe_subtype: Type, super_type: Type) -> bool {
        match (maybe_subtype, super_type) {
            (Type::Object(sub_id), Type::Interface(super_id)) => {
                // does object implement the interface
                let object = self.object(sub_id);
                object.interfaces.contains(&super_id)
            }
            (Type::Object(sub_id), Type::Union(super_id)) => {
                // is object a member of the union
                let union = self.union(super_id);
                union.members.contains(&sub_id)
            }
            (Type::Interface(sub_id), Type::Interface(super_id)) => {
                // does interface implement the interface
                let interface = self.interface(sub_id);
                sub_id == super_id || interface.interfaces.contains(&super_id)
            }
            _ => maybe_subtype == super_type,
        }
    }

    fn are_overlapping_types(&self, a: Type, b: Type) -> bool {
        fn overlapping_objects(a: &[ObjectID], b: &[ObjectID]) -> bool {
            a.iter().any(|item| b.contains(item))
        }

        if a == b {
            return true;
        };
        match (a, b) {
            (Type::Interface(a), Type::Interface(b)) => overlapping_objects(
                &self.interface(a).implementing_objects,
                &self.interface(b).implementing_objects,
            ),

            (Type::Union(a), Type::Union(b)) => {
                overlapping_objects(&self.union(a).members, &self.union(b).members)
            }

            (Type::Union(union_id), Type::Interface(interface_id))
            | (Type::Interface(interface_id), Type::Union(union_id)) => overlapping_objects(
                &self.union(union_id).members,
                &self.interface(interface_id).implementing_objects,
            ),

            (Type::Interface(interface_id), Type::Object(object_id))
            | (Type::Object(object_id), Type::Interface(interface_id)) => self
                .interface(interface_id)
                .implementing_objects
                .contains(&object_id),

            (Type::Union(union_id), Type::Object(object_id))
            | (Type::Object(object_id), Type::Union(union_id)) => {
                self.union(union_id).members.contains(&object_id)
            }

            _ => false,
        }
    }

    fn write_type_string(&self, writer: &mut String, type_: &TypeReference) -> FormatResult {
        match type_ {
            TypeReference::Named(inner) => {
                write!(writer, "{}", self.get_type_name(*inner).lookup())
            }
            TypeReference::NonNull(of) => {
                self.write_type_string(writer, of)?;
                write!(writer, "!")
            }
            TypeReference::List(of) => {
                write!(writer, "[")?;
                self.write_type_string(writer, of)?;
                write!(writer, "]")
            }
        }
    }

    fn get_type_string(&self, type_: &TypeReference) -> String {
        let mut result = String::new();
        self.write_type_string(&mut result, type_).unwrap();
        result
    }

    fn is_extension_directive(&self, name: StringKey) -> bool {
        if let Some(directive) = self.get_directive(name) {
            directive.is_extension
        } else {
            panic!("Unknown directive {}.", name.lookup())
        }
    }
}
