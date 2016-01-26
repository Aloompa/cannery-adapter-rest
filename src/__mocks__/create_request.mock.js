const requests = {
    POST: {
        cars: (options) => {
            if (options.envelope) {
                return {
                    [ options.envelope ]: {
                        id: 2
                    }
                };
            }

            return {
                id: 1
            };
        },

        'api/cars': (options) => {
            return {
                id: 3
            };
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
