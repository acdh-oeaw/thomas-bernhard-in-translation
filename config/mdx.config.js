/** @typedef {import('@mdx-js/mdx').CompileOptions} CompileOptions */

import withSyntaxHighlighter from "@shikijs/rehype";
import withFrontmatter from "remark-frontmatter";
import withGfm from "remark-gfm";
import withMdxFrontmatter from "remark-mdx-frontmatter";
import withTypographicQuotes from "remark-smartypants";

import { config as syntaxHighlighterConfig } from "./syntax-highlighter.config.js";

/** @type {() => Promise<CompileOptions>} */
export function createConfig() {
	/** @type {CompileOptions} */
	const config = {
		remarkPlugins: [withFrontmatter, withMdxFrontmatter, withGfm, withTypographicQuotes],
		rehypePlugins: [[withSyntaxHighlighter, syntaxHighlighterConfig]],
	};

	return Promise.resolve(config);
}
