import glob from "glob";
import path, { parse } from "path";
import { aliasTo, asFunction } from "awilix";
import { AbstractBatchJobStrategy, MedusaContainer } from "@medusajs/medusa";
import { isDefined } from "medusa-core-utils";

type LoaderOptions = {
  container: MedusaContainer;
  configModule: object;
  isTest?: boolean;
};

/**
 * Registers all strategies in the strategies directory
 * @returns void
 */
export default ({ container, configModule, isTest }: LoaderOptions): void => {
  const useMock = isDefined(isTest) ? isTest : process.env.NODE_ENV === "test";

  const corePath = useMock
    ? "../strategies/__mocks__/[!__]*.js"
    : "../strategies/**/[!__]*.js";

  const coreFull = path.join(__dirname, corePath);

  const ignore = [
    "**/__fixtures__/**",
    "**/index.js",
    "**/index.ts",
    "**/utils.js",
    "**/utils.ts",
    "**/types.js",
    "**/types.ts",
    "**/types/**",
  ];
  if (!useMock) {
    ignore.push("**/__tests__/**", "**/__mocks__/**");
  }

  const core = glob.sync(coreFull, {
    cwd: __dirname,
    ignore,
  });

  core.forEach((fn) => {
    const loaded = require(fn).default;
    const name = formatRegistrationName(fn);

    if (AbstractBatchJobStrategy.isBatchJobStrategy(loaded.prototype)) {
      container.registerAdd(
        "batchJobStrategies",
        asFunction((cradle) => new loaded(cradle, configModule))
      );

      container.register({
        [name]: asFunction(
          (cradle) => new loaded(cradle, configModule)
        ).singleton(),
        [`batch_${loaded.identifier}`]: aliasTo(name),
        [`batchType_${loaded.batchType}`]: aliasTo(name),
      });
    } else {
      container.register({
        [name]: asFunction(
          (cradle) => new loaded(cradle, configModule)
        ).singleton(),
      });
    }
  });
};

export function formatRegistrationName(path: string): string {
  const parsed = parse(path);
  const parsedDir = parse(parsed.dir);
  const rawname = parsed.name;
  let directoryNamespace = parsedDir.name;

  if (directoryNamespace.startsWith("__")) {
    const parsedCoreDir = parse(parsedDir.dir);
    directoryNamespace = parsedCoreDir.name;
  }

  switch (directoryNamespace) {
    // We strip the last character when adding the type of registration
    // this is a trick for plural "ies"
    case "repositories":
      directoryNamespace = "repositorys";
      break;
    case "strategies":
      directoryNamespace = "strategys";
      break;
    default:
      break;
  }

  const upperNamespace = upperCaseFirst(directoryNamespace.slice(0, -1));

  return formatRegistrationNameWithoutNamespace(path) + upperNamespace;
}

// declare function upperCaseFirst(str: string): string;
function upperCaseFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
export function formatRegistrationNameWithoutNamespace(path: string): string {
  const parsed = parse(path);

  return toCamelCase(parsed.name);
}
export function toCamelCase(str: string) {
  if (typeof str !== "string") {
    throw new Error("Input must be a string");
  }

  return str.replace(/[-_]+(\w)/g, (_, letter) => letter.toUpperCase());
}
