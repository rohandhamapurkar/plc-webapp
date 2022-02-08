import UserForm from "../components/Form";

const inputFormMixins = {
	components: {
		UserForm,
	},
	data: () => ({
		toggleForm: false,
		isEditMode: false,
		rowToEdit: {},
	}),
	computed: {},
	methods: {
		openInputForm(mode = false, data = {}) {
			this.isEditMode = mode;
			if (this.isEditMode) {
				this.rowToEdit = this.getEditRowObject(data);
			}
			this.toggleForm = true;
		},
		closeForm() {
			this.rowToEdit = {};
			this.isEditMode = false;
			this.toggleForm = false;
		},
	},
};

export default inputFormMixins;
