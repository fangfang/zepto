(function($){
	var CLZ_SHAKE = "zepto-icondrag-shake",
	CLZ_ZOOM = "zepto-icondrag-zoom",
	CLZ_ZOOMIN = "zepto-icondrag-zoomin",
	floor = Math.floor;
	
	$.fn.icondrag = function(options){
		var opt = $.extend({scale:1.2},options),me=this;
		var slots = [];
		
		me.each(function(index){//begin dragging func
			var lastV = {x:0,y:0},
			last={x:0,y:0},
			client = {x:0,y:0},
			delta = {x:0,y:0},
			dragMove = function(e){
				var di = e['changedTouches'][0];
				client.x = floor(di.clientX/opt.scale);
				client.y =floor(di.clientY/opt.scale);
				
				var toV = {x: client.x - last.x + lastV.x ,y:client.y - last.y + lastV.y};
		
				$(this).css("-webkit-transition-duration","0s")
				.css("-webkit-transform","scale("+opt.scale+") translate("+toV.x +"px,"+toV.y+"px)");
					
				lastV = toV;
				
				last.x = client.x;
				last.y = client.y;
			};
			$(this).addClass(CLZ_ZOOM)
			.bind("hold",function(e,pos){
				last = {x:floor(pos.x/opt.scale),y:floor(pos.y/opt.scale)};
				
				$(this).css("-webkit-transition-duration",'inherit')
				.addClass(CLZ_ZOOMIN)
				.css("-webkit-transform","scale("+opt.scale+") translate("+lastV.x +"px,"+lastV.y+"px)")
				
				.bind("touchmove",dragMove);
				
				//shake others
				me.not("."+CLZ_ZOOMIN).each(function(){
					var that = this;
					setTimeout(function(){
						$(that).addClass(CLZ_SHAKE);		
					},floor(Math.random()*100));
				});
				
			}).bind("holdend",function(e,pos){
				//stop shaking
				me.not("."+CLZ_ZOOMIN).each(function(){
					$(this).removeClass(CLZ_SHAKE);
				});
				
				$(this).unbind("touchmove",dragMove)
				.css("-webkit-transition-duration",'inherit');
				
				$(this).css("-webkit-transform","translate("+ lastV.x*opt.scale+"px,"+ lastV.y*opt.scale +"px)")
				.removeClass(CLZ_ZOOMIN);
				$(this).one("webkitTransitionEnd",function(e){
					
					delta.x += (lastV.x*opt.scale);
					delta.y += (lastV.y*opt.scale);
					
					$(this).css("-webkit-transition-duration","0s")
					.css("-webkit-transform","inherit")
					.css("top",delta.y+"px")
					.css("left",delta.x+"px");
					lastV = {x:0,y:0};
					
				});
			});
			
			
			
			slots.push(
					{
						item:this,
						deltaNext:0,
						deltaPrev:0
					}		
			);
			
			
			
		});//end dragging func
		
	
		
		
	}
	
	
})(Zepto);

