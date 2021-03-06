const path = require("path");

module.exports = {
	transpileDependencies: ["vuetify"],
	chainWebpack: (config) => {
		const types = ["vue-modules", "vue", "normal-modules", "normal"];
		types.forEach((type) => addStyleResource(config.module.rule("scss").oneOf(type)));
	},
	// devServer: {
	// 	// host: 'localhost',
	// 	// hot: true,
	// 	// watchOptions: {
	// 	// 	poll: 1000,
	// 	// 	aggregateTimeout: 300
	// 	// }
	//   }
};

function addStyleResource(rule) {
	rule
		.use("style-resource")
		.loader("style-resources-loader")
		.options({
			patterns: [path.resolve(__dirname, "./src/styles/*.scss")],
		});
}
