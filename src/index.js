'use strict';

const ajax = require('then-request');
const adapterOptions = Symbol();

let endpointState = {};
let endpointResolver = {};
let storage = global.localStorage || {};

class RestAdapter {

    constructor (options = {}, routes = {}) {
        this.routes = routes;
        this[adapterOptions] = options;
    }

    getRoutePath (model) {
        let routeArray = [model.constructor.name];
        let child = model;

        while (child.getParent()) {
            routeArray.push(child.getParent().constructor.name);
            child = child.getParent();
        }

        return routeArray.reverse().join('/');
    }

    parseOverrideRoute (uri, model) {
        let parents = [];
        let child = model;

        while (child.getParent()) {
            parents.push(child.getParent().id);
            child = child.getParent();
        }

        uri = uri.replace(/{id}/g, model.id);

        for (let i = 0; i < parents.length; i++) {
            uri = uri.replace(`{parents[${i}]}`, parents[i]);
        }

        return uri;
    }

    getOverrideRoute (requestType, model) {
        const path = this.getRoutePath(model);

        if (this.routes[path] && this.routes[path][requestType]) {
            return this.parseOverrideRoute(this.routes[path][requestType], model);
        }
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
        const url = this.getCreateRoute(model);
        const requestOptions = this.createOptions(options);
        requestOptions.body = this.getBody(model);

        return ajax('POST', url, requestOptions)
            .then(this.formatFetchResponse.bind(this));
    }

    createOptions (model, options = {}) {
        options.headers = Object.assign({}, this[adapterOptions].headers, options.headers);

        return Object.assign({}, this[adapterOptions], options);
    }

    createOptionsWithEtags (model, url, options) {
        let requestOptions = this.createOptions(model, options);
        let key = `${url}-${JSON.stringify(requestOptions.body)}`;

        requestOptions.headers['If-None-Match'] = storage[`e-${key}`];

        return requestOptions;
    }

    destroy (model, options) {
        const url = this.getDestroyRoute(model);
        const requestOptions = this.createOptions(model, options);
        requestOptions.body = model.toJSON();

        return ajax('DELETE', url, requestOptions)
            .then(this.parseResponse.bind(this));
    }

    fetch (model, options = {}) {
        const url = this.getFetchRoute(model);
        const requestOptions = this.createOptionsWithEtags(model, url, options);

        if (endpointState[url] === 'fetching' || endpointState[url] === 'fetched') {
            return endpointResolver[url];
        }

        endpointState[url] = 'fetching';

        endpointResolver[url] = ajax('GET', url, requestOptions)
            .then(this.formatFetchResponse.bind(this))
            .then((response) => {
                endpointState[url] = 'fetched';
                return response;
            });

        return endpointResolver[url];
    }

    fetchWithin (model, parent, options = {}) {
        const url = this.getFetchWithinRoute(model, parent);
        const requestOptions = this.createOptionsWithEtags(model, url, options);

        if (endpointState[url] === 'fetching' || endpointState[url] === 'fetched') {
            return endpointResolver[url];
        }

        endpointState[url] = 'fetching';

        endpointResolver[url] = ajax('GET', this.getUrl(url), requestOptions)
            .then(this.formatFetchResponse.bind(this))
            .then((response) => {
                endpointState[url] = 'fetched';
                return response;
            });

        return endpointResolver[url];
    }

    findAll (Model, options = {}) {
        const url = this.getFindAllRoute(Model);
        const requestOptions = this.createOptionsWithEtags(null, url, options);

        return ajax('GET', url, requestOptions)
            .then(this.formatFindAllResponse.bind(this));
    }

    findAllWithin (Model, parent, options = {}) {
        const url = this.getFindAllWithinRoute(Model, parent);
        const requestOptions = this.createOptionsWithEtags(parent, url, options);

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

    getBody (model) {
        return JSON.stringify(model.toJSON());
    }

    getCreateRoute (model) {
        return this.getOverrideRoute('create', model) || this.getSingleFetchUrl(model);
    }

    getDestroyRoute (model) {
        return this.getOverrideRoute('destroy', model) || this.getSingleFetchUrl(model);
    }

    getFetchRoute (model) {
        return this.getOverrideRoute('fetch', model) || this.getFetchUrl(model.getName(), model.id);
    }

    getFetchWithinRoute (model, parent) {
        return this.getOverrideRoute('fetch', model) || this.buildNestedUrl(model.getName(), parent);
    }

    getFindAllRoute (Model) {
        return this.getOverrideRoute('findAll', new Model()) || this.getUrl(new Model().getName());
    }

    getFindAllWithinRoute (Model, parent) {
        const overrideModel = new Model();
        overrideModel.getParent = () => {
            return parent;
        };

        return this.getOverrideRoute('findAll', overrideModel) || this.buildNestedUrl(new Model().getName(), parent);
    }

    getUpdateRoute (model) {
        return this.getOverrideRoute('update', model) || this.getSingleFetchUrl(model);
    }

    getUrl (url) {
        const { urlRoot } = this.getOptions();

        return `${urlRoot || ''}${url}`;
    }

    getFetchUrl (url, id) {
        if (id) {
            return `${this.getUrl(url)}/${id}`;
        }

        return this.getUrl(url);
    }

    getSingleFetchUrl (model) {
        const parent = model.getParent();
        const parentUrl = (parent) ? `${parent.getName()}/${parent.id}/` : '';
        return this.getFetchUrl(parentUrl + model.getName(), model.id);
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

    update (model, options = {}) {
        const url = this.getUpdateRoute(model);
        const requestOptions = this.createOptions(model, options);
        requestOptions.body = this.getBody(model);

        return ajax('PUT', url, requestOptions)
            .then(this.formatFetchResponse.bind(this));
    }

}

module.exports = RestAdapter;
