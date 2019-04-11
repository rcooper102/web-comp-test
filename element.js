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

    return !abort;
  }

  child(target) {
    return this.querySelector(target);
  }

  prop(target) {
    const prop = this.getAttribute(target);
    if(typeof prop === "string") {
      if(prop.substr(0,1) === '[' || prop.substr(0,1) === '{') {
        return JSON.parse(prop);
      }
    }
    return prop;
  }

  render() {
  }

  static defineElements(elements){
    Object.keys(elements).forEach((item) => {
      window.customElements.define(item, elements[item]);
    });
  }
}

class GBITile extends GBIElement {

	constructor(props) {
		super(props);
    this.onImageLoad = this.onImageLoad.bind(this);
    this.onAdd = this.onAdd.bind(this);
	}

	connectedCallback() {
    this.state.name = this.prop('name');
    this.state.price = this.prop('price');
    this.state.image = this.prop('image');
    this.set();
    const img = new Image();
    img.addEventListener('load', this.onImageLoad);
    img.src = this.state.image;
  }

  onImageLoad() {
    this.classList.remove('loading');
  }

  onAdd = () => {
    this.emit('GBI_ADD_TO_CART', {target: this});
  }

  formatNumber(x) {
      return parseFloat(Math.round(x * 100) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  render = () => {
    this.classList.add('loading');
    this.innerHTML = `
        <photo><img src="${this.state.image}" /></photo>
        <info>
          <name>${this.state.name}</name>
          <price>$${this.formatNumber(this.state.price)}</price>
        </info>
        <button>Add to Cart</button>
    `;
    this.child('button').addEventListener('click', this.onAdd)
  }

}

class GBIGrid extends GBIElement {

  constructor() {
    super();
    this.list = [];
    this.onAddToCart = this.onAddToCart.bind(this);
  }

  connectedCallback() {
    console.time('Data Load');
    fetch('https://my.api.mockaroo.com/fake_products.json', { headers: { 'X-API-Key': '44f77fe0' }
    }).then((response) => {
      return response.json();
    }).then((data) => {
      console.timeEnd('Data Load');
      data.forEach((item) => { this.list.push(item) });
      this.render();
    });
  }

  onAddToCart(e) {
    this.emit('GBI_ADD_TO_CART', e);
  }

  render = () => {
    console.time('Render');
    this.list.forEach((item) => {
      const li = new GBITile(item);
      this.appendChild(li);
      li.on('GBI_ADD_TO_CART', this.onAddToCart);
    });
    console.timeEnd('Render');
  }
}

GBIElement.defineElements({
  'gb-grid': GBIGrid,
  'gb-tile': GBITile,
});





