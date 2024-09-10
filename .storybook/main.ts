import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";

function convertTsConfigPathsToWebpackAliases() {
  const rootDir = path.resolve(__dirname, "../");
  const tsconfig = require("../tsconfig.json");
  const tsconfigPaths = Object.entries(tsconfig.compilerOptions.paths);

  return tsconfigPaths.reduce((aliases, [realPath, mappedPath]) => {
    aliases[realPath] = path.join(rootDir, mappedPath[0]);
    return aliases;
  }, {});
}

const config: StorybookConfig = {
  stories: ["../components/*/src/**/*.stories.@(js|jsx|mjs|ts|tsx)", "../examples/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  addons: [
    {
      name: "@storybook/addon-essentials",
      options: { backgrounds: false, outline: false, actions: false },
    },
  ],
  typescript: {
    reactDocgen: false,
  },
  viteFinal: async (config) => {
    if (config?.resolve?.alias) {
      config.resolve.alias = {
        ...config.resolve.alias,
        ...convertTsConfigPathsToWebpackAliases(),
      };
    }
    return config;
  },
};

export default config;
