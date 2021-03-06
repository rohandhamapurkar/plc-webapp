module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: ["plugin:vue/essential", "eslint:recommended"],
	parserOptions: {
		parser: "babel-eslint",
	},
	rules: {
		"no-console": "off",
		"no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
		"no-unused-vars": "off",
		"no-prototype-builtins": "off",
		"vue/multi-word-component-names": "off",
	},
};
