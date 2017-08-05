
module.exports = function pagination_meta(ctx, result) {
    var has_query   = ctx.url.match(/\?/),
        next        = null,
        previous    = null,
        querystring = '';

    if (ctx.state.offset) {
        querystring = 'offset=' + Math.max(ctx.state.offset - ctx.state.limit, 0);
        if (ctx.url.match(/offset/)) {
            previous = ctx.url.replace(/offset=[0-9]*/, querystring);
        } else {
            previous = ctx.url + (has_query ? '&' : '?') + querystring;
        }
    }
    if (result.total >= (result.limit + result.offset)) {
        querystring = 'offset=' + Math.max(ctx.state.offset + ctx.state.limit, 0);
        if (ctx.url.match(/offset/)) {
            next = ctx.url.replace(/offset=[0-9]*/, querystring);
        } else {
            next = ctx.url + (has_query ? '&' : '?') + querystring;
        }
    }

    return {
        total:    result.total,
        count:    result.data.length,
        limit:    result.limit,
        offset:   result.offset,
        next,
        previous
    };
};
