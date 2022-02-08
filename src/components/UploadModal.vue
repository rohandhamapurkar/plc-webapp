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
						<div class="section-title">
							Uploading
						</div>
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
						<v-file-input
							v-model="file"
							type="file"
							class="upload-file-selector"
							:accept="accept"
						></v-file-input>
						<div class="upload-actions">
							<v-btn
								outlined
								:disabled="!showProgress && file ? false : true"
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
	import { mapActions, mapGetters, mapMutations } from "vuex";
	export default {
		name: "UploadModal",
		mixins: [],
		components: {},
		created() {},
		data: () => ({
			modal: false,
			file: false,
			showProgress: false,
			file: null,
		}),
		methods: {
			...mapMutations(["openLoaderDialog", "closeLoaderDialog", "openSnackbar"]),
			...mapActions("ManageAgents", ["downloadSample"]),
			closeModal(clearSession = false) {
				this.$emit("closeModal", clearSession);
			},
			uploadFile() {
				let formData = this.createFormData(this.file);
				this.showProgress = true;
				this.uploadFunction(formData).then((data) => {
					this.showProgress = false;
					if (data.ok) {
						this.openSnackbar({ text: "File Upload Sucessful. Check logs for Process Status" });
						this.closeModal();
						this.file = null;
					} else {
						this.openSnackbar({ text: data.message });
					}
				});
			},
			createFormData(file) {
				let formData = new FormData();
				formData.append(this.formDataName, file);
				if (this.process_id) formData.append("process_id", this.process_id);
				return formData;
			},
			downloadSampleFile() {
				this.downloadSampleFunc().then(() => {});
			},
		},
		computed: {
			...mapGetters(["uploadPercentage"]),
		},
		watch: {
			toggleModal(nv, ov) {
				this.modal = nv;
				if (nv) this.file = null;
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
		justify-content: flex-end;
	}
	.upload-file-selector {
		flex-basis: 95%;
	}
</style>
