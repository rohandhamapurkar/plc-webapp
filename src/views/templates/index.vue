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
			<div v-for="template in templatesList" :key="template._id" class="card-element">
				<!-- <InformationCard :expandCard="false">
					<template v-slot:topLeft>
						{{ template.name }}
					</template>
					<template v-slot:moreInfo>
						Created On: {{ getFormattedDate(template.record.createdOn, "MMMM Do YYYY - hh:mm A UTC") }}<br />
						Updated On: {{ getFormattedDate(template.record.updatedOn, "MMMM Do YYYY - hh:mm A UTC") }}<br />
					</template>
					<template v-slot:actionButtons>
						<template>
							
						</template>
					</template>
				</InformationCard> -->
				<v-card class="mx-auto" max-width="344">
					<v-card-text>
						<div>Template</div>
						<p class="text-h4 text--primary">{{ template.name }}</p>
						<div class="text--primary">
							Created On: {{ getFormattedDate(template.record.createdOn, "DD/MM/YYYY - hh:mm A UTC") }}<br />
							Updated On: {{ getFormattedDate(template.record.updatedOn, "DD/MM/YYYY - hh:mm A UTC") }}<br />
						</div>
					</v-card-text>
					<v-card-actions>
						<v-btn @click="openInputForm(true, template)" color="primary" text> View </v-btn>
						<v-btn @click="openInputForm(true, template)" color="secondary" text> Edit </v-btn>
						<v-btn @click="openInputForm(true, template)" color="secondary" text> Delete </v-btn>
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
import inputFormMixin from "../../mixins/inputFormMixin";
import defaultCRUDMixin from "../../mixins/defaultCRUDMixins";
import searchMixin from "../../mixins/searchMixin";
import helperMixin from "../../mixins/helperMixins";
import helpers from "../../helpers";
import { required, minLength } from "vuelidate/lib/validators";
import { mapActions, mapMutations } from "vuex";

export default {
	name: "Templates",
	mixins: [defaultCRUDMixin, helperMixin, inputFormMixin, searchMixin],
	components: {},
	async created() {
		// this.getData();
	},
	data: () => ({
		name: "Template",
		placeholder: "Search Templates",
		toggleChangelogModal: false,
		activeState: true,
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
				rules: [(value) => !value || value.size <= 5000000 || "Template image should be less than or equal to 5 MB!"],
			},
		],
		templatesList: [
			{
				_id: 1,
				record: {
					createdOn: new Date(),
					updatedOn: new Date(),
				},
				templateImageURL:
					"https://images.unsplash.com/photo-1532153955177-f59af40d6472?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3087&q=80",
				name: "Vacation itinerary",
			},
			{
				_id: 2,
				record: {
					createdOn: new Date(),
					updatedOn: new Date(),
				},
				templateImageURL:
					"https://images.unsplash.com/photo-1532153955177-f59af40d6472?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3087&q=80",
				name: "Kitchen remodel",
			},
		],
	}),
	computed: {},
	methods: {
		...mapActions("Templates", ["getTemplatesList", "addTemplate", "editTemplate", "deleteTemplate"]),
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
			// this.getData();
		},

		async formOutput(data) {
			var imageFile = data.templateImageURL;
			var formData = JSON.parse(JSON.stringify(data));
			formData.templateImageURL = imageFile;

			if (formData.templateImageURL) {
				formData.templateImageURL = await helpers.toBase64(formData.templateImageURL);
			} else {
				formData.templateImageURL = null;
			}

			this.openLoaderDialog();
			if (!this.isEditMode) {
				this.addAddress(formData).then((data) => {
					this.closeLoaderDialog();
					if (data.ok) {
						this.openSnackbar({ text: "Sucessfully Added Template" });
						// this.getData(true);
						this.closeForm();
					} else {
						this.openSnackbar({ text: data.message });
					}
				});
			} else {
				this.editAddress(formData).then((data) => {
					this.closeLoaderDialog();
					if (data.ok) {
						this.openSnackbar({ text: "Sucessfully Edited Template" });
						// this.getData(true);
						this.closeForm();
					} else {
						this.openSnackbar({ text: data.message });
					}
				});
			}
		},

		getEditRowObject(data) {
			return {
				...data,
				_id: data._id,
				updatedOn: data.record.updatedOn,
			};
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
