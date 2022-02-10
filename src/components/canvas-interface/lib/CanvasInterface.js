import { fabric } from "fabric";
// import { v4 as uuidv4 } from 'uuid'
import listeners from "./listeners";
import initializeCanvas from "./initialise-canvas";
import canvasAttributesManager from "./canvasAttributesManager";
import textInput from "./text-input";
import imageInput from "./image-input";

class CanvasInterface {
	constructor({ selectedRender, canvasSelector }) {
		this.selectedRender = selectedRender;
		this.canvasSelector = canvasSelector;
		this.canvasObject = {};
		this.activeCanvasObject = {};
		this.selectedRender.attributes = {
			filter: "original",
			brightness: 0,
			contrast: 0,
			saturation: 0,
			hue: 0,
			noise: 0,
		};
		this.canvasAttributes = {
			filter: "original",
			brightness: 0,
			contrast: 0,
			saturation: 0,
			hue: 0,
			noise: 0,
		};
		this.defaultCanvasAttributes = {
			filter: "original",
			brightness: 0,
			contrast: 0,
			saturation: 0,
			hue: 0,
			noise: 0,
		};
		this.cropZone = null;
		this.saveAsTemplate = false;
	}

	getObjectAttributesFromType(activeObject) {
		switch (activeObject.get("type")) {
			case "i-text": {
				return {
					id: activeObject.id,
					type: "INTERACTIVE_TEXT",
					text: activeObject.text,
					position: {
						top: activeObject.top,
						left: activeObject.left,
						scaleX: activeObject.scaleX,
						scaleY: activeObject.scaleY,
						angle: activeObject.angle,
					},
					style: {
						color: activeObject.fill,
						fontFamily: activeObject.fontFamily,
						fontSize: activeObject.fontSize,
						fontWeight: activeObject.fontWeight,
						fontStyle: activeObject.fontStyle,
						underline: activeObject.underline,
						horizontalAlignment: activeObject.textAlign,
					},
				};
			}
			case "text": {
				return {
					id: activeObject.id,
					type: "TEXT",
					text: activeObject.text,
					position: {
						top: activeObject.top,
						left: activeObject.left,
						scaleX: activeObject.scaleX,
						scaleY: activeObject.scaleY,
						angle: activeObject.angle,
					},
					style: {
						color: activeObject.fill,
						fontFamily: activeObject.fontFamily,
						fontSize: activeObject.fontSize,
						fontWeight: activeObject.fontWeight,
						fontStyle: activeObject.fontStyle,
						underline: activeObject.underline,
						horizontalAlignment: activeObject.textAlign,
					},
				};
			}
			case "image": {
				return {
					id: activeObject.id,
					type: "IMAGE",
					imageRef: activeObject.getElement().src,
					dimension: {
						width: activeObject.width,
						height: activeObject.height,
					},
					position: {
						top: activeObject.top,
						left: activeObject.left,
					},
					attributes: {
						opacity: activeObject.opacity,
						scaleX: activeObject.scaleX,
						scaleY: activeObject.scaleY,
						angle: activeObject.angle,
					},
				};
			}
			default: {
				return null;
			}
		}
	}

	setBackgroundImageOnCanvas(src) {
		this.canvasObject.setBackgroundImage(src, this.canvasObject.renderAll.bind(this.canvasObject), {
			originX: "left",
			originY: "top",
			crossOrigin: "anonymous",
		});
	}

	addImageOnCanvas(imageRef, imageProperties) {
		fabric.Image.fromURL(imageRef, (fabricImageObject) => {
			const { widthRatio, heightRatio } = this.getImageScaleRatio({
				imageHeight: fabricImageObject.height,
				imageWidth: fabricImageObject.width,
				maxWidth:
					(30 * this.selectedRender.dimension.width) / 100 < 300
						? 300
						: (30 * this.selectedRender.dimension.width) / 100,
			});
			// console.log(widthRatio, heightRatio)

			if (!imageProperties.scaleX) {
				imageProperties.scaleX = widthRatio;
			}
			if (!imageProperties.scaleY) {
				imageProperties.scaleY = heightRatio;
			}
			const imageObject = fabricImageObject.set(imageProperties);
			this.activeCanvasObject = imageObject;
			this.canvasObject.add(imageObject).renderAll();
			this.canvasObject.setActiveObject(imageObject);
			this.onObjectSelected(this.getObjectAttributesFromType(imageObject));
		});
	}

	getImageScaleRatio({ imageHeight, imageWidth, maxWidth }) {
		const widthRatio = maxWidth / imageWidth;
		const heightRatio = (maxWidth * imageHeight) / imageWidth / imageHeight;
		return { widthRatio, heightRatio };
	}

	clearCanvasBackground() {
		this.canvasObject.setBackgroundImage(null);
		this.canvasObject.setBackgroundColor("#fff");
		this.canvasObject.renderAll();
	}

	handleGetAllCanvasElementsEvent() {
		const allCanvasObjects = this.canvasObject.getObjects();
		const normalisedObjects = [];
		for (const canvasObject of allCanvasObjects) {
			normalisedObjects.push(this.getObjectAttributesFromType(canvasObject));
		}

		const thumbnailUrl = this.getCanvasSnapshot("jpeg", 0.5);

		let templateImageUrl = "";
		if (this.saveAsTemplate) {
			// do something here
			this.clearCanvasBackground();
			templateImageUrl = this.getCanvasSnapshot("jpeg", 0.5);
		}
		// console.log(this.saveAsTemplate, { templateImageUrl })
		this.onRequestForCanvasPropertiesAndElement({
			canvasAttributes: this.canvasAttributes,
			addedCanvasElements: normalisedObjects,
			thumbnailUrl,
			...(this.saveAsTemplate && { templateImageUrl }),
		});
	}

	getCanvasSnapshot(format = "jpeg", quality = 1) {
		return this.canvasObject.toDataURL({ format, quality });
	}

	handleApplyTemplateOnCanvasEventEvent(template) {
		this.addImagesOnTheCanvas(template.templateObjects.imageObjects);

		this.addTextObjectsOnTheCanvas(template.templateObjects.textObjects);
	}

	handleInitiateCropEvent() {
		this.canvasObject.discardActiveObject();
		this.activeCanvasObject = {};
		this.canvasObject.setOverlayImage(this.getCanvasSnapshot(), this.canvasObject.renderAll.bind(this.canvasObject), {
			left: 0,
			top: 0,
			width: this.selectedRender.dimension.width - 1,
			height: this.selectedRender.dimension.height - 1,
			lockMovementX: true,
			lockMovementY: true,
			lockRotation: true,
			selectable: false,
			globalCompositeOperation: "destination-atop",
		});

		const cropOverlay = new fabric.Rect({
			width: this.selectedRender.dimension.width,
			height: this.selectedRender.dimension.height,
			fill: "#00000050",
			lockMovementX: true,
			lockMovementY: true,
			globalCompositeOperation: "source-over",
			left: 0,
			top: 0,
		});
		this.canvasObject.add(cropOverlay);

		const cropZone = new fabric.Rect({
			width: this.selectedRender.dimension.width / 4,
			height: this.selectedRender.dimension.height / 4,
			top: this.selectedRender.dimension.height / 4,
			left: this.selectedRender.dimension.width / 4,
			fill: "#451245",
			globalCompositeOperation: "destination-out",
		});

		this.cropZone = cropZone;
		this.canvasObject.add(cropZone);
		this.canvasObject.renderAll();
	}

	handleCropCanvasEvent() {
		const croppedImage = this.canvasObject.toDataURL({
			left: this.cropZone.left,
			top: this.cropZone.top,
			width: this.cropZone.width * this.cropZone.scaleX,
			height: this.cropZone.height * this.cropZone.scaleY,
		});
		// console.log({ croppedImage })
		// this.canvasObject.remove(...this.canvasObject.getObjects())
		this.canvasObject.clear();
		// Maybe Below step is not required
		this.canvasAttributes = this.defaultCanvasAttributes;
		this.canvasObject.setWidth(this.cropZone.width * this.cropZone.scaleX);
		this.canvasObject.setHeight(this.cropZone.height * this.cropZone.scaleY);
		this.updateCanvasDimensionAttributes();
		this.setBackgroundImageOnCanvas(croppedImage);
		// console.log(this.canvasObject)
	}

	updateSaveAsTemplateCheckboxValue(checkboxValue) {
		this.saveAsTemplate = checkboxValue;
	}
}

Object.assign(CanvasInterface.prototype, {
	...listeners,
	...initializeCanvas,
	...canvasAttributesManager,
	...textInput,
	...imageInput,
});

export default CanvasInterface;
