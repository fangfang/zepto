(function($) {

	
	function parentIfText(node){
	      return 'tagName' in node ? node : node.parentNode;
	 }
	
    
    function translate(zobj, x, y) {
        zobj.css("-webkit-transform","translate("+x+"px,"+y+"px)");
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
        if (dir == "horizontal") {
            pos.y = 0;
        }
        else if (dir == "vertical") {
            pos.x = 0;
        }
        return pos;
    }
    
    function computepos(slider, last, cmove, lmove, dtime, force) {
        var powerX = power(cmove.x - lmove.x, dtime, force), powerY = power(cmove.y - lmove.y, dtime, force), pos = {
            x: last.x + powerX,
            y: last.y + powerY
        };
        
        pos.x = pos.x > 0 ? 0 : pos.x;
        pos.y = pos.y > 0 ? 0 : pos.y;
        
        var lcoffset = slider.children().last().offset(), fcoffset = slider.children().first().offset(), poffset = slider.parent().offset(), width = lcoffset.left + lcoffset.width - fcoffset.left, height = lcoffset.top + lcoffset.height - fcoffset.top, pwidth = poffset.width, pheight = poffset.height;
        
        pos.x = (lcoffset.left + lcoffset.width + powerX) < pwidth ? pwidth - width : pos.x;
        pos.y = (lcoffset.top + lcoffset.height + powerY) < pheight ? pheight - height : pos.y;
        
        return pos;
    }
    
    $.fn.bigslide = function(options) {
        var opt = $.extend({
            ontouchmove: function() {
            },
            direction: "horizontal",
            power: 200,
			positive: null,
			negative: null,
			btnspeed: 80
        }, options), me = this, body = $(document.body);
        
        return me.css({
        	"-webkit-perspective":1000,
        	"-webkit-backface-visibility": 'hidden'
        }).each(function(index) {
            var thiz = this, that = $(thiz), slider = that.children(), ontouchmove = function(e) {
				var tmp = getpos(e.touches[0], opt.direction);
				last = {
					x: last.x + tmp.x - cmove.x,
					y: last.y + tmp.y - cmove.y
				};
				translate(slider, last.x, last.y);
				lmove = cmove;
				cmove = tmp;
				
				opt.ontouchmove.call(thiz, cmove, lmove, last);
			}, ontouchend = function(e) {
				
				body.unbind("touchmove", ontouchmove);
				body.unbind("touchend", ontouchend);
				
				if(triggerClick){
					$(parentIfText(e.target)).trigger('click');
				}
				
				if (opt.power <= 0) {
					return;
				}
				
				if (lmove) {
					cmove = getpos(e.changedTouches[0], opt.direction);
					var dtime = cmove.time - lmove.time;
					
					last = computepos(slider, last, cmove, lmove, dtime, opt.power);
					
					slider.addClass("zepto-bigslide-force");
					translate(slider, last.x, last.y);
					slider.one("webkitTransitionEnd", function(e) {
						slider.removeClass("zepto-bigslide-force");
					});
				}
			}, move = function(range) {
				triggerClick = false;
				if (opt.direction == "horizontal") {
		            last.x +=  range;
		        }
		        else if (opt.direction == "vertical") {
		            last.y += range;
		        }
				last.x = last.x > 0 ? 0 : last.x;
		        last.y = last.y > 0 ? 0 : last.y;
		        
		        var lcoffset = slider.children().last().offset(), fcoffset = slider.children().first().offset(), poffset = slider.parent().offset(), width = lcoffset.left + lcoffset.width - fcoffset.left, height = lcoffset.top + lcoffset.height - fcoffset.top, pwidth = poffset.width, pheight = poffset.height;
		        
		        last.x = (lcoffset.left + lcoffset.width + range) < pwidth ? pwidth - width : last.x;
		        last.y = (lcoffset.top + lcoffset.height + range) < pheight ? pheight - height : last.y;
				
				//slider.addClass('zepto-bigslide-move');
				translate(slider, last.x, last.y);
				//slider.one("webkitTransitionEnd", function(e) {
				//	slider.removeClass('zepto-bigslide-move');
				//});
		
			}, cmove, lmove, last = {
                x: 0,
                y: 0
            },triggerClick = true;
            that.bind("touchstart", function(e) {
            	triggerClick = true;
                cmove = getpos(e.touches[0], opt.direction);
                slider.removeClass("zepto-bigslide-force");
                body.bind("touchmove", ontouchmove);
                body.bind("touchend", ontouchend);
                e.preventDefault();
            });
			if ( opt.positive ) {
				var hold = false, ptimeout = function(){
					if (hold) {
						move(opt.btnspeed);
						setTimeout(ptimeout, 100);
					}
				};
				
				$(opt.positive).bind('touchstart', function(e){
					e.preventDefault();
					hold = true;
					setTimeout(ptimeout, 98);
				});
				$(opt.positive).bind('touchend', function(e){
					e.preventDefault();
					hold = false;
				});
			}
			if ( opt.negative ) {
				var hold = false, ntimeout = function(){
					if (hold) {
						move(-opt.btnspeed);
						setTimeout(ntimeout, 100);
					}
				};
				
				$(opt.negative).bind('touchstart', function(e){
					e.preventDefault();
					hold = true;
					setTimeout(ntimeout, 98);
				});
				$(opt.negative).bind('touchend', function(e){
					e.preventDefault();
					hold = false;
				});
			}
        });
    };
    
})(Zepto);
