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
							Created On: {{ getFormattedDate(templateItem.record.createdOn, "DD/MM/YYYY - hh:mm A UTC") }}<br />
							Updated On: {{ getFormattedDate(templateItem.record.updatedOn, "DD/MM/YYYY - hh:mm A UTC") }}<br />
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
				<v-img :src="selectedCardInfo.templateImageURL" height="600px" alt="" contain />
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
				key: "templateImageURL",
				width: "half",
				acceptRules: "image/png, image/jpeg",
				rules: [(value) => !value || value.size <= 15000000 || "Template image should be less than or equal to 15 MB!"],
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
		...mapActions(["uploadImageToSignedUrl"]),
		...mapMutations(["openLoaderDialog", "closeLoaderDialog"]),
		getData() {
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
			});
		},

		advanceSearch(filterObject) {
			this.filter = { ...filterObject };
			this.pageNo = 1;
			this.getData();
		},

		async formOutput(data) {
			var imageFile = data.templateImageURL;
			var inputFormData = JSON.parse(JSON.stringify(data));

			console.log(imageFile);
			this.getSignedUrlForTemplateImage({
				fileName: imageFile.name,
				fileType: "template",
				fileSize: imageFile.size,
				fileExt: imageFile.extension,
			}).then((respData0) => {
				if (respData0.ok) {
					let formData = new FormData();
					for (let key in respData0.uploadMetaData.fields) {
						formData.append(key, respData0.uploadMetaData.fields[key]);
					}
					formData.append("file", imageFile);
					this.uploadImageToSignedUrl({
						uploadUrl: respData0.uploadMetaData.url,
						formData,
					}).then((respData1) => {
						if (respData1.ok) {
							inputFormData.imageUrl = respData0.publicUrl;
							console.log(inputFormData);
							// this.openLoaderDialog();
							// if (!Dthis.isEditMode) {
							// 	this.addAddress(inputFormData).then((data) => {
							// 		this.closeLoaderDialog();
							// 		if (data.ok) {
							// 			this.openSnackbar({ text: "Sucessfully Added Template" });
							// 			this.getData();
							// 			this.closeForm();
							// 		} else {
							// 			this.openSnackbar({ text: data.message });
							// 		}
							// 	});
							// } else {
							// 	this.editAddress(inputFormData).then((data) => {
							// 		this.closeLoaderDialog();
							// 		if (data.ok) {
							// 			this.openSnackbar({ text: "Sucessfully Edited Template" });
							// 			this.getData();
							// 			this.closeForm();
							// 		} else {
							// 			this.openSnackbar({ text: data.message });
							// 		}
							// 	});
							// }
						} else {
							this.openSnackbar({ text: "Couldn't upload image" });
						}
					});
				} else {
					this.openSnackbar({ text: "Couldn't get template image upload url" });
				}
			});
		},

		getEditRowObject(data) {
			return {
				...data,
				_id: data._id,
				updatedOn: data.record.updatedOn,
			};
		},

		openDialogModal(selectedEntry) {
			this.dialogModal = true;
			this.selectedCardInfo = selectedEntry;
			this.dialogModalTitle = selectedEntry.name;
		},

		deleteTemplateEntry(entry) {
			if (window.confirm("Do you really want to delete the template?")) {
				this.openLoaderDialog();
				this.deleteTemplate({
					_id: entry._id,
				}).then((data) => {
					this.closeLoaderDialog();
					if (data.ok) {
						this.openSnackbar({
							text: "Sucessfully Deleted the Template",
						});
						this.getData();
					} else {
						this.openSnackbar({ text: data.message });
					}
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
