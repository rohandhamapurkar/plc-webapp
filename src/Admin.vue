<template>
	<v-app> </v-app>
</template>

<script>
export default {
	name: "Admin",
	data() {
		return {
			drawer: null,
			routeItems: [],
			dates: [],
			menu: false,
			moment: false,
			snackbar: false,
			timeout: 3000,
			title: "SSE/Dashboard",
		};
	},
	created() {},
	methods: {},
	computed: {},
	mounted() {},
};
</script>

<style lang="scss">
#admin-date-menu {
	.theme--light.v-text-field > .v-input__control > .v-input__slot:before {
		border-color: black;
	}

	.mdi-menu-down:before {
		color: black !important;
	}

	.theme--light.v-label {
		color: black !important;
	}

	.v-chip .v-chip__content {
		color: black;
	}
}
</style>
