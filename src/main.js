import Vue from "vue";
import Provider from "./Provider.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";

//Import Global SCSS
import "./styles/main.scss";
import Vuelidate from "vuelidate";
Vue.use(Vuelidate);

Vue.config.productionTip = false;

new Vue({
	router,
	store,
	vuetify,
	render: (h) => h(Provider),
}).$mount("#app");
