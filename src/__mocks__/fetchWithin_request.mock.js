'use strict';

const responses = {
    GET: {
        'foo/bar/baz': {
            body: {
                id: 1,
                name: 'Foo'
            }
        },
        'api/cars/3/part': {
            body: {
                id: 3,
                name: 'Engine'
            }
        },
        'cars/1/part': {
            body: {
                id: 1,
                name: 'Steering Wheel'
            }
        },
        'cars/2/part': {
            body: {
                part: {
                    id: 2,
                    name: 'Engine'
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
