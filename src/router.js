import Vue from "vue";
import Router from "vue-router";
import Dashboard from "./views/Dashboard.vue";
import AccountPage from "./views/account_page";
import Datasets from "./views/datasets";
import Templates from "./views/templates";
import Builder from "./views/Builder.vue";
import Settings from "./views/Settings.vue";

Vue.use(Router);

export default new Router({
	routes: [
		{
			path: "/",
			name: "dashboard",
			component: Dashboard,
			meta: { policy: [10, 30] },
		},
		{
			path: "/account-page",
			name: "account page",
			component: AccountPage,
			meta: { policy: [10, 30] },
		},
		{
			path: "/datasets",
			name: "datasets",
			component: Datasets,
			meta: { policy: [30] },
		},
		{
			path: "/templates",
			name: "templates",
			component: Templates,
			meta: { policy: [30] },
		},
		{
			path: "/builder",
			name: "builder",
			component: Builder,
			meta: { policy: [30] },
		},
		{
			path: "/settings",
			name: "settings",
			component: Settings,
			meta: { policy: [30] },
		},
	],
});
