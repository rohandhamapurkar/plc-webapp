import Vue from "vue";
import Provider from "./Provider.vue";
import router from "./router";
import store from "./store";
import "@babel/polyfill";
import "./plugins/vuetify";
import "@mdi/font/css/materialdesignicons.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";

Vue.config.productionTip = false;

new Vue({
	router,
	store,
	render: (h) => h(Provider),
}).$mount("#app");
