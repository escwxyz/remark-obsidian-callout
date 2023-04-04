import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeRaw from "rehype-raw";
import plugin, { Config } from "../src/index";
import { it, expect, describe } from "vitest";
import { infoIcon, pencilIcon } from "../src/icons";

function normalizeHtml(html: string): string {
  return html.replace(/[\n\s]*(<)|>([\n\s]*)/g, (match, p1, p2) =>
    p1 ? "<" : ">"
  );
}

async function parseMarkdown(
  md: string,
  options?: Partial<Config>,
  debug?: boolean
) {
  const processor = unified()
    .use(remarkParse)
    .use(plugin, options)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify);

  if (debug) {
    const remarkOutput = await processor.run(processor.parse(md));
    console.log("Remark output:", JSON.stringify(remarkOutput, null, 2));
  }

  const output = String(await processor.process(md));

  if (debug) {
    console.log("HTML output:\n" + normalizeHtml(output) + "\n");
  }

  return output;
}

describe("test default behavior", () => {
  const noteInput = `> [!note] This is a note callout.
  > This is the content!`;
  const noContentNoteInput = `> [!note] This is a note callout.`;

  const expandedNoteInput = `> [!note]+This is a note callout.
  > This is the content!`;

  const collapsedNoteInput = `> [!note]- This is a note callout.
  > This is the content!`;

  const infoInput = `> [!info] This is an info callout.`;

  it("should ignore empty blockquote", async () => {
    const html = await parseMarkdown("> ", {}, false);
    const expectedOutput = `<blockquote></blockquote>`;
    expect(normalizeHtml(html)).toBe(normalizeHtml(expectedOutput));
  });

  it("should render a note blockquote", async () => {
    const html = await parseMarkdown(noteInput, {}, false);
    const expectedOutput = `
    <blockquote class="callout-note" data-callout="note" data-expandable="false" data-expanded="false">
      <div class="callout-title">
        <div class="callout-title-icon">${pencilIcon}</div>
        <div class="callout-title-text">This is a note callout.</div>
      </div>
      <div>This is the content!</div>
    </blockquote>`;

    expect(normalizeHtml(html)).toBe(normalizeHtml(expectedOutput));
  });

  it("should render a blank div when there is no content", async () => {
    const html = await parseMarkdown(noContentNoteInput, {}, false);

    const expectedOutput = `
  <blockquote class="callout-note" data-callout="note" data-expandable="false" data-expanded="false">
    <div class="callout-title">
      <div class="callout-title-icon">${pencilIcon}</div>
      <div class="callout-title-text">This is a note callout.</div>
    </div>
  </blockquote>`;

    expect(normalizeHtml(html)).toBe(normalizeHtml(expectedOutput));
  });

  it("should not render callout title if there is none", async () => {
    const input = `> [!note]
  > This is the content!`;

    const html = await parseMarkdown(input, {}, false);

    const expectedOutput = `
  <blockquote class="callout-note" data-callout="note" data-expandable="false" data-expanded="false">
    <div class="callout-title">
      <div class="callout-title-icon">${pencilIcon}</div>
    </div>
    <div>This is the content!</div>
  </blockquote>`;

    expect(normalizeHtml(html)).toBe(normalizeHtml(expectedOutput));
  });

  it("should render blockquote with data-expandable true and data-expanded true when with + symbol", async () => {
    const html = await parseMarkdown(expandedNoteInput, {}, false);

    const expectedOutput = `
  <blockquote class="callout-note" data-callout="note" data-expandable="true" data-expanded="true">
    <div class="callout-title">
      <div class="callout-title-icon">${pencilIcon}</div>
      <div class="callout-title-text">This is a note callout.</div>
    </div>
    <div>This is the content!</div>
  </blockquote>`;

    expect(normalizeHtml(html)).toBe(normalizeHtml(expectedOutput));
  });

  it("should render blockquote with data-expandable true and data-expanded false when with - symbol", async () => {
    const html = await parseMarkdown(collapsedNoteInput, {}, false);

    const expectedOutput = `
  <blockquote class="callout-note" data-callout="note" data-expandable="true" data-expanded="false">
    <div class="callout-title">
      <div class="callout-title-icon">${pencilIcon}</div>
      <div class="callout-title-text">This is a note callout.</div>
    </div>
    <div>This is the content!</div>
  </blockquote>`;

    expect(normalizeHtml(html)).toBe(normalizeHtml(expectedOutput));
  });

  it("should render different callout type", async () => {
    const html = await parseMarkdown(infoInput, {}, false);

    const expectedOutput = `
  <blockquote class="callout-info" data-callout="info" data-expandable="false" data-expanded="false">
    <div class="callout-title">
      <div class="callout-title-icon">${infoIcon}</div>
      <div class="callout-title-text">This is an info callout.</div>
    </div>
  </blockquote>`;

    expect(normalizeHtml(html)).toBe(normalizeHtml(expectedOutput));
  });

  it("should fail when nested callouts", async () => {
    const nestedInput = `> [!note] This is a note callout.
   >> [!note] This is a nested callout.`;

    const html = await parseMarkdown(nestedInput, {}, false);

    const expectedOutput = `
  <blockquote class="callout-note" data-callout="note" data-expandable="false" data-expanded="false">
    <div class="callout-title">
      <div class="callout-title-icon">${pencilIcon}</div>
      <div class="callout-title-text">This is a note callout.</div>
    </div>
    <div>
      <div class="callout-title">
        <div class="callout-title-icon">${pencilIcon}</div>
        <div class="callout-title-text">This is a nested callout.</div>
      </div>
      <div></div>
    </div>
  </blockquote>`;

    expect(normalizeHtml(html)).not.toBe(normalizeHtml(expectedOutput));
  });
});

describe("test custom settings", () => {
  const noteInput = `> [!note] This is a note callout.
  > This is the content!`;

  it("should render span tags for title and text", async () => {
    const html = await parseMarkdown(
      noteInput,
      {
        titleTextTagName: "span",
        iconTagName: "span",
      },
      false
    );

    const expectedOutput = `
    <blockquote class="callout-note" data-callout="note" data-expandable="false" data-expanded="false">
      <div class="callout-title">
        <span class="callout-title-icon">${pencilIcon}</span>
        <span class="callout-title-text">This is a note callout.</span>
      </div>
      <div>This is the content!</div>
    </blockquote>`;

    expect(normalizeHtml(html)).toBe(normalizeHtml(expectedOutput));
  });

  it("should render blockquote with data-custom-callout attribute", async () => {
    const html = await parseMarkdown(
      noteInput,
      {
        dataAttribute: "custom-callout",
      },
      false
    );
    const expectedOutput = `
  <blockquote class="custom-callout-note" data-custom-callout="note" data-expandable="false" data-expanded="false">
    <div class="callout-title">
      <div class="callout-title-icon">${pencilIcon}</div>
      <div class="callout-title-text">This is a note callout.</div>
    </div>
    <div>This is the content!</div>
  </blockquote>`;

    expect(normalizeHtml(html)).toBe(normalizeHtml(expectedOutput));
  });

  it("should render blockquote with custom class names", async () => {
    const html = await parseMarkdown(
      noteInput,
      {
        blockquoteClass: "custom-callout-block",
      },
      false
    );

    const expectedOutput = `
  <blockquote class="custom-callout-block" data-callout="note" data-expandable="false" data-expanded="false">
    <div class="callout-title">
      <div class="callout-title-icon">${pencilIcon}</div>
      <div class="callout-title-text">This is a note callout.</div>
    </div>
    <div>This is the content!</div>
  </blockquote>`;

    expect(normalizeHtml(html)).toBe(normalizeHtml(expectedOutput));
  });

  it("should allow modify default class names for text and icon", async () => {
    const html = await parseMarkdown(
      noteInput,
      {
        titleTextClass: "custom-title-text",
        iconClass: "custom-title-icon",
      },
      false
    );

    const expectedOutput = `
  <blockquote class="callout-note" data-callout="note" data-expandable="false" data-expanded="false">
    <div class="callout-title">
      <div class="custom-title-icon">${pencilIcon}</div>
      <div class="custom-title-text">This is a note callout.</div>
    </div>
    <div>This is the content!</div>
  </blockquote>`;

    expect(normalizeHtml(html)).toBe(normalizeHtml(expectedOutput));
  });

  it("should allow to override icons", async () => {
    const icon = `😊`;

    const html = await parseMarkdown(
      noteInput,
      {
        callouts: {
          note: icon,
        },
      },
      false
    );

    const expectedOutput = `
    <blockquote class="callout-note" data-callout="note" data-expandable="false" data-expanded="false">
      <div class="callout-title">
        <div class="callout-title-icon">${icon}</div>
        <div class="callout-title-text">This is a note callout.</div>
      </div>
      <div>This is the content!</div>
    </blockquote>`;

    expect(normalizeHtml(html)).toBe(normalizeHtml(expectedOutput));
  });

  it("should allow to custom callout type", async () => {
    const customInput = `> [!custom] This is a custom callout.
   > This is the content!`;

    const customIcon = `😭`;

    const html = await parseMarkdown(
      customInput,
      {
        callouts: {
          custom: customIcon,
        },
      },
      false
    );

    const expectedOutput = `
    <blockquote class="callout-custom" data-callout="custom" data-expandable="false" data-expanded="false">
      <div class="callout-title">
        <div class="callout-title-icon">${customIcon}</div>
        <div class="callout-title-text">This is a custom callout.</div>
      </div>
      <div>This is the content!</div>
    </blockquote>`;

    expect(normalizeHtml(html)).toBe(normalizeHtml(expectedOutput));
  });
});
