<template>
	<div class="wrapper">
		<v-container text-xs-center grid-list-sm>
			<v-layout justify-center row wrap>
				<v-flex xs12 sm12 md5>
					<v-text-field
						persistent-hint
						hint="Enter Text to Filter by"
						color="yellow darken-3"
						label="Filter Text"
						v-model="filterText"
					></v-text-field>
				</v-flex>
			</v-layout>
		</v-container>
		<v-container text-xs-center grid-list-sm>
			<v-layout justify-center row wrap>
				<v-flex xs6 sm6 md3>
					<v-btn @click="filterStockist" flat color="orange darken-1" large>Filter</v-btn>
				</v-flex>
				<v-flex xs6 sm6 md3 @click="refreshStockistList">
					<v-btn color="pink" flat>Reset Filter</v-btn>
				</v-flex>
			</v-layout>
		</v-container>
		<v-list two-line>
			<v-list-tile @click="function () {}" v-for="item in templatesData" :key="item.title" avatar>
				<v-list-tile-avatar>
					<v-icon :class="[item.iconClass]">{{ item.icon }}</v-icon>
				</v-list-tile-avatar>

				<v-list-tile-content>
					<v-list-tile-title>{{ item.title }}</v-list-tile-title>
					<v-list-tile-sub-title>{{ item.subtitle }}</v-list-tile-sub-title>
				</v-list-tile-content>
			</v-list-tile>
		</v-list>
		<div class="mt-1 mb-1 text-xs-center">
			<v-pagination
				color="yellow darken-3"
				prev-icon="navigate_before"
				next-icon="navigate_next"
				v-model="page"
				:total-visible="5"
				:length="paginationLength"
				@input="updatePage"
			></v-pagination>
		</div>
		<v-btn @click="refreshStockistList" color="pink" fab dark fixed small bottom right>
			<v-icon>autorenew</v-icon>
		</v-btn>
	</div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
export default {
	data() {
		return {
			page: 1,
			paginationLength: 10,
			filterText: "",
			extension: false,
			fileExtensions: [{ text: "All", value: false }],
			forceRejectFilesDialog: false,
			selectedReasons: [],
			rejectReasons: [],
			uuidsToForceReject: [],
			templatesData: [
				{
					icon: "insert_drive_file",
					iconClass: "grey lighten-1 white--text",
					title: "Photos",
					subtitle: "Jan 9, 2014",
				},
				{
					icon: "insert_drive_file",
					iconClass: "grey lighten-1 white--text",
					title: "Recipes",
					subtitle: "Jan 17, 2014",
				},
				{ icon: "insert_drive_file", iconClass: "grey lighten-1 white--text", title: "Work", subtitle: "Jan 28, 2014" },
			],
		};
	},
	components: {},
	created() {
		// this.fetchTemplates();
	},
	methods: {
		...mapMutations(["openSnackbar"]),
		...mapMutations("templates", ["openFileMetaDialog", "setSelectedFile"]),
		...mapMutations(["openLoaderDialog", "closeLoaderDialog"]),

		fetchTemplates() {
			this.openLoaderDialog();
			this.getMyTemplates({
				pageNo: this.page,
				pageSize: 20,
				text: this.filterText,
			}).then((data) => {
				this.closeLoaderDialog();
				if (data) {
					// console.log(data);
					this.paginationLength = Math.ceil(data.length / 20);
					// console.log("Loaded mail meta");
				}
			});
		},
		refreshStockistList() {
			// this.page = 1;
			this.filterText = "";
			// this.extension = false;
			// this.fetchTemplates();
		},
		updatePage() {
			// this.fetchTemplates();
		},
		filterStockist() {
			this.page = 1;
			// this.fetchTemplates();
		},
	},
	computed: {},
	mounted() {},
	watch: {},
};
</script>

<style lang="scss" scoped>
.v-pagination >>> li button {
	width: 100%;
	min-width: 35px;
}
.v-card__text {
	padding: 0px;
}

.force-reject-files-dialog {
	padding: 20px;
}
</style>
