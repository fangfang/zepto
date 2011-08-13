(function($) {

    function parentIfText(node) {
        return 'tagName' in node ? node : node.parentNode;
    }
    
    function translate(zobj, x, y) {
        zobj.css("-webkit-transform", "translate3d(" + x + "px," + y + "px,0)");
    }
    
    function power(delta, duration, force) {
        return Math.floor(delta / duration * force);
    }
    
    function getpos(e, dir) {
        var pos = {
            x: e.clientX,
            y: e.clientY,
            time: Date.now()
        };
        if ( dir == "horizontal" ) {
            pos.y = 0;
        }
        else if ( dir == "vertical" ) {
            pos.x = 0;
        }
        return pos;
    }
    
    function getOffset(obj) {
        var lc = obj.children().last(), lcoffset = lc.offset(), fcoffset = obj.children().first().offset();
        return {
            width: lcoffset.left + lcoffset.width + parseInt(lc.css('margin-right')) + parseInt(obj.css('padding-left')) - fcoffset.left,
            height: lcoffset.top + lcoffset.height + parseInt(lc.css('margin-bottom')) + parseInt(obj.css('padding-top')) - fcoffset.top
        };
    }
	
	function checkEdge(posValue, sliderValue, parentValue, powerValue) {
		return posValue >= 0 ? 1 : posValue + sliderValue + (powerValue || 0) <= parentValue ? -1 : 0;
	}
    
    function computepos(last, powerX, powerY, slideroffset, parentoffset) {
        var pos = {
            x: last.x + powerX,
            y: last.y + powerY
        }, xState = checkEdge(pos.x, slideroffset.width, parentoffset.width, powerX), yState = checkEdge(pos.y, slideroffset.height, parentoffset.height, powerY);
		
		pos.x = xState > 0 ? 0 : xState < 0 ? parentoffset.width - slideroffset.width : pos.x;
		pos.y = yState > 0 ? 0 : yState < 0 ? parentoffset.height - slideroffset.height : pos.y;
		
        return pos;
    }
    
    $.fn.slider = function(options) {
        var opt = $.extend({
            direction: "horizontal",
            power: 200,
            positive: null,
            negative: null,
            btnspeed: 50
        }, options), me = this, body = $(document.body);
        
        return me.css({
            "-webkit-perspective": 1000,
            "-webkit-backface-visibility": 'hidden'
        }).each(function(index) {
            var thiz = this, that = $(thiz), slider = that.children(), ontouchmove = function(e) {
                triggerClick = false;
                var tmp = getpos(e.touches[0], opt.direction);
                last = {
                    x: last.x + tmp.x - cmove.x,
                    y: last.y + tmp.y - cmove.y
                };
                changeBtnState();
                
                translate(slider, last.x, last.y);
                lmove = cmove;
                cmove = tmp;
            }, ontouchend = function(e) {
            
                body.unbind("touchmove", ontouchmove);
                body.unbind("touchend", ontouchend);
                
                if (triggerClick) {
                    $(parentIfText(e.target)).trigger('click');
                }
                
                if (opt.power <= 0) {
                    return;
                }
                
                if (lmove) {
                    cmove = getpos(e.changedTouches[0], opt.direction);
                    var dtime = cmove.time - lmove.time;
                    
                    last = computepos(last, power(cmove.x - lmove.x, dtime, opt.power), power(cmove.y - lmove.y, dtime, opt.power), slideroffset, that.offset());
                    
                    slider.addClass("zepto-bigslide-force");
                    translate(slider, last.x, last.y);
                    slider.one("webkitTransitionEnd", function(e) {
                        slider.removeClass("zepto-bigslide-force");
                        changeBtnState();
                    });
                }
            }, move = function(range) {
				var rangeX = 0, rangeY = 0;
                if (opt.direction == "horizontal") {
                    rangeX = range;
                }
                else if (opt.direction == "vertical") {
                    rangeY = range;
                }
				last = computepos(last, rangeX, rangeY, slideroffset, that.offset());
                
                slider.addClass('zepto-bigslide-move');
                translate(slider, last.x, last.y);
                slider.one("webkitTransitionEnd", function(e) {
                    slider.removeClass('zepto-bigslide-move');
                    changeBtnState();
                });
                
            }, changeBtnState = function() {
				var state = 0;
				if ( opt.direction == "horizontal" ) {
                	state = checkEdge(last.x, slideroffset.width, that.offset().width)
            	}
            	else if ( opt.direction == "vertical" ) {
                	state = checkEdge(last.y, slideroffset.height, that.offset().height);
           		}
				if ( state > 0 ) {
					if ( positive ) positive.attr('class', opt.positive.enable);
					if ( negative ) negative.attr('class', opt.negative.disable);
				}
				else if ( state < 0 ) {
					if ( negative ) negative.attr('class', opt.negative.enable);
					if ( positive ) positive.attr('class', opt.positive.disable);
				}
				else {
					if ( positive ) positive.attr('class', opt.positive.enable);
					if ( negative ) negative.attr('class', opt.negative.enable);
				}
			}, cmove, lmove, last = {
                x: 0,
                y: 0
            }, triggerClick = true, slideroffset = getOffset(slider), positive = opt.positive ? $(opt.positive.selector) : null, negative = opt.negative ? $(opt.negative.selector) : null;
            
            that.bind("touchstart", function(e) {
                triggerClick = true;
				if (opt.automove) {
					clearInterval(intervalID);
					intervalID = false;
				}
                cmove = getpos(e.touches[0], opt.direction);
                slider.removeClass("zepto-bigslide-force");
                body.bind("touchmove", ontouchmove);
                body.bind("touchend", ontouchend);
                e.preventDefault();
            });
			
			//button
			var hold = false, direction = 1, timeout = function() {
                if (hold) {
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
				bindBtn(positive.selector, -1);
            }
            if ( negative && opt.negative.clickable ) {
				bindBtn(negative.selector, 1);
            }
        });
    };
    
})(Zepto);