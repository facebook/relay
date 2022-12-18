import path from "path";

export class RelativePath {
  private readonly root: string;
  readonly abs: string;
  readonly rel: string;

  constructor(root: string, rel?: string) {
    this.root = root;

    if (rel) {
      if (path.isAbsolute(rel)) {
        this.abs = rel;
      } else {
        this.abs = path.join(this.root, rel);
      }
    } else {
      this.abs = root;
    }

    this.rel = prettifyPath(path.relative(this.root, this.abs));
  }

  get parentDirectory(): string {
    return path.dirname(this.abs);
  }

  get name(): string {
    return path.basename(this.abs);
  }

  toString(): string {
    return this.rel;
  }
}

function prettifyPath(input: string): string {
  let normalizedPath = normalizePath(input);

  if (!normalizedPath.startsWith("..") && !normalizedPath.startsWith("./")) {
    normalizedPath = "./" + normalizedPath;
  }

  return normalizedPath;
}

function normalizePath(input: string): string {
  return input.split(path.sep).join("/");
}
