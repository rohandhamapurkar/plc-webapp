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
	created() {},
	mounted() {},
	data: () => ({}),
	methods: {
		...mapActions([]),
		...mapMutations(["openLoaderDialog", "closeLoaderDialog"]),
	},
	destroyed() {},
	computed: {
		...mapGetters(["currentState"]),
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
