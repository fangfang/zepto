(function($) {

    
    function matrix(elem, x, y, scale) {
    	$(elem).show().css("-webkit-transform","translate("+x+"px,"+y+"px) scale("+scale+")");
    }
    
    function roll(child,slots,start,offset){
    	var len = slots.length;
    	var clen = child.length;
    	
    	for(var i=0; i<len ; i ++ ){
    		//child.get()
    		var to = (start+offset + i + clen )% clen;
    		//console.log("elem:"+to + "slot:" + i);
    		
    		matrix(child.get(to),slots[i][0],slots[i][1],slots[i][2]);
    		
    		if( offset < 0 && i== 0 
    			|| offset >0 && i == len-1){
    			$(child.get(to)).hide();
    		}
    		
    	}
    	
    	var startelem = (start + offset + child.length)% (child.length); 
    	//console.log("return:" + startelem)
    	return startelem;
    };
    
    $.fn.slotslide = function(options) {
        var opt = $.extend({
        	clz : "zepto-slotslide-anim",
        	start : 0
        }, options),
        thiz = this,child = thiz.children().hide();
    	//init hide
        
        if($.isFunction(opt.slotsFn)){
        	opt.slots = [];
        	var w=0,slot;
        	child.each(function(index){
    			slot = opt.slotsFn.call(this,w,index);
    			if(slot !==false){
    				w = slot[0];
    				opt.slots.push(slot);
    			}     			
        	});
        };
        
        var status = roll(child,opt.slots,opt.start,0);
    	
    	thiz.css({
        	"-webkit-perspective":1000,
        	"-webkit-backface-visibility": 'hidden'
        }).slideevent().bind("slideleft",function(e){
    		child.addClass(opt.clz);
    		status = roll(child,opt.slots,status,1);
    	}).bind("slideright",function(e){
    		child.addClass(opt.clz);
    		status = roll(child,opt.slots,status,-1);
    	});
       
        if(opt.controllers){
        	for(var i in opt.controllers){
        		(function(x){
        			$(opt.controllers[x]).bind("touchstart",function(){
            			thiz.trigger(x);
            		});	
        		})(i)
        	}
        }
        return thiz;
    }
    
})(Zepto);
