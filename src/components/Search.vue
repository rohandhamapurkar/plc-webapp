<template>
	<div class="searchWrapper">
		<template v-if="isOnlyAdvanceSearch">
			<v-badge class="filter-button" dot overlap :value="areFiltersApplied">
				<v-btn color="primary" text @click.stop="toggleAdvanceSearchSection()">
					{{ placeholder }}
				</v-btn>
			</v-badge>
			<slot name="buttonSection"></slot>
		</template>
		<v-text-field
			v-else
			label="Search"
			:outlined="!isOnlyAdvanceSearch"
			:solo="isOnlyAdvanceSearch"
			class="search-bar"
			@input="performBasicSearch()"
			v-model="queryString"
			:placeholder="placeholder"
			:readonly="isOnlyAdvanceSearch"
		>
			<template v-slot:append>
				<v-badge dot overlap :value="areFiltersApplied">
					<v-icon color="secondaryFontColor" @click.stop="toggleAdvanceSearchSection()">{{
						appendIcon
					}}</v-icon>
				</v-badge>
			</template>
			<template v-slot:prepend-inner>
				<v-badge dot overlap :value="areFiltersApplied">
					<v-icon
						color="error"
						:disabled="checkClearButtonsDisableStatus"
						@click.stop="isAdvanceSearch ? clearFilters(false) : clearBasicInputField()"
					>
						mdi-close
					</v-icon>
				</v-badge>
			</template>
		</v-text-field>
		<v-expand-transition v-if="isAdvanceSearch">
			<div v-show="menu">
				<v-card class="advance-search-card" outlined elevation="0">
					<div class="filters-container">
						<template v-for="(filter, filterIndex) in filterConfig">
							<div
								v-if="filter.inputType == 'textfield'"
								:key="filter.key + '__' + filterIndex"
								class="form-item"
								:class="checkForClass(filter.classes)"
							>
								<v-text-field
									:type="filter.type"
									:label="filter.name"
									v-model="filterObject[filter.key]"
								></v-text-field>
							</div>
							<div
								v-if="filter.inputType == 'dropdown'"
								:key="filter.key + '__' + filterIndex"
								class="form-item"
								:class="checkForClass(filter.classes)"
							>
								<v-autocomplete
									:label="filter.name"
									v-model="filterObject[filter.key]"
									:items="getItems(filter, 'test')"
									:multiple="filter.multi"
									:item-text="filter.itemText ? filter.itemText : 'text'"
									:item-value="filter.itemValue ? filter.itemValue : 'value'"
									chips
									clearable
									deletable-chips
								></v-autocomplete>
							</div>
							<div
								v-if="filter.inputType == 'switch'"
								:key="filter.key + '__' + filterIndex"
								class="form-item"
								:class="checkForClass(filter.classes)"
							>
								<v-switch
									v-model="filterObject[filter.key]"
									:label="filter.name"
									class="form-item"
									inset
								></v-switch>
							</div>
							<div
								v-if="filter.inputType == 'datePicker'"
								:key="filter.key + '__' + filterIndex"
								class="form-item"
								:class="checkForClass(filter.classes)"
							>
								<v-menu
									v-model="dateMenuRef[filter.key]"
									:close-on-content-click="false"
									:nudge-right="40"
									transition="scale-transition"
									offset-y
									min-width="290px"
								>
									<template v-slot:activator="{ on, attrs }">
										<v-text-field
											v-model="filterObject[filter.key]"
											:label="filter.name"
											prepend-icon="mdi-calendar"
											readonly
											v-bind="attrs"
											v-on="on"
										></v-text-field>
									</template>
									<v-date-picker v-model="filterObject[filter.key]" @input="pickerMenu = false">
										<v-btn text color="primary" @click="clearDate(filter.key)">
											Clear
										</v-btn></v-date-picker
									>
								</v-menu>
							</div>
						</template>
					</div>
					<v-card-actions>
						<v-spacer></v-spacer>

						<v-btn :disabled="!areFiltersApplied" color="error" text @click="clearFilters()">
							Clear
						</v-btn>
						<v-btn outlined color="primary" @click="performAdvanceSearch()">
							{{ isAdvanceAFilter ? "Filter" : "Search" }}
						</v-btn>
					</v-card-actions>
				</v-card>
			</div>
		</v-expand-transition>
	</div>
</template>

<script>
	import { mapGetters } from "vuex";
	export default {
		name: "Search",
		components: {},
		data: () => ({
			menu: false,
			queryString: "",
			filterObject: {},
			searchTimeoutRef: "",
			areFiltersApplied: false,
			dateMenuRef: {},
		}),
		created() {
			this.initialiseFilterElements();
		},
		computed: {
			...mapGetters(["countries", "partners", "zone", "businessType"]),
			appendIcon() {
				if (this.isAdvanceSearch) {
					return this.menu ? "mdi-arrow-up-drop-circle-outline" : "mdi-arrow-down-drop-circle-outline";
				} else {
					return "mdi-magnify";
				}
			},
			checkClearButtonsDisableStatus() {
				// console.log(this.areFiltersApplied);
				if (this.queryString == "" && !this.areFiltersApplied) {
					// console.log("Entered this If");
					return true;
				}
				// else if (this.areFiltersApplied) {
				// 	return true;
				// }
				return false;
			},
		},
		methods: {
			checkForClass(classes) {
				if (classes) {
					return classes;
				}
			},

			performBasicSearch() {
				clearTimeout(this.searchTimeoutRef);
				this.searchTimeoutRef = setTimeout(() => {
					this.$emit("queryString", this.queryString);
				}, 500);
			},
			clearDate(key) {
				this.filterObject[key] = null;
				this.dateMenuRef[key] = false;
			},
			clearFilters(shouldAdvanceSearchToggle = true) {
				this.queryString = "";
				this.initialiseFilterElements();
				this.areFiltersApplied = false;
				if (shouldAdvanceSearchToggle) {
					this.toggleAdvanceSearchSection();
				}
				this.$emit("filterObject", {});
			},
			clearBasicInputField() {
				this.queryString = "";
				this.$emit("queryString", this.queryString);
			},
			performAdvanceSearch() {
				for (let key in this.filterObject) {
					if (this.filterObject[key] == "") {
						delete this.filterObject[key];
					} else if (this.filterObject[key] == null) {
						delete this.filterObject[key];
					}
				}
				this.areFiltersApplied = true;
				if (Object.keys(this.filterObject).length) this.areFiltersApplied = true;
				this.toggleAdvanceSearchSection();
				if (this.queryString != "") this.filterObject.search_text = this.queryString;
				this.$emit("filterObject", this.filterObject);
			},
			toggleAdvanceSearchSection() {
				this.menu = !this.menu;
			},
			getItems(filter, t) {
				if (filter.isListInStore) {
					return this[filter.listVariable];
				} else {
					return filter.listItems;
				}
			},
			initialiseFilterElements() {
				for (let filter of this.filterConfig) {
					this.$set(this.filterObject, filter.key, filter.defaultValue);
				}
			},
		},
		watch: {},
		props: {
			isAdvanceSearch: {
				required: false,
				type: Boolean,
				default: false,
			},
			isOnlyAdvanceSearch: {
				required: false,
				type: Boolean,
				default: false,
			},
			isAdvanceAFilter: {
				required: false,
				type: Boolean,
				default: false,
			},
			placeholder: {
				required: false,
				type: String,
				default: "Type to Search",
			},
			filterConfig: {
				required: false,
				type: Array,
				default: () => [],
			},
		},
	};
</script>
<style lang="scss">
	.searchWrapper {
		flex-basis: 50%;
		@include custom-max(1000px) {
			flex-basis: 70%;
		}
		@include custom-max(600px) {
			flex-basis: 90%;
		}
	}
	.filter-button {
		margin-bottom: 1px;
	}
	.search-bar {
		.v-text-field__details {
			display: none;
		}
		.v-input__slot {
			margin-bottom: 0;
		}
	}
	.advance-search-card {
		padding: 16px;
		border-color: #9e9e9e;

		.form-item {
			padding: 5px;
			flex-basis: 100%;
		}

		.filters-container {
			display: flex;
			justify-content: flex-start;
			flex-wrap: wrap;
		}

		.oneFourth {
			flex: 0 0 23.75% !important;
			@include custom-max(475px) {
				flex: 0 0 95% !important;
			}
		}
		.oneThird {
			flex: 0 0 31.35% !important;
			@include custom-max(475px) {
				flex: 0 0 95% !important;
			}
		}
		.half {
			flex: 0 0 47.5% !important;
			@include custom-max(475px) {
				flex: 0 0 95% !important;
			}
		}
		.full {
			flex: 0 0 95% !important;
		}
	}
</style>
