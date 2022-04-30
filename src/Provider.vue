<template>
	<div>
		<v-overlay :opacity="1" :value="showLoading" :z-index="100">
			<v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
		</v-overlay>
		<app v-if="showApp"></app>
		<auth v-else></auth>
	</div>
</template>

<script>
import App from "./App.vue";
import Auth from "./Auth.vue";

import { mapGetters, mapMutations, mapActions } from "vuex";
export default {
	name: "Provider",
	/*
	 * Clear all references to any previous timeouts that might have persisted.
	 * Initiate check for if the user session exists
	 */
	created() {
		// this.expiryBuffer = 60 * 1000;
		// let id = setTimeout(function () {}, 0); // This Clear all references to any previous timeouts
		// // console.log("In memory timeouts", id);
		// while (id--) {
		// 	clearTimeout(id); // Will do nothing if no timeout with id is present
		// }
		// this.checkUserSession();
	},
	mounted() {},
	data: () => ({
		expiryBuffer: 60 * 1000,
		refreshTokenTimeoutRef: 0,
		loaderDialog: false,
		app: true,
	}),
	methods: {
		...mapActions([]),
		...mapMutations(["openLoaderDialog", "closeLoaderDialog"]),
	},
	destroyed() {},
	computed: {
		...mapGetters(["auth", "authToken", "refreshToken", "currentState"]),
		showApp: function () {
			return this.$auth.isAuthenticated;
		},
		showLoading: function () {
			return this.$auth.loading;
		},
	},
	components: {
		App,
		Auth,
	},
};
</script>
