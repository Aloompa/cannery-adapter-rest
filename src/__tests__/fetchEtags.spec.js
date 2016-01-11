'use strict';

const assert = require('assert');
const proxyquire = require('proxyquire');
const Car = require('../__mocks__/car_model.mock');
const RestAdapter = proxyquire('../index', {
    'then-request': require('../__mocks__/fetchEtags_request.mock')
});

describe('fetch() etags', () => {

    it('Should support e-tags', (done) => {

        const car = new Car(1);
        const adapter = new RestAdapter();

        adapter.fetch(car).then(() => {
            return adapter.fetch(car);
        }).then((data) => {
            assert.equal(data.id, 1);
            done();
        });
    });

});
