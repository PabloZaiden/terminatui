import { buildBinary } from "../../packages/terminatui/src/core/builder";

const rootDir = import.meta.dir;
const entrypoint = rootDir + "/index.ts";

buildBinary(rootDir, entrypoint, "example-tui-app");