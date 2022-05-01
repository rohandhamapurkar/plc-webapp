import Vuex from "vuex";
import Vue from "vue";

import axios from "axios";
import apiEndpoints from "@/api_endpoints";

import Templates from "./views/templates/store";
import Datasets from "./views/datasets/store";
import Builder from "./views/builder/store";
import Jobs from "./views/jobs/store";

import { getInstance } from "./auth/index";
const auth0Instance = getInstance();

Vue.use(Vuex);
const initialState = () => ({
	loaderDialog: false,
	snackbarState: false,
	snackbarText: "",
	snackbarTime: 2000,
	currentState: {},
	messages: {
		loginFailed: "",
		failure: "",
	},
	uploadPercentage: 0,
});

let apiErrorFunction = ({ err, commit, reject }) => {
	console.log("[HTTP API Request Error]", err);
	if (err.message == "Network Error") {
		commit("openSnackbar", { text: "Network Error" });
		console.error("Network Error");
		commit("closeLoaderDialog");
	} else if (err.response.status == 401) {
		localStorage.clear();
		commit("resetState");
	} else if (err.response.status == 400) {
		commit("openSnackbar", {
			text: err.response.data.message || "Request Failed, please try again",
		});
	} else if (err.response.status == 500) {
		console.error("Internal SERVER ERROR");
	} else {
		commit("openSnackbar", {
			text: "Request Failed, please try again",
		});
	}
	let errMsg = "";
	try {
		errMsg = err.response.data.message;
		if (typeof errMsg == "object") {
			errMsg = errMsg[Object.keys(errMsg)[0]];
		}
	} catch (e) {
		console.log(e);
	}
	reject({
		ok: false,
		err,
		message: errMsg || "Request Failed, please try again",
	});
};

export default new Vuex.Store({
	strict: true,
	modules: {
		Templates,
		Datasets,
		Builder,
		Jobs,
	},
	state: initialState(),
	mutations: {
		openLoaderDialog(s) {
			s.loaderDialog = true;
		},
		closeLoaderDialog(s) {
			s.loaderDialog = false;
		},
		openSnackbar(s, { text = "", time = 5000 } = {}) {
			s.snackbarTime = time;
			s.snackbarText = text;
			s.snackbarState = true;
		},
		closeSnackbar(s) {
			s.snackbarState = false;
		},
		clearUploadPercentage(s) {
			s.uploadPercentage = 0;
		},
		setUploadPercentage(s, { uploadStatus }) {
			s.uploadPercentage = uploadStatus;
		},
		failure: (s, p) => {
			s.messages.failure = p;
		},

		loginFail: (s, p) => {
			s.messages.loginFailed = p;
		},
		logoutFail: (s, p) => {
			console.log("logged out");
		},
		resetState(state) {
			const initial = initialState();
			Object.keys(initial).forEach((key) => {
				state[key] = initial[key];
			});
		},
	},
	actions: {
		apiCallWithHeaderConfig({ commit, state }, { partConfig, headerConfig }) {
			return new Promise((resolve, reject) => {
				auth0Instance
					.getTokenSilently()
					.then((token) => {
						if (!token) {
							throw "no auth token found";
						}
						axios({
							...partConfig,
							headers: {
								...headerConfig,
								Authorization: "Bearer " + token,
							},
							onUploadProgress: function (progressEvent) {
								commit("setUploadPercentage", {
									uploadStatus: parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100)),
								});
							},
						})
							.then((response) => {
								let data = response.data;
								resolve(data);
								commit("clearUploadPercentage");
							})
							.catch((err) => {
								commit("clearUploadPercentage");
								apiErrorFunction({ err, commit, reject });
							});
					})
					.catch((err) => {
						apiErrorFunction({ err, commit, reject });
					});
			});
		},
		apiCallWithoutAuth({ commit, state }, { partConfig, headerConfig }) {
			return new Promise((resolve, reject) => {
				axios({
					...partConfig,
					headers: {
						...headerConfig,
					},
					onUploadProgress: function (progressEvent) {
						commit("setUploadPercentage", {
							uploadStatus: parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100)),
						});
					},
				})
					.then((response) => {
						resolve(response);
						commit("clearUploadPercentage");
					})
					.catch((err) => {
						commit("clearUploadPercentage");
						apiErrorFunction({ err, commit, reject });
					});
			});
		},
		apiCall({ commit, state }, partConfig) {
			return new Promise((resolve, reject) => {
				console.log(this);
				this._vm.$auth
					.getTokenSilently()
					.then((token) => {
						console.log(token);
						if (!token) {
							throw "no auth token found";
						}
						axios({
							...partConfig,
							headers: {
								Authorization: "Bearer " + token,
							},
						})
							.then((response) => {
								console.log(response);
								let data = response.data;
								resolve(data);
							})
							.catch((err) => apiErrorFunction({ err, commit, reject }));
					})
					.catch((err) => {
						apiErrorFunction({ err, commit, reject });
					});
			});
		},
		fileDownload_API_Call({ state, commit }, partConfig) {
			return new Promise((resolve, reject) => {
				if (!state.auth) {
					throw "no auth token found";
				}
				axios({
					...partConfig,
					headers: {
						Authorization: state.authToken,
					},
					onDownloadProgress: (progressEvent) => {
						console.log(progressEvent);
						console.log((progressEvent.loaded * 100) / progressEvent.total);
					},
				})
					.then((response) => {
						let data = response.data;
						resolve({ data, response });
					})
					.catch((err) => apiErrorFunction({ err, commit, reject }));
			});
		},

		uploadImageToGDrive: async ({ commit, dispatch }, payload) => {
			let fail = (msg) => commit("failure", msg);
			return dispatch(
				"apiCallWithHeaderConfig",
				{
					partConfig: {
						method: "post",
						data: payload.file,
						url: apiEndpoints.UPLOAD_USER_TEMPLATE_IMAGE,
						params: payload.params,
					},
					headerConfig: {
						"Content-Type": "application/octet-stream",
					},
				},
				{ root: true }
			)
				.then((data) => {
					if (!data.ok) fail(data.message || "Failed to upload template image");
					return data;
				})
				.catch((err) => {
					console.error("Err:", err);
					fail(err.toString() || "Failed to upload template image");
					return {
						ok: false,
						message: err.message,
					};
				});
		},
	},
	getters: {
		loaderDialog: (state) => state.loaderDialog,
		snackbarState: (state) => state.snackbarState,
		snackbarText: (state) => state.snackbarText,
		snackbarTime: (state) => state.snackbarTime,
		userType: (state) => state.userType,
		auth: (state) => state.auth,
		authToken: (state) => state.authToken,
		refreshToken: (state) => state.refreshToken,
		userData: (state) => state.userData,
		uploadPercentage: (state) => state.uploadPercentage,
		currentState: (state) => state.currentState,
		ADMIN: (state) => state.ADMIN,
		USER: (state) => state.USER,
	},
});
