const Koa     = require('koa');
const koaBody = require('koa-body');
const koaCORS = require('koa-cors');
const pg      = require('./lib/pg');
const meta    = require('./lib/meta');
const pkg     = require('./package.json');
const app     = module.exports = new Koa();
const DAY_MS  = 1000 * 60 * 60 * 24;
const MAX_PER_PAGE     = 100000;
const DEFAULT_PER_PAGE = 200;
let data      = [];

app.use(koaBody({
    jsonLimit: '1mb'
}));
app.use(koaCORS());

app.use(async (ctx, next) => {
    const limit  = ctx.query.limit;
    const offset = ctx.query.offset;

    ctx.state.limit = Math.max(0, Math.min(
        parseInt(limit || 0, 10) || DEFAULT_PER_PAGE, MAX_PER_PAGE
    ));
    ctx.state.offset = Math.max(parseInt(offset || 0, 10) || 0, 0);
    await next();
});

app.use(async (ctx, next) => {
    if (ctx.method !== 'POST')
        return await next();

    const body = ctx.request.body;
    if (!(body instanceof Array || body instanceof Object))
        ctx.throw(400, 'body must be an Array or Object of data');
    await pg('sensor_data').insert({
        created_at:   pg.fn.now(),
        device_id:    body.device_id || 'default',
        location:     body.location || 'default',
        devices:      JSON.stringify(body.cellphones || body)
    });
    await pg('sensor_data')
        .where('created_at', '<',
            new Date((new Date()).getTime() - (DAY_MS * 30)))
        .del();
    ctx.status = 201;
});
// response
app.use(async (ctx, next) => {
    if (ctx.method !== 'GET')
        return await next();

    const now   = new Date();
    const start = new Date(ctx.query.start || (now.getTime() - DAY_MS));
    const end   = new Date(ctx.query.end || now);
    const results = pg.select().from('sensor_data')
        .where('created_at', '<', end)
        .where('created_at', '>', start)
        .paginate(ctx.state.limit, ctx.state.offset);
    ctx.body = {
        meta: meta(ctx, results),
        data: results.data
    };
});

if (!module.parent) {
    console.log('%s listening on %s in %s mode',
        pkg.name, process.env.PORT || 3000, process.env.NODE_ENV);
    app.listen(process.env.PORT || 3000);
}
