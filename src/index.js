'use strict';

const ajax = require('then-request');
const adapterOptions = Symbol();

let storage = global.localStorage || {};

class RestAdapter {

    constructor (options = {}) {
        this[adapterOptions] = options;
    }

    buildNestedUrl (url, child) {
        const parent = child.getParent();

        url = `${child.getName()}/${child.id}/${url}`;

        if (parent) {
            return this.buildNestedUrl(url, parent);

        } else {
            return url;
        }
    }

    create (model, options) {
        const url = this.getUrl(model.getName());
        const requestOptions = this.createOptions(options);
        requestOptions.body = model.toJSON();

        return ajax('POST', url, requestOptions)
            .then(this.formatFetchResponse.bind(this));
    }

    createOptions (options = {}) {
        options.headers = Object.assign({}, this.getOptions().headers, options.headers);

        return Object.assign({}, this[adapterOptions], options);
    }

    createOptionsWithEtags (url, options) {
        let requestOptions = this.createOptions(options);
        let key = `${url}-${JSON.stringify(requestOptions.body)}`;

        requestOptions.headers['If-None-Match'] = storage[`e-${key}`];

        return requestOptions;
    }

    destroy (model, options) {
        const url = this.getFetchUrl(model.getName(), model.id);
        const requestOptions = this.createOptions(options);
        requestOptions.body = model.toJSON();

        return ajax('DELETE', url, requestOptions)
            .then(this.parseResponse.bind(this));
    }

    fetch (model, options) {
        const url = this.getFetchUrl(model.getName(), model.id);
        const requestOptions = this.createOptionsWithEtags(url, options);

        return ajax('GET', url, requestOptions)
            .then(this.formatFetchResponse.bind(this));
    }

    fetchWithin (Model, parent, options) {
        const url = this.buildNestedUrl(new Model().getNameSingular(), parent);
        const requestOptions = this.createOptionsWithEtags(url, options);

        return ajax('GET', url, requestOptions)
            .then(this.formatFetchResponse.bind(this));
    }

    findAll (Model, options) {
        const url = this.getUrl(new Model().getName());
        const requestOptions = this.createOptionsWithEtags(url, options);

        return ajax('GET', url, requestOptions)
            .then(this.formatFindAllResponse.bind(this));
    }

    findAllWithin (Model, parent, options) {
        const url = this.buildNestedUrl(new Model().getName(), parent);
        const requestOptions = this.createOptionsWithEtags(url, options);

        return ajax('GET', this.getUrl(url), requestOptions)
            .then(this.formatFindAllResponse.bind(this));
    }

    formatFetchResponse (response) {
        const body = this.parseResponse(response);
        const envelope = this.getOptions().envelope;

        return (envelope) ? body[envelope] : body;
    }

    formatFindAllResponse (response) {
        const body = this.parseResponse(response);
        const envelope = this.getOptions().arrayEnvelope;

        return (envelope) ? body[envelope] : body;
    }

    getUrl (url) {
        const { urlRoot } = this.getOptions();

        return `${urlRoot || ''}${url}`;
    }

    getFetchUrl (url, id) {
        return `${this.getUrl(url)}/${id}`;
    }

    getOptions () {
        return this[adapterOptions];
    }

    getResponseBody (response) {
        const key = response.url;
        const cachedDate = storage[`cannery-d-${key}`];

        if (response.statusCode === 304 && cachedDate) {
            return cachedDate;
        }

        if (response.headers.etag) {
            storage[`cannery-e-${key}`] = response.headers.etag;
            storage[`cannery-d-${key}`] = response.getBody();
        }

        return response.getBody();
    }

    parseResponse (response) {
        const body = this.getResponseBody(response);

        try {
            return JSON.parse(body);
        } catch (e) {}

    }

    update (model, options) {
        const url = this.getFetchUrl(model.getName(), model.id);
        const requestOptions = this.createOptions(options);
        requestOptions.body = model.toJSON();

        return ajax('PUT', url, requestOptions)
            .then(this.formatFetchResponse.bind(this));
    }

}

module.exports = RestAdapter;
