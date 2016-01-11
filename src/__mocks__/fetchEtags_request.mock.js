'use strict';

const responses = {
    GET: {
        'cars/1': {
            body: {
                id: 1,
                make: 'Ford',
                model: 'Tauras'
            }
        }
    }
};

let statusCode = 200;

module.exports = (method, url, options) => {
    return new Promise((resolve, reject) => {
        return resolve({
            statusCode: statusCode,
            headers: {
                etag: '686897696a7c876b7e'
            },
            getBody: () => {
                statusCode = 304;
                return JSON.stringify(responses[method][url].body);
            }
        });
    });
};
