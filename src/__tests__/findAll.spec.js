'use strict';

const assert = require('assert');
const proxyquire = require('proxyquire');
const Car = require('../__mocks__/car_model.mock');
const RestAdapter = proxyquire('../index', {
    'then-request': require('../__mocks__/findAll_request.mock')
});

describe('findAll()', () => {

    it('Should let us use our own url path', (done) => {
        const adapter = new RestAdapter({}, {
            Car: {
                findAll: 'foo/bar/baz'
            }
        });

        adapter.findAll(Car).then((data) => {
            assert.equal(data[0].id, 100);
            done();
        });
    });

    it('Should respond with an array of data', (done) => {
        const adapter = new RestAdapter();

        adapter.findAll(Car).then((data) => {
            assert.equal(data.length, 2);
            assert.equal(data[0].id, 1);
            done();
        });
    });

    it('Should allow us to pass in an envelope for nested data', (done) => {
        const adapter = new RestAdapter({
            arrayEnvelope: 'cars'
        });

        adapter.findAll(Car, {
            envelope: 'cars'
        }).then((data) => {
            assert.equal(data.length, 2);
            assert.equal(data[1].id, 2);
            done();
        });
    });

    it('Should catch errors', (done) => {
        const adapter = new RestAdapter();

        adapter.findAll(Car, {
            throwError: true
        }).catch((data) => {
            assert.equal(data.statusCode, 500);
            done();
        });
    });

    it('Should allow us to specify a urlRoot', (done) => {
        const adapter = new RestAdapter({
            urlRoot: 'api/v1/'
        });

        adapter.findAll(Car).then((data) => {
            assert.equal(data[0].make, 'Pontiac');
            done();
        });
    });

    it('Should pass headers included in the adapter config', (done) => {
        const adapter = new RestAdapter({
            headers: {
                everything: 'cool'
            }
        });

        adapter.formatFindAllResponse = (response) => {
            assert.equal(response.headers.everything, 'cool');
            done();
        };

        adapter.findAll(Car);
    });

    it('Should pass headers included in the request options', (done) => {
        const adapter = new RestAdapter();

        adapter.formatFindAllResponse = (response) => {
            assert.equal(response.headers.part, 'of a team');
            done();
        };

        adapter.findAll(Car, {
            headers: {
                part: 'of a team'
            }
        });
    });

    it('Should pass querystring params included in the request options', (done) => {
        const adapter = new RestAdapter();

        adapter.findAll(Car).then((data) => {
            done();
        });

        adapter.findAll(Car, {
            qs: {
                type: 'chevy'
            }
        });
    });

});
