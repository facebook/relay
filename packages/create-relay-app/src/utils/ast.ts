import generate from "@babel/generator";
import { ParseResult, parse } from "@babel/parser";
import { NodePath } from "@babel/traverse";
import t from "@babel/types";
import { format } from "prettier";

export function parseAst(code: string): ParseResult<t.File> {
  return parse(code, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });
}

export function astToString(ast: ParseResult<t.File>, oldCode: string): string {
  return generate.default(ast, { retainLines: true }, oldCode).code;
}

export function printAst(ast: ParseResult<t.File>, oldCode: string): string {
  const newCode = astToString(ast, oldCode);

  return prettifyCode(newCode);
}

export function prettifyCode(code: string): string {
  return format(code, {
    bracketSameLine: false,
    endOfLine: "auto",
    parser: "babel-ts",
  });
}

export function insertNamedImport(path: NodePath, importName: string, packageName: string): t.Identifier {
  return insertNamedImports(path, [importName], packageName)[0];
}

export function insertNamedImports(path: NodePath, imports: string[], packageName: string): t.Identifier[] {
  const program = path.findParent((p) => p.isProgram()) as NodePath<t.Program>;

  const identifiers: t.Identifier[] = [];
  const missingImports: string[] = [];

  for (const namedImport of imports) {
    const importIdentifier = t.identifier(namedImport);

    const existingImport = getNamedImport(program, namedImport, packageName);

    if (!!existingImport) {
      identifiers.push(importIdentifier);
      continue;
    }

    missingImports.push(namedImport);
  }

  let importDeclaration: t.ImportDeclaration;
  const isFirstImportFromPackage = missingImports.length === imports.length;

  if (isFirstImportFromPackage) {
    importDeclaration = t.importDeclaration([], t.stringLiteral(packageName));
  } else {
    importDeclaration = getImportDeclaration(program, packageName)!;
  }

  for (const namedImport of missingImports) {
    const importIdentifier = t.identifier(namedImport);

    const newImport = t.importSpecifier(t.cloneNode(importIdentifier), importIdentifier);

    importDeclaration.specifiers.push(newImport);

    identifiers.push(importIdentifier);
  }

  if (isFirstImportFromPackage) {
    // Insert import at start of file.
    program.node.body.unshift(importDeclaration);
  }

  return identifiers;
}

export function insertDefaultImport(path: NodePath, importName: string, packageName: string): t.Identifier {
  const importIdentifier = t.identifier(importName);

  const program = path.findParent((p) => p.isProgram()) as NodePath<t.Program>;

  const existingImport = getDefaultImport(program, importName, packageName);

  if (!!existingImport) {
    return importIdentifier;
  }

  const importDeclaration = t.importDeclaration(
    [t.importDefaultSpecifier(t.cloneNode(importIdentifier))],

    t.stringLiteral(packageName)
  );

  // Insert import at start of file.
  program.node.body.unshift(importDeclaration);

  return importIdentifier;
}

function getImportDeclaration(path: NodePath<t.Program>, packageName: string): t.ImportDeclaration | null {
  return path.node.body.find(
    (s) => t.isImportDeclaration(s) && s.source.value === packageName
  ) as t.ImportDeclaration | null;
}

export function getNamedImport(
  path: NodePath<t.Program>,
  importName: string,
  packageName: string
): t.ImportDeclaration {
  return path.node.body.find(
    (s) =>
      t.isImportDeclaration(s) &&
      s.source.value === packageName &&
      s.specifiers.some((sp) => t.isImportSpecifier(sp) && sp.local.name === importName)
  ) as t.ImportDeclaration;
}

function getDefaultImport(path: NodePath<t.Program>, importName: string, packageName: string): t.ImportDeclaration {
  return path.node.body.find(
    (s) =>
      t.isImportDeclaration(s) &&
      s.source.value === packageName &&
      s.specifiers.some((sp) => t.isImportDefaultSpecifier(sp) && sp.local.name === importName)
  ) as t.ImportDeclaration;
}

export function mergeProperties(
  existingProps: t.ObjectExpression["properties"],
  newProps: t.ObjectProperty[]
): t.ObjectExpression["properties"] {
  let existingCopy = [...existingProps];

  for (const prop of newProps) {
    const existingIndex = existingCopy.findIndex(
      (p) => t.isObjectProperty(p) && t.isIdentifier(p.key) && t.isIdentifier(prop.key) && p.key.name === prop.key.name
    );

    if (existingIndex !== -1) {
      existingCopy[existingIndex] = prop;
    } else {
      existingCopy.push(prop);
    }
  }

  return existingCopy;
}
