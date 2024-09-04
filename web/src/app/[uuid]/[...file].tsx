import { prisma } from "@/lib/prisma";
import { GetServerSideProps } from "next";
import { parse } from "node-html-parser";
import Script from "next/script"; // Import Next.js Script component

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { uuid, file } = context.params!;
	const filePath = Array.isArray(file) ? file.join("/") : file;

	const project = await prisma.project.findUnique({
		where: { uuid: uuid as string },
		include: { files: true },
	});

	if (!project) {
		return {
			notFound: true,
		};
	}

	const targetFile = project.files.find((f) => f.name === filePath);
	if (!targetFile) {
		return {
			notFound: true,
		};
	}

	return {
		props: {
			project,
			file: targetFile,
			isRaw: context.resolvedUrl.includes("/raw/"),
		},
	};
};

const RenderFile = ({ project, file, isRaw }: any) => {
	if (isRaw) {
		return (
			<pre>
				<code>{file.content}</code>
			</pre>
		);
	}

	if (file.type === "html") {
		const root = parse(file.content);
		const linkedCssFiles = new Set<string>();
		const linkedJsFiles = new Set<string>();

		// Find all linked CSS files in the <link> tags
		root.querySelectorAll('link[rel="stylesheet"]').forEach(
			(linkElement) => {
				const href = linkElement.getAttribute("href");
				if (href) {
					linkedCssFiles.add(href);
				}
			}
		);

		// Find all linked JS files in the <script> tags
		root.querySelectorAll("script[src]").forEach((scriptElement) => {
			const src = scriptElement.getAttribute("src");
			if (src) {
				linkedJsFiles.add(src);
			}
		});

		return (
			<div>
				{Array.from(linkedCssFiles).map((href: string) => {
					const cssFile = project.files.find((f: any) =>
						href.endsWith(f.name)
					);
					if (cssFile) {
						return (
							<link
								key={cssFile.name}
								rel="stylesheet"
								href={`/project/${project.uuid}/${cssFile.name}`}
							/>
						);
					}
					return null;
				})}

				<div dangerouslySetInnerHTML={{ __html: file.content }} />

				{Array.from(linkedJsFiles).map((src: string) => {
					const jsFile = project.files.find((f: any) =>
						src.endsWith(f.name)
					);
					if (jsFile) {
						return (
							<Script
								key={jsFile.name}
								src={`/project/${project.uuid}/${jsFile.name}`}
								async // Ensure scripts are loaded asynchronously
							/>
						);
					}
					return null;
				})}
			</div>
		);
	}

	return null;
};

export default RenderFile;
