import Vuex from "vuex";
import Vue from "vue";

import axios from "axios";
import apiEndpoints from "@/api_endpoints";
import templates from "./views/templates/store";

Vue.use(Vuex);
const initialState = () => ({
	userType: "",
	authToken: "",
	auth: true,
	userData: {},

	messages: {
		loginFailed: "",
		failure: "",
	},
	loaderDialog: false,
	snackbarState: false,
	snackbarText: "",
	snackbarTime: 2000,
});

export default new Vuex.Store({
	strict: true,
	modules: {
		templates,
	},
	state: initialState(),
	mutations: {
		openSnackbar(s, { text, time = 3000 }) {
			s.snackbarTime = time;
			s.snackbarText = text;
			s.snackbarState = true;
		},
		closeSnackbar(s) {
			s.snackbarState = false;
		},
		openLoaderDialog(s) {
			s.loaderDialog = true;
		},
		closeLoaderDialog(s) {
			s.loaderDialog = false;
		},

		typeTenLogin: (state, data) => {
			state.authToken = data.token ? data.token : true;
			state.auth = !!data.token;
			state.userType = 10;
			state.userData = data.userData;
			sessionStorage.setItem("userType", 10);
			sessionStorage.setItem("auth", data.token);
			// sessionStorage.setItem('tenant', data.tenant);
		},
		typeThirtyLogin: (state, data) => {
			state.authToken = data.token ? data.token : true;
			state.auth = !!data.token;
			state.userType = 30;
			state.userData = data.userData;
			sessionStorage.setItem("userType", 30);
			sessionStorage.setItem("auth", data.token);
			// sessionStorage.setItem('tenant', data.tenant);
		},
		loginFail: (s, p) => {
			s.messages.loginFailed = p;
		},
	},
	actions: {
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
						// console.log(response)
						let data = response.data;
						resolve(data);
					})
					.catch((err) => {
						if (err.message == "Network Error") {
							commit("openSnackbar", { text: "Network Error" });
							// console.log('Network Error');
						} else {
							commit("openSnackbar", {
								text: "Check console for Error",
							});
						}
						reject({
							ok: false,
							message: "Error connecting to SSE server",
						});
					});
			});
		},
		login: ({ commit }, payload) => {
			let fail = (msg) => commit("loginFail", msg);
			if (!payload.username || !payload.password) {
				fail("No username/pw provided");
				return;
			}
			let { username, password } = payload;
			axios
				.post(apiEndpoints.LOGIN, { username, password })
				.then((response) => {
					let data = response.data;
					if (!data.ok) {
						fail(data.message || "Login Failed");
					} else if (data.mortal.type === 10) {
						/* logical success */
						commit("typeTenLogin", {
							token: data.token,
							userData: data.mortal.userData,
						});
					} else if (data.mortal.type === 30) {
						/* logical success */
						commit("typeThirtyLogin", {
							token: data.token,
							userData: data.mortal.userData,
						});
					} else {
						/* logical error */
						fail("Not valid usertype");
					}
				})
				.catch((err) => {
					if (err.message == "Network Error") {
						fail("Network Error");
					} else {
						fail("Login Failed");
					}
				});
		},
	},
	getters: {
		userType: (state) => state.userType,
		auth: (state) => state.auth,
		authToken: (state) => state.authToken,
		userData: (state) => state.userData,
		loaderDialog: (state) => state.loaderDialog,
		snackbarState: (state) => state.snackbarState,
		snackbarText: (state) => state.snackbarText,
		snackbarTime: (state) => state.snackbarTime,
	},
});
