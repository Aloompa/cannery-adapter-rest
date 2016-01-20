'use strict';

const assert = require('assert');
const proxyquire = require('proxyquire');
const Car = require('../__mocks__/car_model.mock');
const Part = require('../__mocks__/part_model.mock');
const RestAdapter = proxyquire('../index', {
    'then-request': require('../__mocks__/findAllWithin_request.mock')
});

describe('findAllWithin()', () => {

    it('Should allow us to define our own url path', (done) => {
        const adapter = new RestAdapter();
        const car = new Car(1);

        Part.prototype.getParent = () => {
            return car;
        };

        adapter.findAllWithin(Part, car, {
            getPath: () => {
                return 'foo/bar/baz';
            }
        }).then((data) => {
            assert.equal(data[0].id, 100);
            done();
        });
    });

    it('Should respond with an array of data', (done) => {
        const adapter = new RestAdapter();
        const car = new Car(1);

        Part.prototype.getParent = () => {
            return car;
        };

        adapter.findAllWithin(Part, car).then((data) => {
            assert.equal(data.length, 2);
            assert.equal(data[0].id, 1);
            done();
        });
    });

    it('Should allow us to pass in an envelope for nested data', (done) => {
        const car = new Car(1);
        const adapter = new RestAdapter({
            arrayEnvelope: 'parts'
        });

        Part.prototype.getParent = () => {
            return car;
        };

        adapter.findAllWithin(Part, car, {
            envelope: 'parts'
        }).then((data) => {
            assert.equal(data[1].id, 2);
            done();
        });
    });

    it('Should allow us to specify a urlRoot', (done) => {
        const car = new Car(1);
        const adapter = new RestAdapter({
            urlRoot: 'api/v1/'
        });

        Part.prototype.getParent = () => {
            return car;
        };

        adapter.findAllWithin(Part, car).then((data) => {
            assert.equal(data[0].name, 'Starter');
            done();
        });
    });

    it('Should allow us to traverse more than one parent', (done) => {
        const adapter = new RestAdapter();
        const car = new Car(1);
        const part = new Part(2);

        Part.prototype.getParent = () => {
            return car;
        };

        class PartMaker {

            constructor (id) {
                this.id = id;
            }

            getName () {
                return 'part_makers';
            }

            getParent () {
                return part;
            }

        }

        adapter.findAllWithin(PartMaker, part).then((data) => {
            assert.equal(data[0].name, 'Big John');
            done();
        });
    });

});
