// Tobermory.es6-string-html plugin for vs code

class TransfareFunctionPicker {
  sliderContainer = null;
  background = null;

  constructor(id, update) {
    this.hard = false;
    const sliderContainer = document.getElementById(id);
    const background = sliderContainer.querySelector(
      ".transfareFunctionBackground"
    );

    this.sliderContainer = sliderContainer;
    this.background = background;

    background.addEventListener("dblclick", (event) => {
      this._addHandle(event);
    });

    sliderContainer
      .querySelector(".pickerCheck")
      .addEventListener("click", () => {
        this.hard = !this.hard;
        this._updateGradient();
      });

    this.update = update
    this._updateGradient()
    for (let i = 0; i < this.background.children.length; i++) {
      const child = this.background.children[i];
      this._addEventsToHandle(child)
    }
  }

  /**
   *
   * @param {MouseEvent} event
   */
  _addHandle(event) {
    const handleTemplate = document.getElementById("colorHandle");

    /** @type { HTMLInputElement } */
    const handle = handleTemplate.content.firstElementChild.cloneNode(true);

    const color = this.getRawColors()
    const colorScale = d3
      .scaleLinear()
      .domain(color.map((s) => s.pos))
      .range(color.map((s) => s.col))
      .interpolate(d3.interpolateRgb)
    handle.value = d3.rgb(colorScale(this._silderPosition(handle, event.clientX))).formatHex()

    this.background.appendChild(handle);
    this._moveHandleTo(handle, event.clientX);
    this._addEventsToHandle(handle)
  }

  _addEventsToHandle(handle){
    
    handle.addEventListener("pointerdown", (ev) => this._startDrag(ev, handle));
    handle.addEventListener("input", (event) => {
      this._updateGradient();
      handle.style.background = event.target.value;
    });
    handle.addEventListener("click", (e) => {
      if (e.detail === 2) {
        handle.remove();
        this._updateGradient();
        e.preventDefault();
      }
    });
  }
  _startDrag(ev, handle) {
    ev.preventDefault();
    handle.setPointerCapture(ev.pointerId);

    const onMove = (e) => this._moveHandleTo(handle, e.clientX);
    const onUp = (e) => {
      handle.releasePointerCapture(e.pointerId);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
    };

    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  }

  _moveHandleTo(handle, clientX) {
    const pct = this._silderPosition(handle, clientX)
    handle.style.left = pct * 100 + "%";
    handle.style.top = "10%";
    this._updateGradient();
  }

  _silderPosition(handle, clientX){
    const box = this.sliderContainer.getBoundingClientRect();
    const handleBox = handle.getBoundingClientRect();

    const hw = handleBox.width;
    const bw = box.width;

    const pct = Math.max(
      0,
      Math.min(bw - hw, clientX - box.left - hw / 2) / bw
    );
    return pct
  }

  _updateGradient() {
    const handles = Array.from(
      this.background.querySelectorAll('input[type="color"]')
    );
    if (!handles.length) return;

    const stops = this.getRawColors()

    const gradient =
      "linear-gradient(to right, " +
      stops.map((s) => `${s.col} ${s.pos*100}%`).join(", ") + // erste Hälfte
      ")";

    this.background.style.background = gradient;

    this._callUpdate()
  }

  getHtmlElement() {
    document.getElementById(id);
  }

  /**
   * @returns { {pos:number, col:string}[]  }
   */
  getRawColors() {
    const handles = Array.from(
      this.background.querySelectorAll('input[type="color"]')
    );
    let stops = handles
      .map((h) => ({
        pos: parseFloat(h.style.left) || 0,
        col: h.value,
      }))
      .sort((a, b) => a.pos - b.pos);

    let stopsReal = [];

    for (let i = 0; i < stops.length; i++) {
      const current = stops[i];
      current.pos/=100
      const next = i + 1 < stops.length ? stops[i + 1] : { pos: 1 };
      stopsReal.push(current);
      if (this.hard) {
        stopsReal.push({ pos:( next.pos/100) - 0.001, col: current.col });
      }
    }


    if (stopsReal.length == 0) {
      return [
        { pos: 0, col: "#ffffff" },
        { pos: 1, col: "#ffffff" },
      ];
    } else if (stopsReal.length == 1) {
      return [
        { pos: 0, col: stopsReal[0].col },
        { pos: 1, col: stopsReal[0].col },
      ];
    } else {

      stopsReal.push({ pos: 1, col: stopsReal[stopsReal.length - 1].col });
      stopsReal.unshift({ pos: 0, col: stopsReal[0].col });
      return stopsReal;
    }
  }

  _callUpdate(){
      if(this.update){
        this.update()
      }
  }
}
