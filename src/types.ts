import type { Node, Data } from "unist";

export interface HtmlNode extends Node {
  type: "html";
  data: Data;
  value: string;
}

export interface Config {
  dataAttribute: string;
  blockquoteClass: string | undefined;
  titleClass: string;
  titleTextTagName: string;
  titleTextClass: string;
  titleTextTransform: (title: string) => string;
  iconTagName: string;
  iconClass: string;
}
