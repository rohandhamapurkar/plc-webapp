<template>
	<div class="uploadModalWrapper">
		<v-row justify="center">
			<v-dialog v-model="modal" width="600px" persistent>
				<v-card class="upload-card">
					<v-card-title>
						<span class="headline">{{ title }}</span>
						<v-spacer></v-spacer>
						<div class="close-dialog" @click="closeModal(true)">
							<v-btn fab color="error" text>
								<v-icon>mdi-close</v-icon>
							</v-btn>
						</div>
					</v-card-title>
					<div v-if="showProgress" class="file-upload-progress-container">
						<div class="section-title">Uploading</div>
						<div class="progress-bar-wrapper">
							<v-progress-linear height="24px" color="primary" rounded :value="uploadPercentage">
								<template v-slot:default="{ value }">
									<strong>{{ Math.ceil(value) }}%</strong>
								</template>
							</v-progress-linear>
							<!-- <div class="section-title progress-completion-status">{{ uploadPercentage }}%</div> -->
						</div>
						<div class="time-elapsed-section">
							<!-- <TimeElapsed :date="startTime"></TimeElapsed>&nbsp;elapsed -->
						</div>
					</div>
					<div v-else class="file-upload-section">
						<div v-if="extraFormFields.length">
							<template v-for="key in extraFormFields">
								<v-text-field
									full-width
									class="upload-file-selector"
									:key="key.name"
									v-model="extraFieldsDataCapture[key.name]"
									:rules="[rules.required]"
									:label="key.text"
								></v-text-field>
							</template>

							<!-- @input="$v.$touch()" -->
						</div>
						<v-file-input v-model="file" type="file" class="upload-file-selector" :accept="accept"></v-file-input>
						<div class="upload-actions">
							<v-btn
								outlined
								:disabled="!showProgress && file && !$v.$invalid ? false : true"
								color="primary"
								class="action-button"
								@click="uploadFile()"
								>Upload</v-btn
							>
							<v-btn
								v-if="showDownloadSampleButton"
								color="green"
								class="action-button"
								@click="downloadSampleFile()"
								text
								>Download Sample</v-btn
							>
						</div>
					</div>
				</v-card>
			</v-dialog>
		</v-row>
	</div>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import { required, minLength } from "vuelidate/lib/validators";
export default {
	name: "UploadModal",
	mixins: [],
	components: {},
	created() {},
	mounted() {
		this.extraFormFields.forEach((item) => {
			this.$set(this.extraFieldsDataCapture, item.name, "");
		});
	},
	validations() {
		if (this.extraFormFields.length) {
			return {
				extraFieldsDataCapture: this.extraFormFields.reduce((acc, cv) => {
					acc[cv.name] = { required, minLength: minLength(3) };
					return acc;
				}, {}),
			};
		} else {
			return {};
		}
	},
	data: function () {
		return {
			modal: false,
			file: null,
			showProgress: false,
			extraFieldsDataCapture: {},
			rules: {
				required: (value) => !!value || "Value is Required.",
			},
		};
	},
	methods: {
		...mapMutations(["openLoaderDialog", "closeLoaderDialog", "openSnackbar"]),
		closeModal(clearSession = false) {
			this.$emit("closeModal", clearSession);
		},
		uploadFile() {
			let formData = this.createFormData(this.file, this.extraFieldsDataCapture);
			this.showProgress = true;
			this.uploadFunction(formData).then((data) => {
				this.showProgress = false;
				if (data.ok) {
					this.openSnackbar({ text: "File Upload Successful." });
					this.closeModal();
					this.resetModalState();
				} else {
					this.openSnackbar({ text: data.message });
				}
			});
		},

		createFormData(file, extraData) {
			let formData = new FormData();
			Object.keys(extraData).forEach((k) => {
				formData.append(k, extraData[k]);
			});
			formData.append(this.formDataName, file);
			if (this.process_id) formData.append("process_id", this.process_id);
			return formData;
		},
		downloadSampleFile() {
			this.downloadSampleFunc().then(() => {});
		},
		resetModalState() {
			this.file = null;
			this.extraFieldsDataCapture = this.extraFormFields.reduce((acc, cv) => {
				acc[cv.name] = null;
				return acc;
			}, {});
		},
	},
	computed: {
		...mapGetters(["uploadPercentage"]),
	},
	watch: {
		toggleModal(nv, ov) {
			this.modal = nv;
			if (!nv) {
				this.resetModalState();
			}
		},
	},
	props: {
		toggleModal: { required: true, default: false },
		accept: { required: true, type: String },
		title: { required: true, type: String },
		uploadFunction: { required: true, type: Function },
		downloadSampleFunc: { required: false, type: Function },
		showDownloadSampleButton: { required: true, type: Boolean },
		process_id: { required: false, type: String },
		formDataName: { required: false, type: String, default: "travelAgents" },
		extraFormFields: { required: false, type: Array, default: () => [] },
	},
};
</script>
<style lang="scss" scoped>
.section-title {
	font-weight: 700;
	margin-bottom: 5px;
}
.file-upload-progress-container {
	padding: 20px;
	padding-bottom: 30px;
}
.file-upload-section {
	padding: 20px;
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-start;
}
.upload-file-selector {
	flex-basis: 95%;
}
</style>
