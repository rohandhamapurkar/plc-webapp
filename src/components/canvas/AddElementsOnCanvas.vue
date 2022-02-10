<template>
	<div class="canvas-brand-wrapper">
		<div class="action-tools-wrapper">
			<div class="add-text" @click="handleAddTextClick">
				<div class="icon-wrapper">+</div>
				<div class="text-wrapper">Add Text</div>
			</div>
			<div class="add-text" @click="handleDataDrivenTextClick">
				<div class="icon-wrapper">+</div>
				<div class="text-wrapper">Add Data Driven Text</div>
			</div>
			<div class="add-image" @click="handleUploadImageClick">
				<div class="icon-wrapper">+</div>
				<div class="text-wrapper">Add Image</div>
			</div>
		</div>
		<template v-if="Object.keys(activeObject).length">
			<ManageTextAttributes v-if="activeObject.type == 'INTERACTIVE_TEXT'" :text-attributes="activeObject" />
			<div v-if="activeObject.type == 'IMAGE'" class="image-attribute-wrapper">
				<div class="slider-label-and-value-wrapper">
					<div class="slider-label">transparency</div>
					<div class="slider-value">{{ imageOpacity }}</div>
				</div>
				<v-slider v-model="imageOpacity" min="0" max="1000" step="1"></v-slider>
			</div>
		</template>
	</div>
</template>

<script>
import ManageTextAttributes from "@/components/canvas/ManageTextAttributes.vue";
import { eventBus } from "@/event-bus";

export default {
	name: "EditCanvasAttributes",
	components: { ManageTextAttributes },
	props: {},
	data() {
		return {
			activeObject: {},
			imageOpacity: 1000,
		};
	},
	computed: {},
	watch: {
		imageOpacity() {
			this.handleSliderValueUpdate();
		},
	},
	created() {
		this.initialiseListeners();
	},
	beforeDestroy() {
		eventBus.$off("object-selected");
		eventBus.$off("object-deselected");
	},
	methods: {
		initialiseListeners() {
			eventBus.$on("object-selected", this.handleObjectSelectedEvent);
			eventBus.$on("object-deselected", this.handleObjectDeselectedEvent);
		},
		handleAddTextClick() {
			eventBus.$emit("add-text-object");
		},
		handleDataDrivenTextClick() {
			eventBus.$emit("add-data-driven-text-object");
		},
		handleUploadImageClick() {
			eventBus.$emit("add-image-object");
		},
		handleObjectSelectedEvent(data) {
			// console.log('Object Selected', data)
			this.activeObject = data;
			if (data.type === "IMAGE") {
				this.imageOpacity = data.attributes.opacity * 1000;
			}
		},
		handleObjectDeselectedEvent() {
			this.activeObject = {};
		},
		handleSliderValueUpdate() {
			const opacityValue = this.imageOpacity / 1000;
			eventBus.$emit("update-image-attribute", {
				attributeName: "opacity",
				attributeValue: opacityValue,
			});
		},
	},
};
</script>

<style lang="scss" scoped>
.action-tools-wrapper {
	display: flex;
	justify-content: space-between;
	padding-top: 20px;
	.add-text,
	.add-image {
		flex: 0 0 33%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 20px 0;
		border: 1px solid red;

		.icon-wrapper {
			font-size: 50px;
		}
	}
}
</style>
