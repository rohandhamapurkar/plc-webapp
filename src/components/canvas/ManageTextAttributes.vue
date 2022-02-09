<template>
	<div class="text-attribute-wrapper">
		<div class="text-element-options-container">
			<div class="text-element-font-family-container">
				<div class="canvas-element-attribute-title">Select Font Family</div>
				<v-select
					v-model="fontFamily"
					:items="fontFamilyList"
					item-text="text"
					item-value="value"
					dense
					outlined
					@change="updateTextAttribute('fontFamily')"
				></v-select>
			</div>
			<div class="text-element-alignment-wrapper">
				<div class="text-element-alignment-container text-attribute horizontal">
					<div class="canvas-element-attribute-title">Toggle Horizontal Alignment {{ horizontalAlignment }}</div>
					<v-btn-toggle v-model="horizontalAlignment" @change="updateTextAttribute('horizontalAlignment')">
						<v-btn value="left" icon tile small>
							<v-icon small>mdi-format-align-left</v-icon>
						</v-btn>
						<v-btn value="center" icon tile small>
							<v-icon small>mdi-format-align-center</v-icon>
						</v-btn>
						<v-btn value="right" icon tile small>
							<v-icon small>mdi-format-align-right</v-icon>
						</v-btn>
					</v-btn-toggle>
				</div>
				<div class="text-element-alignment-container text-decoration-attribute">
					<div class="canvas-element-attribute-title">Font Style {{ fontWeight }}</div>
					<v-btn
						icon
						tile
						small
						:class="{ selected: fontWeight === 'bold' }"
						@click="updateTextAttribute('fontWeight')"
					>
						<v-icon small>mdi-format-bold</v-icon>
					</v-btn>
					<v-btn
						icon
						tile
						small
						:class="{ selected: fontStyle === 'italic' }"
						@click="updateTextAttribute('fontStyle')"
					>
						<v-icon small>mdi-format-italic</v-icon>
					</v-btn>
					<v-btn icon tile small :class="{ selected: underline }" @click="updateTextAttribute('underline')">
						<v-icon small>mdi-format-underline</v-icon>
					</v-btn>
				</div>
			</div>
			<div class="text-element-color-and-size-wrapper">
				<div class="text-attribute text-element-color-picker-container">
					<div class="canvas-element-attribute-title">Pick Font Color {{ color }}</div>
					<v-text-field v-model="color" hide-details class="ma-0 pa-0" solo>
						<template #append>
							<v-menu v-model="menu" top nudge-bottom="105" nudge-left="16" :close-on-content-click="false">
								<template #activator="{ on }">
									<div :style="swatchStyle" v-on="on" />
								</template>
								<v-card>
									<v-card-text class="pa-0">
										<v-color-picker v-model="color" flat />
									</v-card-text>
								</v-card>
							</v-menu>
						</template>
					</v-text-field>
				</div>
				<div class="text-attribute text-element-font-size-container">
					<div class="canvas-element-attribute-title">Select Font Size</div>
					<v-select
						v-model="fontSize"
						:items="fontSizeList"
						item-text="text"
						item-value="value"
						dense
						outlined
						@change="updateTextAttribute('fontSize')"
					></v-select>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { eventBus } from "@/event-bus";
export default {
	name: "EditCanvasAttributes",
	props: {
		textAttributes: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			fontSizeList: [],
			fontFamilyList: [
				{
					text: "Arial",
					value: "Arial, Helvetica, sans-serif",
				},
				{
					text: "Arial Black",
					value: "'Arial Black', Gadget, sans-serif",
				},
				{
					text: "'Comic Sans MS'",
					value: "'Comic Sans MS', cursive, sans-serif",
				},
				{
					text: "Impact",
					value: "Impact, Charcoal, sans-serif",
				},
				{
					text: "'Lucida Sans Unicode'",
					value: "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
				},
				{
					text: "Tahoma",
					value: "Tahoma, Geneva, sans-serif",
				},
				{
					text: "'Trebuchet MS'",
					value: "'Trebuchet MS', Helvetica, sans-serif",
				},
				{
					text: "Verdana",
					value: "Verdana, Geneva, sans-serif",
				},
				{
					text: "Comic Sans",
					value: "Comic Sans, Comic Sans MS, cursive",
				},
				{
					text: "'Lucida Console'",
					value: "'Lucida Console', Monaco, monospace",
				},
				{
					text: "'Courier New'",
					value: "'Courier New', Courier, monospace",
				},
				{
					text: "'Allura'",
					value: "'Allura', cursive",
				},
			],
			horizontalAlignment: 0,
			color: "#000",
			menu: false,
			fontSize: 48,
			fontFamily: "Arial, Helvetica, sans-serif",
			fontWeight: "normal",
			fontStyle: "normal",
			underline: false,
		};
	},
	computed: {
		swatchStyle() {
			const { color, menu } = this;
			return {
				backgroundColor: color,
				cursor: "pointer",
				height: "30px",
				width: "30px",
				borderRadius: menu ? "50%" : "4px",
				transition: "border-radius 200ms ease-in-out",
			};
		},
	},
	watch: {
		color(newValue, oldValue) {
			// Add Set Timeout
			this.updateTextAttribute("color");
		},
	},
	created() {
		this.generateFontSizeList();
		this.setTextAttributes(this.textAttributes);
	},
	methods: {
		generateFontSizeList() {
			for (let i = 10; i <= 400; i += 10) {
				this.fontSizeList.push({
					text: i + " px",
					value: i,
				});
			}
		},
		setTextAttributes(attributesObject) {
			this.color = attributesObject.style.color;
			this.fontFamily = attributesObject.style.fontFamily;
			this.fontSize = attributesObject.style.fontSize;
			this.fontWeight = attributesObject.style.fontWeight;
			this.fontStyle = attributesObject.style.fontStyle;
			this.underline = attributesObject.style.underline;
			this.horizontalAlignment = attributesObject.style.horizontalAlignment;
		},
		updateTextAttribute(attributeName) {
			switch (attributeName) {
				case "horizontalAlignment": {
					if (this.horizontalAlignment) {
						eventBus.$emit("update-text-attribute", {
							attributeName,
							attributeValue: this[attributeName],
						});
					}
					break;
				}
				case "fontWeight": {
					if (this[attributeName] === "normal") {
						this[attributeName] = "bold";
					} else {
						this[attributeName] = "normal";
					}
					eventBus.$emit("update-text-attribute", {
						attributeName,
						attributeValue: this[attributeName],
					});
					break;
				}
				case "fontStyle": {
					if (this[attributeName] === "normal") {
						this[attributeName] = "italic";
					} else {
						this[attributeName] = "normal";
					}
					eventBus.$emit("update-text-attribute", {
						attributeName,
						attributeValue: this[attributeName],
					});
					break;
				}
				case "underline": {
					this[attributeName] = !this[attributeName];
					eventBus.$emit("update-text-attribute", {
						attributeName,
						attributeValue: this[attributeName],
					});
					break;
				}
				default: {
					eventBus.$emit("update-text-attribute", {
						attributeName,
						attributeValue: this[attributeName],
					});
				}
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.text-decoration-attribute {
	.v-btn {
		&.selected {
			background-color: lightgray;
		}
	}
}
</style>
