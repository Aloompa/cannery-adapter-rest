'use strict';

const assert = require('assert');
const proxyquire = require('proxyquire');
const Car = require('../__mocks__/car_model.mock');
const RestAdapter = proxyquire('../index', {
    'then-request': require('../__mocks__/create_request.mock')
});

describe('create()', () => {

    it('Should respond with an object of data', (done) => {
        const car = new Car();
        const adapter = new RestAdapter();

        adapter.create(car).then((data) => {
            assert.equal(data.id, 1);
            done();
        });
    });

    it('Should allow us to pass in an envelope for our data', (done) => {
        const car = new Car();
        const adapter = new RestAdapter({
            envelope: 'car'
        });

        adapter.create(car).then((data) => {
            assert.equal(data.id, 2);
            done();
        });
    });

    it('Should catch errors', (done) => {
        const car = new Car();
        const adapter = new RestAdapter({
            throwError: true
        });

        adapter.create(car).catch((data) => {
            assert.equal(data.statusCode, 500);
            done();
        });
    });

    it('Should allow us to specify a urlRoot', (done) => {
        const car = new Car();
        const adapter = new RestAdapter({
            urlRoot: 'api/'
        });

        adapter.create(car).then((data) => {
            assert.equal(data.id, 3);
            done();
        });
    });

});
