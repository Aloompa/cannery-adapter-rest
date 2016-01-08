'use strict';

const assert = require('assert');
const proxyquire = require('proxyquire');
const Car = require('../__mocks__/car_model.mock');
const RestAdapter = proxyquire('../index', {
    'then-request': require('../__mocks__/findAll_request.mock')
});

describe('fetchWithin()', () => {

    it('Should respond with an array of data');
    it('Should allow us to pass in an envelope for nested data');
    it('Should catch errors');
    it('Should allow us to specify a urlRoot');
    it('Should pass headers included in the adapter config');
    it('Should pass headers included in the request options');

});
