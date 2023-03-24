import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Node, Parent, Data } from "unist";
import { toString } from "mdast-util-to-string";

const infoIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
const pencilIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="2" x2="22" y2="6"></line><path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"></path></svg>`;
const clipboardListIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>`;
const checkCircleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>`;
const flameIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`;
const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
const helpCircleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
const alertTriangleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
const xIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
const zapIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;
const bugIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="14" x="8" y="6" rx="4"></rect><path d="m19 7-3 2"></path><path d="m5 7 3 2"></path><path d="m19 19-3-2"></path><path d="m5 19 3-2"></path><path d="M20 13h-4"></path><path d="M4 13h4"></path><path d="m10 4 1 2"></path><path d="m14 4-1 2"></path></svg>`;
const listIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`;
const quoteIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path></svg>`;

/**
 * Callout object with callout type as its key and icon as its value
 * @date 3/23/2023 - 5:16:27 PM
 *
 * @typedef {Callout}
 */
type Callout = Record<string, unknown>;

interface HtmlNode extends Node {
  type: "html";
  data: Data;
  value: string;
}

/**
 * Plugin configuration
 * @date 3/23/2023 - 5:16:27 PM
 *
 * @export
 * @interface Config
 * @typedef {Config}
 */
export interface Config {
  /**
   * the data attribute name to be added to the blockquote
   * @date 3/23/2023 - 5:16:26 PM
   *
   * @type {string}
   */
  dataAttribute: string;
  /**
   * the custom class name to be added to the blockquote, by default it's `${dataAttribute}-${calloutType}` if not specified
   * @date 3/23/2023 - 5:16:26 PM
   *
   * @type {string | undefined}
   */
  blockquoteClass: string | undefined;
  /**
   * the custom class name to be added to the div, the parent element of icon & title text
   * @date 3/23/2023 - 5:16:26 PM
   *
   * @type {string}
   */
  titleClass: string;
  /**
   * the tag name for the title text element, default to `div`
   * @date 3/23/2023 - 5:16:26 PM
   *
   * @type {string}
   */
  titleTextTagName: string;
  /**
   * the custom class name to be added to the title text element
   * @date 3/23/2023 - 5:16:26 PM
   *
   * @type {string}
   */
  titleTextClass: string;
  /**
   * a function to transform the title text, you can use it to append custom strings
   * @date 3/23/2023 - 5:16:26 PM
   *
   * @type {(title: string) => string}
   */
  titleTextTransform: (title: string) => string;
  /**
   * the tag name for the title icon element, default to `div`
   * @date 3/23/2023 - 5:16:26 PM
   *
   * @type {string}
   */
  iconTagName: string;
  /**
   * the custom class name to be added to the title icon element
   * @date 3/23/2023 - 5:16:26 PM
   *
   * @type {string}
   */
  iconClass: string;
  /**
   * predefined callouts, an object with callout's name as key, its SVG icon as value,
   *
   * see https://help.obsidian.md/Editing+and+formatting/Callouts#Supported+types,
   *
   * you can customize it by overriding the same callout's icon or passing new callout with customized name and icon
   * @date 3/23/2023 - 5:16:26 PM
   *
   * @type {Record<string, unknown>}
   */
  callouts: Record<string, unknown>;
}

/**
 * Default configuration
 * @date 3/23/2023 - 5:16:26 PM
 *
 * @type {Config}
 */
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

const REGEX = /^\[\!(\w+)\]([+-]?)/;

/**
 * Check if the str is a valid callout type
 * @date 3/23/2023 - 5:16:26 PM
 *
 * @param {Callout} obj
 * @param {string} str
 * @returns {boolean}
 */
function containsKey(obj: Callout, str: string): boolean {
  return Object.keys(obj).includes(str);
}

/**
 * This is a remark plugin that parses Obsidian's callout syntax, and adds custom data attributes and classes to the HTML elements for further customizations.
 * @date 3/23/2023 - 5:16:26 PM
 *
 * @param {?Partial<Config>} [customConfig]
 * @returns {(tree: any) => void}
 */
const plugin: Plugin = (customConfig?: Partial<Config>) => {
  const mergedConfig = {
    ...defaultConfig,
    ...customConfig,
    callouts: {
      ...defaultConfig.callouts,
      ...customConfig?.callouts,
    },
  };

  const {
    dataAttribute,
    blockquoteClass,
    titleClass,
    iconTagName,
    iconClass,
    callouts,
    titleTextClass,
    titleTextTagName,
    titleTextTransform,
  } = mergedConfig;

  return function (tree) {
    visit(tree, "blockquote", (node: Node) => {
      if (!("children" in node)) return;

      const firstChild = (node as Parent).children[0];

      if (firstChild.type === "paragraph") {
        const value = toString(firstChild);

        const [firstLine, ...remainingLines] = value.split("\n");
        const remainingContent = remainingLines.join("\n");

        const matched = firstLine.match(REGEX);

        if (matched) {
          const array = REGEX.exec(firstLine);

          const calloutType = array?.at(1);

          const expandCollapseSign = array?.at(2);

          if (array && calloutType && containsKey(callouts, calloutType)) {
            const title = array.input.slice(matched[0].length).trim();

            const titleHtmlNode: HtmlNode = {
              type: "html",
              data: {},
              value: `
              <div class="${titleClass}">
                <${iconTagName} class="${iconClass}">${
                callouts[calloutType]
              }</${iconTagName}>
             ${
               title &&
               `<${titleTextTagName} class="${titleTextClass}">${titleTextTransform(
                 title
               )}</${titleTextTagName}>`
             }
              </div>
              <div>${remainingContent}</div>`,
            };

            (node as Parent).children.splice(0, 1, titleHtmlNode);

            const dataExpandable = Boolean(expandCollapseSign);
            const dataExpanded = expandCollapseSign === "+";

            node.data = {
              hProperties: {
                ...((node.data && node.data.hProperties) || {}),
                className: blockquoteClass || `${dataAttribute}-${calloutType}`,
                [`data-${dataAttribute}`]: calloutType,
                "data-expandable": String(dataExpandable),
                "data-expanded": String(dataExpanded),
              },
            };
          }
        }
      }
    });
  };
};

export default plugin;
