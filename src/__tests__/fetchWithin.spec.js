'use strict';

const assert = require('assert');
const proxyquire = require('proxyquire');
const Car = require('../__mocks__/car_model.mock');
const Part = require('../__mocks__/part_model.mock');
const RestAdapter = proxyquire('../index', {
    'then-request': require('../__mocks__/fetchWithin_request.mock')
});

describe('fetchWithin()', () => {

    it('Should respond with an object of data', (done) => {
        const adapter = new RestAdapter();
        const car = new Car(1);

        Part.prototype.getParent = () => {
            return car;
        };

        adapter.fetchWithin(new Part(), car).then((data) => {
            assert.equal(data.name, 'Steering Wheel');
            done();
        });
    });

    it('Should allow us to pass in an envelope for nested data', (done) => {
        const adapter = new RestAdapter({
            envelope: 'part'
        });

        const car = new Car(2);

        Part.prototype.getParent = () => {
            return car;
        };

        adapter.fetchWithin(new Part(), car).then((data) => {
            assert.equal(data.name, 'Engine');
            done();
        });
    });

    it('Should catch errors', (done) => {
        const car = new Car(2000);
        const adapter = new RestAdapter();

        adapter.fetchWithin(new Part(), car).catch((data) => {
            assert.equal(data.statusCode, 404);
            done();
        });
    });

    it('Should allow us to specify a urlRoot', (done) => {
        const car = new Car(1);
        const adapter = new RestAdapter({
            urlRoot: 'api/'
        });

        adapter.fetchWithin(new Part(), car).then((data) => {
            assert.equal(data.name, 'Steering Wheel');
            done();
        });
    });

});
