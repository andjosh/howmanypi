
module.exports = function pagination_meta(result) {
    var has_query   = this.url.match(/\?/),
        next        = null,
        previous    = null,
        querystring = '';

    if (this.state.offset) {
        querystring = 'offset=' + Math.max(this.state.offset - this.state.limit, 0);
        if (this.url.match(/offset/)) {
            previous = this.url.replace(/offset=[0-9]*/, querystring);
        } else {
            previous = this.url + (has_query ? '&' : '?') + querystring;
        }
    }
    if (result.total >= (result.limit + result.offset)) {
        querystring = 'offset=' + Math.max(this.state.offset + this.state.limit, 0);
        if (this.url.match(/offset/)) {
            next = this.url.replace(/offset=[0-9]*/, querystring);
        } else {
            next = this.url + (has_query ? '&' : '?') + querystring;
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
