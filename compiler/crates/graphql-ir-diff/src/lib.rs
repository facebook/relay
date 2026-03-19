/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::cell::OnceCell;
use std::cell::RefCell;
use std::collections::HashMap;
use std::collections::HashSet;
use std::fmt::Debug;
use std::fmt::Display;
use std::fmt::Write;
use std::fs;
use std::rc::Rc;
use std::sync::Arc;

use anyhow::Result;
use anyhow::anyhow;
use common::ArgumentName;
use common::DirectiveName;
use common::Location;
use common::SourceLocationKey;
use common::TextSource;
use graphql_cli::DiagnosticPrinter;
use graphql_cli::SourcePrinter;
use graphql_ir::Argument;
use graphql_ir::BuilderOptions;
use graphql_ir::ConstantArgument;
use graphql_ir::ConstantValue;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentVariablesSemantic;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Value;
use graphql_ir::Visitor;
use graphql_ir::build_ir_with_extra_features;
use graphql_ir::node_identifier::LocationAgnosticBehavior;
use graphql_ir::node_identifier::LocationAgnosticPartialEq;
use graphql_syntax::OperationKind;
use graphql_syntax::parse_executable;
use graphql_text_printer::PrinterOptions;
use graphql_text_printer::print_arguments;
use graphql_text_printer::print_executable_definition_ast;
use intern::Lookup;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use itertools::Itertools;
use schema::ObjectID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;

// To enable location agnostic equality check for graphql_ir::Value
struct ValueLocationAgnosticBehavior;

impl LocationAgnosticBehavior for ValueLocationAgnosticBehavior {
    fn should_skip_in_node_identifier(_name: DirectiveName) -> bool {
        true
    }
    fn hash_for_name_only(_name: DirectiveName) -> bool {
        true
    }
}

trait Subset {
    type Other;
    // Returns true if self is a subset of other
    fn is_subset(&self, other: &Self::Other) -> bool;
}

impl Subset for Vec<Argument> {
    type Other = Self;
    // Returns true if every argument of self is a subset of the argument with the same name in other
    fn is_subset(&self, other: &Self) -> bool {
        // index other by arg name to speed up subset check
        let other = other
            .iter()
            .map(|arg| (arg.name.item, arg))
            .collect::<HashMap<ArgumentName, &Argument>>();
        self.iter().all(|arg| {
            if let Some(other_arg) = other.get(&arg.name.item) {
                return arg.is_subset(other_arg);
            }
            false
        })
    }
}

impl Subset for Argument {
    type Other = Self;
    fn is_subset(&self, other: &Self) -> bool {
        self.name.item == other.name.item && self.value.item.is_subset(&other.value.item)
    }
}

impl Subset for Vec<ConstantArgument> {
    type Other = Vec<Argument>;
    fn is_subset(&self, other: &Vec<Argument>) -> bool {
        // index other by arg name to speed up subset check
        let other = other
            .iter()
            .map(|arg| (arg.name.item, arg))
            .collect::<HashMap<ArgumentName, &Argument>>();
        self.iter().all(|arg| {
            if let Some(other_arg) = other.get(&arg.name.item) {
                return arg.is_subset(other_arg);
            }
            false
        })
    }
}

impl Subset for ConstantArgument {
    type Other = Argument;
    fn is_subset(&self, other: &Argument) -> bool {
        self.name.item == other.name.item && self.value.item.is_subset(&other.value.item)
    }
}

impl Subset for ConstantValue {
    type Other = Value;
    fn is_subset(&self, other: &Value) -> bool {
        match (self, other) {
            (_, Value::Variable(_)) => true,
            (ConstantValue::List(cv), Value::List(v)) => {
                cv.len() == v.len() && cv.iter().zip(v.iter()).all(|(e1, e2)| e1.is_subset(e2))
            }
            (ConstantValue::Object(ca), Value::Object(a)) => ca.is_subset(a),
            (scalar, Value::Constant(_)) => {
                Value::Constant(scalar.clone())
                    .location_agnostic_eq::<ValueLocationAgnosticBehavior>(other)
            }
            _ => false,
        }
    }
}

impl Subset for Value {
    type Other = Self;
    fn is_subset(&self, other: &Self) -> bool {
        match (self, other) {
            // any value is considered a subset of a variable, because it is always possible to
            // construct the variable to have the same value as concrete constant/object/list
            // values. 2 variables are considered subset of each other without knowing their runtime
            // value.
            // e.g. {input: { take: 5 } } is a subset of $input / {input: $take} / {input: { take: $count } }
            (_, Value::Variable(_)) => true,
            // composite constants compared recursively
            (Value::Constant(ConstantValue::List(cv)), Value::List(v)) => {
                cv.len() == v.len() && cv.iter().zip(v.iter()).all(|(e1, e2)| e1.is_subset(e2))
            }
            (Value::Constant(ConstantValue::Object(ca)), Value::Object(a)) => ca.is_subset(a),
            // scalar constants compared by literal value
            (Value::Constant(_), Value::Constant(_)) => {
                self.location_agnostic_eq::<ValueLocationAgnosticBehavior>(other)
            }
            // lists compared recursively, by list elements in same position. list length must be equal to satisfy subset check.
            (Value::List(l1), Value::List(l2)) => {
                l1.len() == l2.len() && l1.iter().zip(l2.iter()).all(|(e1, e2)| e1.is_subset(e2))
            }
            // objects compared recursively
            (Value::Object(a1), Value::Object(a2)) => a1.is_subset(a2),
            _ => false,
        }
    }
}

// A normailized graphql_ir::Selection representing a linked field or a scalar field,
// the underlying field is represented using the field's *name*, or the dealiased JSON
// key value of the field in the response.
#[derive(Debug, Clone)]
pub struct NormalizedSelection {
    pub field: StringKey,
    pub arguments: Vec<Argument>,
    // for printing
    pub location: Location,
}

impl Subset for NormalizedSelection {
    type Other = Self;
    fn is_subset(&self, other: &Self) -> bool {
        let (
            NormalizedSelection {
                field: f1,
                arguments: a1,
                ..
            },
            NormalizedSelection {
                field: f2,
                arguments: a2,
                ..
            },
        ) = (self, other);
        f1 == f2 && a1.is_subset(a2)
    }
}

impl PartialEq for NormalizedSelection {
    fn eq(&self, other: &Self) -> bool {
        let (
            NormalizedSelection {
                field: f1,
                arguments: a1,
                ..
            },
            NormalizedSelection {
                field: f2,
                arguments: a2,
                ..
            },
        ) = (self, other);
        f1 == f2 && a1.location_agnostic_eq::<ValueLocationAgnosticBehavior>(a2)
    }
}

impl Eq for NormalizedSelection {}

// Schema assisted formatter.
pub struct NormalizedSelectionFormatter<'a> {
    pub schema: Arc<SDLSchema>,
    pub selection: &'a NormalizedSelection,
}

impl<'a> Display for NormalizedSelectionFormatter<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}{}",
            self.selection.field.lookup(),
            print_arguments(
                &self.schema,
                &self.selection.arguments,
                PrinterOptions::default()
            )
        )
    }
}

impl<'a> Debug for NormalizedSelectionFormatter<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        Display::fmt(self, f)
    }
}

pub type NormalizedPath = Vec<NormalizedSelection>;

// The part of normalized tree that is different from another when doing subset checking.
pub struct NormalizedDifference {
    // path from root that leads to the subtree that is different, including the subtree root.
    pub path: NormalizedPath,
    // the subtree that is different.
    pub tree: NormalizedTree,
    // for scalar field, the type condition that is unsatisfied and causes difference,
    // even the selection itself matches by field name and field arguments.
    pub unsatisfied_object_types: Option<HashSet<ObjectID>>,
}

// Schema assisted formatter.
pub struct NormalizedDifferenceFormatter<'a> {
    pub schema: Arc<SDLSchema>,
    pub diff: &'a NormalizedDifference,
}

impl<'a> Display for NormalizedDifferenceFormatter<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}",
            self.diff
                .path
                .iter()
                .map(|selection| NormalizedSelectionFormatter {
                    schema: self.schema.clone(),
                    selection,
                }
                .to_string())
                .collect::<Vec<_>>()
                .join(" -> "),
        )?;
        if let Some(unsatisfied) = &self.diff.unsatisfied_object_types {
            write!(
                f,
                " on {{{}}}",
                unsatisfied
                    .iter()
                    .map(|id| self.schema.object(*id).name.item.lookup())
                    .collect::<Vec<_>>()
                    .join(", ")
            )?;
        }
        Ok(())
    }
}

// A normalized selection tree of a query for subset testing.
// The tree's structure closely matches the JSON structure of the query's response:
// * Fragment spread and inline fragments are omitted in the tree, while their type conditions are captured at leaf level, e.g.
//   { ...on User {id} } == { id on {FBUser, IGUser, ...} }
// * Fields are deduplicated, e.g. { id id } == { id }
// The tree's structure reflects the actual scalar fields that are resolved when the query executes:
// * Fields are dealiased, e.g. { my_id: id } == { my_fbid: id } == { id }
//
// RefCell/Rc fields for top-down tree construction mandated by graphql_ir::Visitor, where these
// fields are mutated with subtrees as they are gradually constructed.
#[derive(Debug, Clone)]
pub enum NormalizedTree {
    // LinkedFields along the path, with OperationDefinition being a special case:
    // they are treated as a no-arg selection of pseudo linked field query/mutation/subscription.
    Node {
        selection: NormalizedSelection,
        children: RefCell<Vec<Rc<NormalizedTree>>>,
    },
    // A ScalarField
    Leaf {
        selection: NormalizedSelection,
        // concrete object types that the parent object type must be one of, in order
        // for the scalar field to be included in the response.
        possible_object_types: RefCell<HashSet<ObjectID>>,
    },
}

impl NormalizedTree {
    pub fn new_node(field: StringKey, arguments: Vec<Argument>, location: Location) -> Rc<Self> {
        Rc::new(NormalizedTree::Node {
            selection: NormalizedSelection {
                field,
                arguments,
                location,
            },
            children: RefCell::new(Vec::new()),
        })
    }

    pub fn new_leaf(
        field: StringKey,
        arguments: Vec<Argument>,
        location: Location,
        possible_object_types: HashSet<ObjectID>,
    ) -> Rc<Self> {
        Rc::new(NormalizedTree::Leaf {
            selection: NormalizedSelection {
                field,
                arguments,
                location,
            },
            possible_object_types: RefCell::new(possible_object_types),
        })
    }

    fn selection(&self) -> &NormalizedSelection {
        match self {
            NormalizedTree::Node { selection, .. } | NormalizedTree::Leaf { selection, .. } => {
                selection
            }
        }
    }

    fn children(&self) -> RefCell<Vec<Rc<NormalizedTree>>> {
        match self {
            NormalizedTree::Node { children, .. } => children.clone(),
            NormalizedTree::Leaf { .. } => RefCell::new(Vec::new()),
        }
    }

    // Add child to self's children during tree construction:
    // * Leaf can not be added to
    // * Only add Node/Leaf if it, or its superset, is not present in self's children
    // * Merge Leaf's possible object types with existing leaf instead of adding.
    pub fn add_child(&self, child: Rc<Self>) {
        match self {
            NormalizedTree::Node { children, .. } => {
                let mut children = children.borrow_mut();
                match &*child {
                    node @ NormalizedTree::Node { .. } => {
                        if !children.iter().any(|child| (**child).eq(node)) {
                            children.push(child);
                        }
                    }
                    leaf @ NormalizedTree::Leaf {
                        possible_object_types,
                        ..
                    } => {
                        if let Some(existing_leaf) =
                            children.iter().find(|&child| (**child).eq(leaf))
                        {
                            match &**existing_leaf {
                                NormalizedTree::Leaf {
                                    possible_object_types: existing_possible_object_types,
                                    ..
                                } => {
                                    existing_possible_object_types
                                        .borrow_mut()
                                        .extend(possible_object_types.borrow().iter());
                                }
                                _ => unreachable!("existing_leaf must be a leaf"),
                            }
                        } else {
                            children.push(child);
                        }
                    }
                }
            }
            NormalizedTree::Leaf { .. } => panic!("cannot add child to leaf"),
        }
    }
}

// Subset testing ONLY considers its selection, not its children.
impl Subset for NormalizedTree {
    type Other = Self;
    fn is_subset(&self, other: &Self) -> bool {
        match (self, other) {
            (
                NormalizedTree::Node { selection: s1, .. },
                NormalizedTree::Node { selection: s2, .. },
            ) => s1.is_subset(s2),
            (
                NormalizedTree::Leaf { selection: s1, .. },
                NormalizedTree::Leaf { selection: s2, .. },
            ) => s1.is_subset(s2),
            _ => false,
        }
    }
}

// Partial equality ONLY considers its selection, not its children.
impl PartialEq for NormalizedTree {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (
                NormalizedTree::Node { selection: s1, .. },
                NormalizedTree::Node { selection: s2, .. },
            ) => s1.eq(s2),
            (
                NormalizedTree::Leaf { selection: s1, .. },
                NormalizedTree::Leaf { selection: s2, .. },
            ) => s1.eq(s2),
            _ => false,
        }
    }
}

impl Eq for NormalizedTree {}

impl NormalizedTree {
    // DFS traversal of the 2 selection set that outputs the differences. Selections are
    // considered different if one is not a subset of the other.
    fn subtract_impl(
        selections1: &RefCell<Vec<Rc<NormalizedTree>>>,
        selections2: &RefCell<Vec<Rc<NormalizedTree>>>,
        path_stack: &mut NormalizedPath,
    ) -> Vec<NormalizedDifference> {
        let (selections1, selections2) = (selections1.borrow(), selections2.borrow());
        let mut diff = vec![];
        for sel1 in selections1.iter() {
            path_stack.push(sel1.selection().clone());
            let sel2 = selections2.iter().find(|sel2| (**sel1).is_subset(&**sel2));
            if let Some(sel2) = sel2 {
                match (Rc::as_ref(sel1), Rc::as_ref(sel2)) {
                    (
                        l1 @ NormalizedTree::Leaf {
                            possible_object_types: p1,
                            ..
                        },
                        NormalizedTree::Leaf {
                            possible_object_types: p2,
                            ..
                        },
                    ) => {
                        let unsatisfied = &*p1.borrow() - &*p2.borrow();
                        if !unsatisfied.is_empty() {
                            diff.push(NormalizedDifference {
                                path: path_stack.clone(),
                                tree: l1.clone(),
                                unsatisfied_object_types: Some(unsatisfied),
                            });
                        }
                    }
                    (
                        NormalizedTree::Node {
                            children: selections1,
                            ..
                        },
                        NormalizedTree::Node {
                            children: selections2,
                            ..
                        },
                    ) => {
                        diff.extend(Self::subtract_impl(selections1, selections2, path_stack));
                    }
                    _ => unreachable!(
                        "selections of different types found after explicit comparison above"
                    ),
                }
            } else {
                // node in selection1 not found in selection2
                diff.push(NormalizedDifference {
                    path: path_stack.clone(),
                    tree: (**sel1).clone(),
                    unsatisfied_object_types: None,
                });
            }
            path_stack.pop();
        }
        diff
    }

    /// Subtract the other tree from self tree, using is_subset check for individual nodes and leaves.
    ///
    /// # Returns
    /// A vec of tree differences, representing the root of subtrees of self (can be a leaf), that were not
    /// found in the other tree.
    pub fn subtract(&self, other: &Self) -> Vec<NormalizedDifference> {
        let mut stack = vec![self.selection().clone()];
        if !self.is_subset(other) {
            return vec![NormalizedDifference {
                path: stack.clone(),
                tree: self.clone(),
                unsatisfied_object_types: None,
            }];
        }
        Self::subtract_impl(&self.children(), &other.children(), &mut stack)
    }

    // The number of total nodes and leaves of a tree, including root node.
    pub fn size(&self) -> usize {
        match self {
            NormalizedTree::Node { children, .. } => {
                let mut size = 1;
                for sel in children.borrow().iter() {
                    size += sel.size();
                }
                size
            }
            NormalizedTree::Leaf { .. } => 1,
        }
    }
}

// Collect normalized tree from a given program, by calling visit_program with the program.
struct NormalizedTreeCollector {
    schema: Arc<SDLSchema>,
    program: OnceCell<Program>,
    // begins and ends with the root node
    stack: Vec<Rc<NormalizedTree>>,
    // vec size increase by 1 as type conditions are gradually enforce as we traverse the query,
    // in current design this happens when:
    // * encountering a linked field
    // * encountering an inlined fragment with type condition
    // * encountering a fragment spread where type condition is mandatory
    // e.g.
    // query {
    //   me { # possible types += {FBUser, IGUser, ...}
    //     ... on FBUser { # possible types = {FBUser}
    //       fb_profile_url
    //     } # possible types popped
    //     ... IGUser
    //   } # possible types popped
    //   posts { # possible types += {TextPost, PhotoPost, ...}
    //     id
    //   } # possible types popped
    // }
    // fragment IGUser { # possible types += {IGUser}
    //   ig_profile_url
    // } # possible types popped
    //
    // last elem of the vec is the most "refined" set of possible object types enclosing the select currently
    // being traversed.
    possible_object_types: Vec<HashSet<ObjectID>>,
}

impl NormalizedTreeCollector {
    pub fn new(schema: &Arc<SDLSchema>) -> Self {
        Self {
            schema: schema.clone(),
            program: OnceCell::new(),
            stack: vec![],
            possible_object_types: vec![],
        }
    }

    fn fragment(&self, spread: &graphql_ir::FragmentSpread) -> &Arc<FragmentDefinition> {
        self.program
            .get()
            .expect("missing program, collector's visit_program not called")
            .fragment(spread.fragment.item)
            .expect("missing fragment definition")
    }

    fn root_name(&self, operation: &OperationDefinition) -> &str {
        match operation.kind {
            OperationKind::Query => "query",
            OperationKind::Mutation => "mutation",
            OperationKind::Subscription => "subscription",
        }
    }

    fn root_object_id(&self, operation: &OperationDefinition) -> ObjectID {
        let root_type = match operation.kind {
            OperationKind::Query => self.schema.query_type(),
            OperationKind::Mutation => self.schema.mutation_type(),
            OperationKind::Subscription => self.schema.subscription_type(),
        };
        let root_type = root_type.expect("type Query/Mutation/Subscription missing");
        let Type::Object(root_object_id) = root_type else {
            panic!("root type must be an object");
        };
        root_object_id
    }

    // For a given type, get concrete, object types that conforms to the type.
    //
    // Note: possible object types for common interfaces (e.g. Node) might be very large in
    // real schemas, representing them in ObjectID (u32) as they are in IR somewhat helps.
    fn possible_object_types_for(&self, type_: Type) -> HashSet<ObjectID> {
        match type_ {
            Type::Object(object_id) => HashSet::from([object_id]),
            Type::Interface(interface_id) => self
                .schema
                .interface(interface_id)
                .recursively_implementing_objects(Arc::as_ref(&self.schema)),
            Type::Union(union_id) => {
                HashSet::from_iter(self.schema.union(union_id).members.iter().copied())
            }
            Type::Scalar(_) | Type::Enum(_) | Type::InputObject(_) => HashSet::new(), // not an object
        }
    }

    // We are encountering a selection that does not advance path (e.g. Root->me => Root->me-id), but
    // rather enforces tighter type condition on its selection set, namely inlined fragment and fragment
    // spread.
    fn collect_possible_types(&mut self, type_condition: Option<Type>) {
        if let Some(type_condition) = type_condition {
            if let Some(current_possible_object_types) = self.possible_object_types.last() {
                self.possible_object_types.push(
                    self.possible_object_types_for(type_condition)
                        .intersection(current_possible_object_types)
                        .cloned()
                        .collect(),
                );
            } else {
                // edge case: inlined fragment spread under root
                self.possible_object_types
                    .push(self.possible_object_types_for(type_condition));
            }
        }
    }
}

impl Visitor for NormalizedTreeCollector {
    const NAME: &'static str = "NormalizedTreeCollector";
    const VISIT_ARGUMENTS: bool = true;
    const VISIT_DIRECTIVES: bool = true;

    fn visit_program(&mut self, program: &Program) {
        self.program
            .set(program.clone())
            .expect("visit_program called multiple times");
        assert!(
            program.operations().count() == 1,
            "only support a single operation per program"
        );
        for operation in program.operations() {
            self.visit_operation(operation);
        }
    }

    fn visit_operation(&mut self, operation: &OperationDefinition) {
        self.stack.push(NormalizedTree::new_node(
            self.root_name(operation).intern(),
            vec![],
            operation.name.location,
        ));
        self.possible_object_types
            .push(HashSet::from([self.root_object_id(operation)]));
        self.default_visit_operation(operation)
        // root is the final result, and not popped
    }

    fn visit_fragment_spread(&mut self, spread: &graphql_ir::FragmentSpread) {
        self.default_visit_fragment_spread(spread);
        // retrieve actual fragment definition and continue traversal, in a way treating
        // fragment speads as inlined fragments, aka. inlining spreads.
        for sel in self.fragment(spread).selections.clone() {
            self.visit_selection(&sel);
        }
    }

    fn visit_selection(&mut self, selection: &Selection) {
        match selection {
            Selection::LinkedField(selection) => {
                let field = self.schema.field(selection.definition.item);
                self.possible_object_types
                    .push(self.possible_object_types_for(field.type_.inner()));
                let node = NormalizedTree::new_node(
                    field.name.item,
                    selection.arguments.clone(),
                    selection.definition.location,
                );
                self.stack
                    .last()
                    .expect("empty stack during traversal")
                    .add_child(Rc::clone(&node));
                self.stack.push(node);
            }
            Selection::InlineFragment(selection) => {
                self.collect_possible_types(selection.type_condition);
            }
            Selection::FragmentSpread(selection) => {
                self.collect_possible_types(Some(self.fragment(selection).type_condition));
            }
            Selection::ScalarField(selection) => {
                self.stack
                    .last()
                    .expect("empty stack during traversal")
                    .add_child(NormalizedTree::new_leaf(
                        self.schema.field(selection.definition.item).name.item,
                        selection.arguments.clone(),
                        selection.definition.location,
                        self.possible_object_types
                            .last()
                            .expect("non-empty possible types")
                            .clone(),
                    ));
            }
            _ => (),
        }
        self.default_visit_selection(selection);
        // if possible_object_types or stack was pushed to above, then pop after.
        match selection {
            Selection::LinkedField(_) => {
                self.possible_object_types.pop();
                self.stack.pop();
            }
            Selection::InlineFragment(selection) => {
                if selection.type_condition.is_some() {
                    self.possible_object_types.pop();
                }
            }
            Selection::FragmentSpread(_) => {
                self.possible_object_types.pop();
            }
            _ => (),
        }
    }
}

pub fn collect_normalized_tree(program: &Program) -> Rc<NormalizedTree> {
    let mut collector = NormalizedTreeCollector::new(&program.schema);
    collector.visit_program(program);
    assert!(
        collector.stack.len() == 1,
        "stack must be size 1 post visit"
    );
    collector.stack.last().unwrap().clone()
}

pub fn format_document(document: &str) -> Result<String> {
    let ast = parse_executable(document, SourceLocationKey::generated())
        .map_err(|diagnostics| anyhow::anyhow!(diagnostics.iter().join("\n")))?;

    let formatted: String = ast
        .definitions
        .iter()
        .map(print_executable_definition_ast)
        .collect::<Vec<_>>()
        .join("\n\n");

    Ok(formatted)
}

pub fn parse(schema: Arc<SDLSchema>, document: &str) -> Result<Program> {
    let ast = parse_executable(document, SourceLocationKey::generated())
        .map_err(|diagnostics| anyhow::anyhow!(diagnostics.iter().join("\n")))?;
    let ir = build_ir_with_extra_features(
        &schema,
        &ast.definitions,
        &BuilderOptions {
            allow_undefined_fragment_spreads: false,
            allow_non_overlapping_abstract_spreads: false,
            fragment_variables_semantic: FragmentVariablesSemantic::PassedValue,
            relay_mode: None,
            // allows parsing of "query {...}" with no name, all other options are default
            default_anonymous_operation_name: Some("Anonymous".intern()),
            allow_custom_scalar_literals: true,
        },
    )
    .map_err(|diagnostics| anyhow::anyhow!(diagnostics.iter().join("\n")))?;

    Ok(Program::from_definitions(schema, ir))
}

pub fn load_schema(schema_paths: Vec<String>) -> Result<Arc<SDLSchema>> {
    // Collect (content, file_path) pairs for each schema file
    let schema_files: Vec<(String, String)> = schema_paths
        .clone()
        .into_iter()
        .map(|pattern| {
            // expand if path contains "*"
            let paths = glob::glob(&pattern)
                .map_err(|e| anyhow!("Invalid glob pattern '{}': {}", pattern, e))?;
            let file_entries: Result<Vec<(String, String)>> = paths
                .map(|entry| {
                    let file_path =
                        entry.map_err(|e| anyhow!("Failed to read glob entry: {}", e))?;
                    let file_path_str = file_path.to_string_lossy().to_string();
                    let schema_bytes = fs::read(file_path)?;
                    let content = String::from_utf8(schema_bytes)
                        .map_err(|e| anyhow!("Cannot parse schema utf8 from bytes: {}", e))?;
                    Ok((content, file_path_str))
                })
                .collect();
            file_entries
        })
        .collect::<Result<Vec<_>>>()?
        .into_iter()
        .flatten()
        .collect();

    if schema_files.is_empty() {
        return Err(anyhow!(
            "No schema loaded for paths: {}",
            schema_paths.join(",")
        ));
    }

    // Build a source map for DiagnosticPrinter
    let source_map: HashMap<SourceLocationKey, TextSource> = schema_files
        .iter()
        .map(|(content, file_path)| {
            let source_key = SourceLocationKey::standalone(file_path);
            let text_source = TextSource::from_whole_document(content.clone());
            (source_key, text_source)
        })
        .collect();

    // Convert to (content, SourceLocationKey) tuples for build_schema_with_extensions_parallel
    let schema_sdls: Vec<(String, SourceLocationKey)> = schema_files
        .into_iter()
        .map(|(content, file_path)| {
            let source_key = SourceLocationKey::standalone(&file_path);
            (content, source_key)
        })
        .collect();

    let schema = schema::build_schema_with_extensions_parallel::<_, &str>(
        &schema_sdls
            .iter()
            .map(|(content, key)| (content.as_str(), *key))
            .collect::<Vec<_>>(),
        &[],
    )
    .map_err(|diagnostics| {
        let printer =
            DiagnosticPrinter::new(|key: SourceLocationKey| source_map.get(&key).cloned());
        anyhow!(
            "Failed to build schema:\n{}",
            printer.diagnostics_to_string(&diagnostics)
        )
    })?;

    Ok(Arc::new(schema))
}

/// Compare 2 GraphQL executable definitions belonging to the same schema, by subtracting doc2's normalized selection
/// set from doc1's. Normalized selection set is the minimal set of (linked/scalar) field and argument combo that
/// is selected by the executable, considering the field's type condition enforced by its {} enclosures. Comparison
/// is assisted by typing information from the schema, passed as a comma separated list of paths.
///
/// # Returns (score, message)
/// * `score` - numerical score in [0.0, 1.0], where 0 means doc1 is disjointed from doc2, and 1 means doc1 is
///   a subset of doc2
/// * `message` - details of relative complement of doc1 with respect to doc2, aka. doc1 - doc2
pub fn compare(schema_paths: Vec<String>, doc1: &str, doc2: &str) -> Result<(f64, String)> {
    let schema = load_schema(schema_paths)?;
    // formatting input docs so that output with location underscored are more consumable.
    let doc1 = format_document(doc1)?;
    let doc2 = format_document(doc2)?;
    let program1 = parse(schema.clone(), &doc1)?;
    let program2 = parse(schema.clone(), &doc2)?;
    let tree1 = collect_normalized_tree(&program1);
    let tree2 = collect_normalized_tree(&program2);

    let diffs = tree1.subtract(&tree2);

    // score based on # of missing nodes / # of total nodes in doc1
    let total = tree1.size();
    let diff_total = diffs.iter().map(|d| d.tree.size()).sum::<usize>();
    let score = 1.0 - (diff_total as f64) / (total as f64);

    let mut output = String::new();
    if diffs.is_empty() {
        writeln!(&mut output, "Subset test passed")?;
    } else {
        writeln!(&mut output, "Found {} missing selection(s):", diffs.len())?;
        let printer = SourcePrinter;
        for diff in diffs {
            let location = diff.tree.selection().location;
            printer.write_span(&mut output, location.span(), &doc1, 0)?;
            writeln!(
                &mut output,
                "* {}",
                NormalizedDifferenceFormatter {
                    schema: schema.clone(),
                    diff: &diff,
                }
            )?;
            writeln!(&mut output)?;
        }
    }

    Ok((score, output))
}
