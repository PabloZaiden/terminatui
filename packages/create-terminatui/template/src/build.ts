import { buildBinary } from "@pablozaiden/terminatui";
import { MyApp } from ".";

const rootDir = import.meta.dir + "/..";
const entrypoint = rootDir + "/src/index.ts";

buildBinary(rootDir, entrypoint, MyApp.appName);