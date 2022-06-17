import apiEndpoints from "@/api_endpoints";

const initialState = () => ({});
export default {
	namespaced: true,
	state: initialState(),
	mutations: {
		failure: (s, msg) => {
			console.error("[failure] ", msg);
		},
		resetState(state) {
			const initial = initialState();
			Object.keys(initial).forEach((key) => {
				state[key] = initial[key];
			});
		},
	},
	actions: {
		getTemplatesList: ({ commit, dispatch }, payload) => {
			let fail = (msg) => commit("failure", msg);
			return dispatch(
				"apiCall",
				{
					method: "get",
					params: payload,
					url: apiEndpoints.USER_TEMPLATES,
				},
				{ root: true }
			)
				.then((data) => {
					return {
						totalCount: data.totalCount,
						fetchCount: data.fetchCount,
						list: data.data,
					};
				})
				.catch((err) => {
					console.error("Err:", err);
					fail(err.toString() || "Failed to Load Templates List");
					return { totalCount: 0, fetchCount: 0, list: [] };
				});
		},
		addTemplate: ({ commit, dispatch }, payload) => {
			let fail = (msg) => commit("failure", msg);
			return dispatch(
				"apiCall",
				{
					method: "post",
					data: payload,
					url: apiEndpoints.USER_TEMPLATES,
				},
				{ root: true }
			)
				.then(() => {
					return null;
				})
				.catch((err) => {
					console.error("Err:", err);
					fail(err.toString() || "Failed to add Template");
					return new Error(err.message);
				});
		},
		editTemplate: ({ commit, dispatch }, payload) => {
			let fail = (msg) => commit("failure", msg);
			return dispatch(
				"apiCall",
				{
					method: "patch",
					data: payload.form,
					url: apiEndpoints.USER_TEMPLATES + payload.id,
				},
				{ root: true }
			)
				.then(() => {
					return null;
				})
				.catch((err) => {
					console.error("Err:", err);
					fail(err.toString() || "Failed to edit Template");
					return new Error(err.message);
				});
		},
		deleteTemplate: ({ commit, dispatch }, payload) => {
			let fail = (msg) => commit("failure", msg);
			return dispatch(
				"apiCall",
				{
					method: "delete",
					data: payload,
					url: apiEndpoints.USER_TEMPLATES + payload.id,
				},
				{ root: true }
			)
				.then(() => {
					return null;
				})
				.catch((err) => {
					console.error("Err:", err);
					fail(err.toString() || "Failed to Delete Template");
					return new Error(err.message);
				});
		},
	},
	getters: {},
};
