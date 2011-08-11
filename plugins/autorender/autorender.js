(function($) {
	var linkMap = {
		'A' : 'href',
		'IMG' : 'src'
	};
	
    function findTpl(obj, tplName) {
        var children = obj.children();
        for ( var i in children ) {
            if ( $(children[i]).data('ar-name') === tplName ) 
                return $(children[i].cloneNode(true))
        }
    }
    
    function getTpl(obj, tplName) {
        window[tplName] = window[tplName] || findTpl(obj, tplName);
        return window[tplName]
    }

    $.fn.autorender = function(opt) {
        opt = $.extend({
            mode: 'append',
			preprocess: function(){},
            callback: function(){},
			dataRender: function(e, data) {
				e.html(data)
			},
			link: function(e, link) {
				e.attr(linkMap[e[0].nodeName], link)
			},
			'link-tpl': function(e, data){
				var attrName = linkMap[e[0].nodeName],
					urlObj = $.urlParser({
						url: e.attr(attrName)
					}),
					urlTpls = e.data('ar-tpl').split('&');
					
				for ( var i in urlTpls ) {
					var pair = urlTpls[i].split('='), names = pair[1].match(/\[[^\[\]]+\]/g);
						
					for ( var j in names ) {
						key = names[j].match(/[^\[\]]+/);
						pair[1] = pair[1].replace(names[j], data[key[0]])
					}
					urlObj.params[pair[0]] = encodeURIComponent(pair[1])
				}
				
				e.attr(attrName, urlObj.toUrl())
			},
            hash: function(tpl, data, renderNum){
                var target = $(tpl[0].cloneNode(true)), children = target.find('*');

		        children.each(function(idx, element) {
		            var e = $(element), name = e.data('ar-name'), type = e.data('ar-type');
						
		            if ( type ) {
						if ( type == 'num' ) {
							opt['dataRender'](e, renderNum)
						}
						else {
							opt[type](e, name ? data[name] : data)
						}
		            }
					else if ( name ) {
						opt['dataRender'](e, data[name])
					}
		        });
				
				return target
            },
            array: function(container, data){
                var fragment = document.createDocumentFragment(), dataArr = data.array, count = parseInt(data.num) || 1;

                for ( var i in dataArr ) {
                    var tpl = getTpl(container, dataArr[i].tplName || data.tplName);

                    if ( tpl.data('ar-type') == 'hash' ) {
                        fragment.appendChild(opt['hash'](tpl, dataArr[i], count++)[0])
                    }
                }
                container[opt.mode](fragment)
            },
        }, opt);
        var me = this;
		
		if ( !opt.data && opt.url ) {
			$.getJSON(opt.url, function(response) {
				opt.preprocess.call(me, response);
				
				var type = me.data('ar-type'), data = response.data;
				type && opt[type](me, data);
				
				opt.callback.call(me, response)
			})
		}
		else {
			opt.preprocess.call(me, response);
			
			opt.type && opt[opt.type](me, data);
			
			opt.callback.call(me, response)
		}
		
		return me
    }

})(Zepto);
