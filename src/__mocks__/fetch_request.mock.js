'use strict';

const responses = {
    GET: {
        'foo/bar/baz': {
            body: {
                id: 1,
                make: 'Foo'
            }
        },
        'api/cars/1': {
            body: {
                id: 1,
                make: 'Jeep',
                model: 'Grand Cherokee'
            }
        },
        'cars/1': {
            body: {
                id: 1,
                make: 'Ford',
                model: 'Tauras'
            }
        },
        'cars/2': {
            body: {
                car: {
                    id: 2,
                    make: 'Honda',
                    model: 'Accord'
                }
            }
        }
    }
};

module.exports = (method, url, options) => {
    return new Promise((resolve, reject) => {
        if (responses[method][url]) {
            return resolve({
                statusCode: 200,
                headers: options.headers,
                getBody: () => {
                    return JSON.stringify(responses[method][url].body);
                }
            });
        }

        return reject({
            statusCode: 404,
            headers: options.headers,
            getBody: () => {
                return `${url} not found`;
            }
        });

    });
};
