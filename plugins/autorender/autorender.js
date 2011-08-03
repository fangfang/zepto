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
	
	function dataRender(e, data) {
		e.html(data)
	}
	
	function linkRender(e, link) {
		e.attr(linkMap[e[0].nodeName], link)
	}
	
	function linkTplRender(e, data) {
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
	}
    
    function hashRender(element, data, renderNum) {
        var target = $(element[0].cloneNode(true)), children = target.find('*');

        children.each(function(idx, element) {
            var e = $(element), name = e.data('ar-name'), type = e.data('ar-type');
				
            if ( name || type ) {
				if ( type == 'link-tpl' ) {
					linkTplRender(e, data)
				}
				else if ( type == 'link' ) {
					linkRender(e, data[name])
				}
				else if ( type == 'num' ) {
					dataRender(e, renderNum)
				}
				else {
					dataRender(e, data[name])
				}
            }
        });
		return target
    }
     
    function arrayRender(container, data) {
        var fragment = document.createDocumentFragment(), dataArr = data.array, count = 1;

        for ( var i in dataArr ) {
            var tpl = getTpl(container, dataArr[i].tplName || data.tplName);

            if ( tpl.data('ar-type') == 'hash' ) {
                fragment.appendChild(hashRender(tpl, dataArr[i], parseInt(data.num) + parseInt(count))[0])
            }
            ++count
        }

        return fragment
    }
    
    $.fn.autorender = function(opt) {
        opt = $.extend({
            mode: 'append',
			preprocess: function(){},
            callback: function(){}
        }, opt);
        var container = this;
        
        $.getJSON(opt.url, function(response) {
			opt.preprocess.call(container, response);
			
			var type = container.data('ar-type'), fn = opt.mode, data = response.data;
			if ( type === 'array' ) {
				container[fn](arrayRender(container, data))
			}
			else if ( type === 'hash' ) {
				(container.parent())[fn](hashRender(container, data))
			}

            opt.callback.call(container, response)
        });
		
		return container
    }
})(Zepto);
