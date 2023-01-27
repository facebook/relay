/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;

use common::InterfaceName;
use common::WithLocation;
use intern::string_key::StringKey;

use crate::DirectiveValue;
use crate::FieldID;
use crate::InterfaceID;
use crate::ObjectID;
use crate::Schema;

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct Interface {
    pub name: WithLocation<InterfaceName>,
    pub is_extension: bool,
    pub implementing_interfaces: Vec<InterfaceID>,
    pub implementing_objects: Vec<ObjectID>,
    pub fields: Vec<FieldID>,
    pub directives: Vec<DirectiveValue>,
    pub interfaces: Vec<InterfaceID>,
    pub description: Option<StringKey>,
}

impl Interface {
    /// Return all objects that implement, directly or recursively, a given interface.
    /// The iteration order of the HashSet might depend on the order in which schema files
    /// are processed. It should not be relied upon when generating artifacts.
    pub fn recursively_implementing_objects(&self, schema: &impl Schema) -> HashSet<ObjectID> {
        // Note: we do not have the InterfaceID of self. This is awkward, and means that we cannot
        // prevent the loop below from visiting self if there is a recursive relationship
        // (e.g. in which InterfaceA implements InterfaceB, which implements InterfaceA).
        // This is [disallowed in the spec](https://spec.graphql.org/October2021/#sel-FAHbhBLCAACEkBq4P).
        //
        // However, even if we do, this is not a problem, because we're creating a HashSet, and
        // inserting the same item into a HashSet twice is a no-op, which is all that would happen.
        //
        // We do prevent infinite recursion, though.
        let mut encountered_interfaces: HashSet<InterfaceID> =
            HashSet::with_capacity(self.implementing_interfaces.len());

        let mut implementing_objects =
            HashSet::from_iter(self.implementing_objects.iter().copied());

        let mut interface_queue = self.implementing_interfaces.iter().collect::<Vec<_>>();
        while let Some(interface_id) = interface_queue.pop() {
            if !encountered_interfaces.contains(interface_id) {
                encountered_interfaces.insert(*interface_id);

                let interface = schema.interface(*interface_id);

                implementing_objects.extend(interface.implementing_objects.iter().copied());
                interface_queue.extend(interface.implementing_interfaces.iter());
            }
        }

        implementing_objects
    }
}

#[cfg(test)]
mod test {
    use std::collections::HashMap;
    use std::collections::HashSet;
    use std::sync::Arc;

    use common::InterfaceName;
    use common::WithLocation;
    use intern::string_key::Intern;

    use crate::Interface;
    use crate::InterfaceID;
    use crate::ObjectID;
    use crate::Schema;

    struct InterfaceOnlySchema {
        interface_map: HashMap<InterfaceID, Arc<Interface>>,
    }
    #[allow(unused_variables)]
    impl Schema for InterfaceOnlySchema {
        fn query_type(&self) -> Option<crate::Type> {
            unimplemented!()
        }

        fn mutation_type(&self) -> Option<crate::Type> {
            unimplemented!()
        }

        fn subscription_type(&self) -> Option<crate::Type> {
            unimplemented!()
        }

        fn clientid_field(&self) -> crate::FieldID {
            unimplemented!()
        }

        fn strongid_field(&self) -> crate::FieldID {
            unimplemented!()
        }

        fn typename_field(&self) -> crate::FieldID {
            unimplemented!()
        }

        fn fetch_token_field(&self) -> crate::FieldID {
            unimplemented!()
        }

        fn is_fulfilled_field(&self) -> crate::FieldID {
            unimplemented!()
        }

        fn get_type(&self, type_name: intern::string_key::StringKey) -> Option<crate::Type> {
            unimplemented!()
        }

        fn get_directive(&self, name: common::DirectiveName) -> Option<&crate::Directive> {
            unimplemented!()
        }

        fn input_object(&self, id: crate::InputObjectID) -> &crate::InputObject {
            unimplemented!()
        }

        fn input_objects<'a>(&'a self) -> Box<dyn Iterator<Item = &'a crate::InputObject> + 'a> {
            unimplemented!()
        }

        fn enum_(&self, id: crate::EnumID) -> &crate::Enum {
            unimplemented!()
        }

        fn enums<'a>(&'a self) -> Box<dyn Iterator<Item = &'a crate::Enum> + 'a> {
            unimplemented!()
        }

        fn scalar(&self, id: crate::ScalarID) -> &crate::Scalar {
            unimplemented!()
        }

        fn scalars<'a>(&'a self) -> Box<dyn Iterator<Item = &'a crate::Scalar> + 'a> {
            unimplemented!()
        }

        fn field(&self, id: crate::FieldID) -> &crate::Field {
            unimplemented!()
        }

        fn fields<'a>(&'a self) -> Box<dyn Iterator<Item = &'a crate::Field> + 'a> {
            unimplemented!()
        }

        fn object(&self, id: crate::ObjectID) -> &crate::Object {
            unimplemented!()
        }

        fn objects<'a>(&'a self) -> Box<dyn Iterator<Item = &'a crate::Object> + 'a> {
            unimplemented!()
        }

        fn union(&self, id: crate::UnionID) -> &crate::Union {
            unimplemented!()
        }

        fn unions<'a>(&'a self) -> Box<dyn Iterator<Item = &'a crate::Union> + 'a> {
            unimplemented!()
        }

        fn interface(&self, id: crate::InterfaceID) -> &crate::Interface {
            self.interface_map.get(&id).as_ref().unwrap()
        }

        fn interfaces<'a>(&'a self) -> Box<dyn Iterator<Item = &'a crate::Interface> + 'a> {
            unimplemented!()
        }

        fn get_type_name(&self, type_: crate::Type) -> intern::string_key::StringKey {
            unimplemented!()
        }

        fn is_extension_type(&self, type_: crate::Type) -> bool {
            unimplemented!()
        }

        fn is_string(&self, type_: crate::Type) -> bool {
            unimplemented!()
        }

        fn is_id(&self, type_: crate::Type) -> bool {
            unimplemented!()
        }

        fn named_field(
            &self,
            parent_type: crate::Type,
            name: intern::string_key::StringKey,
        ) -> Option<crate::FieldID> {
            unimplemented!()
        }

        fn unchecked_argument_type_sentinel(&self) -> &crate::TypeReference<crate::Type> {
            unimplemented!()
        }

        fn snapshot_print(&self) -> String {
            unimplemented!()
        }
    }

    fn with_objects_and_interfaces(
        implementing_objects: Vec<ObjectID>,
        implementing_interfaces: Vec<InterfaceID>,
    ) -> Interface {
        Interface {
            name: WithLocation::generated(InterfaceName("AnInterface".intern())),
            is_extension: false,
            implementing_interfaces,
            implementing_objects,
            fields: vec![],
            directives: vec![],
            interfaces: vec![],
            description: None,
        }
    }

    /// Test a basic case, in which IBase is implemented by
    /// INestA1 and INestB. INestA1 is implemented by INestA2.
    ///
    /// There is a mix of overlapping and non-overlapping ObjectIDs.
    #[test]
    fn basic_recursively_implementing_objects() {
        let i_nest_a2_id = InterfaceID(0);
        let i_nest_a2 =
            with_objects_and_interfaces(vec![ObjectID(0), ObjectID(1), ObjectID(2)], vec![]);

        let i_nest_a1_id = InterfaceID(1);
        let i_nest_a1 = with_objects_and_interfaces(
            vec![ObjectID(1), ObjectID(3), ObjectID(4)],
            vec![i_nest_a2_id],
        );

        let i_nest_b_id = InterfaceID(2);
        let i_nest_b =
            with_objects_and_interfaces(vec![ObjectID(4), ObjectID(5), ObjectID(6)], vec![]);

        let i_base_id = InterfaceID(3);
        let i_base = with_objects_and_interfaces(
            vec![ObjectID(6), ObjectID(2), ObjectID(5), ObjectID(7)],
            vec![i_nest_a1_id, i_nest_b_id],
        );

        let schema = InterfaceOnlySchema {
            interface_map: {
                let mut map = HashMap::new();
                map.insert(i_nest_a2_id, Arc::new(i_nest_a2));
                map.insert(i_nest_a1_id, Arc::new(i_nest_a1));
                map.insert(i_nest_b_id, Arc::new(i_nest_b));
                map.insert(i_base_id, Arc::new(i_base));
                map
            },
        };

        let expected_object_ids = {
            let mut set = HashSet::with_capacity(8);
            for x in 0..=7 {
                set.insert(ObjectID(x));
            }
            set
        };
        assert!(
            schema
                .interface(i_base_id)
                .recursively_implementing_objects(&schema)
                == expected_object_ids
        );
    }

    /// Test the case where IBase implements IBase
    #[test]
    fn recursively_implementing_objects_direct_cycle() {
        let i_base_id = InterfaceID(0);

        // The graphql spec disallows this, but we don't prevent it.
        let i_base = with_objects_and_interfaces(vec![ObjectID(0)], vec![i_base_id]);

        let schema = InterfaceOnlySchema {
            interface_map: {
                let mut map = HashMap::with_capacity(1);
                map.insert(i_base_id, Arc::new(i_base));
                map
            },
        };

        let expected_object_ids = {
            let mut set = HashSet::new();
            set.insert(ObjectID(0));
            set
        };

        assert!(
            schema
                .interface(i_base_id)
                .recursively_implementing_objects(&schema)
                == expected_object_ids
        );
    }

    /// Test the case where IBase implements INest which implements IBase
    #[test]
    fn recursively_implementing_objects_indirect_cycle() {
        let i_base_id = InterfaceID(0);
        let i_nest_id = InterfaceID(1);

        let i_base = with_objects_and_interfaces(vec![ObjectID(0)], vec![i_nest_id]);
        let i_nest = with_objects_and_interfaces(vec![ObjectID(1)], vec![i_base_id]);

        let schema = InterfaceOnlySchema {
            interface_map: {
                let mut map = HashMap::with_capacity(1);
                map.insert(i_base_id, Arc::new(i_base));
                map.insert(i_nest_id, Arc::new(i_nest));
                map
            },
        };

        let expected_object_ids = {
            let mut set = HashSet::new();
            set.insert(ObjectID(0));
            set.insert(ObjectID(1));
            set
        };

        assert!(
            schema
                .interface(i_base_id)
                .recursively_implementing_objects(&schema)
                == expected_object_ids
        );
    }
}
