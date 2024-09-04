import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: { uuid: string; file: string[] } }
) {
	const { uuid, file } = params;
	const filePath = file.join("/");

	const project = await prisma.project.findUnique({
		where: { uuid: uuid },
		include: { files: true },
	});

	if (!project) {
		return NextResponse.json(
			{ error: "Project not found" },
			{ status: 404 }
		);
	}

	const targetFile = project.files.find((f) => f.name === filePath);

	if (!targetFile) {
		return NextResponse.json({ error: "File not found" }, { status: 404 });
	}

	return new Response(targetFile.content, {
		headers: {
			"Content-Type": "text/plain",
		},
	});
}
