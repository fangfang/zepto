(function($){
	$.fn.hovering=function(){
		var me=this,win=window,offset = me.offset(),
		update = function(e){
			
			if(me.hoveringActive && (offset.top - win.pageYOffset > 0 )){
				me.removeClass("zepto-hovering");
				me.positionfixedclear();
				me.hoveringActive=false;
			}
			
			if(!me.hoveringActive && (offset.top - win.pageYOffset <= 0 )){
				me.addClass("zepto-hovering");
				me.positionfixed();
				me.hoveringActive=true;
			}
	
		};
		$(win).bind('scroll',update)
		.bind('unload',function(){});//fix backspace problem
		return me;
	}
	
	$.fn.hoveringClear = function(){
		var me=this;
		me.removeClass("zepto-hovering");
		me.positionfixedclear();
		me.hoveringActive=false;
	}

})(Zepto);
