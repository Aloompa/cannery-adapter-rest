const requests = {
    PUT: {
        'cars/1': (options) => {
            if (options.envelope) {
                return {
                    [ options.envelope ]: JSON.parse(options.body)
                };
            }

            return JSON.parse(options.body);
        },

        'api/cars/2': (options) => {
            return JSON.parse(options.body);
        }
    }
};

module.exports = (method, url, options) => {
    return new Promise((resolve, reject) => {
        if (!options.throwError) {
            return resolve({
                statusCode: 200,
                headers: options.headers,
                getBody: () => {
                    const body = requests[method][url](options);
                    return JSON.stringify(body);
                }
            });
        }

        return reject({
            statusCode: 500,
            headers: options.headers,
            getBody: () => {
                return `Server Error`;
            }
        });

    });
};
