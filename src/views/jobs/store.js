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
		getJobsList: ({ commit, dispatch }, payload) => {
			let fail = (msg) => commit("failure", msg);
			return dispatch(
				"apiCall",
				{
					method: "get",
					params: payload,
					url: apiEndpoints.USER_JOBS,
				},
				{ root: true }
			)
				.then((data) => {
					if (data.ok) {
						return {
							ok: true,
							totalCount: data.totalCount,
							fetchCount: data.fetchCount,
							list: data.data,
						};
					} else {
						fail(data.message || "Failed to Load Jobs List");
						return {
							ok: false,
							totalCount: data.totalCount,
							fetchCount: 0,
							list: [],
						};
					}
				})
				.catch((err) => {
					console.error("Err:", err);
					fail(err.toString() || "Failed to Load Jobs List");
					return { ok: false, totalCount: 0, fetchCount: 0, list: [] };
				});
		},
		getJobDetails: ({ commit, dispatch }, payload) => {
			let fail = (msg) => commit("failure", msg);
			return dispatch(
				"apiCall",
				{
					method: "get",
					url: apiEndpoints.USER_JOBS + "/" + payload._id,
				},
				{ root: true }
			)
				.then((data) => {
					if (data.ok) {
						return {
							ok: true,
							jobDetails: data.data,
						};
					} else {
						fail(data.message || "Failed to Load Jobs List");
						return {
							ok: false,
							jobDetails: {},
						};
					}
				})
				.catch((err) => {
					console.error("Err:", err);
					fail(err.toString() || "Failed to Load Jobs List");
					return { ok: false, jobDetails: {} };
				});
		},
	},
	getters: {},
};
