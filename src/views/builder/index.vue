<template>
	<div class="builder-container">
		<canvas id="canvas" width="800" height="770"></canvas>
		<div class="action-tools-container">
			<v-btn @click="addStaticText" color="primary" text> Add Static Text </v-btn>
			<v-btn @click="() => {}" color="primary" text> Add Dataset Field </v-btn>
			<v-btn @click="() => {}" color="primary" text> Add Custom Image </v-btn>
			<v-btn @click="toJSON" color="primary" text> toJSON </v-btn>
		</div>
	</div>
</template>

<script>
import { fabric } from "fabric";
var deleteIcon = require("../../assets/deleteIcon.svg");

export default {
	components: {},
	mounted() {
		this.canvas = new fabric.Canvas("canvas");

		fabric.Object.prototype.transparentCorners = false;
		fabric.Object.prototype.cornerColor = "blue";
		fabric.Object.prototype.cornerStyle = "circle";

		fabric.Image.fromURL(
			"https://images.unsplash.com/photo-1532153955177-f59af40d6472?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3087&q=80",
			(bckImg) => {
				bckImg.set({
					left: 0,
					top: 0,
					selectable: false,
				});
				this.canvas.setDimensions({ width: bckImg.width, height: bckImg.height }).add(bckImg).renderAll();
				this.initializeForViewPort();
			}
		);

		this.iconImg = document.createElement("img");
		this.iconImg.onload = () => {
			fabric.Object.prototype.controls.deleteControl = new fabric.Control({
				x: 0.5,
				y: -0.5,
				offsetY: 16,
				cursorStyle: "pointer",
				mouseUpHandler: this.deleteSelectedObject,
				render: this.renderDeleteIcon,
				cornerSize: this.controlCornerSize,
			});
		};
		this.iconImg.src = deleteIcon;
	},
	created() {},
	data: () => ({
		canvas: null,
		iconImg: null,
		controlCornerSize: 48,
	}),
	methods: {
		addStaticText() {
			this.canvas
				.add(
					new fabric.IText("Click and Edit me", {
						fontFamily: "times new roman",
						left: 100,
						top: 100,
					})
				)
				.renderAll();
		},
		deleteSelectedObject(eventData, transform) {
			var target = transform.target;
			var canvas = target.canvas;
			canvas.remove(target);
			canvas.requestRenderAll();
		},
		renderDeleteIcon(ctx, left, top, styleOverride, fabricObject) {
			var size = this.controlCornerSize;
			ctx.save();
			ctx.translate(left, top);
			ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
			ctx.drawImage(this.iconImg, -size / 2, -size / 2, size, size);
			ctx.restore();
		},
		initializeForViewPort() {
			const canvasWrapper = document.querySelector(".canvas-container");
			canvasWrapper.style.height = "100%";
			canvasWrapper.style.width = "auto";
			const lowerCanvas = document.querySelector(".lower-canvas");
			lowerCanvas.style.height = "100%";
			lowerCanvas.style.width = "auto";
			const upperCanvas = document.querySelector(".upper-canvas");
			upperCanvas.style.height = "100%";
			upperCanvas.style.width = "auto";
		},
		toJSON() {
			console.log(this.canvas.toJSON());
		},
	},
};
</script>

<style lang="scss" scoped>
#canvas {
	border: 1px dotted #000000;
}

.builder-container {
	display: flex;
	flex-direction: row;
	height: 80vh;
}
.action-tools-container {
	display: flex;
	flex-direction: column;
}
</style>
