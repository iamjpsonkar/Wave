#!/usr/bin/env node
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const IGNORED_DIRECTORIES = new Set([".git", "node_modules", "dist", "coverage", "test-results", "playwright-report", "history"]);

async function walkMarkdown(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRECTORIES.has(entry.name)) {
        files.push(...await walkMarkdown(root, path.join(directory, entry.name)));
      }
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push(path.relative(root, path.join(directory, entry.name)).split(path.sep).join("/"));
    }
  }
  return files;
}

function withoutCode(markdown) {
  let fence = null;
  return markdown.split(/\r?\n/).map((line) => {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (marker) {
      const token = marker[1];
      if (!fence) fence = { char: token[0], length: token.length };
      else if (token[0] === fence.char && token.length >= fence.length) fence = null;
      return "";
    }
    if (fence) return "";
    return line.replace(/(`+).*?\1/g, "");
  });
}

export function extractInlineMarkdownLinks(markdown) {
  const links = [];
  const lines = withoutCode(markdown);
  lines.forEach((line, index) => {
    let cursor = 0;
    while (cursor < line.length) {
      const open = line.indexOf("](", cursor);
      if (open < 0) break;
      const labelStart = line.lastIndexOf("[", open);
      if (labelStart < 0 || (labelStart > 0 && line[labelStart - 1] === "\\")) {
        cursor = open + 2;
        continue;
      }
      let start = open + 2;
      while (/\s/.test(line[start] || "")) start++;
      let destination = "";
      let end = start;
      if (line[start] === "<") {
        const close = line.indexOf(">", start + 1);
        if (close < 0) { cursor = open + 2; continue; }
        destination = line.slice(start + 1, close);
        end = close + 1;
      } else {
        let depth = 0;
        while (end < line.length) {
          const char = line[end];
          if (char === "\\" && end + 1 < line.length) { end += 2; continue; }
          if (char === "(") depth++;
          else if (char === ")") {
            if (depth === 0) break;
            depth--;
          } else if (/\s/.test(char) && depth === 0) break;
          end++;
        }
        destination = line.slice(start, end);
      }
      if (destination) links.push({ destination: destination.replace(/\\([()\\ ])/g, "$1"), line: index + 1 });
      cursor = Math.max(end + 1, open + 2);
    }
  });
  return links;
}

function classifyExternal(destination) {
  return !destination || destination.startsWith("#") || destination.startsWith("//") ||
    /^(?:[a-z][a-z0-9+.-]*:)/i.test(destination);
}

async function inspectTarget(root, source, destination) {
  if (classifyExternal(destination)) return null;
  let decoded;
  try { decoded = decodeURIComponent(destination); }
  catch { return { reason: "invalid percent-encoding" }; }
  const pathOnly = decoded.split(/[?#]/, 1)[0];
  if (!pathOnly) return null;
  const sourceDirectory = path.posix.dirname(source);
  const joined = pathOnly.startsWith("/") ? pathOnly.slice(1) : path.posix.join(sourceDirectory === "." ? "" : sourceDirectory, pathOnly);
  const segments = [];
  for (const segment of joined.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      if (!segments.length) return { reason: "target escapes the repository" };
      segments.pop();
    } else segments.push(segment);
  }
  if (!segments.length) return null;
  let current = root;
  const actual = [];
  for (const segment of segments) {
    let names;
    try { names = await readdir(current); }
    catch { return { target: segments.join("/"), reason: "parent directory does not exist" }; }
    if (names.includes(segment)) {
      actual.push(segment);
      current = path.join(current, segment);
      continue;
    }
    const caseMatch = names.find((name) => name.toLowerCase() === segment.toLowerCase());
    if (caseMatch) return { target: segments.join("/"), actual: [...actual, caseMatch].join("/"), reason: "path casing does not match" };
    return { target: segments.join("/"), reason: "target does not exist" };
  }
  try { await stat(current); return null; }
  catch { return { target: segments.join("/"), reason: "target does not exist" }; }
}

export async function checkMarkdownLinks(root = process.cwd()) {
  const absoluteRoot = path.resolve(root);
  const markdownFiles = (await walkMarkdown(absoluteRoot)).sort();
  const problems = [];
  for (const source of markdownFiles) {
    const content = await readFile(path.join(absoluteRoot, source), "utf8");
    for (const link of extractInlineMarkdownLinks(content)) {
      const issue = await inspectTarget(absoluteRoot, source, link.destination);
      if (issue) problems.push({ file: source, line: link.line, destination: link.destination, ...issue });
    }
  }
  return problems;
}

async function main() {
  const problems = await checkMarkdownLinks();
  if (problems.length) {
    console.error(`Found ${problems.length} broken local Markdown link(s):`);
    for (const problem of problems) {
      const detail = problem.actual ? ` (actual path: ${problem.actual})` : "";
      console.error(`- ${problem.file}:${problem.line}: ${problem.destination} — ${problem.reason}${detail}`);
    }
    process.exitCode = 1;
    return;
  }
  console.log("All inline local Markdown links resolve with exact path casing.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main();
}
