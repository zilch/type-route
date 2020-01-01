# cacheable-lookup

> A cacheable [`dns.lookup(…)`](https://nodejs.org/api/dns.html#dns_dns_lookup_hostname_options_callback) that respects the TTL :tada:

[![Build Status](https://travis-ci.org/szmarczak/cacheable-lookup.svg?branch=master)](https://travis-ci.org/szmarczak/cacheable-lookup)
[![Coverage Status](https://coveralls.io/repos/github/szmarczak/cacheable-lookup/badge.svg?branch=master)](https://coveralls.io/github/szmarczak/cacheable-lookup?branch=master)
[![npm](https://img.shields.io/npm/dm/cacheable-lookup.svg)](https://www.npmjs.com/package/cacheable-lookup)
[![install size](https://packagephobia.now.sh/badge?p=cacheable-lookup)](https://packagephobia.now.sh/result?p=cacheable-lookup)

Making lots of HTTP requests? You can save some time by caching DNS lookups.<br>
Don't worry, this package respects the TTL :smiley:

## Usage

```js
const CacheableLookup = require('cacheable-lookup');
const cacheable = new CacheableLookup();

http.get('https://example.com', {lookup: cacheable.lookup}, response => {
	// Handle the response here
});
```

## API

### new CacheableLookup(options)

Returns a new instance of `CacheableLookup`.

#### options

Type: `Object`<br>
Default: `{}`

Options used to cache the DNS lookups.

##### options.cacheAdapter

Type: [Keyv adapter instance](https://github.com/lukechilds/keyv)<br>
Default: `new Map()`

A Keyv adapter which stores the cache.

##### options.maxTtl

Type: `number`<br>
Default: `Infinity`

Limits the cache time (TTL).

If set to `0`, it will make a new DNS query each time.

##### options.resolver

Type: `Function`<br>
Default: [`new dns.Resolver()`](https://nodejs.org/api/dns.html#dns_class_dns_resolver)

An instance of [DNS Resolver](https://nodejs.org/api/dns.html#dns_class_dns_resolver) used to make DNS queries.

### Entry object

Type: `Object`

#### address

Type: `string`

The IP address (can be an IPv4 or IPv6 address).

#### family

Type: `number`

The IP family (`4` or `6`).

### CacheableLookup instance

#### servers

Type: `Array`

DNS servers used to make the query. Can be overridden - then the new servers will be used.

#### [lookup(hostname, options, callback)](https://nodejs.org/api/dns.html#dns_dns_lookup_hostname_options_callback)

#### lookupAsync(hostname, options)

The asynchronous version of `dns.lookup(…)`.

Returns an [entry object](#entry-object).<br>
If `options.all` is true, returns an array of entry objects.

**Note**: If entry(ies) were not found, it will return `undefined`.

##### hostname

Type: `string`

##### options

Type: `Object`

The same as the [`dns.lookup(…)`](https://nodejs.org/api/dns.html#dns_dns_lookup_hostname_options_callback) options.

##### options.throwNotFound

Type: `boolean`<br>
Default: `false`

Throw when there's no match.

If set to `false` and it gets no match, it will return `undefined`.

**Note**: This option is meant **only** for the asynchronous implementation! The synchronous version will always throw an error if no match found.

##### options.details

Type: `boolean`<br>
Default: `false`

If `true` the entries returned by `lookup(…)` and `lookupAsync(…)` will have additional `expires` and `ttl` properties representing the expiration timestamp and the original TTL.

#### query(hostname, family)

An asynchronous function which returns cached DNS lookup entries. This is the base for `lookupAsync(hostname, options)` and `lookup(hostname, options, callback)`.

**Note**: This function has no options.

Returns an array of objects with `address`, `family`, `ttl` and `expires` properties.

#### queryAndCache(hostname, family)

An asynchronous function which makes a new DNS lookup query and updates the database. This is used by `query(hostname, family)` if no entry in the database is present.

Returns an array of objects with `address`, `family`, `ttl` and `expires` properties.

## High performance

See the benchmarks (queries `localhost`, performed on i7-7700k):

```
CacheableLookup#lookupAsync            x 219,396 ops/sec ±0.69%  (285 runs sampled)
CacheableLookup#lookup                 x 219,296 ops/sec ±0.20%  (284 runs sampled)
CacheableLookup#lookupAsync - zero TTL x 27.67   ops/sec ±51.06% (246 runs sampled)
CacheableLookup#lookup      - zero TTL x 29.64   ops/sec ±49.60% (204 runs sampled)
dns#resolve4                           x 27.03   ops/sec ±41.64% (246 runs sampled)
dns#lookup                             x 5,994   ops/sec ±0.26%  (285 runs sampled)
Fastest is CacheableLookup#lookup
```

The package is based on [`dns.resolve4(…)`](https://nodejs.org/api/dns.html#dns_dns_resolve4_hostname_options_callback) and [`dns.resolve6(…)`](https://nodejs.org/api/dns.html#dns_dns_resolve6_hostname_options_callback).

[Why not `dns.lookup(…)`?](https://github.com/nodejs/node/issues/25560#issuecomment-455596215)

> It is not possible to use `dns.lookup(…)` because underlying calls like [getaddrinfo](http://man7.org/linux/man-pages/man3/getaddrinfo.3.html) have no concept of servers or TTL (caching is done on OS level instead).

## Related

 - [cacheable-request](https://github.com/lukechilds/cacheable-request) - Wrap native HTTP requests with RFC compliant cache support

## License

MIT
