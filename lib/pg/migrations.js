var knex = require('./index.js');

module.exports = knex.schema

.createTableIfNotExists('sensor_data', function(table) {
    table.increments('id');
    table.dateTime('created_at');
    table.string('device_id');
    table.string('location');
    table.jsonb('data');
})
.then(function() {
    process.exit();
})
.catch(function(e) {
    console.error(e);
    process.exit(1);
});
