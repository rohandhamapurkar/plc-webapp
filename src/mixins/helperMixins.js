import helpers from "../helpers";

const helperMixins = {
	components: {},
	data: () => ({}),
	computed: {},
	methods: {
		getFormattedDate(date, format = "DD/MM/YYYY") {
			return helpers.getFormattedDate(date, format);
		},
		daysUntil(dateToCheckAgainst, todayMessage) {
			return helpers.daysUntil(dateToCheckAgainst, todayMessage);
		},
		isSelectedDateCurrentDate(date) {
			return helpers.isSelectedDateCurrentDate(date);
		},
	},
};

export default helperMixins;
