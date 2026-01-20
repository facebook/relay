/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt::Error as FmtError;
use std::fmt::Result as FmtResult;
use std::fmt::Write;

use signedsource::sign_file;

pub enum ContentSection {
    CommentAnnotations(CommentAnnotationsSection),
    Docblock(DocblockSection),
    Generic(GenericSection),
}

impl std::fmt::Display for ContentSection {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> FmtResult {
        match self {
            ContentSection::CommentAnnotations(section) => write!(f, "{section}"),
            ContentSection::Docblock(section) => write!(f, "{section}"),
            ContentSection::Generic(section) => write!(f, "{section}"),
        }
    }
}

impl ContentSection {
    fn is_empty(&self) -> bool {
        match self {
            ContentSection::CommentAnnotations(CommentAnnotationsSection(s))
            | ContentSection::Docblock(DocblockSection(s))
            | ContentSection::Generic(GenericSection(s)) => s.is_empty(),
        }
    }
}

impl FromIterator<ContentSection> for Vec<String> {
    fn from_iter<I: IntoIterator<Item = ContentSection>>(iter: I) -> Self {
        iter.into_iter()
            .map(|section| section.to_string())
            .collect()
    }
}

#[derive(Default)]
pub struct CommentAnnotationsSection(String);

impl Write for CommentAnnotationsSection {
    fn write_str(&mut self, str: &str) -> FmtResult {
        write!(self.0, "{str}")
    }
}

impl std::fmt::Display for CommentAnnotationsSection {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> FmtResult {
        for line in self.0.lines() {
            if line.is_empty() {
                writeln!(f)?;
            } else {
                writeln!(f, "// {line}")?;
            }
        }
        Ok(())
    }
}

#[derive(Default)]
pub struct DocblockSection(String);

impl Write for DocblockSection {
    fn write_str(&mut self, str: &str) -> FmtResult {
        write!(self.0, "{str}")
    }
}

impl std::fmt::Display for DocblockSection {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> FmtResult {
        if !self.0.is_empty() {
            writeln!(f, "/**")?;
            for line in self.0.lines() {
                if line.is_empty() {
                    writeln!(f, " *")?;
                } else {
                    writeln!(f, " * {line}")?;
                }
            }
            writeln!(f, " */")
        } else {
            Ok(())
        }
    }
}

#[derive(Default)]
pub struct GenericSection(String);

impl Write for GenericSection {
    fn write_str(&mut self, str: &str) -> FmtResult {
        write!(self.0, "{str}")
    }
}

impl std::fmt::Display for GenericSection {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> FmtResult {
        write!(f, "{}", self.0)
    }
}

#[derive(Default)]
pub struct ContentSections(Vec<ContentSection>);

impl ContentSections {
    pub fn push(&mut self, section: ContentSection) {
        if !section.is_empty() {
            self.0.push(section);
        }
    }

    pub fn into_signed_bytes(self) -> Result<Vec<u8>, FmtError> {
        Ok(sign_file(
            self.0
                .into_iter()
                .collect::<Vec<String>>()
                .join("\n")
                .as_str(),
        )
        .into_bytes())
    }
}
