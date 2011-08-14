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
	
	function computeState(pos, slideroffset) {
		return pos / slideroffset;
	}
	
	function computePos(last, power, slideroffset, parentoffset, scale){
	    var pos = last + power, state = computeState(pos, slideroffset);

		return state > 0 ? 0 : state < scale - 1 ? parentoffset - slideroffset : pos;
	}
    
    $.fn.slider = function(options) {
        var opt = $.extend({
            direction: "horizontal",
            power: 200,
            positive: null,
            negative: null,
			scroll: false,
            btnspeed: 50
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
	    }, me = this, body = $(document.body), horizontal = true, positive = opt.positive ? $(opt.positive.selector) : null, negative = opt.negative ? $(opt.negative.selector) : null;
		
		horizontal = opt.direction == 'horizontal';
		
        return me.css({
            "-webkit-perspective": 1000,
            "-webkit-backface-visibility": 'hidden'
        }).each(function(index) {
            var thiz = this, that = $(thiz), slider = that.children(), parentoffset = horizontal ? that.offset().width : that.offset().height, ontouchmove = function(e) {
                movecount += 1;
                var tmp = getpos(e.touches[0]),
					factor = state > 0 || state < scale - 1 ? 0.5 : 1;

                last = last + (tmp.val - cmove.val) * factor;
				
                translate(slider, last);
				changeState();
				scrollbar && changeScrollbar();
				(positive || negative) && changeBtn();
                lmove = cmove;
                cmove = tmp;
            }, ontouchend = function(e) {
                body.unbind("touchmove", ontouchmove);
                body.unbind("touchend", ontouchend);
				
				cmove = getpos(e.changedTouches[0]);
                
                if ( (isIphone && !movecount) || (isAndroid && movecount <= 2 && (Date.now() - touchstartPos.time) < 750 && Math.abs(cmove.val - touchstartPos.val) < 15) ) {
                    $(parentIfText(e.target)).trigger('click');
                }
                
                if (opt.power <= 0) return;
                
                if (lmove) {
                    last = computePos(last, power(cmove.val - lmove.val, cmove.time - lmove.time, opt.power), slideroffset, parentoffset, scale);
                    slider.addClass("zepto-slider-force");
					translate(slider, last);
					changeState();
					scrollbar && changeScrollbar();
                    slider.one("webkitTransitionEnd", function(e) {
                    	slider.removeClass("zepto-slider-force");
                        (positive || negative) && changeBtn();
						scrollbar && scrollbar.css('opacity', '0');
                    });
                }
            }, move = function(range) {
				var stateOld = state;
				last = computePos(last, range, slideroffset, parentoffset, scale);
				changeState();
				if (state === stateOld) return;
				slider.addClass('zepto-slider-move');
				translate(slider, last);
				scrollbar && scrollbar.addClass('zepto-slider-scrollbar-move');
				scrollbar && changeScrollbar();
				slider.one("webkitTransitionEnd", function(e) {
					slider.removeClass('zepto-slider-move');
					scrollbar && scrollbar.removeClass('zepto-slider-scrollbar-move');
					(positive || negative) && changeBtn();
					scrollbar && scrollbar.css('opacity', '0');
				});
            }, changeState = function() {
				state = computeState(last, slideroffset);
			}, changeBtn = function() {
				if ( state >= 0 ) {
					opt.positive.enable && opt.positive.enable.call(positive);
					opt.negative.disable && opt.negative.disable.call(negative);
				}
				else if ( state <= scale - 1 ) {
					opt.negative.enable && opt.negative.enable.call(negative);
					opt.positive.disable && opt.positive.disable.call(positive);
				}
				else {
					opt.positive.enable && opt.positive.enable.call(positive);
					opt.negative.enable && opt.negative.enable.call(negative);
				}
			}, changeScrollbar = function() {
				scrollbar.css('opacity', '.5');
				translate(scrollbar, parentoffset * -state);
			}, initScrollbar = function() {
				if (!scrollbar) {
					styleStr = horizontal ? 'left:0;bottom:0;height:5px;width:' + scale * parentoffset + 'px;' : 'right:0;top:0;width:5px;height:' + scale * parentoffset + 'px;';
					scrollbar = $('<div class="zepto-slider-scrollbar" style="' + styleStr + '"></div>');
					that.append(scrollbar);
					translate(scrollbar, parentoffset * -state);
				}
				else {
					scrollbar[horizontal ? 'width' : 'height'](scale * parentoffset + 'px');
					changeScrollbar();
				}
				scrollbar.css('opacity', 0);
			}, init = function() {
				slideroffset = getOffset(slider);
				scale = parentoffset / slideroffset;
				changeState();
				(positive || negative) && changeBtn();
				opt.scroll && initScrollbar();
			}, cmove, lmove, last = 0, movecount = 0, touchstartPos, slideroffset, scale, scrollbar, state;
            
			me.sliderReinit = function(){
				me.each(init);
			};

            init();
			that.bind("touchstart", function(e) {
                e.preventDefault();
                movecount = 0;
                cmove = getpos(e.touches[0], opt.direction);
				touchstartPos = cmove;
                slider.removeClass("zepto-slider-force");
                body.bind("touchmove", ontouchmove);
                body.bind("touchend", ontouchend);
            });

			//button
			var hold = false, direction = 1, timeout = function() {
                if ( hold ) {
                    move(direction * opt.btnspeed);
                    setTimeout(timeout, 100);
                }
			}, bindBtn = function(btn, dir) {
				btn.bind('touchstart', function(e) {
					direction = dir;
                    e.preventDefault();
                    hold = true;
                    setTimeout(timeout, 100);
                }).bind('touchend', function(e) {
                    hold = false;
                });
			};

            if ( positive && opt.positive.clickable ) {
				bindBtn(positive, -1);
            }
            if ( negative && opt.negative.clickable ) {
				bindBtn(negative, 1);
            }
        });
    };
})(Zepto);
