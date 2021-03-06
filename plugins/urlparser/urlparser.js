(function($){
    function parseQuery(query) {
        var ret = {}, seg = query.substring(1).split('&'), s;
		
        for ( var i in seg ) {
			if ( !seg[i] || seg[i].indexOf('=') == -1 ) continue;
			s = seg[i].split('=');
			ret[s[0]] = s[1];
		}
        return ret;
    }
	
	function toQuery(params) {
		var query = [];
		for ( var key in params ) {
			query.push(key + '=' + params[key]);
		}
		
		return query.join('&');
	}

    function parseURL(url) {
        var a = document.createElement('a');
        a.href = url;

        return {
			source: url,
			protocol: a.protocol.replace(':', ''),
			host: a.hostname,
			port: a.port,
			query: a.search,
			params: parseQuery(a.search),
			file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
			hash: a.hash.replace('#', ''),
			path: a.pathname.replace(/^([^\/])/, '/$1'),
			relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
			segments: a.pathname.replace(/^\//, '').split('/'),
			toUrl: function() {
				var port = this.port == '' || this.port == '0' ? '' : ':' + this.port, //mobile safari当url中没有端口时，port为0，pc上此时port为空字符串
					path = this.paht == '' ? '/' : this.path,
					query = toQuery(this.params),
					hash = this.hash == '' ? '' : '#' + this.hash;
				query = query == '' ? '' : '?' + query;
                return this.protocol + '://' + this.host + port + path + query + hash; //现代浏览器中，字符串拼接优化过，比join方法略快。
			}
        };
    }
    
    $.urlParser = function(opt){
        return parseURL(opt.url);
    };
})(Zepto);
