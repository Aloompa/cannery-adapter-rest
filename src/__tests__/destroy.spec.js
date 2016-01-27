'use strict';

const assert = require('assert');
const proxyquire = require('proxyquire');
const Car = require('../__mocks__/car_model.mock');
const RestAdapter = proxyquire('../index', {
    'then-request': require('../__mocks__/destroy_request.mock')
});

describe('destroy()', () => {

    it('Should allow us to override the route', (done) => {
        const car = new Car(1);
        const adapter = new RestAdapter(car, {
            'Car': 'foo/bar/baz'
        });

        adapter.destroy(car).then((data) => {
            done();
        });
    });

    it('Should respond with an object of data', (done) => {
        const car = new Car(1);
        const adapter = new RestAdapter();

        adapter.destroy(car).then((data) => {
            done();
        });
    });

    it('Should allow us to pass in an envelope for our data', (done) => {
        const car = new Car(1);
        const adapter = new RestAdapter({
            envelope: 'car'
        });

        adapter.destroy(car).then((data) => {
            done();
        });
    });

    it('Should catch errors', (done) => {
        const car = new Car(404);
        const adapter = new RestAdapter({
            throwError: true
        });

        adapter.destroy(car).catch((data) => {
            done();
        });
    });

    it('Should allow us to specify a urlRoot', (done) => {
        const car = new Car(2);
        const adapter = new RestAdapter({
            urlRoot: 'api/'
        });

        adapter.destroy(car).then((data) => {
            done();
        });
    });

});
