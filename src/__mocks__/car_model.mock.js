'use strict';

class Car {

    constructor (id) {
        this.id = id;
    }

    getName () {
        return 'cars';
    }

    getParent () {
        return null;
    }

}

module.exports = Car;
