class GBIElement extends HTMLElement {
  constructor(render) {
    super();
    this.listenerLibrary = {};
    this.state = {};
  }

  set(target) {
    if(target) {
      this.state = {
        ...this.state,
        ...target,
      };
    }
    if(this.render) {
      this.render();
    }
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

  render() {

  }
}

class GBITile extends GBIElement {

	constructor() {
		super();
	}

	connectedCallback() {
    this.state.name = this.getAttribute('name');
    this.state.price = this.getAttribute('price');
    this.state.image = this.getAttribute('image');
    this.set();
  }

  set name(target) {
    this.set({
      name: target,
    })
  }

  get name() { return this.state.name }

  get price() { return this.state.price }

  set price(target) {
    this.set({
      price: Number(target),
    })
  }

  get image() { return this.state.image }

  set image(target) {
    this.set({
      image: target,
    })
  }  

  onAdd = () => {
    this.emit("GBI_ADD_TO_CARD", {target: this});
  }

  render = () => {
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



