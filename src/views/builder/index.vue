<template>
	<div class="enhance-wrapper default-page-padding">
		<div v-if="selectedRender" class="render-enhance-wrapper">
			<div class="render-enhance-canvas-wrapper">
				<CanvasWrapper :selectedRender="selectedRender" />
			</div>
			<div class="render-enhance-canvas-editor-wrapper">
				<CanvasEditorWrapper />
			</div>
		</div>
		<div v-else>
			<div class="templates-search-bar">
				<h1>Select Template to start building</h1>
				<Search
					ref="templatesSearch"
					@queryString="queryString"
					@filterObject="advanceSearch"
					@clearFilter="advanceSearch"
					:placeholder="placeholder"
					:isAdvanceSearch="true"
					:filterConfig="selectedSearchConfig"
				></Search>
			</div>
			<div class="card-wrapper">
				<div v-for="templateItem in templatesList" :key="templateItem._id" class="card-element">
					<v-card class="mx-auto">
						<v-card-text>
							<div>Template</div>
							<p class="text-h4 text--primary">{{ templateItem.name }}</p>
							<div class="text--primary">
								Created On: {{ getFormattedDate(templateItem.record.createdOn, "DD/MM/YYYY - hh:mm A UTC") }}<br />
								Updated On: {{ getFormattedDate(templateItem.record.updatedOn, "DD/MM/YYYY - hh:mm A UTC") }}<br />
							</div>
						</v-card-text>
						<v-card-actions>
							<v-btn @click="setSelectedRenderObject(templateItem)" color="primary" text> Select </v-btn>
						</v-card-actions>
					</v-card>
				</div>
			</div>

			<div v-if="isPaginationRequired" class="paginationWrapper text-center">
				<v-pagination
					@input="updatedPageNo"
					v-model="pageNo"
					:length="Math.ceil(fetchCount / pageSize)"
					:total-visible="paginationTotalVisible"
					class="pagination-component"
				></v-pagination>
				<div class="page-size-dropdown">
					<v-autocomplete v-model="pageSize" :items="pageSizeList" auto-select-first solo dense></v-autocomplete>
				</div>
			</div>
			<DialogModal @closeModal="dialogModal = false" :toggleModal="dialogModal" :modalName="'Select Dataset and Field'">
				<template v-slot:modalContent>
					<v-autocomplete
						v-model="selectedDatasetDetail"
						:items="items"
						:loading="isLoading"
						:search-input.sync="search"
						color="white"
						hide-no-data
						hide-selected
						item-text="Description"
						item-value="API"
						label="Public APIs"
						placeholder="Start typing to Search"
						prepend-icon="mdi-database-search"
						return-object
					></v-autocomplete>
				</template>
			</DialogModal>
		</div>
	</div>
</template>

<script>
import CanvasWrapper from "@/components/canvas/CanvasWrapper.vue";
import CanvasEditorWrapper from "@/components/canvas/CanvasEditorWrapper.vue";
import searchMixin from "@/mixins/searchMixin";
import helperMixin from "@/mixins/helperMixins";
import { eventBus } from "@/event-bus";
import { mapActions, mapMutations } from "vuex";

export default {
	components: {
		CanvasWrapper,
		CanvasEditorWrapper,
	},
	mixins: [helperMixin, searchMixin],
	mounted() {},
	beforeDestroy() {
		eventBus.$off("data-driven-text-add-event");
	},
	created() {
		eventBus.$on("data-driven-text-add-event", function () {
			let datasetId = "2d37sad3awd";
			let datasetName = "testDataset";
			let fieldName = "name";
			eventBus.$emit("dataset-selection", { datasetId, datasetName, fieldName });
		});
	},
	data: () => ({
		selectedRender: false,
		name: "Template",
		placeholder: "Search Templates",
		dialogModal: false,
		activeState: true,
		descriptionLimit: 60,
		entries: [],
		isLoading: false,
		selectedDatasetDetail: null,
		search: null,
		selectedSearchConfig: [
			{
				name: "Template Name",
				key: "name",
				type: "text",
				inputType: "textfield",
				defaultValue: "",
			},
		],
		templatesList: [
			{
				_id: 1,
				record: {
					createdOn: new Date(),
					updatedOn: new Date(),
				},
				templateImageURL: "https://i1.lensdump.com/i/r7yvIe.jpg",
				name: "Felix Wedding Invitation",
				imageDimensions: { width: "581", height: "874" },
			},
			{
				_id: 2,
				record: {
					createdOn: new Date(),
					updatedOn: new Date(),
				},
				templateImageURL: "https://i2.lensdump.com/i/r7yLmk.jpg",
				name: "Pablo Birthday Card",
				imageDimensions: { width: "1086", height: "812" },
			},
		],
	}),
	computed: {
		items() {
			return this.entries.map((entry) => {
				const Description =
					entry.Description.length > this.descriptionLimit
						? entry.Description.slice(0, this.descriptionLimit) + "..."
						: entry.Description;

				return Object.assign({}, entry, { Description });
			});
		},
	},
	watch: {
		search(val) {
			// Items have already been loaded
			if (this.items.length > 0) return;

			// Items have already been requested
			if (this.isLoading) return;

			this.isLoading = true;

			// Lazily load input items
			fetch("https://api.publicapis.org/entries")
				.then((res) => res.json())
				.then((res) => {
					const { count, entries } = res;
					this.count = count;
					this.entries = entries;
				})
				.catch((err) => {
					console.log(err);
				})
				.finally(() => (this.isLoading = false));
		},
	},
	methods: {
		...mapActions("Templates", ["getTemplatesList"]),
		...mapMutations("Templates", ["setTemplatesList"]),
		getData(callMutation = false) {
			this.openLoaderDialog();
			this.getTemplatesList({
				filter: this.filter,
				pageSize: this.pageSize,
				pageNo: this.pageNo,
			}).then((data) => {
				this.closeLoaderDialog();
				this.templatesList = this.checkForErrorMessage(data, "template");
				this.totalCount = data.totalCount;
				this.fetchCount = data.fetchCount;
				if (callMutation) {
					this.setTemplatesList(this.templatesList);
				}
			});
		},
		advanceSearch(filterObject) {
			this.filter = { ...filterObject };
			if (this.filter.active) {
				this.activeState = false;
			} else {
				this.activeState = true;
			}
			this.pageNo = 1;
			this.getData();
		},

		setSelectedRenderObject(templateItem) {
			this.selectedRender = {};
			this.selectedRender.imageUrl = templateItem.templateImageURL;
			this.selectedRender.dimension = templateItem.imageDimensions;
		},
	},
};
</script>

<style lang="scss" scoped>
.render-enhance-wrapper {
	display: flex;
	justify-content: space-between;
}
.render-enhance-canvas-wrapper {
	flex-basis: 70%;
}
.render-enhance-canvas-editor-wrapper {
	flex: 0 0 30%;
	display: flex;
	.canvas-editor-wrapper {
		margin: 0 auto;
		width: 80%;
	}
}
.templates-dropdown {
	margin-top: 12px;
	display: flex;
	justify-content: center;
	text-align: center;
	flex-direction: column;
}
.templates-search-bar {
	margin-top: 12px;
	display: flex;
	justify-content: center;
	text-align: center;
	flex-direction: column;
}
</style>
