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
					if (data.ok) {
						return {
							ok: true,
							totalCount: data.totalCount,
							fetchCount: data.fetchCount,
							list: data.data,
						};
					} else {
						fail(data.message || "Failed to Load Datasets List");
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
					fail(err.toString() || "Failed to Load Datasets List");
					return { ok: false, totalCount: 0, fetchCount: 0, list: [] };
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
				.then((data) => {
					if (!data.ok) fail(data.message || "Failed to upload dataset file");
					return data;
				})
				.catch((err) => {
					console.error("Err:", err);
					fail(err.toString() || "Failed to upload dataset file");
					return {
						ok: false,
						message: err.message,
					};
				});
		},
		deleteDataset: ({ commit, dispatch }, payload) => {
			let fail = (msg) => commit("failure", msg);
			return dispatch(
				"apiCall",
				{
					method: "delete",
					data: payload,
					url: apiEndpoints.USER_DATASETS,
				},
				{ root: true }
			)
				.then((data) => {
					if (!data.ok) fail(data.message || "Failed to Delete Dataset");
					return data;
				})
				.catch((err) => {
					console.error("Err:", err);
					fail(err.toString() || "Failed to Delete Dataset");
					return {
						ok: false,
						message: err.message,
					};
				});
		},
		getDatasetData: ({ commit, dispatch }, payload) => {
			let fail = (msg) => commit("failure", msg);
			return dispatch(
				"apiCall",
				{
					method: "get",
					url: apiEndpoints.USER_DATASETS + "/" + payload._id,
				},
				{ root: true }
			)
				.then((data) => {
					if (data.ok) {
						return {
							ok: true,
							rows: data.rows,
						};
					} else {
						fail(data.message || "Failed to Load Dataset Data");
						return {
							ok: false,
							rows: [],
							headers: [],
						};
					}
				})
				.catch((err) => {
					console.error("Err:", err);
					fail(err.toString() || "Failed to Load Datasets Data");
					return { ok: false, rows: [], headers: [] };
				});
		},
	},
	getters: {},
};
