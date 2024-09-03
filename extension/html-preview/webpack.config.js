const path = require("path");
const webpack = require("webpack");

/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const webExtensionConfig = {
	mode: "none",
	target: "webworker", // Extensions run in a webworker context
	entry: {
		extension: "./src/web/extension.ts",
	},
	output: {
		filename: "[name].js",
		path: path.join(__dirname, "./dist/web"),
		libraryTarget: "commonjs",
		devtoolModuleFilenameTemplate: "../../[resource-path]",
	},
	resolve: {
		mainFields: ["browser", "module", "main"],
		extensions: [".ts", ".js"],
		alias: {},
		fallback: {
			assert: require.resolve("assert/"),
			buffer: require.resolve("buffer/"),
			util: require.resolve("util/"),
			stream: require.resolve("stream-browserify/"),
		},
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "ts-loader",
					},
				],
			},
		],
	},
	plugins: [
		new webpack.ProvidePlugin({
			process: "process/browser", // Provide a shim for the global `process` variable
			Buffer: ["buffer", "Buffer"], // Provide a shim for the global `Buffer` variable
		}),
	],
	externals: {
		vscode: "commonjs vscode", // Exclude the vscode module from the bundle
	},
	performance: {
		hints: false,
	},
	devtool: "nosources-source-map", // Create a source map that points to the original source file
};

module.exports = [webExtensionConfig];
