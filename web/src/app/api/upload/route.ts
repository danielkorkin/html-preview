import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const { files, projectId } = await req.json();

	if (!projectId || !files) {
		return NextResponse.json({ error: "Invalid input" }, { status: 400 });
	}

	try {
		// Check if the project exists
		let project = await prisma.project.findUnique({
			where: { id: projectId },
		});

		// If the project does not exist, create it
		if (!project) {
			project = await prisma.project.create({
				data: { id: projectId },
			});
		}

		// Proceed to insert the files
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

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export function OPTIONS() {
	return NextResponse.json({}, { status: 200 });
}
