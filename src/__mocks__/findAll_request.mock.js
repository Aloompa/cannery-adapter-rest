'use strict';

const responses = {
    GET: {
        cars: [{
            id: 1,
            make: 'Ford',
            model: 'Tauras'
        }, {
            id: 2,
            make: 'Honda',
            model: 'Accord'
        }],
        'api/v1/cars': [{
            id: 1,
            make: 'Pontiac',
            model: 'Grand Prix'
        }],
        'cars?type=chevy': [{
            make: 'Chevy'
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
                    response = responses[method]['cars?type=chevy'];
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
