<template>
	<v-app>
		<v-navigation-drawer
			class="navigationDrawerWrapper"
			v-model="navigationToggle"
			color="primary"
			hide-overlay
			fixed
			app
		>
			<!-- <v-list color="primary" id="navigation-list" flat> -->
			<v-list id="navigation-list" flat>
				<template v-for="(navItem, index) of routeItems">
					<v-list-item
						:key="navItem.route + '' + index"
						id="basic-list-item"
						@click="openPortal(navItem)"
						:class="{
							'active-list-item': currentRoute == navItem.route ? true : false,
						}"
					>
						<v-list-item-content>
							<v-list-item-title>
								<span
									class="list-title"
									:class="{
										'selected-route': currentRoute == navItem.title ? true : false,
									}"
									>{{ navItem.title }}</span
								>
							</v-list-item-title>
						</v-list-item-content>
					</v-list-item>
				</template>
			</v-list>
		</v-navigation-drawer>

		<v-app-bar class="toolbarWrapper" color="primary" app fixed>
			<v-btn icon x-large @click="toggleNav">
				<v-icon color="white">mdi-menu</v-icon>
			</v-btn>

			<v-toolbar-title
				><span style="color: white">{{ title }}</span></v-toolbar-title
			>
			<v-spacer></v-spacer>
			<div class="toolbar-version">
				<v-chip color="white"> v {{ version }} </v-chip>
			</div>
			<v-btn large icon @click="openPortal(settingsRoute)">
				<v-icon color="white">mdi-cog</v-icon>
			</v-btn>
			<v-btn large icon @click="logoutUser">
				<v-icon color="white">mdi-logout</v-icon>
			</v-btn>
			<v-tooltip bottom>
				<template v-slot:activator="{ on, attrs }">
					<v-avatar class="toolbar-profile" size="45" v-bind="attrs" v-on="on">
						<img src="https://source.boringavatars.com/beam/120/?colors=FFFFFF,000000" alt="John" />
					</v-avatar>
				</template>
				<span v-if="userData"
					>{{ userData.name ? userData.name : "" }} ({{ userData.email ? userData.email : "" }})</span
				>
			</v-tooltip>
		</v-app-bar>

		<v-main>
			<router-view />
		</v-main>

		<v-snackbar v-model="localSnackbarState" multi-line light top right :timeout="snackbarTime">
			<div class="snackbarComponentWrapper">
				<div class="content">{{ snackbarText }}</div>
				<div class="action-button">
					<v-btn small fab color="accent" text @click.stop="closeSnackbar">
						<v-icon>mdi-close</v-icon>
					</v-btn>
				</div>
			</div>
		</v-snackbar>

		<v-overlay class="app-loader" :value="loaderDialog" :z-index="300">
			<v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
		</v-overlay>
	</v-app>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import helpers from "./helpers";
import packageJSON from "../package.json";
export default {
	name: "App",

	components: {},
	data: () => ({
		navigationToggle: false,
		localSnackbarState: false,
		currentRoute: "",
		title: "TITLE",
		settingsRoute: {
			title: "Settings",
			route: "/settings",
		},
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
				title: "My Jobs",
				route: "/jobs",
				highlight: false,
			},
		],
		logoutPortal: { icon: "account_circle", title: "account page", route: "/account-page" },
		version: "1.0.0",
	}),
	async created() {
		this.version = packageJSON.version;
		this.setRouteItems();
		if (helpers.getCurrentRoute() != "settings") {
			this.currentRoute = this.routeItems.find((e) => e.route == "/" + helpers.getCurrentRoute()).title || "Dashboard";
		} else {
			this.currentRoute = this.settingsRoute.title;
		}
		// this.title = this.title.split("/")[0] + " / " + this.currentRoute;
		this.title = this.currentRoute;
	},
	methods: {
		...mapActions(["logout"]),
		...mapMutations(["openLoaderDialog", "closeLoaderDialog", "resetState", "openSnackbar", "closeSnackbar"]),
		setRouteItems() {
			if (this.userType == this.ADMIN) {
				let tempArray = [];
				this.routeItems = this.routeItems.concat(tempArray);
			}
		},
		toggleNav() {
			this.navigationToggle = !this.navigationToggle;
		},
		async logoutUser() {
			console.log("User Logged Out");
			this.openSnackbar({ text: "You are being logged out" });
			this.openLoaderDialog();
			await this.logout();
			this.closeLoaderDialog();
			if (this.currentRoute != "Dashboard") this.$router.push({ path: "/" });
			localStorage.clear();
			this.resetState();
			this.$emit("userHasLoggedOut");
		},
		openPortal(item) {
			if (item.title !== this.currentRoute) {
				// this.title = this.title.split("/")[0] + "/" + item.title;
				this.currentRoute = item.title;
				this.title = item.title;
				if (item.hasOwnProperty("prop")) {
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
			}
		},
	},
	computed: {
		...mapGetters([
			"loaderDialog",
			"userData",
			"userType",
			"snackbarState",
			"snackbarText",
			"snackbarTime",
			"ADMIN",
			"USER",
		]),
	},
	watch: {
		snackbarState(nv) {
			this.localSnackbarState = nv;
		},
		localSnackbarState(nv) {
			if (!nv) {
				this.closeSnackbar();
			}
		},
	},
};
</script>
<style lang="scss" scoped>
// .title-wrapper {
// 	// transform: translateX(-50%);
// 	text-align: center;
// 	width: 100%;
// 	font-size: 20px;
// 	color: white;
// 	padding-top: 24px;
// 	padding-bottom: 54px;
// }

.logo-wrapper {
	// background-color: white;
	width: 100%;
	height: auto;
	padding: 10px;
	img {
		height: 50%;
		width: 50%;
	}
}

.toolbarWrapper {
	background: white;
}
.navigationDrawerWrapper {
	background: white;
}

.snackbarComponentWrapper {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.toolbar-version {
	font-weight: 600;
}

.toolbar-profile {
	font-size: 14px;
	font-weight: 600;
	color: black;
	border: 3px solid black;
}

#navigation-list {
	// background-color: $primary;

	.v-list-item__content {
		padding: 0px !important;
	}
	.v-list-group__header {
		font-size: 16px;
		&:not(.v-list-item--active) {
			.list-group-title {
				color: white;
			}
		}

		&.v-list-item--active {
			background-color: $error;
		}
	}

	.list-title {
		display: block;
		color: $secondaryFontColor;
		padding: 12px;
		width: 98%;
		margin: 4px 0;
	}

	.selected-route {
		background-color: $secondary;
		border-radius: 6px;
		color: white;
		box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14),
			0px 1px 5px 0px rgba(0, 0, 0, 0.12);
	}

	.list-group-title-dot {
		height: 12px;
		width: 12px;
		background-color: $secondary;
		border-radius: 50%;
		float: right;
	}
}
</style>

<style lang="scss">
#navigation-list {
	.v-list-group .v-list-group__header .v-list-item__icon.v-list-group__header__append-icon {
		margin-left: 0px;
	}

	.v-list-item__icon.v-list-group__header__append-icon {
		.v-icon.v-icon {
			color: white;
		}
	}

	.v-list-group__header {
		&.v-list-item--active {
			background-color: $secondary;
			border-left: 4px solid $secondary;
		}
	}
}
#basic-list-item {
	.v-list-item.v-list-item--link.active-list-item {
		background-color: $secondary;
		border-left: 4px solid $secondary;
	}
}
.app-loader {
	z-index: 10;
}
</style>
