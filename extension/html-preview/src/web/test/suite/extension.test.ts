import * as assert from "assert";
import * as vscode from "vscode";

// Describe a Mocha test suite
suite("Web Extension Test Suite", () => {
	vscode.window.showInformationMessage("Start all tests.");

	// A simple test example
	test("Sample test", () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});
