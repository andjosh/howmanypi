// Connect to the postgres database
var knex    = require('knex'),
    Promise = require('bluebird'),
    config  = {};

config = {
    development: {
        client: 'pg',
        // debug: true,
        connection: {
            host:       'postgres',
            user:       'postgres',
            database:   'skyfall_development',
            password:   'skyfall'
        }
    },
    test: {
        client: 'pg',
        // debug: true,
        connection: {
            host:       'postgres',
            user:       'postgres',
            database:   'skyfall_test',
            password:   'skyfall'
        }
    },
    staging: {
        client: 'pg',
        // debug: true,
        connection: process.env.DATABASE_URL
    },
    production: {
        client: 'pg',
        // debug: true,
        connection: process.env.DATABASE_URL
    }
};

Object.assign(knex.Client.prototype.QueryBuilder.prototype, {
    paginate(per_page, offset) {
        var pagination = {};
        per_page = +per_page || 8;
        offset   = +offset || 0;
        if ( offset < 1 ) offset = 0;
        return Promise.all([
            this.clone().count('* as count').first(),
            this.offset(offset).limit(per_page)
        ]).then(function(values) {
            var count = ~~values[0].count;
            var rows  = values[1];
            pagination.data   = rows;
            pagination.total  = count;
            pagination.limit  = per_page;
            pagination.offset = offset;
            //pagination.to = offset + rows.length;
            //pagination.from = offset;
            return pagination;
        });
    }
});

module.exports = knex(config[process.env.NODE_ENV || 'development']);
