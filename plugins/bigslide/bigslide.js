(function($){
	
	/* function fx(el,x,y){
		 var trans = getComputedStyle(el).webkitTransform;
		 trans = (trans == "none" ? "" :trans);
		 el.style.webkitTransform = new WebKitCSSMatrix(trans).translate(x,y);
	 }*/
	 
	 var REG_TRANS = /(.+,)([^,]+,[^,]+\))$/;
	 function translate(zobj,x,y){
		 var trans = zobj.css("-webkit-transform");
		 trans = (trans == "none" ? "matrix(1,0,0,1,0,0)" :trans);
		 var m = REG_TRANS.exec(trans);
		 zobj.css("-webkit-transform", m[1] +"" +x+", "+y+")");
		//zobj.css("-webkit-transform","translate("+x+"px,"+y+"px)");
	 }
	 
	 function power(delta,duration,force){
		return  Math.floor(delta/duration * force);
	 }
	 
	 function getpos(e,dir){
		var pos = {x:e.clientX,y:e.clientY,time:Date.now()};
		if(dir == "horizontal"){
			pos.y = 0;
		}else if(dir == "vertical" ){
			pos.x = 0;
		}
		return pos;
	 }
	 
	
	 
	 $.fn.bigslide = function(options){
		var opt = $.extend({
			ontouchmove:function(){},
			direction:"horizontal",
			power:200
		},options),me = this,body=$(document.body);
		
		me.each(function(index){
			var thiz = this,that = $(thiz),
			slider = that.children(),
			ontouchmove = function(e){
				var tmp = getpos(e,opt.direction);
				last = {x:last.x + tmp.x-cmove.x, y: last.y + tmp.y-cmove.y};
				translate(slider,last.x,last.y);
				lmove = cmove;
				cmove = tmp;
				
				opt.ontouchmove.call(thiz,cmove,lmove,last);
				/*zooms.each(function(e){
					var offset = $(this).offset();
					zoom($(this),offset);
				})*/
			},
			ontouchend = function(e){
			//	that.unbind("mousemove",ontouchmove);
			//	that.unbind("mouseup",ontouchend);
				body.unbind("mousemove",ontouchmove);
				body.unbind("mouseup",ontouchend);
				
				if(opt.power <= 0){
					return;	
				}
				
				if(lmove){
					cmove = getpos(e,opt.direction);
					var dtime =  cmove.time - lmove.time;
					last = {x:last.x+ power(cmove.x - lmove.x,dtime,opt.power),y:last.y + power(cmove.y - lmove.y,dtime,opt.power)};
					slider.addClass("zepto-bigslide-force");
					translate(slider,last.x,last.y);
					slider.one("webkitTransitionEnd",function(e){
					slider.removeClass("zepto-bigslide-force");
					});
				}
			},
			cmove,lmove,last={x:0,y:0};
			that.bind("mousedown",function(e){
				cmove = getpos(e,opt.direction);
				slider.removeClass("zepto-bigslide-force");
			//	that.bind("mousemove",ontouchmove);
			//	that.bind("mouseup",ontouchend);
				body.bind("mousemove",ontouchmove);
				body.bind("mouseup",ontouchend);
				e.preventDefault();
			});
		});
	 }
	 
})(Zepto);
