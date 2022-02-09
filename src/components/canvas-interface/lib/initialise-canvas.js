import { fabric } from "fabric";
let deleteIconSVG = require("../../../assets/deleteIcon.svg");
const initializeCanvas = {
	initCanvas() {
		this.createCanvas({
			height: this.selectedRender.dimension.height,
			width: this.selectedRender.dimension.width,
		});
		this.initialiseFabricListners();
		this.updateCanvasDimensionAttributes();
		this.initialiseCanvasElements();
		this.onInit();
		fabric.Object.prototype.transparentCorners = false;
		fabric.Object.prototype.cornerColor = "blue";
		fabric.Object.prototype.cornerStyle = "circle";
		var deleteIconImg = document.createElement("img");

		deleteIconImg.onload = function () {
			fabric.Object.prototype.controls.deleteControl = new fabric.Control({
				x: 0.5,
				y: -0.5,
				offsetY: 16,
				cursorStyle: "pointer",
				mouseUpHandler: function deleteObject(eventData, transform) {
					var target = transform.target;
					var canvas = target.canvas;
					canvas.remove(target);
					canvas.requestRenderAll();
				},
				render: function (ctx, left, top, styleOverride, fabricObject) {
					var size = this.cornerSize;
					ctx.save();
					ctx.translate(left, top);
					ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
					ctx.drawImage(deleteIconImg, -size / 2, -size / 2, size, size);
					ctx.restore();
				},
				cornerSize: 24,
			});
		};
		deleteIconImg.src = deleteIconSVG;
	},

	createCanvas({ height, width }) {
		this.canvasObject = new fabric.Canvas(this.canvasSelector, {
			width,
			height,
			preserveObjectStacking: true,
		});
	},

	initialiseFabricListners() {
		this.canvasObject.on("mouse:down", () => {
			const activeObject = this.canvasObject.getActiveObject();
			if (activeObject && activeObject.id !== this.activeCanvasObject.id) {
				this.activeCanvasObject = activeObject;
				this.onObjectSelected(this.getObjectAttributesFromType(activeObject));
			} else if (!activeObject && Object.keys(this.activeCanvasObject).length) {
				this.activeCanvasObject = {};
				this.onObjectDeSelected();
			}
		});
		this.canvasObject.on("object:added", () => {
			this.onObjectAddOnCanvas(this.canvasObject.getObjects().length);
		});
	},

	updateCanvasDimensionAttributes() {
		this.updateDimensionAttributes(".lower-canvas");
		this.updateDimensionAttributes(".upper-canvas");
		this.updateDimensionAttributes(".canvas-container");
	},

	updateDimensionAttributes(elementSelector = null) {
		const elementToBeUpdated = document.querySelector(elementSelector);
		if (!elementToBeUpdated) {
			return null;
		}
		elementToBeUpdated.style.height = "auto";
		elementToBeUpdated.style.width = "100%";
	},

	initialiseCanvasElements() {
		this.handleApplyFilterEvent({
			filterName: this.selectedRender.attributes.filter,
		});
		const canvasAttributes = JSON.parse(JSON.stringify(this.selectedRender.attributes));
		delete canvasAttributes.filters;
		this.applyFiltersOnTheCanvasBackground(canvasAttributes);
		// this.addImagesOnTheCanvas(this.selectedRender.additionalBrandObjects.imageObjects);
		// this.addTextObjectsOnTheCanvas(this.selectedRender.additionalBrandObjects.textObjects);
	},
};

export default initializeCanvas;
