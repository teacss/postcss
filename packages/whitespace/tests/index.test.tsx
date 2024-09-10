import { afterEach, beforeEach, expect, test } from "bun:test";
import assert from "node:assert";
import React, { act } from "react";
import { createRoot } from "react-dom/client";

const App = () => {
  return (
    <div role="main">
      <article>
        <h3>Welcome to Bun!</h3>
      </article>
    </div>
  );
};

let container: HTMLDivElement | null = null;

beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  if (container) {
    document.body.removeChild(container);
    container = null;
  }
});

test("App", () => {
  act(() => {
    createRoot(container!).render(<App />);
  });

  expect(container?.children[0].innerHTML).toMatchSnapshot();
  assert(container);

  const article = container!.querySelector("article");
  expect(article?.children.length).toBe(1);
});
