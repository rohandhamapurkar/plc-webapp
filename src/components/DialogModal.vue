<template>
	<div class="dialogModalWrapper">
		<!-- attach=".dialogModalWrapper" -->
		<v-dialog v-model="dialogModalState" width="600px" persistent style="z-index: 20000">
			<!-- <v-card> -->
			<v-card-title class="dialogHeadline">
				<span>{{ modalName }}</span>
				<v-spacer></v-spacer>
				<div class="close-dialog" @click="closeModal()">
					<v-btn fab color="error" text>
						<v-icon>mdi-close</v-icon>
					</v-btn>
				</div>
			</v-card-title>
			<div class="modalContent">
				<slot name="modalContent"></slot>
			</div>
			<!-- </v-card> -->
		</v-dialog>
	</div>
</template>
<script>
// import helperMixin from "../mixins/helperMixins";
// import searchMixin from "../mixins/searchMixin";
// import { mapActions, mapGetters, mapMutations } from "vuex";
export default {
	name: "DialogModal",
	components: {},
	created() {
		// console.log("Created");
	},
	updated() {
		// console.log("Updated");
	},
	data: () => ({
		dialogModalState: false,
	}),
	methods: {
		closeModal() {
			this.$emit("closeModal");
		},
	},
	watch: {
		toggleModal(nv, ov) {
			this.dialogModalState = nv;
		},
	},
	props: {
		toggleModal: { required: true, default: true },
		modalName: { default: "Info", type: String },
	},
};
</script>
<style lang="scss" scoped>
.dialogHeadline {
	flex-wrap: nowrap;
	word-break: break-word;
}
</style>
