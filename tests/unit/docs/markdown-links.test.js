import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { checkMarkdownLinks, extractInlineMarkdownLinks } from "../../../scripts/check-markdown-links.mjs";

test("extracts inline links and ignores fenced and inline code", () => {
  const markdown = [
    "[guide](./Guide.md) and ![image](assets/picture.png)",
    "`[not a link](missing.md)`",
    "```md",
    "[example](also-missing.md)",
    "```",
    "[angle](<./folder name/page.md>)",
  ].join("\n");
  assert.deepEqual(extractInlineMarkdownLinks(markdown), [
    { destination: "./Guide.md", line: 1 },
    { destination: "assets/picture.png", line: 1 },
    { destination: "./folder name/page.md", line: 6 },
  ]);
});

test("checks local paths, percent encoding, exact case and missing targets", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "wave-markdown-links-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "docs"), { recursive: true });
  await writeFile(path.join(root, "docs", "Guide.md"), "# Guide\n");
  await writeFile(path.join(root, "docs", "Space Name.md"), "# Space\n");
  await writeFile(path.join(root, "README.md"), [
    "[good](docs/Guide.md)",
    "[encoded](docs/Space%20Name.md)",
    "[case](docs/guide.md)",
    "[missing](docs/missing.md)",
    "[external](https://example.com/docs)",
    "[anchor](#top)",
  ].join("\n"));
  const problems = await checkMarkdownLinks(root);
  assert.deepEqual(problems.map(({ line, destination, reason, actual }) => ({ line, destination, reason, actual })), [
    { line: 3, destination: "docs/guide.md", reason: "path casing does not match", actual: "docs/Guide.md" },
    { line: 4, destination: "docs/missing.md", reason: "target does not exist", actual: undefined },
  ]);
});

test("repository Markdown links remain valid", async () => {
  const problems = await checkMarkdownLinks(process.cwd());
  assert.deepEqual(problems, problems.slice(0, 0), problems.map((p) => `${p.file}:${p.line} ${p.destination} — ${p.reason}`).join("\n"));
});
