import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";

const textInput = {
	addTextObjectsOnTheCanvas(textObjectsArray) {
		for (const textObject of textObjectsArray) {
			this.handleAddTextEvent(textObject.text, {
				id: textObject.id,
				left: textObject.position.left,
				top: textObject.position.top,
				angle: textObject.position.angle,
				scaleX: textObject.position.scaleX,
				scaleY: textObject.position.scaleY,
				fill: textObject.style.color,
				fontFamily: textObject.style.fontFamily,
				fontSize: textObject.style.fontSize,
				fontStyle: textObject.style.fontStyle,
				fontWeight: textObject.style.fontWeight,
				textAlign: textObject.style.horizontalAlignment,
				underline: textObject.style.underline,
			});
		}
	},

	handleAddTextEvent(text = "Lorem Ipsum", textProperties = false, textType = "IText") {
		if (!textProperties) {
			textProperties = {
				id: uuidv4(),
				left: this.selectedRender.dimension.width / 2,
				top: this.selectedRender.dimension.height / 2,
				lockSkewingX: true,
				lockSkewingY: true,
				fontSize: "40", // Font Size
				fontFamily: "Arial, Helvetica, sans-serif", // Font Family
				fill: "#000",
			};
		}
		const textObject = new fabric[textType](text, textProperties);
		this.activeCanvasObject = textObject;
		this.canvasObject.add(textObject);
		this.canvasObject.setActiveObject(textObject);
		this.onObjectSelected(this.getObjectAttributesFromType(textObject));
	},

	handleUpdateTextAttribute(data) {
		switch (data.attributeName) {
			case "color": {
				this.activeCanvasObject.set("fill", data.attributeValue);
				this.canvasObject.renderAll();
				break;
			}
			case "horizontalAlignment": {
				this.activeCanvasObject.set("textAlign", data.attributeValue);
				this.canvasObject.renderAll();
				break;
			}
			default: {
				this.activeCanvasObject.set(data.attributeName, data.attributeValue);
				this.canvasObject.renderAll();
				break;
			}
		}
	},
};

export default textInput;
