import { join } from "node:path";

import { notFound } from "next/navigation";
import rehypeExternalLinks from "rehype-external-links";
import toHtml from "rehype-stringify";
import fromMarkdown from "remark-parse";
import toHast from "remark-rehype";
import { read } from "to-vfile";
import { unified } from "unified";

import { Image } from "@/components/image";
import { Link } from "@/components/link";
import { MainContent } from "@/components/main-content";
import type { Locale } from "@/config/i18n.config";
import forschungsstelle from "@/public/assets/images/forschungsstelle.png";
import itbg from "@/public/assets/images/itbg.png";
import suhrkamp from "@/public/assets/images/suhrkamp.png";

const processor = unified()
	.use(fromMarkdown)
	.use(toHast)
	.use(rehypeExternalLinks, { target: "_blank" })
	.use(toHtml);

interface AboutPageProps {
	params: {
		locale: Locale;
	};
}

export default async function AboutPage(props: AboutPageProps) {
	const locale = props.params.locale;
	try {
		const filePath = join(process.cwd(), "content", locale, "about.md");

		const vfile = await read(filePath);
		const result = await processor.process(vfile);
		return (
			<MainContent className="mx-auto w-full max-w-screen-lg p-4">
				<section dangerouslySetInnerHTML={{ __html: String(result) }} className="prose" />
				<div className="flex flex-row flex-wrap items-center justify-center">
					<div className="mt-3 flex flex-col items-center gap-3">
						<Link href="https://www.suhrkamp.de/" target="_blank">
							<Image
								alt="Suhrkamp Verlag Logo"
								className="w-44 max-w-full dark:invert"
								src={suhrkamp}
							/>
						</Link>
						<Link
							href="https://thomasbernhard.at/internationale-thomas-bernhard-gesellschaft/"
							target="_blank"
						>
							<Image
								alt="Internationale Thomas Bernhard Gesellschaft Logo"
								className="w-80 max-w-full dark:invert"
								src={itbg}
							/>
						</Link>
					</div>
					<Link
						href="https://www.oeaw.ac.at/acdh/research/literary-textual-studies/research/authors-editions/ftb-thomas-bernhard-research-centre"
						target="_blank"
					>
						<Image
							alt="Forschungsstelle Thomas Bernhard Logo"
							className="w-52 max-w-full dark:invert"
							src={forschungsstelle}
						/>
					</Link>
				</div>
			</MainContent>
		);

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		notFound();
	}
}
