import apiEndpoints from "@/api_endpoints";

const initialState = () => ({
	templatesData: [],
});
export default {
	namespaced: true,
	state: initialState(),
	mutations: {
		loadTemplatesData(state, mm) {
			state.mailMeta = JSON.parse(JSON.stringify(mm));
		},
		refreshStockistListEmitter(state) {},
		failure: (s, msg) => {
			console.log("[failure] ", msg);
		},
		resetState(state) {
			const initial = initialState();
			Object.keys(initial).forEach((key) => {
				state[key] = initial[key];
			});
		},
	},
	actions: {
		getMailMeta: ({ commit, dispatch }, payload) => {
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
						commit("loadTemplatesData", data.files);
						return data;
					} else {
						fail(data.message || "Failed to load user templates");
						return false;
					}
				})
				.catch((err) => {
					// console.log('Yo ', err);
					fail(err.toString() || "Failed to load user templates");
				});
		},
	},
	getters: {
		mailMeta: (state) => state.mailMeta,
	},
};
