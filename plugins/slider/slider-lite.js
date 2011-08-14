(function($) {
	var isIphone = /i(Phone|P(o|a)d)/.test(navigator.userAgent) && typeof window.ontouchstart !== 'undefined',
		isAndroid = /Android/.test(navigator.userAgent),
		has3d = isIphone && 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix();
	
	var translateStart = has3d ? 'translate3d(' : 'translate(', translateEnd = has3d ? ',0)' : ')';
	
    function parentIfText(node) {
        return 'tagName' in node ? node : node.parentNode;
    }
    
    function power(delta, duration, force) {
        return Math.floor(delta / duration * force);
    }
	
	function checkEdge(posValue, sliderValue, parentValue) {
		return posValue >= 0 ? 1 : posValue + sliderValue <= parentValue ? -1 : 0;
	}
	
	function computepos(last, power, slideroffset, parentoffset){
	    var pos = last + power, state = checkEdge(pos, slideroffset, parentoffset);

		return state > 0 ? 0 : state < 0 ? parentoffset - slideroffset : pos;
	}
    
    $.fn.slider = function(options) {
        var opt = $.extend({
            direction: "horizontal",
            power: 200
        }, options), translate = function(zobj, pos) {
        	zobj.css("-webkit-transform", translateStart + (horizontal ? pos + "px,0" : "0," + pos + "px") + translateEnd);
    	}, getpos = function(e){
			var pos = {
				val: horizontal ? e.clientX : e.clientY,
            	time: Date.now()
        	};
		
        	return pos;
		}, getOffset = function(obj){
	        var lc = obj.children().last(), fc = obj.children().first(), lcoffset = lc.offset(), fcoffset = fc.offset();
	
	        return horizontal ? lcoffset.left + lcoffset.width + parseInt(lc.css('margin-right')) + parseInt(fc.css('margin-left')) + parseInt(obj.css('padding-left')) + parseInt(obj.css('padding-right')) + parseInt(obj.css('margin-right')) - obj.offset().left : lcoffset.top + lcoffset.height + parseInt(lc.css('margin-bottom')) + parseInt(fc.css('margin-top')) + parseInt(obj.css('padding-top')) + parseInt(obj.css('padding-bottom')) + parseInt(obj.css('margin-bottom')) - obj.offset().top;
	    }, me = this, body = $(document.body), horizontal = true;
		
		horizontal = opt.direction == 'horizontal';
		
        return me.css({
            "-webkit-perspective": 1000,
            "-webkit-backface-visibility": 'hidden'
        }).each(function(index) {
            var thiz = this, that = $(thiz), slider = that.children(), parentoffset = horizontal ? that.offset().width : that.offset().height, slideroffset = getOffset(slider), ontouchmove = function(e) {
                movecount += 1;
                var tmp = getpos(e.touches[0]),
					factor = state !== 0 ? 0.5 : 1;

                last = last + (tmp.val - cmove.val) * factor;
                translate(slider, last);
				changeState();
                lmove = cmove;
                cmove = tmp;
            }, ontouchend = function(e) {
                body.unbind("touchmove", ontouchmove);
                body.unbind("touchend", ontouchend);
				
				cmove = getpos(e.changedTouches[0]);
                
                if ( (isIphone && !movecount) || (isAndroid && movecount <= 2 && (Date.now() - touchstartPos.time) < 300 && Math.abs(cmove.val - touchstartPos.val) < 15 ) {
                    $(parentIfText(e.target)).trigger('click');
                }
                
                if (opt.power <= 0) return;
                
                if (lmove) {
                    last = computepos(last, power(cmove.val - lmove.val, cmove.time - lmove.time, opt.power), slideroffset, parentoffset);
                    slider.addClass("zepto-slider-force");
					translate(slider, last);
					changeState();
					slider.one("webkitTransitionEnd", function(e) {
                    	slider.removeClass("zepto-slider-force");
                    });
                }
            }, changeState = function() {
				state = checkEdge(last, slideroffset, parentoffset);
			}, cmove, lmove, last = 0, movecount = 0, touchstartPos, state = 0;
			
            that.bind("touchstart", function(e) {
                e.preventDefault();
                movecount = 0;
                cmove = getpos(e.touches[0]);
				touchstartPos = cmove;
                slider.removeClass("zepto-slider-force");
                body.bind("touchmove", ontouchmove);
                body.bind("touchend", ontouchend);
            });
        });
    };
})(Zepto);