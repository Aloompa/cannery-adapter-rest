'use strict';

const assert = require('assert');
const proxyquire = require('proxyquire');
const Car = require('../__mocks__/car_model.mock');
const RestAdapter = proxyquire('../index', {
    'then-request': require('../__mocks__/fetch_request.mock')
});

describe('fetch()', () => {

    it('Should allow us to define a custom url path', (done) => {
        const car = new Car(1);
        const adapter = new RestAdapter(car, {
            Car: {
                fetch: 'foo/bar/baz'
            }
        });

        adapter.fetch(car).then((data) => {
            assert.equal(data.make, 'Foo');
            done();
        });
    });

    it('Should respond with an object of data', (done) => {
        const car = new Car(1);
        const adapter = new RestAdapter();

        adapter.fetch(car, {}).then((data) => {
            assert.equal(data.make, 'Ford');
            done();
        });
    });

    it('Should allow us to pass in an envelope for our data', (done) => {
        const car = new Car(2);
        const adapter = new RestAdapter({
            envelope: 'car'
        });

        adapter.fetch(car).then((data) => {
            assert.equal(data.make, 'Honda');
            done();
        });
    });

    it('Should catch errors', (done) => {
        const car = new Car(2000);
        const adapter = new RestAdapter();

        adapter.fetch(car).catch((data) => {
            assert.equal(data.statusCode, 404);
            done();
        });
    });

    it('Should allow us to specify a urlRoot', (done) => {
        const car = new Car(1);
        const adapter = new RestAdapter({
            urlRoot: 'api/'
        });

        adapter.fetch(car).then((data) => {
            assert.equal(data.make, 'Jeep');
            done();
        });
    });

});
