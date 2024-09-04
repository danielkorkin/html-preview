import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "render-html" is now active!');

	// Update the command implementation
	let disposable = vscode.commands.registerCommand(
		"extension.renderHtml",
		async () => {
			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (!workspaceFolders) {
				vscode.window.showErrorMessage("No workspace folder is open.");
				return;
			}

			const workspaceUri = workspaceFolders[0].uri;
			const files = await vscode.workspace.findFiles(
				"**/*.{html,css,js}"
			);

			if (files.length === 0) {
				vscode.window.showErrorMessage(
					"No HTML, CSS, or JS files found in the workspace."
				);
				return;
			}

			const uploadFiles = await Promise.all(
				files.map(async (file) => {
					const fileContent = await vscode.workspace.fs.readFile(
						file
					);
					const fileString =
						Buffer.from(fileContent).toString("utf8");
					return {
						name: vscode.workspace.asRelativePath(file),
						content: fileString,
						type: file.fsPath.split(".").pop(),
					};
				})
			);

			const projectId = workspaceUri.path.split("/").pop(); // Use the last folder name as project ID

			try {
				const response = await fetch(
					"https://html-preview-nine.vercel.app/api/upload",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ files: uploadFiles, projectId }),
					}
				);

				if (response.ok) {
					const data = await response.json();
					vscode.window.showInformationMessage(
						`HTML rendered at: https://html-preview-nine.vercel.app/${data.projectUuid}/index.html`
					);
					console.log("URLs:", data.urls); // Log the returned URLs

					data.urls.forEach(
						(file: { file: string; rawUrl: string }) => {
							vscode.window.showInformationMessage(
								`Raw file available at: ${file.rawUrl}`
							);
						}
					);
				} else {
					vscode.window.showErrorMessage("Failed to upload files.");
				}
			} catch (error) {
				if (error instanceof Error) {
					vscode.window.showErrorMessage(`Error: ${error.message}`);
				} else {
					vscode.window.showErrorMessage(`Unexpected error`);
				}
			}
		}
	);

	context.subscriptions.push(disposable);
}

export function deactivate() {}
