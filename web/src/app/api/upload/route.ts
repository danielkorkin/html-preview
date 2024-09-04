import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const { files, projectId } = await req.json();

	if (!projectId || !files) {
		return NextResponse.json({ error: "Invalid input" }, { status: 400 });
	}

	try {
		let project = await prisma.project.findUnique({
			where: { id: projectId },
		});

		if (!project) {
			project = await prisma.project.create({
				data: { id: projectId, uuid: crypto.randomUUID() },
			});
		}

		await prisma.$transaction(
			files.map((file: any) =>
				prisma.codeFile.create({
					data: {
						name: file.name,
						content: file.content,
						type: file.type,
						projectId: project.id,
					},
				})
			)
		);

		return NextResponse.json({
			success: true,
			projectUuid: project.uuid,
			urls: files.map((file: any) => ({
				file: file.name,
				url: `/project/${project.uuid}/${file.name}`,
				rawUrl: `/project/${project.uuid}/raw/${file.name}`,
			})),
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
