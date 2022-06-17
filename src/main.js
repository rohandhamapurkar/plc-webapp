import Vue from "vue";
import Provider from "./Provider.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
// Import the plugin here
import { Auth0Plugin } from "./auth/index";

//Import Global SCSS
import "./styles/main.scss";
import Vuelidate from "vuelidate";
Vue.use(Vuelidate);

// Install the authentication plugin here
Vue.use(Auth0Plugin, {
	domain: "paperless-auth.eu.auth0.com",
	clientId: "ChZhHupxRQFbOBijlkazp5TAlqQXwb2G",
	redirect_uri: window.location.origin,
	audience: "https://paperless-clone.herokuapp.com/v1",
});

router.beforeEach((to, from, next) => {
	next();
});

Vue.config.productionTip = false;

new Vue({
	router,
	store,
	vuetify,
	render: (h) => h(Provider),
}).$mount("#app");
