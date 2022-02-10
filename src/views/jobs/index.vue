<template>
	<div class="jobsWrapper">
		<div>
			<v-list style="width: 100%">
				<v-list-item @click="() => {}" v-for="jobItem in jobsList" :key="jobItem._id">
					<v-list-item-avatar>
						<v-icon :class="'blue'" v-text="'mdi-clipboard-text'"></v-icon>
					</v-list-item-avatar>

					<v-list-item-content>
						<v-list-item-title v-text="`Job Id: ${jobItem._id}`"></v-list-item-title>

						<v-list-item-subtitle
							v-text="getFormattedDate(jobItem.record.createdOn, 'DD/MM/YYYY - hh:mm A UTC')"
						></v-list-item-subtitle>
					</v-list-item-content>
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

		<DialogModal @closeModal="dialogModal = false" :toggleModal="dialogModal" :modalName="dialogModalTitle">
			<template v-slot:modalContent> </template>
		</DialogModal>
	</div>
</template>

<script>
import defaultCRUDMixin from "@/mixins/defaultCRUDMixins";
import helperMixin from "@/mixins/helperMixins";
import searchMixin from "@/mixins/searchMixin";
import DialogModal from "@/components/DialogModal.vue";
import { mapActions, mapMutations } from "vuex";

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
		selectedRowInfo: {},
		dialogModal: false,
		dialogModalTitle: "",
		jobsList: [],
	}),
	computed: {},
	methods: {
		...mapActions("Jobs", ["getJobsList"]),
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
			this.dialogModal = true;
			this.selectedCardInfo = selectedEntry;
			this.dialogModalTitle = "Job id: " + selectedEntry.id;
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
