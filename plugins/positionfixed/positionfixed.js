(function($){
	$.fn.positionfixed=function(options){	
		var win=window,me=this,timer,
		opt = $.extend({
			timeout:200,	
			top:0,
			left:0
		},options)
		,update = function(){
			me.css("-webkit-transform",'translateY('+ (win.pageYOffset + opt.top)+'px) translateX('+ (win.pageXOffset + opt.left)+'px)');
		};
		me.positionfixedupdate = function(){
			if(timer){
				win.clearTimeout(timer);
			}
			timer = win.setTimeout(update,opt.timeout);
		};
		update();
		$(win).bind('scroll',me.positionfixedupdate);
		return me;
	};
	$.fn.positionfixedclear = function(){
		var me = this;
		$(window).unbind('scroll',me.positionfixedupdate);
		
		return me.css("-webkit-transform",'none').one("webkitTransitionEnd",function(){
			me.css("-webkit-transform",'none');
		});
	}
	
})(Zepto);