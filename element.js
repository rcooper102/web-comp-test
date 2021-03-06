class GBIElement extends HTMLElement {
  constructor(props) {
    super();
    this._props = {};
    if(props) {
      Object.keys(props).forEach((item) => {
        this.setAttribute(item, typeof props[item] === "object" || typeof props[item] === "array" ? JSON.stringify(props[item]) : props[item]);
        this._props[item] = props[item];
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
    if(this._props[target]) {
      return this._props[target];
    }
    const prop = this.getAttribute(target);
    if(typeof prop === "string") {
      if(prop.substr(0,1) === '[' || prop.substr(0,1) === '{') {
        return JSON.parse(prop);
      }
    }
    return prop;
  }

  get props() {
    const ret = {};
    const l = this.attributes.length;
    for(let i = 0; i < l; i++) {
      ret[this.attributes[i].name] = this.prop(this.attributes[i].name);
    }
    return ret;
  }

  render() {}

  static defineElements(elements){
    Object.keys(elements).forEach((item) => {
      window.customElements.define(item, elements[item]);
    });
  }
}

class GBITile extends GBIElement {

	constructor(props) {
		super(props);
	}

	connectedCallback() {
    this.set({
      ...this.props,
    });
    this.classList.add('loading');
    const img = new Image();
    img.addEventListener('load', this.onImageLoad);
    img.src = this.state.image;
  }

  onImageLoad = () => {
    this.classList.remove('loading');
  }

  onAdd = () => {
    this.emit('GBI_ADD_TO_CART', {target: this});
  }

  formatNumber = (target) => {
      return parseFloat(Math.round(target * 100) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  render = () => {
    this.innerHTML = `
        <photo><img src="${this.state.image}" /></photo>
        <info>
          <name>${this.state.name}</name>
          <price>$${this.formatNumber(this.state.price)}</price>
          <stock class="${ this.state.stock <= 5 ? 'warning' : '' }">${this.state.stock} in stock</stock>
        </info>
        <button>${ this.state.variants.length > 1 ? 'Choose Options' : 'Add to Cart' }</button>
    `;
    this.child('button').addEventListener('click', this.onAdd)
  }
}

class GBIGrid extends GBIElement {

  constructor(props) {
    super(props);
  }

  connectedCallback() {
    this.set({ list: this.prop('data') });
  }

  onAddToCart = (e) => {
    this.emit('GBI_ADD_TO_CART', e);
  }

  render = () => {
    console.time('Render');
    this.state.list.forEach((item) => {
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





