<template>
	<div>
		<!-- <App v-if="auth && userType == 10" /> -->
		<App v-if="auth" />
		<!-- <Admin v-else-if="auth && userType == 30" /> -->
		<Auth v-if="!auth" />
	</div>
</template>

<script>
import Admin from "./Admin.vue";
import App from "./App.vue";
import Auth from "./Auth.vue";
import { mapState, mapGetters, mapActions } from "vuex";
export default {
	name: "Provider",
	components: {
		// Admin,
		App,
		Auth,
	},
	created() {},
	computed: {
		...mapGetters(["auth", "userType"]),
	},
};
</script>

<style></style>
