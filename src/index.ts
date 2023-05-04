import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Node, Parent } from "unist";
import { toString } from "mdast-util-to-string";
import emojiRegex from "emoji-regex";
import { HtmlNode, Config } from "./types";

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

const REGEX = /^(\S+)(?:\s+(\S+))?(?:\s+(.*))?/;

const plugin: Plugin = (customConfig?: Partial<Config>) => {
  const mergedConfig = {
    ...defaultConfig,
    ...customConfig,
  };

  const {
    dataAttribute,
    blockquoteClass,
    titleClass,
    iconTagName,
    iconClass,
    titleTextClass,
    titleTextTagName,
    titleTextTransform,
  } = mergedConfig;

  return function (tree) {
    visit(tree, "blockquote", (node: Node) => {
      if (!("children" in node) || (node as Parent).children.length == 0)
        return;

      const firstChild = (node as Parent).children[0];

      if (firstChild.type === "paragraph") {
        const value = toString(firstChild);

        const [firstLine, ...remainingLines] = value.split("\n");
        const remainingContent = remainingLines.join("\n");

        const matched = firstLine.match(REGEX);

        if (matched) {
          const emojiCode = matched[1] || "";
          const title = matched[2]?.trim() || "";

          // Check if the first character is an emoji
          const isEmoji = emojiRegex().test(emojiCode);

          if (isEmoji) {
            const titleHtmlNode: HtmlNode = {
              type: "html",
              data: {},
              value: `
                <div class="${titleClass}">
                  <${iconTagName} class="${iconClass}">${emojiCode}</${iconTagName}>
               ${
                 title &&
                 `<${titleTextTagName} class="${titleTextClass}">${titleTextTransform(
                   title
                 )}</${titleTextTagName}>`
               }
                </div>
                ${remainingContent && `<div>${remainingContent}</div>`}`,
            };

            (node as Parent).children.splice(0, 1, titleHtmlNode);

            node.data = {
              hProperties: {
                ...((node.data && node.data.hProperties) || {}),
                className: `${blockquoteClass} ${emojiCode}`, // Set the className to the emojiCode
                [`data-${dataAttribute}`]: emojiCode,
              },
            };
          }
        }
      }
    });
  };
};

export default plugin;
