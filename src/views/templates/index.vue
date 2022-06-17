<template>
	<div class="templatesWrapper">
		<div class="templates-search-bar">
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

		<div v-if="showErrorMessage" class="content-error-message">
			{{ errorMessage }}
		</div>

		<div class="card-wrapper">
			<div v-for="templateItem in templatesList" :key="templateItem._id" class="card-element">
				<v-card class="mx-auto">
					<v-card-text>
						<div>Template</div>
						<p class="text-h4 text--primary">{{ templateItem.name }}</p>
						<div class="text--primary">
							Created On: {{ getFormattedDate(templateItem.createdOn, "DD/MM/YYYY - hh:mm A UTC") }}<br />
							Updated On: {{ getFormattedDate(templateItem.updatedOn, "DD/MM/YYYY - hh:mm A UTC") }}<br />
						</div>
					</v-card-text>
					<v-card-actions>
						<v-btn @click="openDialogModal(templateItem)" color="primary" text> View </v-btn>
						<v-btn @click="openInputForm(true, templateItem)" color="secondary" text> Edit </v-btn>
						<v-btn @click="deleteTemplateEntry(templateItem)" color="red" text> Delete </v-btn>
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

		<DialogModal @closeModal="dialogModal = false" :toggleModal="dialogModal" :modalName="dialogModalTitle">
			<template v-slot:modalContent>
				<v-img :src="selectedCardInfo.imageUrl" height="600px" alt="" contain />
			</template>
		</DialogModal>

		<UserForm
			@formOutput="formOutput"
			@closeForm="closeForm"
			:name="name"
			:inputConfig="inputConfig"
			:toggleForm="toggleForm"
			:formData="rowToEdit"
			:isEditMode="isEditMode"
		></UserForm>

		<div class="floating-button">
			<v-btn @click="openInputForm()" color="primary" dark fab>
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
import helpers from "@/helpers";
import DialogModal from "@/components/DialogModal.vue";
import { required, minLength } from "vuelidate/lib/validators";
import { mapActions, mapMutations } from "vuex";

export default {
	name: "Templates",
	mixins: [defaultCRUDMixin, helperMixin, inputFormMixin, searchMixin],
	components: {
		DialogModal,
	},
	async created() {
		this.getData();
	},
	data: () => ({
		name: "Template",
		placeholder: "Search Templates",
		selectedCardInfo: {},
		dialogModal: false,
		dialogModalTitle: "",
		selectedSearchConfig: [
			{
				name: "Template Name",
				key: "name",
				type: "text",
				inputType: "textfield",
				defaultValue: "",
			},
		],
		inputConfig: [
			{
				name: "Template Name*",
				type: "String",
				key: "name",
				width: "half",
				validations: {
					required,
					minLength: minLength(1),
				},
			},
			{
				name: "Template Image",
				type: "FilePicker",
				key: "imageUrl",
				width: "half",
				acceptRules: "image/png, image/jpeg, image/jpg",
				rules: [(value) => !value || value.size <= 10000000 || "Template image should be less than or equal to 10 MB!"],
			},
		],
		templatesList: [],
	}),
	computed: {},
	methods: {
		...mapActions("Templates", [
			"getTemplatesList",
			"addTemplate",
			"editTemplate",
			"deleteTemplate",
			"getSignedUrlForTemplateImage",
		]),
		...mapActions(["uploadImageToGDrive"]),
		...mapMutations(["openLoaderDialog", "closeLoaderDialog", "openSnackbar"]),
		getData() {
			this.openLoaderDialog();
			this.getTemplatesList({
				searchText: this.filter.searchText,
				pageSize: this.pageSize,
				pageNo: this.pageNo,
			}).then((data) => {
				this.closeLoaderDialog();
				this.templatesList = this.checkForErrorMessage(data, "template");
				this.totalCount = data.totalCount;
				this.fetchCount = data.fetchCount;
			});
		},

		advanceSearch(filterObject) {
			this.filter = { ...filterObject };
			this.pageNo = 1;
			this.getData();
		},

		async formOutput(data) {
			let form = new FormData();
			if (data.imageUrl.fileSize !== 0) form.append("file", data.imageUrl);
			form.append("name", data.name);
			console.log(form);
			this.openLoaderDialog();
			return this.editOrCreate(form, data._id);
		},

		async editOrCreate(inputFormData, id) {
			if (!this.isEditMode) {
				let err = await this.addTemplate(inputFormData);
				this.closeLoaderDialog();
				if (err) this.openSnackbar({ text: err.message });
				else this.openSnackbar({ text: "Sucessfully Added Template" });
			} else {
				let err = await this.editTemplate({ form: inputFormData, id });
				if (err) this.openSnackbar({ text: err.message });
				else this.openSnackbar({ text: "Sucessfully Edited Template" });
			}
			this.closeLoaderDialog();
			this.getData();
			this.closeForm();
		},

		getEditRowObject(data) {
			return {
				...data,
				_id: data._id,
				updatedOn: data.updatedOn,
			};
		},

		openDialogModal(selectedEntry) {
			this.dialogModal = true;
			this.selectedCardInfo = selectedEntry;
			this.dialogModalTitle = selectedEntry.name;
			console.log(this.selectedCardInfo);
		},

		deleteTemplateEntry(entry) {
			if (window.confirm("Do you really want to delete the template?")) {
				this.openLoaderDialog();
				this.deleteTemplate({
					id: entry._id,
				}).then((data) => {
					this.closeLoaderDialog();
					this.openSnackbar({
						text: "Sucessfully Deleted the Template",
					});
					this.getData();
				});
			}
		},
	},
	watch: {},
	props: {},
};
</script>

<style lang="scss" scopped>
.templatesWrapper {
	padding: 20px 5px;
	height: 100%;

	.template-name {
		text-transform: none;
	}
}
.templates-search-bar {
	margin-top: 12px;
	display: flex;
	justify-content: center;
}
</style>
