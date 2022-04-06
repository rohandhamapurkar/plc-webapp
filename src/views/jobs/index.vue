<template>
	<div class="jobsWrapper">
		<div>
			<v-list style="width: 100%">
				<v-list-item @click="openDialogModal(jobItem)" v-for="jobItem in jobsList" :key="jobItem._id">
					<v-list-item-avatar>
						<v-icon :class="'blue'" v-text="'mdi-clipboard-text'"></v-icon>
					</v-list-item-avatar>

					<v-list-item-content>
						<v-list-item-title v-text="`Job Id: ${jobItem._id}`"></v-list-item-title>

						<v-list-item-subtitle
							v-text="getFormattedDate(jobItem.record.createdOn, 'DD/MM/YYYY - hh:mm A UTC')"
						></v-list-item-subtitle>
					</v-list-item-content>
					<v-list-item-action>
						<v-icon color="grey lighten-1">mdi-information</v-icon>
					</v-list-item-action>
				</v-list-item>
			</v-list>
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

		<DialogModal @closeModal="closeDialogModal" :toggleModal="dialogModal" :modalName="dialogModalTitle">
			<template v-if="selectedJobInfo" v-slot:modalContent>
				<v-card class="mx-auto" max-width="600">
					<v-card-title class="blue-grey white--text">
						<span class="text-h6">Job Output</span>
						<v-spacer></v-spacer>
					</v-card-title>
					<v-card-text class="py-0">
						<span
							v-if="
								selectedJobInfo.changelog[0].status === 'SUCCESS' &&
								selectedJobInfo.jobInfo.hasOwnProperty('outputFile')
							"
							class="text-h6"
						>
							Job Completed Download output here
							<v-spacer></v-spacer>
							<v-btn @click="downloadOutputFile(selectedJobInfo.jobInfo.outputFile)"> Download </v-btn>
						</span>
						<span
							class="text-h6"
							v-else-if="
								selectedJobInfo.changelog[0].status === 'SUCCESS' &&
								!selectedJobInfo.jobInfo.hasOwnProperty('outputFile')
							"
							>Job Completed Output zip file not available</span
						>
						<span class="text-h6" v-else-if="selectedJobInfo.changelog[0].status === 'ERROR'"
							>Job encountered an error</span
						>
						<span
							class="text-h6"
							v-else-if="
								selectedJobInfo.changelog[0].status !== 'ERROR' && selectedJobInfo.changelog[0].status !== 'SUCCESS'
							"
							>Current Job Status: {{ selectedJobInfo.changelog[0].status }}</span
						>
					</v-card-text>
				</v-card>
				<v-card class="mx-auto" max-width="600">
					<v-card-title class="blue-grey white--text">
						<span class="text-h6">Job Logs</span>
						<v-spacer></v-spacer>
					</v-card-title>
					<v-card-text class="py-0">
						<v-timeline dense>
							<v-slide-x-reverse-transition group hide-on-leave>
								<v-timeline-item
									v-for="item in selectedJobInfo.changelog"
									:key="item.id"
									:color="item.color"
									small
									fill-dot
								>
									<v-alert :value="true" :color="item.color" :icon="item.icon" class="white--text">
										{{ item.text }}
										<v-spacer></v-spacer>
										{{ item.date }}
									</v-alert>
								</v-timeline-item>
							</v-slide-x-reverse-transition>
						</v-timeline>
					</v-card-text>
				</v-card>
			</template>
		</DialogModal>
	</div>
</template>

<script>
import defaultCRUDMixin from "@/mixins/defaultCRUDMixins";
import helperMixin from "@/mixins/helperMixins";
import searchMixin from "@/mixins/searchMixin";
import DialogModal from "@/components/DialogModal.vue";
import { mapActions, mapMutations } from "vuex";

const statusHashMap = {
	ARCHIVING_FILES: { icon: "mdi-information", color: "info", text: "Archiving Files" },
	DELETING_TEMP_FILES: { icon: "mdi-information", color: "info", text: "Clearing temporary files" },
	ERROR: { icon: "mdi-alert-circle", color: "error", text: "Process Errored" },
	IN_QUEUE: { icon: "mdi-information", color: "info", text: "Job In Queue" },
	PROCESSING_FILES: { icon: "mdi-information", color: "info", text: "Processing Job" },
	PUSHED_TO_QUEUE: { icon: "mdi-alert", color: "warning", text: "Pushed Job to Queue" },
	SUCCESS: { icon: "mdi-check-circle'", color: "success", text: "Job completed successfully" },
};
export default {
	name: "Jobs",
	mixins: [defaultCRUDMixin, searchMixin, helperMixin],
	components: {
		DialogModal,
	},
	async created() {
		this.getData();
	},
	data: () => ({
		name: "Jobs",
		placeholder: "Search Jobs",
		selectedJobInfo: null,
		dialogModal: false,
		dialogModalTitle: "",

		jobsList: [],
	}),
	computed: {},
	methods: {
		...mapActions("Jobs", ["getJobsList", "getJobDetails"]),
		...mapMutations(["openLoaderDialog", "closeLoaderDialog"]),
		getData() {
			this.openLoaderDialog();
			this.getJobsList({
				pageSize: this.pageSize,
				pageNo: this.pageNo,
			}).then((data) => {
				this.closeLoaderDialog();
				this.jobsList = this.checkForErrorMessage(data, "job");
				this.totalCount = data.totalCount;
				this.fetchCount = data.fetchCount;
			});
		},

		openDialogModal(selectedEntry) {
			this.dialogModalTitle = "Job id: " + selectedEntry._id;
			this.openLoaderDialog();
			this.getJobDetails({
				_id: selectedEntry._id,
			}).then((data) => {
				if (data.ok) {
					this.selectedJobInfo = {
						jobInfo: selectedEntry,
						changelog: data.jobDetails.map((e, index) => {
							if (statusHashMap[e.status])
								return {
									id: index,
									status: e.status,
									...statusHashMap[e.status],
									date: this.getFormattedDate(e.record.createdOn, "DD/MM/YYYY - hh:mm:ss A UTC"),
								};
							else
								return {
									id: index,
									status: e.status,
									icon: "mdi-information",
									color: "info",
									text: e.status,
									date: this.getFormattedDate(e.record.createdOn, "DD/MM/YYYY - hh:mm:ss A UTC"),
								};
						}),
					};
					console.log(this.selectedJobInfo);
				}
				this.closeLoaderDialog();
				this.dialogModal = true;
			});
		},

		downloadOutputFile(url) {
			var link = document.createElement("a");
			link.setAttribute("download", "");
			link.href = url;
			document.body.appendChild(link);
			link.click();
			link.remove();
		},

		closeDialogModal() {
			this.selectedJobInfo = null;
			this.dialogModalTitle = "";
			this.dialogModal = false;
		},
	},
	watch: {},
	props: {},
};
</script>

<style lang="scss" scopped>
.jobsWrapper {
	padding: 20px 5px;
	height: 100%;

	.template-name {
		text-transform: none;
	}
}
</style>
