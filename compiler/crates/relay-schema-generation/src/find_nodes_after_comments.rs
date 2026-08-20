/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(clippy::all)]

use std::convert::Infallible;

use dupe::Dupe;
use flow_parser::ast;
use flow_parser::ast_utils::loc_of_statement;
use flow_parser::ast_visitor;
use flow_parser::ast_visitor::AstVisitor;
use flow_parser::loc::Loc;

/// The kinds of node a Relay docblock can precede: a statement (for resolver
/// definitions) or an object type property (for `@gqlField` property lookups).
#[derive(Debug)]
pub enum AttachedNode<'a> {
    Statement(&'a ast::statement::Statement<Loc, Loc>),
    ObjectTypeProperty(&'a ast::types::object::NormalProperty<Loc, Loc>),
}

pub type AttachedComments<'a> = Vec<(&'a str, Loc, AttachedNode<'a>, Loc)>;

struct CommentAttachmentVisitor<'a> {
    comments: &'a [ast::Comment<Loc>],
    idx: usize,
    attached_comments: AttachedComments<'a>,
}

impl<'a> CommentAttachmentVisitor<'a> {
    fn new(comments: &'a [ast::Comment<Loc>]) -> Self {
        Self {
            comments,
            idx: 0,
            attached_comments: Default::default(),
        }
    }

    fn attach(&mut self, node: AttachedNode<'a>, node_loc: &Loc) {
        let comments = self.comments;
        // If several comments precede the node, only the last one is attached;
        // the rest are consumed so that they cannot attach to a nested node.
        let mut found_node = false;
        while self.idx < comments.len() && comments[self.idx].loc.end < node_loc.start {
            found_node = true;
            self.idx += 1;
        }
        if found_node {
            let comment = &comments[self.idx - 1];
            self.attached_comments
                .push((&comment.text, comment.loc.dupe(), node, node_loc.dupe()));
        }
    }
}

impl<'a> AstVisitor<'a, Loc, Loc, &'a Loc, Infallible> for CommentAttachmentVisitor<'a> {
    fn normalize_loc(loc: &'a Loc) -> &'a Loc {
        loc
    }

    fn normalize_type(type_: &'a Loc) -> &'a Loc {
        type_
    }

    fn statement(
        &mut self,
        stmt: &'a ast::statement::Statement<Loc, Loc>,
    ) -> Result<(), Infallible> {
        self.attach(AttachedNode::Statement(stmt), loc_of_statement(stmt));
        ast_visitor::statement_default(self, stmt)
    }

    fn object_property_type(
        &mut self,
        prop: &'a ast::types::object::NormalProperty<Loc, Loc>,
    ) -> Result<(), Infallible> {
        self.attach(AttachedNode::ObjectTypeProperty(prop), &prop.loc);
        ast_visitor::object_property_type_default(self, prop)
    }
}

/// For every comment, attach the outermost node that follows it.
/// This has the assumption that comments and AST nodes are visited in the order they appear in the file.
/// Only the node kinds a Relay docblock can precede are considered, so a
/// comment in some other position attaches to the next statement or object type
/// property instead of to the node immediately after it.
pub fn find_nodes_after_comments(program: &ast::Program<Loc, Loc>) -> AttachedComments<'_> {
    let mut visitor = CommentAttachmentVisitor::new(&program.all_comments);
    visitor
        .program(program)
        .unwrap_or_else(|never| match never {});
    visitor.attached_comments
}
