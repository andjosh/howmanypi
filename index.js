const Koa     = require('koa');
const koaBody = require('koa-body');
const koaCORS = require('koa-cors');
const pkg     = require('./package.json');
const app     = module.exports = new Koa();
let data      = [];

app.use(koaBody({
    jsonLimit: '1mb'
}));
app.use(koaCORS());

app.use(async (ctx, next) => {
    if (ctx.method !== 'POST')
        return await next();
    const body = ctx.request.body;
    if (!(body instanceof Array || body instanceof Object))
        ctx.throw(400, 'body must be an Array or Object of data');
    data.push({
        created_at: new Date(),
        devices:    body.cellphones || body
    });
    ctx.status = 201;
});
// response
app.use(async (ctx, next) => {
    if (ctx.method !== 'GET')
        return await next();
    ctx.body = data;
});

if (!module.parent) {
    console.log('%s listening on %s in %s mode',
        pkg.name, process.env.PORT || 3000, process.env.NODE_ENV);
    app.listen(process.env.PORT || 3000);
}
