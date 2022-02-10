<template>
	<div class="enhance-wrapper default-page-padding">
		<div v-if="selectedRender" class="render-enhance-wrapper">
			<div class="render-enhance-canvas-wrapper">
				<CanvasWrapper :selectedRender="selectedRender" />
			</div>
			<div class="render-enhance-canvas-editor-wrapper">
				<CanvasEditorWrapper :selectedRender="selectedRender" />
			</div>
			<DialogModal
				@closeModal="closeDatasetSelectionModal"
				:toggleModal="dialogModal"
				:modalName="'Select Dataset and Field'"
			>
				<template v-slot:modalContent>
					<v-card color="white" class="dialog-modal">
						<v-autocomplete
							v-model="selectedDatasetDetails"
							:items="entries"
							:loading="isLoading"
							:search-input.sync="search"
							color="black"
							hide-no-data
							item-text="name"
							item-value="value"
							label="Search Datasets"
							placeholder="Start typing to Search Dataset"
							prepend-icon="mdi-database-search"
							return-object
						></v-autocomplete>
						<v-autocomplete
							v-if="selectedDatasetDetails"
							v-model="selectedDatasetField"
							:items="selectedDatasetDetails.headers"
							dense
							filled
							label="Select Header"
						></v-autocomplete>
						<v-btn v-if="selectedDatasetField" @click="submitSelectedDataset" color="primary" text> Submit </v-btn>
						<!-- hide-selected -->
					</v-card>
				</template>
			</DialogModal>
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
		</div>
	</div>
</template>

<script>
import CanvasWrapper from "@/components/canvas/CanvasWrapper.vue";
import CanvasEditorWrapper from "@/components/canvas/CanvasEditorWrapper.vue";
import DialogModal from "@/components/DialogModal.vue";
import searchMixin from "@/mixins/searchMixin";
import helperMixin from "@/mixins/helperMixins";
import { eventBus } from "@/event-bus";
import { mapActions, mapMutations } from "vuex";

export default {
	components: {
		CanvasWrapper,
		CanvasEditorWrapper,
		DialogModal,
	},
	mixins: [helperMixin, searchMixin],
	mounted() {},
	beforeDestroy() {
		eventBus.$off("data-driven-text-add-event");
		eventBus.$off("submit-for-processing-event");
	},
	created() {
		eventBus.$on("data-driven-text-add-event", () => {
			this.clearDatasetSelection();
			this.dialogModal = true;
		});

		eventBus.$on("submit-for-processing-event", this.onSubmitForProcessing);
	},
	data: () => ({
		selectedRender: false,
		name: "Template",
		placeholder: "Search Templates",
		dialogModal: false,
		activeState: true,
		entries: [],
		isLoading: false,

		selectedDatasetDetails: null,
		selectedDatasetField: null,

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
	computed: {},
	watch: {
		selectedDatasetDetails(val) {
			if (val == null) {
				this.selectedDatasetField = null;
			}
		},
		search(val) {
			// Items have already been requested
			if (this.isLoading) return;

			this.isLoading = true;

			// Lazily load input items

			let arr = [
				{
					_id: 1,
					record: {
						createdOn: new Date(),
					},
					name: "Felix Wedding Invitees",
					headers: ["field_1", "field_2", "field_3"],
				},
				{
					_id: 2,
					record: {
						createdOn: new Date(),
					},
					name: "Pablo Birthday Invitees",
					headers: ["field_1", "field_2", "field_3"],
				},
			].filter((elem) => new RegExp(val, "ig").test(elem.name));

			this.entries = arr;
			this.count = arr.length;
			this.isLoading = false;
		},
	},
	methods: {
		...mapActions("Templates", ["getTemplatesList"]),
		...mapMutations("Templates", ["setTemplatesList"]),
		...mapMutations(["openLoaderDialog", "closeLoaderDialog"]),
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

		resetState() {
			this.selectedRender = false;
			this.selectedDatasetDetails = null;
			this.selectedDatasetField = null;
		},

		onSubmitForProcessing(finalCanvasReferenceObject) {
			let fCO = JSON.parse(JSON.stringify(finalCanvasReferenceObject));
			let payload = {
				templateId: fCO.template._id,
				config: fCO.additionalBrandObjects.textObjects
					.map((elem) => {
						if (elem.id.indexOf("dataDriven_") > -1) {
							let idParts = elem.id.split("_");
							let textParts = elem.text.split(".");
							return {
								type: "from_dataset",
								datasetId: idParts[1],
								dataField: textParts[1],
								position: elem.position,
								style: elem.style,
							};
						} else {
							return {
								type: "static",
								text: elem.text,
								position: elem.position,
								style: elem.style,
							};
						}
					})
					.concat(
						fCO.additionalBrandObjects.imageObjects.map((elem) => {
							return {
								type: "image",
								url: elem.imageRef,
								attributes: elem.attributes,
								position: elem.position,
							};
						})
					),
			};
			console.log(payload);
			// this.openLoaderDialog();
			// this.resetState();
			// setTimeout(() => {
			// 	this.closeLoaderDialog();
			// }, 5000);
		},

		clearDatasetSelection() {
			this.selectedDatasetDetails = null;
			this.selectedDatasetField = null;
		},
		closeDatasetSelectionModal() {
			this.dialogModal = false;
			this.clearDatasetSelection();
		},
		submitSelectedDataset() {
			eventBus.$emit("dataset-selection", {
				datasetId: this.selectedDatasetDetails._id,
				datasetName: this.selectedDatasetDetails.name,
				fieldName: this.selectedDatasetField,
			});
			this.closeDatasetSelectionModal();
		},

		setSelectedRenderObject(templateItem) {
			this.selectedRender = {};
			this.selectedRender = {
				imageUrl: templateItem.templateImageURL,
				dimension: templateItem.imageDimensions,
				template: templateItem,
			};
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
.dialog-modal {
	height: 500px;
}
</style>
