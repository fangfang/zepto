(function($){
	 
	 function parentIfText(node){
	      return 'tagName' in node ? node : node.parentNode;
	 }
	 
	 function getpos(e){
		 return {x:e.clientX,
			 	y:e.clientY,
			 	target:parentIfText(e.target)}
	 }
	 
	 
	 $.fn.slideevent = function(options){
		 var ismoving = false,start,isX,me = this,
		 opt = $.extend({
                gap:20,
                ontouchstart:function(){},
                ontouchmove:function(){},
                ontouchend:function(){}
		 	},options),
			handleTouchStart = function(e){
				start  = getpos(e.touches[0]);
				ismoving = false;
                opt.ontouchstart.call(me, e);
			},
			handleTouchMove = function(e){
                var end = getpos(e.touches[0]), deltaX = end.x - start.x;
                
                if(!ismoving) {
                    isX = Math.abs(deltaX) > Math.abs(end.y - start.y); 
                    isX && e.preventDefault();
                    ismoving = true;
                }
                else {
                    if(isX){ 
                        e.preventDefault();
                        opt.ontouchmove.call(me, e);
                    }
                }
			},
			handleTouchEnd = function(e){
                var end = getpos(e.changedTouches[0]), deltaX = end.x - start.x;
				if(!ismoving || Math.abs(deltaX) < 10){
					$(start.target).trigger('click');
				}
                else{
                    if(isX){
                        if(deltaX > opt.gap) {
                            triggerSlideEvent("right");
                        }
                        else if(deltaX < -opt.gap){
                            triggerSlideEvent("left");
                        }
                        opt.ontouchend.call(me, e);
                    }
                }
			},
			triggerSlideEvent = function(type){
				$(start.target).trigger('slide'+type,start);
			};
			return this.bind('touchstart',handleTouchStart)
			.bind('touchmove',handleTouchMove).bind('touchend',handleTouchEnd);
	 }
	 	 
})(Zepto);
