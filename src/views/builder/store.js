import apiEndpoints from "@/api_endpoints";

const initialState = () => ({});
export default {
	namespaced: true,
	state: initialState(),
	mutations: {
		failure: (s, msg) => {
			console.error("[failure] ", JSON.stringify(msg));
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
			let fail = (msg) => commit("failure", msg);
			return dispatch(
				"apiCall",
				{
					method: "post",
					data: payload,
					url: apiEndpoints.USER_SUBMIT_JOB,
				},
				{ root: true }
			)
				.then((data) => {
					if (!data.ok) fail(data.message || "Failed to start Job");
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
