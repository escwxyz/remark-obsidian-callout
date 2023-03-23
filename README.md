### What is this

This is a [remark](https://github.com/remarkjs/remark) plugin that parses [Obsidian's callout](https://help.obsidian.md/Editing+and+formatting/Callouts) syntax, and adds custom data attributes and classes to the HTML elements for further customizations.

### Why

Because I am currently building my digital garden using [Astro](https://astro.build/) and Obsidian. Despite the great support for the Markdown that Astro brings, we still need to some work to customize the rendered output.

### How to use

#### Installation

First, install the plugin with your favorite package manager:

```
npm install remark-obsidian-callout --save-dev
```

or with `pnpm`:

```
pnpm add -D remark-obsidian-callout
```

Then in your `astro.config.mjs` config file:

```js
import remarkObsidianCallout from "remark-obsidian-callout";

export default defineConfig({
  // ...
  markdown: {
    // ...
    remarkPlugins: [
      // ...
      remarkObsidianCallout,
    ],
  },
  // ...
});
```

Now we can run the dev server with `pnpm astro dev`.

Say if we are to render an error callout with:

```
> [!error] This is an error callout
> This is the content inside callout
```

in the markdown file.

The callout would be rendered as something like this:

```html
<blockquote
  class="callout-error"
  data-callout="error"
  data-expandable="false"
  data-expanded="false"
>
  <div class="callout-title">
    <div class="callout-title-icon">
      <!-- Predefined SVG here -->
    </div>
    <div class="callout-title-text">This is an error callout</div>
  </div>
  <div>This is the content inside callout</div>
</blockquote>
```

#### Configuration

To configure the plugin, simply add the following options to your `astro.config.mjs` file. For example:

```js
import remarkObsidianCallout from "remark-obsidian-callout";

export default defineConfig({
  // ...
  markdown: {
    // ...
    remarkPlugins: [
      // ...
      [
        remarkObsidianCallout,
        {
          dataAttribute: "custom-callout",
          titleTextTagName: "span",
          iconTagName: "span",
          // ...
        },
      ],
    ],
  },
  // ...
});
```

Config Options:

```ts
export interface Config {
  // the data attribute name to be added to the blockquote
  dataAttribute: string;
  // the custom class name to be added to the blockquote, if not specified, use `${dataAttribute}-${calloutType}`
  blockquoteClass?: string;
  // the custom class name to be added to the div, the parent element of icon & title text
  titleClass: string;
  // the tag name for the title text element, default to `div`
  titleTextTagName: string;
  // the custom class name to be added to the title text element
  titleTextClass: string;
  // a function to transform the title text, you can use it to append custom strings
  titleTextTransform: (title: string) => string;
  // the tag name for the title icon element, default to `div`
  iconTagName: string;
  // the custom class name to be added to the title icon element
  iconClass: string;
  // predefined callouts, an object with callout's name as key, its SVG icon as value
  // see https://help.obsidian.md/Editing+and+formatting/Callouts#Supported+types
  // you can customize it by overriding the same callout's icon or passing new callout with customized name and icon
  callouts: Record<string, unknown>;
}
// default configs
const defaultConfig: Config = {
  dataAttribute: "callout",
  blockquoteClass: undefined,
  titleClass: "callout-title",
  titleTextTagName: "div",
  titleTextClass: "callout-title-text",
  titleTextTransform: (title: string) => title.trim(),
  iconTagName: "div",
  iconClass: "callout-title-icon",
  callouts: {
    note: pencilIcon,
    abstract: clipboardListIcon,
    summary: clipboardListIcon,
    tldr: clipboardListIcon,
    info: infoIcon,
    todo: checkCircleIcon,
    tip: flameIcon,
    hint: flameIcon,
    important: flameIcon,
    success: checkIcon,
    check: checkIcon,
    done: checkIcon,
    question: helpCircleIcon,
    help: helpCircleIcon,
    faq: helpCircleIcon,
    warning: alertTriangleIcon,
    attention: alertTriangleIcon,
    cautions: alertTriangleIcon,
    failure: xIcon,
    missing: xIcon,
    fail: xIcon,
    danger: zapIcon,
    error: zapIcon,
    bug: bugIcon,
    example: listIcon,
    quote: quoteIcon,
    cite: quoteIcon,
  },
};
```

### TODOs & Limitations

- [ ] Currently does not support nested callouts, as the usecase of this should be uncommon

### Credits

Thanks to [remark-github-beta-blockquote-admonitions](https://github.com/myl7/remark-github-beta-blockquote-admonitions) for guidance on how to set up testing.
