import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    layout: "padded",
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    msw: {
      handlers: [],
    },
    darkMode: {
      darkClass: "dark",
      lightClass: "light",
    },
    backgrounds: { padding: 0 },
  },
};

export default preview;
