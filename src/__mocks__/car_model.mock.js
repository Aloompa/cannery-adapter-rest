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

    toJSON () {
        return {
            id: this.id,
            make: 'Mazda',
            model: 'Mazda3'
        };
    }

}

module.exports = Car;
