import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

export default new VueRouter({
	routes: [
		{
			path: "/",
			name: "dashboard",
			component: () => import("./views/Dashboard.vue"),
			meta: { policy: [10, 30] },
		},
		{
			path: "/account-page",
			name: "account page",
			component: () => import("./views/account_page"),
			meta: { policy: [10, 30] },
		},
		{
			path: "/datasets",
			name: "datasets",
			component: () => import("./views/datasets"),
			meta: { policy: [30] },
		},
		{
			path: "/templates",
			name: "templates",
			component: () => import("./views/templates"),
			meta: { policy: [30] },
		},
		{
			path: "/builder",
			name: "builder",
			component: () => import("./views/Builder.vue"),
			meta: { policy: [30] },
		},
		{
			path: "/settings",
			name: "settings",
			component: () => import("./views/Settings.vue"),
			meta: { policy: [30] },
		},
	],
});
