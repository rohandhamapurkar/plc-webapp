import InformationCard from "../components/InformationCard.vue";
import ViewMoreModal from "../components/ViewMoreModal";
import { mapActions, mapGetters, mapMutations } from "vuex";

const defaultCRUDMixins = {
	components: {
		InformationCard,
		ViewMoreModal,
	},
	data: () => ({
		viewMoreModal: false,
	}),
	computed: {},
	methods: {
		...mapMutations(["openLoaderDialog", "closeLoaderDialog", "openSnackbar"]),
	},
};

export default defaultCRUDMixins;
