import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
	theme: {
		themes: {
			light: {
				primary: "#440381",
				primaryFontColor: "#ffffff",
				secondary: "#EC368D",
				secondaryFontColor: "#ffffff",
				tertiary: "#FFA5A5",
				tertiaryFontColor: "#000000",
				accent: "#FFD6C0",
				error: "#940000",
			},
		},
		icons: {
			iconfont: "mdi", // 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4' || 'faSvg'
		},
	},
});
