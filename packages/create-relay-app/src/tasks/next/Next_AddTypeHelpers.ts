import path from "path";
import { NEXT_SRC_PATH } from "../../consts.js";
import { ProjectContext } from "../../misc/ProjectContext.js";
import { RelativePath } from "../../misc/RelativePath.js";
import { prettifyCode } from "../../utils/ast.js";
import { bold } from "../../utils/cli.js";
import { TaskBase } from "../TaskBase.js";

const code = `
import type { GetServerSideProps, GetStaticProps, PreviewData } from "next";
import type { ParsedUrlQuery } from "querystring";
import type { RecordMap } from "relay-runtime/lib/store/RelayStoreTypes";

export type RelayPageProps = {
  initialRecords?: RecordMap;
};

export type GetRelayServerSideProps<
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
> = GetServerSideProps<P & Required<RelayPageProps>, Q, D>;

export type GetRelayStaticProps<
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
> = GetStaticProps<P & Required<RelayPageProps>, Q, D>;
`;

export class Next_AddTypeHelpers extends TaskBase {
  message = "Add type helpers";

  constructor(private context: ProjectContext) {
    super();
  }

  isEnabled(): boolean {
    return this.context.is("next") && this.context.args.typescript;
  }

  async run(): Promise<void> {
    const filepath = Next_AddTypeHelpers.getRelayTypesPath(this.context);

    this.updateMessage(this.message + " " + bold(filepath.rel));

    if (this.context.fs.exists(filepath.abs)) {
      this.skip("File exists");
      return;
    }

    const prettifiedCode = prettifyCode(code);

    await this.context.fs.writeToFile(filepath.abs, prettifiedCode);
  }

  static getRelayTypesPath(context: ProjectContext): RelativePath {
    const filepath = path.join(NEXT_SRC_PATH, "relay-types.ts");

    return context.env.rel(filepath);
  }
}
