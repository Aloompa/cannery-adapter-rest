const requests = {
    DELETE: {
        'cars/1': (options) => {
            return {
                messsage: 'Deleted Car'
            };
        },

        'api/cars/2': (options) => {
            return {
                messsage: 'We Deleted the Car'
            };
        }
    }
};

module.exports = (method, url, options) => {
    return new Promise((resolve, reject) => {
        if (url !== 'cars/404') {
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
            statusCode: 404,
            headers: options.headers,
            getBody: () => {
                return 'File not found';
            }
        });

    });
};
