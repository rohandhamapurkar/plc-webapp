<template>
	<div class="canvas-editor-wrapper">
		<v-tabs v-model="tab" grow>
			<v-tab v-for="(ele, index) in tabConfig" :key="ele.id + '__' + index">{{ ele.nameRef }}</v-tab>
		</v-tabs>
		<v-tabs-items v-model="tab" class="tabItemWrapper">
			<v-tab-item v-for="(ele, index) in tabConfig" :key="ele.id + '__' + index" :eager="true">
				<component :is="ele.component" v-bind="{ ...ele.props }" />
			</v-tab-item>
		</v-tabs-items>
		<div class="action-button-wrapper">
			<!-- <v-btn>Cancel</v-btn> -->
			<v-btn @click="handleSaveButtonClick">Submit for processing</v-btn>
		</div>
	</div>
</template>

<script>
import AddElementsOnCanvas from "@/components/canvas/AddElementsOnCanvas.vue";
import { eventBus } from "@/event-bus";
import { v4 as uuidv4 } from "uuid";

export default {
	components: {
		AddElementsOnCanvas,
	},
	props: {
		selectedRender: { required: true, default: true },
	},
	data() {
		return {
			tab: "",
			tabConfig: [],
		};
	},
	computed: {},
	created() {
		this.setTabConfig();
		this.initialiseListeners();
	},
	beforeDestroy() {
		eventBus.$off("all-canvas-properties-and-elements");
	},
	methods: {
		initialiseListeners() {
			eventBus.$on("all-canvas-properties-and-elements", this.handleCanvasPropertiesAndElementsEvent);
		},
		setTabConfig() {
			this.tabConfig = [
				{
					nameRef: "Tools",
					id: "tools",
					props: {},
					component: "AddElementsOnCanvas",
				},
			];
		},
		handleSaveButtonClick() {
			if (window.confirm("Do you really want to process this image?")) {
				eventBus.$emit("get-all-canvas-properties-and-elements");
			}
		},

		handleCanvasPropertiesAndElementsEvent(latestCanvasRef) {
			eventBus.$emit("submit-for-processing-event", this.getNormalizedRenderObject(latestCanvasRef));
		},

		getNormalizedRenderObject(latestCanvasRef) {
			const tempRenderObject = JSON.parse(JSON.stringify(this.selectedRender));
			const { imageObjects, textObjects } = this.getImageAndTextObjects(latestCanvasRef.addedCanvasElements);

			tempRenderObject.additionalBrandObjects = {};
			tempRenderObject.additionalBrandObjects.imageObjects = imageObjects;
			tempRenderObject.additionalBrandObjects.textObjects = textObjects;
			tempRenderObject.attributes = latestCanvasRef.canvasAttributes;
			// tempRenderObject.thumbnailUrl = latestCanvasRef.thumbnailUrl;
			// console.log({ tempRenderObject })
			return tempRenderObject;
		},
		getNormalizedTemplateObject(latestCanvasRef) {
			// console.log({ latestCanvasRef })
			const tempTemplateObject = {
				_id: uuidv4(),
				imageUrl: latestCanvasRef.templateImageUrl,
				templateObjects: {
					textObjects: [],
					imageObjects: [],
					mainImage: {
						width: this.selectedRender.dimension.width,
						height: this.selectedRender.dimension.height,
					},
				},
				createdBy: uuidv4(),
			};
			const { imageObjects, textObjects } = this.getImageAndTextObjects(latestCanvasRef.addedCanvasElements);
			tempTemplateObject.templateObjects.textObjects = textObjects;
			tempTemplateObject.templateObjects.imageObjects = imageObjects;
			return tempTemplateObject;
		},
		getImageAndTextObjects(allCanvasObjects) {
			const imageObjects = [];
			const textObjects = [];
			for (const object of allCanvasObjects) {
				switch (object.type) {
					case "INTERACTIVE_TEXT": {
						textObjects.push(object);
						break;
					}
					case "TEXT": {
						textObjects.push(object);
						break;
					}
					case "IMAGE": {
						imageObjects.push(object);
						break;
					}
				}
			}
			return { imageObjects, textObjects };
		},
	},
};
</script>

<style lang="scss" scoped>
.canvas-editor-wrapper {
	.action-button-wrapper {
		margin-top: 10px;
	}
}
</style>
