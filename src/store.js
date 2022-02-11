import Vuex from "vuex";
import Vue from "vue";

import axios from "axios";
import apiEndpoints from "@/api_endpoints";

import Templates from "./views/templates/store";
import Datasets from "./views/datasets/store";
import Builder from "./views/builder/store";
import Jobs from "./views/jobs/store";

Vue.use(Vuex);
const initialState = () => ({
	loaderDialog: false,
	snackbarState: false,
	snackbarText: "",
	snackbarTime: 2000,
	// userType: false,
	userType: 10,
	authToken: "",
	refreshToken: "",
	currentState: {},
	auth: false,
	userData: {},
	messages: {
		loginFailed: "",
		failure: "",
	},
	uploadPercentage: 0,
	USER: 40,
	ADMIN: 10,
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

		// Super Admin
		typeTenLogin: (state, data) => {
			state.authToken = data.token ? data.token : true;
			state.refreshToken = data.dataObj.refreshToken;
			state.auth = !!data.token;
			state.userType = state.ADMIN;
			state.userData = data.userData;
			state.currentState = data.dataObj;
			localStorage.setItem("userType", state.ADMIN);
			localStorage.setItem("auth", data.token);
			localStorage.setItem("userState", JSON.stringify(data.dataObj));
		},
		typeFourtyLogin: (state, data) => {
			state.authToken = data.token ? data.token : true;
			state.refreshToken = data.dataObj.refreshToken;
			state.auth = !!data.token;
			state.userType = state.USER;
			state.userData = data.userData;
			state.currentState = data.dataObj;
			localStorage.setItem("userType", state.USER);
			localStorage.setItem("auth", data.token);
			localStorage.setItem("userState", JSON.stringify(data.dataObj));
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
				if (!state.auth) {
					throw "no auth token found";
				}
				axios({
					...partConfig,
					headers: {
						...headerConfig,
						Authorization: state.authToken,
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
			});
		},
		apiCall({ commit, state }, partConfig) {
			return new Promise((resolve, reject) => {
				if (!state.auth) {
					throw "no auth token found";
				}
				axios({
					...partConfig,
					headers: {
						Authorization: state.authToken,
					},
				})
					.then((response) => {
						// console.log(response);
						let data = response.data;
						resolve(data);
					})
					.catch((err) => apiErrorFunction({ err, commit, reject }));
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
		extendUserSession: ({ commit, state }, { refreshToken, currentState }) => {
			let fail = (msg) => commit("loginFail", msg);
			return axios
				.get(apiEndpoints.EXTEND_USER_SESSION, {
					headers: { refreshToken },
				})
				.then((response) => {
					let data = response.data;
					if (data.ok) {
						if (data.user.type === state.ADMIN) {
							commit("typeTenLogin", {
								token: data.token,
								userData: data.user.userData,
								dataObj: currentState,
							});
						} else if (data.user.type === state.USER) {
							commit("typeFourtyLogin", {
								token: data.token,
								userData: data.user.userData,
								dataObj: currentState,
							});
						}
						return { ok: true };
					} else {
						return { ok: false };
					}
				})
				.catch((err) => {
					console.log("[Error] ", err);
					fail(err.toString() || "Failed to auto extend user session");
					return { ok: false };
				});
		},

		login: ({ commit, state }, payload) => {
			let fail = (msg) => commit("loginFail", msg);
			if (!payload.email || !payload.password) {
				fail("No email/pw provided");
				return;
			}
			let { email, password } = payload;
			return axios
				.post(apiEndpoints.LOGIN, { email, password })
				.then((response) => {
					let data = response.data;
					if (!data.ok) {
						fail(data.message || "Login Failed");
						return { ok: false };
					} else if (data.user.type === state.ADMIN) {
						commit("typeTenLogin", {
							token: data.token,
							userData: data.user.userData,
							dataObj: data,
						});
					} else if (data.user.type === state.USER) {
						commit("typeFourtyLogin", {
							token: data.token,
							userData: data.user.userData,
							dataObj: data,
						});
					} else {
						/* logical error */
						fail("Not valid usertype");
						return { ok: false };
					}
					return { ok: true };
				})
				.catch((err) => {
					console.log("[Error] login", err);
					if (err.message == "Network Error") {
						fail("Network Error");
					} else {
						fail("Login Failed");
					}
					return { ok: false };
				});
		},
		logout: ({ commit, state }) => {
			let fail = (msg) => commit("logoutFail", msg);
			return axios
				.post(
					apiEndpoints.LOGOUT,
					{},
					{
						headers: {
							Authorization: state.authToken,
						},
					}
				)
				.then((response) => {
					let data = response.data;
					if (!data.ok) {
						fail(data.message || "Logout Failed");
						return { ok: false };
					} else {
						/* logical error */
						fail("Not valid usertype");
						return { ok: false };
					}
				})
				.catch((err) => {
					console.log("[Error] login", err);
					if (err.message == "Network Error") {
						fail("Network Error");
					} else {
						fail("Login Failed");
					}
					return { ok: false };
				});
		},
		register: ({ commit, state }, payload) => {
			let fail = (msg) => commit("loginFail", msg);
			if (!payload.email || !payload.password) {
				fail("No email/pw provided");
				return;
			}
			let { email, password } = payload;
			return axios
				.post(apiEndpoints.REGISTER, { email, password })
				.then((response) => {
					let data = response.data;
					console.log("data", data);
					if (!data.ok) {
						fail(data.message || "Registration Failed");
						return { ok: false };
					}
					return { ok: true };
				})
				.catch((err) => {
					console.log("[Error] login", err);
					if (err.message == "Network Error") {
						fail("Network Error");
					} else {
						fail("Login Failed");
					}
					return { ok: false };
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
