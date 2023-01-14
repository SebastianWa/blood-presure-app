const measurementBtn = document.querySelector("#meassubmit");
const measumentForm = document.querySelector("#measument-form");
const measurementsCnt = document.querySelector("#measurements-cnt");
const inputSystolic = document.querySelector("#input-systolic");
const inputDiastolic = document.querySelector("#input-diastolic");
const inputPuls = document.querySelector("#input-puls");
const inputData = document.querySelector("#input-date");
const inputTime = document.querySelector("#input-time");
const formPopup = document.querySelector(".form__popup");
const navBtnCnt = document.querySelector(".nav");

let clicked;
navBtnCnt.addEventListener("click", (e) => {
  e.preventDefault();
  clicked = e.target.closest(".btn--nav");
  if (!clicked) return;
  console.log(clicked);

  document
    .querySelectorAll(".section")
    .forEach((btn) => btn.classList.remove("section--active"));

  document
    .querySelector(`.section--${clicked.dataset.tab}`)
    .classList.add("section--active");
});

class Measurement {
  #id;
  #curentMeasurementDataSet;
  constructor(
    systolic,
    diastolic,
    puls,
    date,
    time,
    curentMeasurementDataSet,
    id
  ) {
    this.systolic = systolic;
    this.diastolic = diastolic;
    this.puls = puls;
    this.date = date;
    this.time = time;
    this.#id = id ? id : (Date.now() + "").slice(-10);
    this.#curentMeasurementDataSet = curentMeasurementDataSet;
    this._setmeasurementType();
    this._renderMeasurement();
  }

  _setmeasurementType() {
    switch (this.#curentMeasurementDataSet) {
      case 0:
        this.type = "Niedociśnienie";
        break;
      case 1:
        this.type = "Normalne";
        break;
      case 2:
        this.type = "Wysokie Prawidłowe";
        break;
      case 3:
        this.type = "Nadciśnienie tętnicze 1";
        break;
      case 4:
        this.type = "Nadciśnienie tętnicze 2";
        break;

      default:
        break;
    }
  }

  _renderMeasurement() {
    let html = `
        <li class="measurement" data-id="${this.#id}">
            <div class="measurement__pres">
              <p class="measurement__sys">${this.systolic}</p>
              <p class="measurement__diat">${this.diastolic}</p>
            </div>
            <div class="measurement__desc">
              <p class="measurement__type">${this.type}</p>
              <span class="measurement__date">${this.date}</span
              ><span class="measurement__time">${this.time}</span
              ><span class="measurement__puls">${this.puls}</span>
            </div>
          </li>
      `;
    measurementsCnt.insertAdjacentHTML("afterbegin", html);
  }
}

class App {
  #measurements = [];
  #curentMeasurementDataSet = 1;

  sysRanges = [
    [0, 90],
    [91, 120],
    [121, 140],
    [141, 160],
    [161, 220],
  ];
  diasRanges = [
    [0, 60],
    [61, 80],
    [81, 90],
    [91, 100],
    [101, 160],
  ];

  constructor() {
    this._getLocalStorage();
    this._setInputsDateParams();

    //event listeners
    measumentForm.addEventListener("submit", (e) => {
      this._submitMeasurement(e);
    });

    inputSystolic.addEventListener("input", (e) => {
      this._checkPressure();
    });
    inputDiastolic.addEventListener("input", (e) => {
      this._checkPressure();
    });
  }

  _setLocalStorage() {
    localStorage.setItem("measurements", JSON.stringify(this.#measurements));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("measurements"));

    if (!data) return;

    this.#measurements = data;

    data.forEach((obj) => {
      const meas = new Measurement(
        obj.systolic,
        obj.diastolic,
        obj.puls,
        obj.date,
        obj.time,
        obj.curentMeasurementDataSet,
        obj.id
      );
    });
  }

  //aps INIT
  _setInputsDateParams() {
    const date = new Intl.DateTimeFormat("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .format(Date.now())
      .split(".")
      .reverse()
      .join("-");

    const time = new Intl.DateTimeFormat("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(Date.now());

    inputData.setAttribute("value", date);
    inputData.setAttribute("max", date);
    inputTime.setAttribute("value", time);

    document
      .querySelector(".chart__part--1 ")
      .classList.add("chart__part--active");
  }

  _setTableAndGraph() {
    const removeClassesFrom = (elem, cssClass) => {
      elem.forEach((e) => e.classList.remove(cssClass));
    };

    const addClassToElem = (elem, cssClass) => {
      elem.classList.add(cssClass);
    };

    //set active pressure type in table
    removeClassesFrom(
      document.querySelectorAll(".pressure-name"),
      "pressure-name--active"
    );
    addClassToElem(
      document.querySelector(
        `span[data-pre="${this.#curentMeasurementDataSet}"]`
      ),
      "pressure-name--active"
    );

    removeClassesFrom(
      document.querySelectorAll(".chart__part"),
      "chart__part--active"
    );
    addClassToElem(
      document.querySelector(`.chart__part--${this.#curentMeasurementDataSet}`),
      "chart__part--active"
    );

    //set active text to explain  measumerent

    removeClassesFrom(
      document.querySelectorAll(".chart__text"),
      "chart__text--active"
    );
    addClassToElem(
      document.querySelector(
        `div[data-text="${this.#curentMeasurementDataSet}"]`
      ),
      "chart__text--active"
    );
  }

  _clearInputs() {
    this._setInputsDateParams();

    inputSystolic.value = "120";
    inputDiastolic.value = "80";
    inputPuls.value = "60";
    this._setTableAndGraph();
  }

  //event listeners
  _submitMeasurement(e) {
    e.preventDefault();

    //get inputs data
    const systolic = +inputSystolic.value;
    const diastolic = +inputDiastolic.value;
    const puls = +inputPuls.value;
    const data = inputData.value;
    const time = inputTime.value;

    const measurement = new Measurement(
      systolic,
      diastolic,
      puls,
      data,
      time,
      this.#curentMeasurementDataSet
    );

    //save  measument in array
    this.#measurements.push(measurement);
    console.log(this.#measurements);

    //save measument in local storage
    this._setLocalStorage();

    // //render measument in list
    // this._renderMeasurement(measurement);

    this._clearInputs();

    //active and deactive popup 'Add!'
    formPopup.classList.add("form__popup--active");
    setTimeout(() => formPopup.classList.remove("form__popup--active"), 1500);

    this.#curentMeasurementDataSet = 2;
    this._setTableAndGraph();
  }

  _checkPressure() {
    const sys = +inputSystolic.value;
    const dia = +inputDiastolic.value;
    if (sys > 220 || sys < 0 || dia < 0 || dia > 160) return;

    const findIndexHelper = (elem, type) => {
      if (type >= elem[0] && type <= elem[1]) return true;
    };

    const sysIndex = this.sysRanges.findIndex((elem) =>
      findIndexHelper(elem, sys)
    );
    const diasIndex = this.diasRanges.findIndex((elem) =>
      findIndexHelper(elem, dia)
    );
    this.#curentMeasurementDataSet =
      sysIndex > diasIndex ? sysIndex : diasIndex;
    this._setTableAndGraph();
  }
}

const app = new App();
