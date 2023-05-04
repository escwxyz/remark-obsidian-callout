# remark-emoji-callout

A remark plugin to parse @readme/markdown callout syntax.

## What is this

This is a [remark](https://github.com/remarkjs/remark) plugin that parses [Readme's callout](https://docs.readme.com/rdmd/docs/callouts) syntax.

## Why

Because the `@mollify` team prefer this syntax to Obsidian, but didn't want to use `rdmd` for the whole project.

## How to use

### Installation

First, install the plugin with your favorite package manager.

With `npm`:

```
npm install remark-emoji-callout --save-dev
```

or with `pnpm`:

```
pnpm add -D remark-emoji-callout
```

Then in your `svelte.config.js` config file:

```js
// ...
import { mdsvex } from 'mdsvex';
import callouts from "remark-emoji-callout";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [
		vitePreprocess(),
		mdsvex({
			highlight: {},
			extensions: ['.md'],
			remarkPlugins: [callouts]
		})
	],
  // ...
}
```

Now we can run the dev server with `npm run dev`.

Say if we want to render an error callout with:

```
> ⚠️ This is an error callout
> This is the content inside callout
```

The callout would be rendered as something like this:

```html
<blockquote
  class="callout ⚠️"
  data-callout="⚠️"
>
  <div class="callout-title">
    <span class="callout-title-icon">
      ⚠️
    </span>
    <span class="callout-title-text">This is an error callout</span>
  </div>
  <div>This is the content inside callout</div>
</blockquote>
```

Now you can customize the callout with some CSS or JavaScript for example:

```css
blockquote[data-callout] {
  padding: 1rem;
  border-radius: 1rem;
}

blockquote.⚠️ {
  background-color: red;
}
```

### Configuration

To configure the plugin, simply add the following options to your `svelte.config.mjs` file. For example:

```js
// ...
import { mdsvex } from 'mdsvex';
import callouts from "remark-emoji-callout";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [
		vitePreprocess(),
		mdsvex({
			highlight: {},
			extensions: ['.md'],
			remarkPlugins: [
        callouts,
        {
          dataAttribute: "custom-callout",
          titleTextTagName: "span",
          iconTagName: "span",
          // ...
        }
      ]
		})
	],
  // ...
}
```

Config Options:

```ts
export interface Config {
  // the data attribute name to be added to the blockquote
  dataAttribute: string;
  // the custom class name to be added to the blockquote, by default it's `${dataAttribute}-${calloutType}` if not specified
  blockquoteClass: string | undefined;
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
}
// default configs
const defaultConfig: Config = {
  dataAttribute: "callout",
  blockquoteClass: "callout",
  titleClass: "callout-title",
  titleTextTagName: "span",
  titleTextClass: "callout-title-text",
  titleTextTransform: (title: string) => title?.trim() || "",
  iconTagName: "span",
  iconClass: "callout-title-icon",
};
```

## Support

If you have any questions or suggestions, feel free to open an issue.

## Credits

Thanks to [remark-obsidian-callout](https://github.com/escwxyz/remark-obsidian-callout) for providing the basis for this fork.

## License

The source code is licensed under the Apache 2.0 License, while the builtin icons from [Lucide](https://lucide.dev/license) are licensed under the ISC License.
