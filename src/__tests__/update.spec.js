'use strict';

const assert = require('assert');
const proxyquire = require('proxyquire');
const Car = require('../__mocks__/car_model.mock');
const RestAdapter = proxyquire('../index', {
    'then-request': require('../__mocks__/update_request.mock')
});

describe('update()', () => {

    it('Should allow us to override the route', (done) => {
        const car = new Car(1);
        const adapter = new RestAdapter(car, {
            Car: {
                update: 'foo/bar/baz'
            }
        });

        adapter.update(car, {}).then((data) => {
            assert.equal(data.id, 5000);
            done();
        });
    });

    it('Should respond with an object of data', (done) => {
        const car = new Car(1);
        const adapter = new RestAdapter();

        adapter.update(car).then((data) => {
            assert.equal(data.id, 1);
            done();
        });
    });

    it('Should allow us to pass in an envelope for our data', (done) => {
        const car = new Car(1);
        const adapter = new RestAdapter({
            envelope: 'car'
        });

        adapter.update(car).then((data) => {
            assert.equal(data.id, 1);
            done();
        });
    });

    it('Should catch errors', (done) => {
        const car = new Car(3);
        const adapter = new RestAdapter({
            throwError: true
        });

        adapter.update(car).catch((data) => {
            assert.equal(data.statusCode, 500);
            done();
        });
    });

    it('Should allow us to specify a urlRoot', (done) => {
        const car = new Car(2);
        const adapter = new RestAdapter({
            urlRoot: 'api/'
        });

        adapter.update(car).then((data) => {
            assert.equal(data.id, 2);
            done();
        });
    });

});
