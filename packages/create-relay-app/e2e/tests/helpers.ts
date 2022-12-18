import { ChildProcess, spawn, SpawnOptions } from "child_process";
import { Filesystem } from "../../src/misc/Filesystem";
import { RelativePath } from "../../src/misc/RelativePath";
import { traverse, types as t } from "@babel/core";
import { parse, ParseResult } from "@babel/parser";
import generate from "@babel/generator";
import { NodePath } from "@babel/traverse";
import path from "path";

export function runCmd(cmd: string, opt?: SpawnOptions) {
  return new Promise<void>((resolve, reject) => {
    const [executable, ...args] = cmd.split(" ");

    const child = spawn(executable, args, {
      ...opt,
      shell: true,
    });

    if (child.stdout) {
      child.stdout.setEncoding("utf8");
      child.stdout.on("data", function (data) {
        process.stdout.write(data);
      });
    }

    if (child.stderr) {
      child.stderr.setEncoding("utf8");
      child.stderr.on("data", function (data) {
        process.stdout.write(data);
      });
    }

    child.on("close", (code) => {
      if (code !== 0) {
        reject(`Command \"${executable} ${args.join(" ")}\" failed`);
        return;
      }

      resolve();
    });
  });
}

export function fireCmd(cmd: string, opt?: SpawnOptions): ChildProcess {
  const [executable, ...args] = cmd.split(" ");

  const child = spawn(executable, args, {
    ...opt,
    stdio: "inherit",
    shell: true,
  });

  return child;
}

export async function insertTestComponentBelowRelayProvider(
  filepath: string,
  relativeImport: string
) {
  const fs = new Filesystem();
  const code = await fs.readFromFile(filepath);

  const ast = parseAst(code);

  let inserted = false;

  traverse(ast, {
    JSXElement: (nodePath) => {
      if (inserted) {
        return;
      }

      const openingElement = nodePath.node.openingElement;

      if (
        !t.isJSXIdentifier(openingElement.name) ||
        openingElement.name.name !== "RelayEnvironmentProvider"
      ) {
        return;
      }

      const parentDirectory = path.dirname(filepath);

      const relativeImportPath = new RelativePath(
        parentDirectory,
        removeExtension(relativeImport)
      );

      const importName = "TestComponent";

      const testComponentId = insertNamedImport(
        nodePath,
        importName,
        relativeImportPath.rel
      );

      if (
        nodePath.node.children.some(
          (c) =>
            t.isJSXElement(c) &&
            t.isJSXIdentifier(c.openingElement.name) &&
            c.openingElement.name.name === importName
        )
      ) {
        inserted = true;
        nodePath.skip;
        return;
      }

      const newTest = t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier(testComponentId.name), [], true),
        null,
        [],
        true
      );

      nodePath.node.children.push(newTest);

      inserted = true;

      nodePath.skip();
    },
  });

  if (!inserted) {
    throw new Error("Could not insert reference to TestComponent");
  }

  const updatedCode = printAst(ast, code);

  await fs.writeToFile(filepath, updatedCode);
}

function removeExtension(filename: string): string {
  return filename.substring(0, filename.lastIndexOf(".")) || filename;
}

// taken from src/utils/ast
function parseAst(code: string): ParseResult<t.File> {
  return parse(code, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });
}

function printAst(ast: ParseResult<t.File>, oldCode: string): string {
  return generate(ast, { retainLines: true }, oldCode).code;
}

function insertNamedImport(
  path: NodePath,
  importName: string,
  packageName: string
): t.Identifier {
  const importIdentifier = t.identifier(importName);

  const program = path.findParent((p) => p.isProgram()) as NodePath<t.Program>;

  const existingImport = getNamedImport(program, importName, packageName);

  if (!!existingImport) {
    return importIdentifier;
  }

  const importDeclaration = t.importDeclaration(
    [t.importSpecifier(t.cloneNode(importIdentifier), importIdentifier)],
    t.stringLiteral(packageName)
  );

  // Insert import at start of file.
  program.node.body.unshift(importDeclaration);

  return importIdentifier;
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
      s.specifiers.some(
        (sp) => t.isImportSpecifier(sp) && sp.local.name === importName
      )
  ) as t.ImportDeclaration;
}
