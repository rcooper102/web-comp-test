class GBIElement extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({mode: 'open'})
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

class MyElement extends GBIElement {

	constructor() {
		super();		
		setTimeout(() => {
			this.emit("COMPLETE",{target:this});
		}, 4000);

		this.shadow.innerHTML = this.render();
	}

	render(){
		return `
			<div>
				Hello World!
			</div>
		`;
	}

}

window.customElements.define('my-element', MyElement);