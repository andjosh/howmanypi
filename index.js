const Koa     = require('koa');
const koaBody = require('koa-body');
const koaCORS = require('koa-cors');
const pkg     = require('./package.json');
const app     = module.exports = new Koa();
let data      = [];

app.use(koaBody({
    jsonLimit: '1kb'
}));
app.use(koaCORS());

app.use(async (ctx, next) => {
    if (ctx.method !== 'POST')
        return await next();
    const body = ctx.request.body;
    if (!(body instanceof Array))
        ctx.throw(400, 'body must be an Array of data');
    data.push({
        created_at: new Date(),
        devices:    body
    });
    ctx.status = 201;
    console.log(new Date(), body);
});
// response
app.use(async (ctx, next) => {
    if (ctx.method !== 'GET')
        return await next();
    ctx.body = data;
});

if (!module.parent) {
    console.log(pkg.name, 'listening on', process.env.PORT || 3000,
        'in', process.env.NODE_ENV, 'mode');
    app.listen(process.env.PORT || 3000);
}
