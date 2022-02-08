import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
	theme: {
		themes: {
			light: {
				primary: "#440381",
				primaryFontColor: "white",
				secondary: "#EC368D",
				secondaryFontColor: "white",
				tertiary: "#FFA5A5",
				tertiaryFontColor: "black",
				accent: "#FFD6C0",
				error: "#940000",
			},
		},
	},
});
