class GBIElement extends HTMLElement {
  constructor() {
    super();
    this.listenerLibrary = {};
  }

  /* * Adds an event listener to this object
  * @param {string} type - The listener type as a string
  * @param {function} method - The function to call when the event is emitted
  * @param {boolean} once - Whether the listener self removes itself after firing once or not
  * */
  on(type, method, once = false) {
    if (this.listenerLibrary[type] === undefined) {
      this.listenerLibrary[type] = [];
    }
    this.listenerLibrary[type].push({ method, once });
  }

  once(type, method) {
    this.on(type, method, true);
  }

  off(type, method) {
    if (this.listenerLibrary[type]) {
      this.listenerLibrary[type] = this.listenerLibrary[type].filter(({ method: m }) => m !== method);
    }
  }

  emit(type, evt) {
    // Can't break out of `forEach`, use `abort` to determine whether to invoke each method.
    let abort;

    if (this.listenerLibrary[type] && Array.isArray(this.listenerLibrary[type])) {
      this.listenerLibrary[type].forEach((listener) => {
        if (!abort) {
          abort = listener.method(evt) === false;
          if (listener.once) {
            this.off(type, listener.method);
          }
        }
      });
    }

    // Return `true` if process executed as expected, `false` if aborted.
    return !abort;
  }
}

class GBITile extends GBIElement {

	constructor() {
		super();
    this.onAdd = this.onAdd.bind(this);
	}

	connectedCallback() {
    this.name = this.getAttribute('name');
    this.price = this.getAttribute('price');
    this.image = this.getAttribute('image');
    this.render();
  }

  onAdd() {
    this.emit("GBI_ADD_TO_CARD", {target: this});
  }

  render() {
    this.innerHTML = `
        <img src='${this.image}' />
        <name>${this.name}</name>
        <price>${this.price}</price>
        <button>Add to Cart</button>
    `;
    this.querySelector("button").addEventListener("click", this.onAdd)
  }

}

window.customElements.define('gb-tile', GBITile);



