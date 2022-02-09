module.exports = {
  onInit() {
    console.log('Canvas Initialised')
  },

  onObjectSelected() {
    console.log('An Object was Selected')
  },

  onObjectDeSelected() {
    console.log('An Object was De-Selected')
  },

  onObjectAddOnCanvas() {
    console.log('An Object was Added On Canvas')
  },

  onRequestForCanvasPropertiesAndElement() {
    console.log('Canvas Properties And Element')
  },

  addEventListener(event, callback = null) {
    switch (event) {
      case 'init': {
        if (callback) this.onInit = callback
        break
      }
      case 'object-selected': {
        if (callback) this.onObjectSelected = callback
        break
      }
      case 'object-deselected': {
        if (callback) this.onObjectDeSelected = callback
        break
      }
      case 'object-added-on-canvas': {
        if (callback) this.onObjectAddOnCanvas = callback
        break
      }
      case 'all-canvas-properties-and-elements': {
        if (callback) this.onRequestForCanvasPropertiesAndElement = callback
        break
      }
    }
  },
}
