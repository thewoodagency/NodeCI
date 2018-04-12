/**
 * Created by jay on 4/2/18
 */
const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

//const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget); //return a promise
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    console.log('key', this.hashKey);
    return this;
}

mongoose.Query.prototype.exec = async function() {
    //console.log('=====> about run query');
    //console.log(this.getQuery());
    //console.log(this.mongooseCollection.name);
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    //console.log('===> key', key);

    //See if we have a value for 'key' in redis
    //key needs to be a string
    const cacheValue = await client.hget(this.hashKey, key);

    //If we do, return that
    if (cacheValue) {
        console.log('===>read from cache');
        const doc = JSON.parse(cacheValue);
        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc);
    }

    //Otherwise, issue the query and store the result in redis

    const result = await exec.apply(this, arguments);
    //console.log('db', result.validate);
    console.log('===>read from db');
    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
    return result;
}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
};


