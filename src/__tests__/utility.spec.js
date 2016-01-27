'use strict';

const assert = require('assert');
const proxyquire = require('proxyquire');
const RestAdapter = proxyquire('../index', {});

class Jedi {

    constructor (id) {
        this.id = id;
    }

    getParent () {
        return null;
    }

}

const yoda = new Jedi(1);

class Lightsaber {

    constructor (id) {
        this.id = id;
    }

    getParent () {
        return yoda;
    }

}

const yodasLightsaber = new Lightsaber(2);

class Color {

    constructor (id) {
        this.id = id;
    }

    getParent () {
        return yodasLightsaber;
    }

}

describe('utility', () => {
    describe('getRoutePath()', () => {

        it('Should build a path from the parent nesting', () => {
            const adapter = new RestAdapter();
            const lightsaber = new Lightsaber();
            const path = adapter.getRoutePath(lightsaber);

            assert.equal(path, 'Jedi/Lightsaber');
        });

    });

    describe('getOverrideRoute()', () => {

        it('Should allow us to totally override a route', () => {
            const lightsaber = new Lightsaber();
            const adapter = new RestAdapter(lightsaber, {
                'Jedi/Lightsaber': {
                    fetch: 'jedilightsaberpath'
                }
            });
            const route = adapter.getOverrideRoute('fetch', lightsaber);

            assert.equal(route, 'jedilightsaberpath');
        });

        it('Should replace {id} with the current model id', () => {
            const lightsaber = new Lightsaber(2);
            const adapter = new RestAdapter(lightsaber, {
                'Jedi/Lightsaber': {
                    fetch: 'saber/{id}'
                }
            });
            const route = adapter.getOverrideRoute('fetch', lightsaber);

            assert.equal(route, 'saber/2');
        });

        it('Should replace {parents[0]} with model parent id', () => {
            const lightsaber = new Lightsaber(2);
            const adapter = new RestAdapter(lightsaber, {
                'Jedi/Lightsaber': {
                    fetch: 'jedi/{parents[0]}/saber'
                }
            });
            const route = adapter.getOverrideRoute('fetch', lightsaber);

            assert.equal(route, 'jedi/1/saber');
        });

        it('Should replace allow us to go as far up the parent tree as we like', () => {
            const color = new Color(3);
            const adapter = new RestAdapter(color, {
                'Jedi/Lightsaber/Color': {
                    fetch: 'jedi/{parents[1]}/saber/{parents[0]}/colors'
                }
            });
            const route = adapter.getOverrideRoute('fetch', color);

            assert.equal(route, 'jedi/1/saber/2/colors');
        });

    });
});
