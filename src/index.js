'use strict';

const ajax = require('then-request');
const debug = require('debug')('cannery-adapter-rest');
const adapterOptions = Symbol();

let endpointState = {};
let endpointResolver = {};
let storage = global.sessionStorage || {};

class RestAdapter {

    constructor (options = {}, routes = {}) {
        this.routes = routes;
        this[adapterOptions] = options;
    }

    buildCacheKey (url, options = {}) {
        let key = this.getUrl(url);

        if (options.qs) {
            key += `-${JSON.stringify(options.qs)}`;
        }

        if (options.headers) {
            key += `-${JSON.stringify(options.headers)}`;
        }

        return key;
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

        debug('ROUTE', requestType, path);

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
        const requestOptions = this.createOptions(model, options);
        requestOptions.body = this.getBody(model);

        return ajax('POST', url, requestOptions)
            .then(this.formatFetchResponse.bind(this));
    }

    createOptions (model, options) {
        options = options || {};
        return Object.assign({}, {
            qs: options.qs,
            body: options.body,
            headers: Object.assign({}, this[adapterOptions].headers, options.headers)
        });
    }

    createOptionsWithEtags (model, options, cacheKey) {
        let requestOptions = this.createOptions(model, options);

        //requestOptions.headers['If-None-Match'] = storage[`cannery-e-${cacheKey}`];

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
        const cacheKey = this.buildCacheKey(url, options);
        const requestOptions = this.createOptionsWithEtags(model, options, cacheKey);

        if (endpointState[url] === 'fetching' || endpointState[url] === 'fetched') {
            return endpointResolver[url];
        }

        endpointState[url] = 'fetching';

        endpointResolver[url] = ajax('GET', url, requestOptions)
            .then((response) => {
                return this.formatFetchResponse(response, cacheKey);
            })
            .then((response) => {
                endpointState[url] = 'fetched';
                return response;
            });

        return endpointResolver[url];
    }

    fetchWithin (model, parent, options = {}) {
        const url = this.getFetchWithinRoute(model, parent);
        const cacheKey = this.buildCacheKey(url, options);
        const requestOptions = this.createOptionsWithEtags(model, options, cacheKey);

        if (endpointState[url] === 'fetching' || endpointState[url] === 'fetched') {
            return endpointResolver[url];
        }

        endpointState[url] = 'fetching';

        endpointResolver[url] = ajax('GET', this.getUrl(url), requestOptions)
            .then((response) => {
                return this.formatFetchResponse(response, cacheKey);
            })
            .then((response) => {
                endpointState[url] = 'fetched';
                return response;
            });

        return endpointResolver[url];
    }

    findAll (Model, options = {}) {
        const url = this.getFindAllRoute(Model);
        const cacheKey = this.buildCacheKey(url, options);
        const requestOptions = this.createOptionsWithEtags(null, options, cacheKey);

        return ajax('GET', url, requestOptions)
            .then((response) => {
                return this.formatFindAllResponse(response, cacheKey);
            });
    }

    findAllWithin (Model, parent, options = {}) {
        const url = this.getFindAllWithinRoute(Model, parent);
        const cacheKey = this.buildCacheKey(url, options);
        const requestOptions = this.createOptionsWithEtags(parent, options, cacheKey);

        return ajax('GET', this.getUrl(url), requestOptions)
            .then((response) => {
                return this.formatFindAllResponse(response, cacheKey);
            });
    }

    formatFetchResponse (response, cacheKey) {
        const body = this.parseResponse(response, cacheKey);
        const envelope = this.getOptions().envelope;

        return (envelope) ? body[envelope] : body;
    }

    formatFindAllResponse (response, cacheKey) {
        const body = this.parseResponse(response, cacheKey);
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

    getResponseBody (response, cacheKey) {
        const cachedData = storage[`cannery-d-${cacheKey}`];

        if (response.statusCode === 304 && cachedData) {
            return cachedData;
        }

        if (response.headers.etag) {
            storage[`cannery-e-${cacheKey}`] = response.headers.etag;
            storage[`cannery-d-${cacheKey}`] = response.getBody();
        }

        return response.getBody();
    }

    parseResponse (response, cacheKey) {
        const body = this.getResponseBody(response, cacheKey);

        try {
            return JSON.parse(body);
        } catch (e) {
            return {};
        }

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
