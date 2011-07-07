(function($){
	
	 var OFFSET = 5,TIME = 500,gesture = {},gestureTimeout;
	 
	 function parentIfText(node){
	      return 'tagName' in node ? node : node.parentNode;
	 }
	 
	 function triggerHoldEvent(){
		  $(gesture.target).trigger("hold",gesture);
		  gesture.triggered = true;
	 }
	 
	 function ifCancelTimeout(e){
		 var di = e['changedTouches'][0];
		 
		 if( Math.abs(di.clientX - gesture.x) > OFFSET
			|| Math.abs(di.clientY - gesture.y) > OFFSET
		 ){
			 clearTimeout(gestureTimeout);
		 }
	 }
	 
	 $(document).ready(function(){
		 $(document.body).bind('touchstart',function(e){
			 
			 var di = e['changedTouches'][0],
			 now = Date.now();
			 	 
			 gesture.target = parentIfText(e.target);
			 gesture.x = di.clientX;
			 gesture.y = di.clientY;
			 gesture.triggered = false;
			 gesture.last = now;
			 
			 clearTimeout(gestureTimeout);
			 gestureTimeout = setTimeout(triggerHoldEvent,TIME);
			 e.preventDefault();
			 
		 }).bind('touchmove',ifCancelTimeout)
		 .bind('touchend',function(e){
			 var di = e['changedTouches'][0];
			 ifCancelTimeout(e);
			 if(Date.now() - gesture.last < TIME ){
				 clearTimeout(gestureTimeout);
			 }
			 if(gesture.triggered){
				 $(gesture.target).trigger("holdend",{x:di.clientX,y:di.clientY});
			 } 
		 });
	 });
		 
})(Zepto);
