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
		getDatasetsList: ({ commit, dispatch }, payload) => {
			let fail = (msg) => commit("failure", msg);
			return dispatch(
				"apiCall",
				{
					method: "get",
					params: payload,
					url: apiEndpoints.USER_DATASETS,
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
					fail(err.toString() || "Failed to Load Datasets List");
					return { totalCount: 0, fetchCount: 0, list: [] };
				});
		},
		uploadDataset: ({ commit, dispatch }, payload) => {
			let fail = (msg) => commit("failure", msg);
			return dispatch(
				"apiCallWithHeaderConfig",
				{
					partConfig: {
						method: "post",
						data: payload,
						url: apiEndpoints.USER_DATASETS,
					},
					headerConfig: {
						"Content-Type": "multipart/form-data",
					},
				},
				{ root: true }
			)
				.then(() => {
					return null;
				})
				.catch((err) => {
					console.error("Err:", err);
					fail(err.toString() || "Failed to upload dataset file");
					return new Error(err.message);
				});
		},
		deleteDataset: ({ commit, dispatch }, payload) => {
			let fail = (msg) => commit("failure", msg);
			return dispatch(
				"apiCall",
				{
					method: "delete",
					url: apiEndpoints.USER_DATASETS + payload._id,
				},
				{ root: true }
			)
				.then(() => {
					return null;
				})
				.catch((err) => {
					console.error("Err:", err);
					fail(err.toString() || "Failed to Delete Dataset");
					return new Error(err.message);
				});
		},
		getDatasetData: ({ commit, dispatch }, payload) => {
			let fail = (msg) => commit("failure", msg);
			return dispatch(
				"apiCall",
				{
					method: "get",
					url: apiEndpoints.USER_DATASETS + payload._id,
				},
				{ root: true }
			)
				.then((data) => {
					return {
						ok: true,
						rows: data.data,
					};
				})
				.catch((err) => {
					console.error("Err:", err);
					fail(err.toString() || "Failed to Load Datasets Data");
					return { ok: false, rows: [] };
				});
		},
	},
	getters: {},
};
