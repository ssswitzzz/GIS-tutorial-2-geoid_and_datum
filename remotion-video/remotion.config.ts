// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";
import path from "path";
import os from "os";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Fix: The project path contains '#' which webpack/memfs interprets as a URL
// fragment separator, causing "file that only differs in casing or query string"
// errors. We redirect webpack's output to a safe temp path without '#'.
const safeBuildPath = path.join(os.tmpdir(), "remotion-build-geoid");

Config.overrideWebpackConfig((currentConfig) => {
  const tailwindConfig = enableTailwind(currentConfig);
  return {
    ...tailwindConfig,
    output: {
      ...tailwindConfig.output,
      path: safeBuildPath,
    },
  };
});
