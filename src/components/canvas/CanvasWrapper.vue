<template>
	<div class="canvas-container-wrapper">
		<input id="file" type="file" style="display: none" />
		<canvas id="renderCanvas"></canvas>
	</div>
</template>

<script>
import { eventBus } from "@/event-bus";
import { v4 as uuidv4 } from "uuid";
import CanvasInterface from "@/components/canvas-interface";

export default {
	data() {
		return {
			something: {},
		};
	},
	computed: {},
	created() {
		this.something = new CanvasInterface({
			selectedRender: this.selectedRender,
			canvasSelector: "renderCanvas",
		});
		this.initialiseListeners();
	},
	mounted() {
		this.something.addListnerOnFileInput();

		this.something.addEventListener("init", () => {
			eventBus.$emit("initialised-canvas");
		});
		this.something.addEventListener("object-selected", (objectAttributes) => {
			eventBus.$emit("object-selected", objectAttributes);
		});
		this.something.addEventListener("object-deselected", () => {
			eventBus.$emit("object-deselected");
		});
		this.something.addEventListener("all-canvas-properties-and-elements", (properties) => {
			eventBus.$emit("all-canvas-properties-and-elements", properties);
		});
		this.something.initCanvas();
	},
	beforeDestroy() {
		eventBus.$off("add-text-object");
		eventBus.$off("add-image-object");
		eventBus.$off("update-text-attribute");
		eventBus.$off("update-image-attribute");
		eventBus.$off("get-all-canvas-properties-and-elements");
		eventBus.$off("add-data-driven-text-object");
		eventBus.$off("dataset-selection");
	},
	methods: {
		initialiseListeners() {
			eventBus.$on("add-text-object", (text, textProperties) => {
				this.something.handleAddTextEvent(text, textProperties);
			});
			eventBus.$on("add-data-driven-text-object", (text, textProperties) => {
				eventBus.$emit("data-driven-text-add-event");
			});
			eventBus.$on("dataset-selection", (datasetDetails) => {
				this.something.handleAddTextEvent(
					`${datasetDetails.datasetName}.${datasetDetails.fieldName}`,
					{
						id: "dataDriven_" + datasetDetails.datasetId + "_" + uuidv4(),
						left: this.selectedRender.dimension.width / 2,
						top: this.selectedRender.dimension.height / 2,
						lockSkewingX: true,
						lockSkewingY: true,
						fontSize: "40", // Font Size
						fontFamily: "Arial, Helvetica, sans-serif", // Font Family
						fill: "#000",
						editable: false,
					},
					"Text"
				);
			});
			eventBus.$on("update-text-attribute", (data) => {
				this.something.handleUpdateTextAttribute(data);
			});
			eventBus.$on("add-image-object", () => {
				this.something.handleAddImageEvent();
			});
			eventBus.$on("update-image-attribute", (data) => {
				this.something.handleUpdateImageAttribute(data);
			});
			eventBus.$on("get-all-canvas-properties-and-elements", () => {
				this.something.handleGetAllCanvasElementsEvent();
			});
		},
	},
	props: {
		selectedRender: { required: true, default: true },
	},
};
</script>

<style scoped></style>
