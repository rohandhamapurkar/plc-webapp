<template>
	<div class="datasetsWrapper">
		<div class="datasets-search-bar">
			<Search
				ref="datasetsSearch"
				@queryString="queryString"
				@filterObject="advanceSearch"
				@clearFilter="advanceSearch"
				:placeholder="placeholder"
				:isAdvanceSearch="true"
				:filterConfig="selectedSearchConfig"
			></Search>
		</div>

		<div v-if="showErrorMessage" class="content-error-message">
			{{ errorMessage }}
		</div>

		<div class="card-wrapper">
			<div v-for="datasetItem in datasetsList" :key="datasetItem._id" class="card-element">
				<v-card class="mx-auto">
					<v-card-text>
						<div>Dataset</div>
						<p class="text-h4 text--primary">{{ datasetItem.name }}</p>
						<div class="text--primary">
							Created On: {{ getFormattedDate(datasetItem.record.createdOn, "DD/MM/YYYY - hh:mm A UTC") }}<br />
						</div>
					</v-card-text>
					<v-card-actions>
						<v-btn @click="openViewMoreModal(datasetItem)" color="primary" text> View </v-btn>
						<v-btn @click="deleteTemplateEntry(datasetItem)" color="red" text> Delete </v-btn>
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

		<ViewMoreModal @closeModal="closeViewMoreModal" :toggleModal="viewMoreModal">
			<template v-slot:modalTitle>
				<div v-if="selectedDataset.name">
					{{ selectedDataset.name }}
				</div>
			</template>
			<template v-slot:modalContent>
				<v-simple-table>
					<template v-slot:default>
						<thead>
							<tr>
								<th v-for="item in selectedDatasetHeaders" :key="item" class="text-left">{{ item }}</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="item in selectedDatasetData" :key="item._id">
								<td v-for="header in selectedDatasetHeaders" :key="item._id + header">{{ item[header] }}</td>
							</tr>
						</tbody>
					</template>
				</v-simple-table>
			</template>
		</ViewMoreModal>

		<UploadModal
			accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
			@closeModal="closeUploadModal"
			:toggleModal="uploadModal"
			title="Upload Dataset"
			:uploadFunction="uploadFileFunc"
			:downloadSampleFunc="downloadSampleFileFunc"
			:showDownloadSampleButton="true"
			:extraFormFields="[{ text: 'Enter Dataset Name', name: 'name' }]"
			formDataName="dataset"
		>
		</UploadModal>

		<div class="floating-button">
			<v-btn @click="toggleUploadModal(true)" color="primary" dark fab>
				<v-icon>mdi-plus</v-icon>
			</v-btn>
		</div>
	</div>
</template>

<script>
import inputFormMixin from "@/mixins/inputFormMixin";
import defaultCRUDMixin from "@/mixins/defaultCRUDMixins";
import searchMixin from "@/mixins/searchMixin";
import helperMixin from "@/mixins/helperMixins";
import { mapActions, mapMutations } from "vuex";

import UploadModal from "@/components/UploadModal.vue";

export default {
	name: "Datasets",
	mixins: [defaultCRUDMixin, helperMixin, inputFormMixin, searchMixin],
	components: {
		UploadModal,
	},
	async created() {
		// this.getData();
	},
	data: () => ({
		name: "Datasets",
		placeholder: "Search Datasets",
		activeState: true,
		uploadModal: false,
		selectedSearchConfig: [
			{
				name: "Dataset Name",
				key: "name",
				type: "text",
				inputType: "textfield",
				defaultValue: "",
			},
		],
		selectedDataset: {},
		selectedDatasetHeaders: ["field_1", "field_2"],
		selectedDatasetData: [
			{
				field_1: "Frozen Yogurt",
				field_2: 159,
			},
			{
				field_1: "Frozen Yogurt",
				field_2: 159,
			},
			{
				field_1: "Frozen Yogurt",
				field_2: 159,
			},
			{
				field_1: "Frozen Yogurt",
				field_2: 159,
			},
			{
				field_1: "Frozen Yogurt",
				field_2: 159,
			},
		],
		datasetsList: [
			{
				_id: 1,
				record: {
					createdOn: new Date(),
				},
				name: "Felix Wedding Invitees",
			},
			{
				_id: 2,
				record: {
					createdOn: new Date(),
				},
				name: "Pablo Birthday Invitees",
			},
		],
	}),
	computed: {},
	methods: {
		...mapActions("Datasets", ["getDatasetsList", "getDatasetData", "uploadDataset", "deleteDataset"]),
		...mapMutations("Datasets", ["setDatasetsList"]),
		...mapMutations(["openLoaderDialog", "closeLoaderDialog"]),
		getData(callMutation = false) {
			this.openLoaderDialog();
			this.getDatasetsList({
				filter: this.filter,
				pageSize: this.pageSize,
				pageNo: this.pageNo,
			}).then((data) => {
				this.closeLoaderDialog();
				this.datasetsList = this.checkForErrorMessage(data, "template");
				this.totalCount = data.totalCount;
				this.fetchCount = data.fetchCount;
				if (callMutation) {
					this.setDatasetsList(this.datasetsList);
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

		openViewMoreModal(datasetItem) {
			this.selectedDataset = datasetItem;
			this.openLoaderDialog();
			this.getDatasetData({
				_id: datasetItem._id,
			}).then((data) => {
				this.closeLoaderDialog();
				this.selectedDatasetHeaders = data.headers;
				this.selectedDatasetData = data.rows;
				this.viewMoreModal = true;
			});
		},
		closeViewMoreModal() {
			this.selectedDatasetHeaders = [];
			this.selectedDatasetData = [];
			this.viewMoreModal = false;
		},

		deleteDatasetEntry(entry) {
			if (window.confirm("Do you really want to the dataset?")) {
				this.openLoaderDialog();
				this.deleteDataset({
					_id: entry._id,
				}).then((data) => {
					this.closeLoaderDialog();
					if (data.ok) {
						this.openSnackbar({
							text: "Sucessfully Deleted the Dataset",
						});
						this.getData();
					} else {
						this.openSnackbar({ text: data.message });
					}
				});
			}
		},

		uploadFileFunc(formData) {
			return this.uploadDataset(formData);
		},
		downloadSampleFileFunc() {
			return;
		},
		toggleUploadModal(value) {
			this.uploadModal = value;
		},
		closeUploadModal(data) {
			this.toggleUploadModal(false);
		},
	},
	watch: {},
	props: {},
};
</script>

<style lang="scss" scopped>
.datasetsWrapper {
	padding: 20px 5px;
	height: 100%;

	.template-name {
		text-transform: none;
	}
}
.datasets-search-bar {
	margin-top: 12px;
	display: flex;
	justify-content: center;
}
</style>
