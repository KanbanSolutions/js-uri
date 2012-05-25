/*jslint white: false, plusplus: false */
/*global window: true, navigator: false, document: true, importScripts: false,
 jQuery: false, kanban: true, JSON: true, Base64: true */

/*
 Utility for working with URIs and extracting parts of it
 */
//requires ['kanban/base']
(function() {
    "use strict";

    var URI = function() {
        var _private = {};
        var _public = {};

        _private.url_regex = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;


        _public.parse = function(uri) {
            return new _private.URIParser(uri);
        };

        _public.builder = function() {
            return new _private.URIParser();
        };

        _private.URIParser = function(uri) {
            var _p_private = {};
            var _p_public = {};

            _p_private.raw = uri || '';
            if(!/^(([^:/?#]+):)|^\/\//.test(_p_private.raw)) {
                _p_private.raw = '//' + _p_private.raw;
            }
            _p_public.raw = function(uri) {
                if(uri) {
                    _p_private.raw = String(uri);
                    _p_private.parse();
                    return;
                }

                return String(_p_private.raw);
            };
            _p_public.full = function() {
                var uri = [];
                if(_p_private.protocol) {
                    uri.push(_p_private.protocol);
                }
                if(_p_private.subdomains.length) {
                    uri.push(_p_private.subdomains.join('.'));
                    uri.push('.');
                }
                uri.push(_p_private.domain_name);
                uri.push('.');
                uri.push(_p_private.tld);
                if(_p_private.path) {
                    uri.push(_p_private.path);
                }
                if(!kanban.isEmptyObject(_p_private.query)) {
                    uri.push('?');
                    var params = [];
                    for(var param in _p_private.query) {
                        params.push(param + '=' + _p_private.query[param]);
                    }
                    uri.push(params.join('&'));
                }
                if(_p_private.hash) {
                    uri.push('#');
                    uri.push(_p_private.hash);
                }

                return uri.join('');
            };

            _p_private.protocol = '';
            _p_public.protocol = function(protocol) {
                if(protocol) {
                    _p_private.protocol = String(protocol);
                }

                return _p_private.protocol;
            };

            _p_private.scheme = '';
            _p_public.scheme = function(scheme) {
                if(scheme) {
                    _p_private.scheme = String(scheme);
                }

                return _p_private.scheme;
            };

            _p_private.hash = '';
            _p_public.hash = function(hash) {
                if(hash) {
                    _p_private.hash = String(hash).replace('#','');
                    return;
                }

                return String(_p_private.hash);
            };

            _p_public.get_hash_object = function(hash_data) {
                hash_data = hash_data || {};
                var hash = _p_public.hash(hash_data.hash);
                var obj_separator = hash_data.obj_separator || '&';
                var val_separator = hash_data.val_separator || '=';

                var hash_items = hash.split(obj_separator);
                var hash_obj = {};

                for(var i = 0; i < hash_items.length; i++) {
                    var pair = hash_items[i].split(val_separator);
                    if(!hash_obj[pair[0]]) {
                        hash_obj[pair[0]] = [];
                    }
                    hash_obj[pair[0]].push(pair[1]);
                }

                return hash_obj;
            };

            _p_private.query = {};
            _p_public.query = function(params, append) {
                if(params) {
                    if(!append) {
                        _p_private.query = kanban.utils.clone(params);
                        return;
                    } else {
                        _p_private.query = kanban.extend(_p_private.query, params);
                        return;
                    }
                }

                return _p_private.query;
            };

            _p_private.path = '';
            _p_public.path = function(path) {
                if(path) {
                    if(typeof path === 'string') {
                        if (path.charAt(0) !== '/') {
                            path = '/' + path;
                        }
                        _p_private.path = path;
                    } else if(kanban.isArray(path)) {
                        _p_private.path = path.join('/');
                    }
                    return;
                }

                return String(_p_private.path);
            };

            _p_private.tld = '';
            _p_public.tld = function(tld) {
                if(tld) {
                    if(typeof tld === 'string') {
                        _p_private.tld = String(tld);
                    } else if(kanban.isArray(tld)) {
                        _p_private.tld = tld.join('.');
                    }
                }

                return String(_p_private.tld);
            };

            _p_private.domain_name = '';
            _p_public.domain_name = function(domain_name) {
                if(domain_name) {
                    if(typeof domain_name === 'string') {
                        _p_private.domain_name = domain_name;
                    }
                    _p_private.domain_name = String(domain_name);
                }

                return String(_p_private.domain_name);
            };
            _p_public.domain = function(domain) {
                if(domain) {
                    if(typeof domain === 'string') {
                        domain = domain.split('.');
                    }

                    if(kanban.isArray(domain)) {
                        _p_private.domain_name = domain[0];
                        domain.splice(0, 1);
                        _p_private.tld = domain.join('.');
                    }

                    return;
                }

                return String(_p_private.domain_name + '.' + _p_private.tld);
            };

            _p_private.subdomains = [];
            _p_public.subdomains = function(subdomains) {
                if(subdomains) {
                    if(kanban.isArray(subdomains)) {
                        _p_private.subdomains = kanban.utils.clone(subdomains);
                    } else {
                        _p_private.subdomains = subdomains.split('.');
                    }

                    return;
                }

                return kanban.extend([], _p_private.subdomains);
            };

            _p_public.update = function update(uri) {
                if (!uri) {
                    return;
                } else if (/^#/.test(uri)) {
                    _p_public.hash(uri);
                    _p_private.raw = _p_public.full();
                } else if (/^\?/.test(uri)) {
                    var params = _p_private.get_query_params(uri);
                    _p_public.query(params);
                    _p_private.raw = _p_public.full();
                } else if (/^\/[^/?#]*/.test(uri)) {
                    _p_public.path(uri);
                    _p_private.raw = _p_public.full();
                } else if (/^\/\//.test(uri)) {
                    uri = uri.replace('//','');
                    _p_public.raw(_p_private.protocol + uri);
                } else if (_private.url_regex.test(uri)) {
                    _p_public.raw(uri);
                } else {
                    console.warn('Unable to update uri: could not recognize input pattern');
                }
            };

            _p_private.get_query_params = function get_query_params(qstr) {
                if (/\?/.test(qstr)) {
                    qstr = qstr.split('?')[1];
                }
                var params = {};
                var qt = qstr.split('&');
                for (var i = 0, len = qt.length; i < len; i++) {
                    var q = qt[i].split('=');
                    if (!params[q[0]]) {
                        params[q[0]] = [];
                    }
                    params[q[0]].push(q[1]);
                }
                return params;
            };


            _p_private.parse = function() {
                if(_p_private.raw) {
                    var url_components = _p_private.raw.match(_private.url_regex);
                    /*
                        Component Parts
                        $0 = _p_private.raw
                        $1 = http(s):
                        $2 = http(s)
                        $3 = //www.ics.uci.edu
                        $4 = www.ics.uci.edu
                        $5 = /pub/ietf/uri/
                        $6 = ?pnbr=TEST-PG-CBN26-25452&gud=twe
                        $7 = pnbr=TEST-PG-CBN26-25452&gud=twe
                        $8 = #Related
                        $9 = Related
                     */
                    if(!url_components) {
                        throw("url parse error");
                    }
                    _p_private.hash = url_components[9] || '';

                    //Add query args
                    if(url_components[7]) {
                        _p_private.query = _p_private.get_query_params(url_components[7]);
                    }

                    //Get path
                    _p_private.path = url_components[5];

                    //Get protocol
                    _p_private.protocol = (url_components[1] && url_components[1] + '//') || '//';
                    _p_private.scheme = url_components[2] || '';

                    var domain_parts = url_components[4].split('.');
                    var part = domain_parts.pop();

                    var tld = [];
                    if(_private.country_tlds.contains(part) || _private.tlds.contains(part)) {
                        tld.push(part);
                        part = domain_parts.pop();
                    }

                    if(_private.tlds.contains(part)) {
                        tld.push(part);
                        part = domain_parts.pop();
                    }
                    tld.reverse();

                    _p_private.tld = tld.join('.');

                    _p_private.domain_name = String(part);

                    _p_public.subdomains(domain_parts);
                }
            };


            _p_private.parse();

            return _p_public;
        };

        //Should be a set but js does not have sets
        _private.tlds = ['aero', 'asia', 'biz', 'cat', 'co', 'com', 'coop', 'edu', 'gov', 'info', 'int', 'jobs', 'mil', 'mobi', 'museum',
                         'name', 'net', 'net', 'org', 'pro', 'tel', 'travel'];

        //Should be a set but js does not have sets
        _private.country_tlds = ['ac', 'ad', 'ae', 'af', 'ag', 'ai', 'al', 'am', 'an', 'ao', 'aq', 'ar',
                                 'as', 'at', 'au', 'aw', 'ax', 'az', 'ba', 'bb', 'bd', 'be', 'bf', 'bg',
                                 'bh', 'bi', 'bj', 'bm', 'bn', 'bo', 'br', 'bs', 'bt', 'bv', 'bw', 'by',
                                 'bz', 'ca', 'cc', 'cd', 'cf', 'cg', 'ch', 'ci', 'ck', 'cl', 'cm', 'cn',
                                 'co', 'cr', 'cu', 'cv', 'cx', 'cy', 'cz', 'de', 'dj', 'dk', 'dm', 'do',
                                 'dz', 'ec', 'ee', 'eg', 'eh', 'er', 'es', 'et', 'eu', 'fi', 'fj', 'fk',
                                 'fm', 'fo', 'fr', 'ga', 'gb', 'gd', 'ge', 'gf', 'gg', 'gh', 'gi', 'gl',
                                 'gm', 'gn', 'gp', 'gq', 'gr', 'gs', 'gt', 'gu', 'gw', 'gy', 'hk', 'hm',
                                 'hn', 'hr', 'ht', 'hu', 'id', 'ie', 'il', 'im', 'in', 'io', 'iq', 'ir',
                                 'is', 'it', 'je', 'jm', 'jo', 'jp', 'ke', 'kg', 'kh', 'ki', 'km', 'kn',
                                 'kp', 'kr', 'kw', 'ky', 'kz', 'la', 'lb', 'lc', 'li', 'lk', 'lr', 'ls',
                                 'lt', 'lu', 'lv', 'ly', 'ma', 'mc', 'md', 'me', 'mg', 'mh', 'mk', 'ml',
                                 'mm', 'mn', 'mo', 'mp', 'mq', 'mr', 'ms', 'mt', 'mu', 'mv', 'mw', 'mx',
                                 'my', 'mz', 'na', 'nc', 'ne', 'nf', 'ng', 'ni', 'nl', 'no', 'np', 'nr',
                                 'nu', 'nz', 'om', 'pa', 'pe', 'pf', 'pg', 'ph', 'pk', 'pl', 'pm', 'pn',
                                 'pr', 'ps', 'pt', 'pw', 'py', 'qa', 're', 'ro', 'rs', 'ru', 'rw', 'sa',
                                 'sb', 'sc', 'sd', 'se', 'sg', 'sh', 'si', 'sj', 'sk', 'sl', 'sm', 'sn',
                                 'so', 'sr', 'st', 'su', 'sv', 'sy', 'sz', 'tc', 'td', 'tf', 'tg', 'th',
                                 'tj', 'tk', 'tl', 'tm', 'tn', 'to', 'tp', 'tr', 'tt', 'tv', 'tw', 'tz',
                                 'ua', 'ug', 'uk', 'us', 'uy', 'uz', 'va', 'vc', 've', 'vg', 'vi', 'vn',
                                 'vu', 'wf', 'ws', 'ye', 'yt', 'za', 'zm', 'zw'];

        return _public;
    };


    if(!Array.indexOf) {
        Array.prototype.indexOf = function(obj) {
            for(var i = 0; i < this.length; i++) {
                if(this[i] == obj) {
                    return i;
                }
            }
            return -1;
        };
    }
    if(!Array.contains) {
        Array.prototype.contains = function(obj) {
            if(this.indexOf(obj) == -1) {
                return false;
            }

            return true;
        };
    }

    kanban.extend({uri: new URI()});
}(kanban));
