class GBIElement extends HTMLElement {
  constructor(props) {
    super();
    if(props) {
      Object.keys(props).forEach((item) => {
        this.setAttribute(item, props[item]);
      });
    }
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

  child(target) {
    return this.querySelector(target);
  }

  prop(target) {
    const prop = this.getAttribute(target);
    if(typeof prop === "string") {
      if(prop.substr(0,1) === "[" || prop.substr(0,1) === "{") {
        return JSON.parse(prop);
      }
    }
    return prop;
  }

  render() {

  }
}

class GBITile extends GBIElement {

	constructor(props) {
		super(props);
	}

	connectedCallback() {
    this.state.name = this.prop('name');
    this.state.price = this.prop('price');
    this.state.image = this.prop('image');
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

  formatNumber(x) {
      return parseFloat(Math.round(x * 100) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  render = () => {
    this.innerHTML = `
        <photo><img src='${this.image}' /></photo>
        <name>${this.name}</name>
        <price>$${this.formatNumber(this.price)}</price>
        <button>Add to Cart</button>
    `;
    this.child("button").addEventListener("click", this.onAdd)
  }

}

class GBIGrid extends GBIElement {

  constructor() {
    super();
    this.list = [];
  }

  connectedCallback() {
    console.time("Data Load");
    fetch("https://my.api.mockaroo.com/fake_products.json", { headers: { "X-API-Key": "44f77fe0" }
    }).then((response) => {
      return response.json();
    }).then((data) => {
      console.timeEnd("Data Load");
      data.forEach((item) => { this.list.push(item) });
      this.render();
    });
  }

  render = () => {
    console.time("Render");
    this.list.forEach((item) => {
      const li = new GBITile(item);
      li.on("GBI_ADD_TO_CARD", (e) => {
         this.emit("GBI_ADD_TO_CARD", e);
      });
      this.appendChild(li);
    });
    console.timeEnd("Render");
  }

}

window.customElements.define('gb-grid', GBIGrid);
window.customElements.define('gb-tile', GBITile);


