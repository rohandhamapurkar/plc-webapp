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
		submitJob: ({ commit, dispatch }, payload) => {
			let form = new FormData();
			form.append("payload", JSON.stringify(payload));
			let fail = (msg) => commit("failure", msg);
			return dispatch(
				"apiCall",
				{
					method: "post",
					data: form,
					url: apiEndpoints.USER_JOB,
				},
				{ root: true }
			)
				.then((data) => {
					return data;
				})
				.catch((err) => {
					console.error("Err:", err);
					fail(err.toString() || "Failed to start Job");
					return {
						ok: false,
						message: err.message,
					};
				});
		},
	},
	getters: {},
};
