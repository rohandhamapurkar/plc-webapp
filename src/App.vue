<template>
	<v-app>
		<v-navigation-drawer id="nav-draw" v-model="drawer" fixed app dark>
			<v-list dense two-line subheader>
				<v-list-tile v-for="item in routeItems" :key="item.route" @click="openPortal(item)">
					<v-list-tile-action>
						<v-icon :color="item.iconColor" medium>{{ item.icon }}</v-icon>
					</v-list-tile-action>
					<v-list-tile-content>
						<v-list-tile-title class="subheading">
							<span v-if="item.highlight" :style="getColor(item)">{{ item.title }}</span>
							<span v-else>{{ item.title }}</span>
						</v-list-tile-title>
						<v-list-tile-sub-title></v-list-tile-sub-title>
					</v-list-tile-content>
				</v-list-tile>
			</v-list>
		</v-navigation-drawer>
		<v-toolbar color="light-grey darken-3" app>
			<v-toolbar-side-icon color="back" @click.stop="drawer = !drawer"></v-toolbar-side-icon>
			<v-toolbar-title class="font-weight-regular text-uppercase">
				<span class="back--text">{{ title }}</span>
			</v-toolbar-title>
			<v-spacer></v-spacer>
			<v-btn @click="openPortal(logoutPortal)" color="light-grey darken-4" fab small dark>
				<v-icon>account_circle</v-icon>
			</v-btn>
			<v-btn color="light-grey darken-4" fab small dark>
				<v-icon>logout</v-icon>
			</v-btn>
		</v-toolbar>
		<v-dialog v-model="loaderDialog" persistent width="300">
			<v-card color="light-grey darken-4" dark>
				<v-card-text>
					Please stand by {{ userData.name }}
					<v-progress-linear indeterminate color="back" class="mb-0"></v-progress-linear>
				</v-card-text>
			</v-card>
		</v-dialog>
		<v-snackbar v-model="snackbar" left :timeout="snackbarTime" top multi-line>
			{{ snackbarText }}
		</v-snackbar>
		<v-content>
			<router-view />
		</v-content>
	</v-app>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
export default {
	name: "App",
	data() {
		return {
			drawer: null,
			routeItems: [
				{
					icon: "data_usage",
					title: "Dashboard",
					route: "/",
					highlight: false,
				},
				{
					icon: "insert_drive_file",
					title: "My Templates",
					route: "/templates",
					highlight: false,
				},
				{
					icon: "table_chart",
					title: "My Datasets",
					route: "/datasets",
					highlight: false,
				},
				{
					icon: "build",
					title: "Builder",
					route: "/builder",
					highlight: false,
				},
				{
					icon: "settings",
					title: "Workspace Settings",
					route: "/settings",
					highlight: false,
				},
			],
			snackbar: false,
			timeout: 3000,
			title: "PLC/Dashboard",
			logoutPortal: { icon: "account_circle", title: "account page", route: "/account-page" },
		};
	},
	created() {},
	methods: {
		...mapMutations(["openLoaderDialog", "openSnackbar", "closeSnackbar"]),
		openPortal(item) {
			this.title = this.title.split("/")[0] + "/" + item.title;
			if (item.prop) {
				this.$router.push({
					name: item.route,
					params: {
						propItem: item.prop,
					},
				});
			} else {
				this.$router.push({
					path: item.route,
				});
			}
		},
		getColor(item) {
			return {
				color: item.highlight,
			};
		},
	},
	computed: {
		...mapGetters(["loaderDialog", "snackbarState", "snackbarText", "snackbarTime", "userData"]),
	},
	mounted() {
		this.$store.subscribe((mutation) => {
			if (mutation.type === "openSnackbar") {
				this.snackbar = true;
			} else if (mutation.type === "closeSnackbar") {
				this.snackbar = false;
			}
		});
		this.openPortal({
			icon: "bubble_chart",
			title: "Dashboard",
			route: "/",
		});
	},
};
</script>

<style lang="scss" scoped>
.spinner-wrapper {
	height: 75px;
	overflow: auto;
	display: flex;
	justify-content: center;
	align-items: center;
}

v-dialog {
	box-shadow: none;
}
</style>

<style lang="scss">
// ScrollBar Styles to make it look like macbook (Will only work on modern browsers)
::-webkit-scrollbar {
	width: 8px;
}

::-webkit-scrollbar-track {
	// -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
	border-radius: 10px;
}

::-webkit-scrollbar-thumb {
	background-color: lightgray;
	border-radius: 10px;
	// -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5);
}
</style>
