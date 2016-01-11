'use strict';

class Part {

    constructor (id) {
        this.id = id;
    }

    getName () {
        return 'parts';
    }

    getNameSingular () {
        return 'part';
    }

}

module.exports = Part;
