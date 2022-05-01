<template>
	<v-dialog v-model="form" width="600px" persistent>
		<div class="form-wrapper">
			<div class="headline">
				<!-- <div class="">{{ isEditMode ? "Edit " : "Add " }}{{ name }}</div> -->
				<div class="">{{ getFormName() }}{{ name }}</div>
			</div>
			<div v-show="showError" id="error-container" class="error-container">
				{{ errorText }}
			</div>
			<div class="form-input">
				<template v-for="(config, index) in inputConfig">
					<v-text-field
						v-if="config.type == 'String'"
						:label="config.name"
						:key="config.name + '__' + index"
						v-model="formElements[config.key]"
						class="form-item"
						:class="checkWidth(config.width)"
						:disabled="disableConfig[config.key] ? disableConfig[config.key] : false"
					></v-text-field>

					<v-text-field
						v-else-if="config.type == 'Number'"
						:label="config.name"
						:key="config.name + '__' + index"
						v-model="formElements[config.key]"
						class="form-item"
						type="number"
						:class="checkWidth(config.width)"
						:disabled="disableConfig[config.key] ? disableConfig[config.key] : false"
					></v-text-field>

					<v-textarea
						v-else-if="config.type == 'TextArea'"
						:label="config.name"
						:key="config.name + '__' + index"
						v-model="formElements[config.key]"
						class="form-item"
						:class="checkWidth(config.width)"
						:disabled="disableConfig[config.key] ? disableConfig[config.key] : false"
						:rows="config.rows ? config.rows : 3"
					></v-textarea>

					<template v-else-if="config.type == 'Dropdown'">
						<v-autocomplete
							:key="config.name + '__' + index"
							:label="config.name"
							v-model="formElements[config.key]"
							:items="getItems(config)"
							:multiple="config.multi"
							class="form-item"
							:class="checkWidth(config.width)"
							:disabled="disableConfig[config.key] ? disableConfig[config.key] : false"
							:item-text="config.itemText ? config.itemText : 'text'"
							:item-value="config.itemValue ? config.itemValue : 'value'"
							chips
							clearable
							deletable-chips
						></v-autocomplete>
					</template>

					<template v-else-if="config.type == 'DropdownWithMoreInfo'">
						<v-autocomplete
							:key="config.name + '__' + index"
							:label="config.name"
							v-model="formElements[config.key]"
							:items="getItems(config)"
							:item-text="config.itemText"
							:item-value="config.itemValue"
							:multiple="config.multi"
							class="form-item"
							:class="checkWidth(config.width)"
							:disabled="disableConfig[config.key] ? disableConfig[config.key] : false"
							chips
							clearable
							deletable-chips
						>
							<template v-slot:[`item`]="{ item }">
								<v-list-item-content>
									<v-list-item-title v-text="config.titleContent(item)"></v-list-item-title>
									<v-list-item-subtitle
										v-text="config.subtitleContent ? config.subtitleContent(item) : ''"
									></v-list-item-subtitle>
								</v-list-item-content>
							</template>
						</v-autocomplete>
					</template>

					<template v-else-if="config.type == 'AsyncDropdownWithMoreInfo'">
						<v-autocomplete
							:key="config.name + '__' + index"
							:label="config.name"
							v-model="formElements[config.key]"
							:items="asyncList[config.key]"
							:item-text="config.itemText"
							:item-value="config.itemValue"
							:multiple="config.multi"
							class="form-item"
							:class="checkWidth(config.width)"
							:disabled="disableConfig[config.key] ? disableConfig[config.key] : false"
							chips
							clearable
							deletable-chips
						>
							<template v-slot:[`item`]="{ item }">
								<v-list-item-content>
									<v-list-item-title v-text="config.titleContent(item)"></v-list-item-title>
									<v-list-item-subtitle
										v-text="config.subtitleContent ? config.subtitleContent(item) : ''"
									></v-list-item-subtitle>
								</v-list-item-content>
							</template>
						</v-autocomplete>
					</template>

					<template v-else-if="config.type == 'Date'">
						<div :key="config.name + '__' + index" class="date-picker form-item" :class="checkWidth(config.width)">
							<v-menu
								:ref="config.key"
								v-model="dateMenuRef[config.key]"
								:key="config.name + '__' + index"
								:close-on-content-click="false"
								transition="scale-transition"
								offset-y
								min-width="290px"
							>
								<template v-slot:activator="{ on, attrs }">
									<v-text-field
										v-model="formElements[config.key]"
										:label="config.name"
										prepend-icon="mdi-calendar"
										readonly
										v-bind="attrs"
										v-on="on"
									></v-text-field>
								</template>
								<v-date-picker
									v-model="formElements[config.key]"
									:min="getMin(config)"
									:max="getMax(config)"
									:disabled="disableConfig[config.key] ? disableConfig[config.key] : false"
									no-title
									scrollable
								>
									<v-spacer></v-spacer>

									<v-btn text color="primary" @click="clearDate(config.key)"> Clear </v-btn>
									<v-btn @click="dateMenuRef[config.key] = false" text color="primary"> OK </v-btn>
								</v-date-picker>
							</v-menu>
						</div>
					</template>

					<template v-else-if="config.type == 'MultiInput'">
						<template v-for="(input, mulIndex) in formElements[config.key]">
							<div
								:key="config.name + '__' + index + '__' + mulIndex"
								class="multi-input-field form-item"
								:class="checkWidth(config.width)"
							>
								<v-text-field
									:value="formElements[config.key][mulIndex].input"
									:label="config.name"
									@blur="updateMultiInputObject($event.target.value, config, mulIndex)"
								></v-text-field>
							</div>
						</template>
						<div :key="config.name + '__' + index + '__buttons'" class="multi-input-buttons">
							<v-btn
								@click="removeMultiInputField(config)"
								:key="config.name + '__' + index + '__remove'"
								depressed
								color="error"
								small
								text
								:disabled="formElements[config.key].length == 1"
								>Remove</v-btn
							>
							<v-btn
								@click="addMultiInputField(config)"
								:key="config.name + '__' + index + '__add'"
								depressed
								color="primary"
								small
								class="ml-2"
								>Add</v-btn
							>
						</div>
					</template>

					<template v-else-if="config.type == 'MultiInputWithGroupKey' && formElements[config.key]">
						<template v-for="(row, rowIndex) in formElements[config.key]">
							<div :key="config.name + '__' + index + '__' + rowIndex" class="input-with-group-key-title">
								Enter {{ config.name }} for {{ row.groupKey }}
							</div>
							<template v-for="(input, mulIndex) in row.input">
								<div
									:key="config.name + '__' + index + '__' + mulIndex + '__' + rowIndex + '__' + row.groupKey"
									class="multi-input-field form-item"
									:class="checkWidth(config.width)"
								>
									<v-text-field
										:value="formElements[config.key][rowIndex].input[mulIndex].input"
										:label="config.name"
										@blur="updateMultiInputWithGroupKey($event.target.value, config, rowIndex, mulIndex)"
									></v-text-field>
								</div>
							</template>
							<div
								v-if="config.multi"
								:key="config.name + '__' + index + '__buttons__' + row.groupKey"
								class="multi-input-buttons"
							>
								<v-btn
									@click="removeMultiInputWithGroupKeyField(config, rowIndex)"
									:key="config.name + '__' + index + '__remove'"
									depressed
									color="error"
									small
									text
									:disabled="formElements[config.key][rowIndex].input.length == 1"
									>Remove</v-btn
								>
								<v-btn
									@click="addMultiInputWithGroupKeyField(config, rowIndex)"
									:key="config.name + '__' + index + '__add'"
									depressed
									color="primary"
									small
									class="ml-2"
									>Add</v-btn
								>
							</div>
						</template>
					</template>

					<template v-else-if="config.type == 'FilePicker'">
						<v-file-input
							v-model="formElements[config.key]"
							:key="config.name + '__' + index"
							:accept="config.acceptRules"
							:rules="config.rules"
							:label="config.name"
							class="form-item"
							:class="checkWidth(config.width)"
							:disabled="disableConfig[config.key] ? disableConfig[config.key] : false"
						></v-file-input>
					</template>

					<template v-else-if="config.type == 'Switch'">
						<v-switch
							v-model="formElements[config.key]"
							:key="config.name + '__' + index"
							:label="config.name"
							class="form-item"
							inset
							:disabled="disableConfig[config.key] ? disableConfig[config.key] : false"
						></v-switch>
					</template>
				</template>
			</div>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn color="error" text @click="closeForm()"> Cancel </v-btn>
				<v-btn color="primary" text @click="formValidation"> Submit </v-btn>
			</v-card-actions>
		</div>
	</v-dialog>
</template>

<script>
import { required, email, minLength, numeric, alpha } from "vuelidate/lib/validators";
import { mapGetters } from "vuex";
import moment from "moment-timezone";
import helpers from "../helpers";
export default {
	name: "Form",
	components: {},
	data: () => ({
		form: false,
		showError: false,
		errorText: false,
		formElements: {},
		dateMenuRef: {},
		asyncList: {},
		watcherList: [],
		disableConfig: {},
		errorMessages: {
			required: {
				type: "normal",
				msg: (name) => `${name} is a Required Field`,
			},
			alpha: { type: "normal", msg: (name) => `${name} can only be Alphabets` },
			numeric: { type: "normal", msg: (name) => `${name} can only be Numbers` },
			minLength: {
				type: "conditional",
				msg: (name, condition) => `${name} needs to have a minimum length of ${condition}`,
				conditionKey: "min",
			},
			maxLength: {
				type: "conditional",
				msg: (name, condition) => `${name} needs to have a minimum length of ${condition}`,
				conditionKey: "max",
			},
			email: { type: "normal", msg: (name) => `${name} is not a valid email` },
		},
	}),
	created() {
		this.initialiseFormElements();
	},
	mounted() {},
	computed: {},
	methods: {
		checkWidth(width) {
			if (width) {
				return width;
			}
		},
		clearDate(key) {
			this.formElements[key] = null;
			this.dateMenuRef[key] = false;
		},
		getMin(config) {
			if (config.min) {
				return config.min();
			}
		},
		getMax(config) {
			if (config.max) {
				return config.max();
			}
		},
		getFormName() {
			if (this.prependFormName) {
				if (this.isEditMode) {
					return "Edit ";
				} else {
					return "Add ";
				}
			}
			return "";
		},
		formValidation() {
			this.showError = false;
			this.errorText = false;
			this.$v.$touch();
			if (this.$v.$invalid) {
				for (let config of this.inputConfig) {
					if (this.$v.formElements[config.key] && this.$v.formElements[config.key].$invalid) {
						for (let param in this.$v.formElements[config.key].$params) {
							if (param != "$each" && !this.$v.formElements[config.key][param]) {
								if (this.errorMessages[param].type == "conditional") {
									this.errorText = this.errorMessages[param].msg(
										config.name,
										this.$v.formElements[config.key].$params[param][this.errorMessages[param].conditionKey]
									);
								} else {
									this.errorText = this.errorMessages[param].msg(config.name);
								}
							}
						}
						if (!this.errorText) {
							this.errorText = config.name + " is incorrect";
						}
						this.showError = true;
						break;
					}
				}
				this.$vuetify.goTo("#error-container", {
					duration: 300,
				});
				return false;
			} else {
				for (let elements in this.formElements) {
					if (typeof this.formElements[elements] == "string") {
						this.formElements[elements] = this.formElements[elements].trim();
					}
					if (this.formElements[elements] === undefined) {
						this.formElements[elements] = null;
					}
				}
				if (!this.isEditMode) {
					this.$emit("formOutput", this.formElements);
				} else {
					this.$emit("formOutput", {
						...this.formElements,
						_id: this.formData._id,
						updatedOn: this.formData.updatedOn,
					});
				}
				return true;
			}
		},
		getItems(config) {
			if (config.isListInStore) {
				return this[config.listVariable];
			} else {
				return config.listItems;
			}
		},
		updateMultiInputObject(value, config, mulIndex) {
			this.formElements[config.key][mulIndex].input = value;
		},
		updateMultiInputWithGroupKey(value, config, rowIndex, mulIndex) {
			this.formElements[config.key][rowIndex].input[mulIndex].input = value;
		},
		removeMultiInputWithGroupKeyField(config, rowIndex) {
			if (this.formElements[config.key][rowIndex].input.length > 1) {
				this.formElements[config.key][rowIndex].input.pop({ input: "" });
			}
		},
		addMultiInputWithGroupKeyField(config, rowIndex) {
			this.formElements[config.key][rowIndex].input.push({ input: "" });
		},
		removeMultiInputField(config) {
			if (this.formElements[config.key].length > 1) {
				this.formElements[config.key].pop({ input: "" });
			}
		},
		addMultiInputField(config) {
			this.formElements[config.key].push({ input: "" });
		},
		closeForm() {
			this.$emit("closeForm");
		},
		async initialiseFormElements() {
			this.showError = false;
			if (this.watcherList.length) {
				for (let i of this.watcherList) {
					i();
				}
			}

			for (let i of this.inputConfig) {
				this.$set(this.disableConfig, i.key, false);

				if (!this.isEditMode) {
					// This will initialize the form when add user button is clicked
					if (i.type == "MultiInput") {
						this.$set(this.formElements, i.key, [{ input: "" }]);
					} else if (i.type == "MultiInputWithGroupKey") {
						this.$set(this.formElements, i.key, null);
					} else if (i.type == "Switch") {
						this.$set(this.formElements, i.key, false);
					} else {
						if (i.initialValue) {
							this.$set(this.formElements, i.key, i.initialValue);
						} else {
							this.$set(this.formElements, i.key, null);
						}
					}
					if (i.type == "AsyncDropdownWithMoreInfo") {
						this.$set(this.asyncList, i.key, []);
					}
					if (i.type == "Date") {
						this.$set(this.dateMenuRef, i.key, false);
					}
				} else {
					// This will initialize the form when Edit user button is clicked
					if (i.type == "MultiInput") {
						if (this.formData[i.key] && this.formData[i.key].length) {
							this.$set(
								this.formElements,
								i.key,
								this.formData[i.key].map((e) => ({
									input: e,
								}))
							);
						} else {
							this.$set(this.formElements, i.key, [{ input: "" }]);
						}
					} else if (i.type == "MultiInputWithGroupKey") {
						if (this.formData[i.key]) {
							let tempObj = this.formData[i.key].map((e) => ({
								groupKey: e[i.keyforGrouped],
								input: i.multi ? e[i.keyBeingGrouped].map((f) => ({ input: f })) : [{ input: e[i.keyBeingGrouped] }],
							}));
							let tempObjRefForLoop = JSON.parse(JSON.stringify(tempObj));
							// tempObj Output -> [
							// 	{ groupKey: "United States", input: [{ input: "+1 310 663 9484" }] },
							// 	{ groupKey: "Canada", input: [{ input: "" }] },
							// ];
							for (let j of this.formData[i.keyToGroup]) {
								let found = true;
								for (let k of tempObjRefForLoop) {
									if (j == k.groupKey) {
										found = false;
									}
								}
								if (found) {
									tempObj.push({
										groupKey: j,
										input: [{ input: "" }],
									});
								}
							}
							this.$set(this.formElements, i.key, tempObj);
						}
					} else if (i.type == "Date") {
						if (this.formData[i.key]) {
							this.$set(this.formElements, i.key, helpers.getFormattedDate(this.formData[i.key], "YYYY-MM-DD"));
						} else {
							this.$set(this.formElements, i.key, null);
						}
					} else if (i.type == "FilePicker") {
						if (this.formData[i.key]) {
							// let extn = helpers.base64MimeType(this.formData[i.key]);
							let urlSplit = this.formData[i.key].split(".");
							let extn = urlSplit[urlSplit.length - 1];
							let fileObj = await helpers.URLtoFile(this.formData[i.key], "image." + extn, "image/" + extn);

							this.$set(this.formElements, i.key, fileObj);
						} else {
							this.$set(this.formElements, i.key, null);
						}
					} else if (i.type == "Switch") {
						if (this.formData[i.key]) {
							this.$set(this.formElements, i.key, this.formData[i.key]);
						} else {
							this.$set(this.formElements, i.key, false);
						}
					} else {
						this.$set(this.formElements, i.key, this.formData[i.key]);
					}

					if (i.type == "AsyncDropdownWithMoreInfo") {
						i.apiCall(this.formData[i.triggerKey]).then((data) => {
							this.$set(this.asyncList, i.key, data);
						});
					}

					if (i.type == "Date") {
						this.$set(this.dateMenuRef, i.key, false);
					}
				}
			}

			for (let i of this.inputConfig) {
				if (i.disableCheck) {
					this.disableConfig[i.key] = i.disableCheck(this.formElements[i.disableTriggerKey]);
				}
			}

			// Initialise watchers
			if (this.keysToWatch && this.keysToWatch.length > 0) {
				// create watchers here
				for (let watchKey of this.keysToWatch) {
					this.watcherList.push(this.$watch(`formElements.${watchKey}`, this.keyUpdated.bind(this, watchKey)));
				}
			}
		},
		keyUpdated(watchKey, nv, ov) {
			for (let i of this.inputConfig) {
				if (i.type == "MultiInputWithGroupKey" && watchKey == i.keyToGroup) {
					// console.log("MultiInputWithGroupKey OV", ov);
					// console.log("MultiInputWithGroupKey NV", nv);
					if (!ov || !ov.length) {
						// Enters this If when there is no OV, i.e when it is initialized for the first time (Usually when Add Button is clicked to create a new entry)
						this.formElements[i.key] = nv.map((e) => ({
							groupKey: e,
							input: [{ input: "" }],
						}));
					} else {
						// console.log(this.formElements[i.key], i);
						if (!nv.length) {
							// "Enters this condition when the keyToGroup is empty"
							this.formElements[i.key] = null;
						} else {
							let tempObj = [];
							/* "Below If condition checks if the key value is set to null, this happens when key wasn't present during Add form, but instead when It is initialized for the first time in Edit form" */
							if (this.formElements[i.key] === null) {
								this.formElements[i.key] = nv.map((e) => ({
									groupKey: e,
									input: [{ input: "" }],
								}));
							}
							for (let k of this.formElements[i.key]) {
								if (ov.includes(k.groupKey) && nv.includes(k.groupKey)) {
									tempObj.push(k);
								}
							}
							for (let j of nv) {
								if (!ov.includes(j)) {
									tempObj.push({
										groupKey: j,
										input: [{ input: "" }],
									});
								}
							}
							// console.log("tempObj", tempObj);
							this.formElements[i.key] = tempObj;
						}
					}
				} else if (i.type == "AsyncDropdownWithMoreInfo" && watchKey == i.triggerKey) {
					if (nv && nv != ov) {
						i.apiCall(nv).then((data) => {
							this.formElements[i.key] = null;
							this.asyncList[i.key] = data;
						});
					}
				}

				if (i.disableCheck && watchKey == i.disableTriggerKey) {
					this.disableConfig[i.key] = i.disableCheck(this.formElements[i.disableTriggerKey]);
				}
			}
		},
	},
	validations() {
		let tempObj = {};
		for (let i of this.inputConfig) {
			if (i.validations) {
				tempObj[i.key] = i.validations;
			}
		}
		return { formElements: tempObj };
	},
	props: {
		name: { required: true, type: String },
		inputConfig: { required: true, type: Array },
		isEditMode: { required: true, type: Boolean, default: false },
		toggleForm: { required: true, type: Boolean, default: false },
		keysToWatch: { required: false, type: Array, default: () => [] },
		formData: { required: false, type: Object },
		prependFormName: { required: false, type: Boolean, default: true },
	},
	watch: {
		toggleForm(nv, ov) {
			this.form = nv;
			this.initialiseFormElements();
		},
		inputConfig() {
			this.initialiseFormElements();
		},
	},
};
</script>

<style lang="scss" scoped>
.error-container {
	margin-top: 8px;
	margin-bottom: 16px;
	// width: 300px;
	background: #ff5d5d1a 0% 0% no-repeat padding-box;
	border-radius: 5px;
	color: $error;
	padding: 10px 37px;
}
.form-wrapper {
	padding: 20px 30px;
	background: white;

	.input-with-group-key-title {
		flex: 0 0 95%;
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

	.headline {
		font-size: 32px;
		font-weight: 700;
		margin-bottom: 14px;
	}

	.form-item {
		padding: 5px;
	}

	.form-input {
		display: flex;
		justify-content: flex-start;
		flex-wrap: wrap;
	}
	.date-picker {
		flex-basis: 47.5%;
		@include media-breakpoint-up(xs) {
			flex-basis: 95%;
		}
	}
	.multi-input-field {
		flex-basis: 95%;
	}
	.multi-input-buttons {
		flex-basis: 95%;
		display: flex;
		justify-content: flex-end;
	}
}
</style>
