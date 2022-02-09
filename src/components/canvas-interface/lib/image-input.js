// import { fabric } from 'fabric'
import { v4 as uuidv4 } from 'uuid'

const imageInput = {
  addImagesOnTheCanvas(imageObjectsArray) {
    for (const imageObject of imageObjectsArray) {
      this.addImageOnCanvas(imageObject.imageRef, {
        id: imageObject.id,
        left: imageObject.position.left,
        top: imageObject.position.top,
        angle: imageObject.attributes.angle,
        scaleX: imageObject.attributes.scaleX,
        scaleY: imageObject.attributes.scaleY,
        opacity: imageObject.attributes.opacity,
      })
    }
  },

  addListnerOnFileInput() {
    document.getElementById('file').addEventListener('change', (e) => {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (f) => {
        this.addImageOnCanvas(f.target.result, {
          id: uuidv4(),
          left: 0,
          top: 0,
          angle: 0,
        })
        document.getElementById('file').value = ''
      }
      reader.readAsDataURL(file)
    })
  },

  handleAddImageEvent() {
    document.getElementById('file').click()
  },

  handleUpdateImageAttribute(data) {
    this.activeCanvasObject.set(data.attributeName, data.attributeValue)
    this.canvasObject.renderAll()
  },
}

export default imageInput
