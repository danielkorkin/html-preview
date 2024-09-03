import { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { uuid } = context.params!;
	const project = await prisma.project.findUnique({
		where: { id: uuid as string },
		include: { files: true },
	});

	if (!project) {
		return {
			notFound: true,
		};
	}

	return {
		props: {
			files: project.files,
		},
	};
};

const RenderFile = ({ files }: any) => {
	const htmlFile = files.find((file: any) => file.type === "html");
	const cssFiles = files.filter((file: any) => file.type === "css");
	const jsFiles = files.filter((file: any) => file.type === "js");

	return (
		<div>
			<style>
				{cssFiles.map((file: any) => file.content).join("\n")}
			</style>
			<div dangerouslySetInnerHTML={{ __html: htmlFile.content }} />
			{jsFiles.map((file: any) => (
				<script
					key={file.name}
					dangerouslySetInnerHTML={{ __html: file.content }}
				/>
			))}
		</div>
	);
};

export default RenderFile;
