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
							Created On: {{ getFormattedDate(datasetItem.createdOn, "DD/MM/YYYY - hh:mm A UTC") }}<br />
						</div>
					</v-card-text>
					<v-card-actions>
						<v-btn @click="openViewMoreModal(datasetItem)" color="primary" text> View </v-btn>
						<v-btn @click="deleteDatasetEntry(datasetItem)" color="red" text> Delete </v-btn>
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
			formDataName="file"
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
import defaultCRUDMixin from "@/mixins/defaultCRUDMixins";
import searchMixin from "@/mixins/searchMixin";
import helperMixin from "@/mixins/helperMixins";
import { mapActions, mapMutations } from "vuex";

import UploadModal from "@/components/UploadModal.vue";

export default {
	name: "Datasets",
	mixins: [defaultCRUDMixin, helperMixin, searchMixin],
	components: {
		UploadModal,
	},
	async created() {
		this.getData();
	},
	data: () => ({
		name: "Datasets",
		placeholder: "Search Datasets",
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
		selectedDatasetHeaders: [],
		selectedDatasetData: [],
		datasetsList: [],
	}),
	computed: {},
	methods: {
		...mapActions("Datasets", ["getDatasetsList", "getDatasetData", "uploadDataset", "deleteDataset"]),
		...mapMutations(["openLoaderDialog", "closeLoaderDialog"]),
		getData() {
			this.openLoaderDialog();
			this.getDatasetsList({
				searchText: this.filter.searchText,
				pageSize: this.pageSize,
				pageNo: this.pageNo,
			}).then((data) => {
				this.closeLoaderDialog();
				this.datasetsList = this.checkForErrorMessage(data, "dataset");
				this.totalCount = data.totalCount;
				this.fetchCount = data.fetchCount;
			});
		},

		advanceSearch(filterObject) {
			this.filter = { ...filterObject };

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
				this.selectedDatasetHeaders = datasetItem.headers;
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
				}).then((err) => {
					this.closeLoaderDialog();
					if (err)
						this.openSnackbar({
							text: "Could not delete dataset",
						});
					else
						this.openSnackbar({
							text: "Sucessfully Deleted the Dataset",
						});
					this.getData();
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
