'use strict';

const responses = {
    GET: {
        'cars/1/parts': [{
            id: 1,
            name: 'Engine'
        }, {
            id: 2,
            name: 'Steering Wheel'
        }],
        'api/v1/cars/1/parts': [{
            id: 1,
            name: 'Starter'
        }],
        'cars/1/parts?type=chevy': [{
            id: 3,
            name: 'Radio'
        }],
        'cars/1/parts/2/part_makers': [{
            id: 3,
            name: 'Big John'
        }]
    }
};

module.exports = (method, url, options) => {

    return new Promise((resolve, reject) => {
        if (options.throwError) {
            return reject({
                statusCode: 500
            });
        }

        return resolve({
            statusCode: 200,
            headers: options.headers,
            getBody: () => {

                let response = responses[method][url];

                if (options.qs) {
                    response = responses[method]['cars/1/parts?type=chevy'];
                }

                if (options.envelope) {
                    return JSON.stringify({
                        [ options.envelope ]: response
                    });
                }

                return JSON.stringify(response);
            }
        });
    });
};
