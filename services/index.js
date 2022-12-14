const DO = require("./modules/DO");
const simulationGroup = require("./modules/simulationGroup");
const serviceGroup = require("./modules/serviceGroup");
const control = require("./modules/control");
class Services {
   #getInstance(_class) {
      const className = _class.name;

      // instance 최초 생성
      if (!this[className]) {
         this[className] = new _class();
      }

      return this[className];
   }

   get do() {
      return this.#getInstance(DO);
   }

   get simulation() {
      return this.#getInstance(simulationGroup);
   }

   get service() {
      return this.#getInstance(serviceGroup);
   }

   get control() {
      return this.#getInstance(control);
   }
}

module.exports = new Services();
