'use strict';

const ajax = require('then-request');
const adapterOptions = Symbol();
const formatFetchResponse = Symbol();

class RestAdapter {

    constructor (options = {}) {
        this[adapterOptions] = options;
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

    destroy (model, options) {
        throw new Error('Implement this');
    }

    fetch (model, options) {
        const url = this.getFetchUrl(model.getName(), model.id);
        const requestOptions = this.createOptions(options);

        return ajax('GET', url, requestOptions)
            .then(this.formatFetchResponse.bind(this));
    }

    fetchWithin (Model, parent, options) {
        throw new Error('Implement this');
    }

    findAll (Model, options) {
        const url = this.getUrl(new Model().getName());
        const requestOptions = this.createOptions(options);

        return ajax('GET', url, requestOptions)
            .then(this.formatFindAllResponse.bind(this));
    }

    findAllWithin (Model, parent, options) {
        const requestOptions = this.createOptions(options);

        let child = new Model();
        let url = new Model().getName();

        while (child.getParent()) {
            child = child.getParent();
            url = `${child.getName()}/${child.id}/${url}`;
        }

        return ajax('GET', this.getUrl(url), requestOptions)
            .then(this.formatFindAllResponse.bind(this));
    }

    formatFetchResponse (response) {
        const body = JSON.parse(response.getBody());
        const envelope = this.getOptions().envelope;

        return (envelope) ? body[envelope] : body;
    }

    formatFindAllResponse (response) {
        const body = JSON.parse(response.getBody());
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

    update (model, options) {
        throw new Error('Implement this');
    }

}

module.exports = RestAdapter;
