'use strict';

var parse = require('co-body'),
    route = require('koa-route'),
    pg    = require('./lib/pg'),
    meta  = require('./lib/meta'),
    latest_data = {};

const DAY_MS = 1000 * 60 * 60 * 24;
const MAX_PER_PAGE = 100000;
const DEFAULT_PER_PAGE = 200;

module.exports = {
    webhook:               webhook,
    latest:                latest,
    date_range:            date_range,
    parse_pagination_qs:   parse_pagination_qs
};

function webhook(app) {
    return route.post('/input/webhook', function* rouote_webhook() {
        var body = yield parse(this);
        console.log('raw body: %j', body);
        
        latest_data = {
            created_at: body.published_at,
            device_id: body.guid,
            location: body.LOCN,
            data: [
                { unit: 'kPa', value: (parseFloat(body.KPA)/1000), source: 'BARORESISTOR' },
                { unit: 'C', value: parseFloat(body.C), source: 'THERMORESISTOR' },
                { unit: 'F', value: ((parseFloat(body.C) * 1.8) + 32), source: 'THERMORESISTOR' },
                { unit: 'RL', value: parseFloat(body.RL), source: 'PHOTORESISTOR' },
                { unit: 'RH', value: parseFloat(body.RH), source: 'HUMISTOR' }
            ]
        };
        // app.io.emit('SKYFALL', latest_data);
        this.body = {};
        yield pg('sensor_data').insert({
            created_at:   latest_data.created_at,
            device_id:    latest_data.device_id,
            location:     latest_data.location,
            data:         JSON.stringify(latest_data.data)
        });
        yield pg('sensor_data')
            .where('created_at', '<', new Date((new Date()).getTime() - (DAY_MS * 7)))
            .del();
    });
}

function latest(app) {
    return route.get('/output/latest', function* rouote_latest() {
        this.body = latest_data;
    });
}

function date_range(app) {
    return route.get('/output/date-range', function* route_date_range() {
        var query   = {},
            now     = new Date(),
            start   = new Date(this.query.start || now),
            end     = new Date(this.query.end || now),
            results = [];
        
        query = pg.select().from('sensor_data')
            .where('created_at', '<', end)
            .where('created_at', '>', start);
        query = query.paginate(this.state.limit, this.state.offset);
        results = yield query;
        this.body = {
            meta: meta.call(this, results),
            data: results.data
        };
    });
}

function parse_pagination_qs() {
    return function* parse_pagination_qs(next) {
        var limit = this.query.limit,
            offset = this.query.offset;

        this.state.limit = Math.max(0, Math.min(
            parseInt(limit || 0, 10) || DEFAULT_PER_PAGE, MAX_PER_PAGE
        ));
        this.state.offset = Math.max(parseInt(offset || 0, 10) || 0, 0);
        yield next;
    };
}
