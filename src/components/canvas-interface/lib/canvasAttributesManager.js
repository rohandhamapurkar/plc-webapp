import { fabric } from "fabric";

const canvasAttributesManager = {
	handleApplyFilterEvent(filter) {
		this.canvasAttributes.filter = filter.filterName;
		switch (filter.filterName) {
			case "original": {
				this.applyFilterToCanvasBackground(this.selectedRender.imageUrl, false, 6);
				break;
			}
			case "sepia": {
				this.applyFilterToCanvasBackground(this.selectedRender.imageUrl, new fabric.Image.filters.Sepia(), 6);
				break;
			}
			case "emboss": {
				this.applyFilterToCanvasBackground(
					this.selectedRender.imageUrl,
					new fabric.Image.filters.Convolute({
						matrix: [1, 1, 1, 1, 0.7, -1, -1, -1, -1],
					}),
					6
				);
				break;
			}
			case "grayscale": {
				this.applyFilterToCanvasBackground(this.selectedRender.imageUrl, new fabric.Image.filters.Grayscale(), 6);
				break;
			}
			case "sharpen": {
				this.applyFilterToCanvasBackground(
					this.selectedRender.imageUrl,
					new fabric.Image.filters.Convolute({
						matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0],
					}),
					6
				);
				break;
			}
			case "blackwhite": {
				this.applyFilterToCanvasBackground(this.selectedRender.imageUrl, new fabric.Image.filters.BlackWhite(), 6);
				break;
			}
		}
	},

	handleUpdateAttributeEvent(attribute) {
		this.canvasAttributes[attribute.name] = attribute.value;
		switch (attribute.name) {
			case "brightness": {
				this.applyFilterToCanvasBackground(
					this.selectedRender.imageUrl,
					new fabric.Image.filters.Brightness({
						brightness: attribute.value,
					}),
					1
				);
				break;
			}
			case "contrast": {
				this.applyFilterToCanvasBackground(
					this.selectedRender.imageUrl,
					new fabric.Image.filters.Contrast({
						contrast: attribute.value,
					}),
					2
				);
				break;
			}
			case "saturation": {
				this.applyFilterToCanvasBackground(
					this.selectedRender.imageUrl,
					new fabric.Image.filters.Saturation({
						saturation: attribute.value,
					}),
					3
				);
				break;
			}
			case "hue": {
				this.applyFilterToCanvasBackground(
					this.selectedRender.imageUrl,
					new fabric.Image.filters.HueRotation({
						rotation: attribute.value,
					}),
					4
				);
				break;
			}
			case "noise": {
				this.applyFilterToCanvasBackground(
					this.selectedRender.imageUrl,
					new fabric.Image.filters.Noise({
						noise: attribute.value,
					}),
					5
				);
				break;
			}
		}
	},

	applyFiltersOnTheCanvasBackground(filtersToApply) {
		for (const canvasAttributeName of Object.keys(filtersToApply)) {
			this.handleUpdateAttributeEvent({
				name: canvasAttributeName,
				value: filtersToApply[canvasAttributeName],
			});
		}
	},

	applyFilterToCanvasBackground(src, filterObject, filterIndex = 0) {
		const canvasObject = this.canvasObject;
		fabric.Image.fromURL(
			src,
			function (image) {
				if (canvasObject.backgroundImage) {
					image.filters.push(...canvasObject.backgroundImage.filters);
				}
				image.filters[filterIndex] = filterObject;
				image.applyFilters();
				canvasObject.setBackgroundImage(image, canvasObject.renderAll.bind(canvasObject), {
					originX: "left",
					originY: "top",
					crossOrigin: "anonymous",
				});
			},
			{ crossOrigin: "Anonymous" }
		);
	},
};

export default canvasAttributesManager;
