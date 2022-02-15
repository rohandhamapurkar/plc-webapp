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
					if (data.ok) {
						return {
							ok: true,
							totalCount: data.totalCount,
							fetchCount: data.fetchCount,
							list: data.data,
						};
					} else {
						fail(data.message || "Failed to Load Templates List");
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
					fail(err.toString() || "Failed to Load Templates List");
					return { ok: false, totalCount: 0, fetchCount: 0, list: [] };
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
				.then((data) => {
					if (!data.ok) fail(data.message || "Failed to add Template");
					return data;
				})
				.catch((err) => {
					console.error("Err:", err);
					fail(err.toString() || "Failed to add Template");
					return {
						ok: false,
						message: err.message,
					};
				});
		},
		editTemplate: ({ commit, dispatch }, payload) => {
			let fail = (msg) => commit("failure", msg);
			return dispatch(
				"apiCall",
				{
					method: "put",
					data: payload,
					url: apiEndpoints.USER_TEMPLATES,
				},
				{ root: true }
			)
				.then((data) => {
					if (!data.ok) fail(data.message || "Failed to edit Template");
					return data;
				})
				.catch((err) => {
					console.error("Err:", err);
					fail(err.toString() || "Failed to edit Template");
					return {
						ok: false,
						message: err.message,
					};
				});
		},
		deleteTemplate: ({ commit, dispatch }, payload) => {
			let fail = (msg) => commit("failure", msg);
			return dispatch(
				"apiCall",
				{
					method: "delete",
					data: payload,
					url: apiEndpoints.USER_TEMPLATES,
				},
				{ root: true }
			)
				.then((data) => {
					if (!data.ok) fail(data.message || "Failed to Delete Template");
					return data;
				})
				.catch((err) => {
					console.error("Err:", err);
					fail(err.toString() || "Failed to Delete Template");
					return {
						ok: false,
						message: err.message,
					};
				});
		},
		getSignedUrlForTemplateImage: ({ commit, dispatch }, payload) => {
			let fail = (msg) => commit("failure", msg);
			return dispatch(
				"apiCall",
				{
					method: "get",
					params: payload,
					url: apiEndpoints.USER_TEMPLATE_GET_UPLOAD_URL,
				},
				{ root: true }
			)
				.then((data) => {
					if (data.ok) {
						return {
							ok: true,
							uploadMetaData: data.uploadMetaData,
						};
					} else {
						fail(data.message || "Failed to Get Signed Url");
						return {
							ok: false,
							uploadMetaData: {},
						};
					}
				})
				.catch((err) => {
					console.error("Err:", err);
					fail(err.toString() || "Failed to Get Signed Url");
					return { ok: false, uploadMetaData: {} };
				});
		},
	},
	getters: {},
};
