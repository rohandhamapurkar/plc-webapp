import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

export default new VueRouter({
	routes: [
		{
			path: "/",
			name: "dashboard",
			component: () => import("./views/dashboard"),
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
			component: () => import("./views/builder"),
			meta: { policy: [30] },
		},
		{
			path: "/settings",
			name: "settings",
			component: () => import("./views/settings"),
			meta: { policy: [30] },
		},
		{
			path: "/jobs",
			name: "jobs",
			component: () => import("./views/jobs"),
			meta: { policy: [30] },
		},
	],
});
