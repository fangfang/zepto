(function($){
	if(!window.localStorage && !window.JSON) return;

	$.storage = function(type,index,val,callback){			
		if($.isFunction(callback)) $(window).one("storage",callback);
		switch(type){
			case "storageSet" : set(index,val,callback);return;
			case "storageGet" : get(index,callback);return;
			case "storageClear" : clear(index);return;
			default :;
		}
	}
	
	var cache = {},
	
	set = function(index,val,callback){
		cache[index] = val;
		if($.isObject(val))  var val = JSON.stringify(val);
		var value = val.trim();		
		if(value.length === 0) return;
		
		localStorage[index] = value;
	},
	
	get = function(index,callback){
		if((index) in cache) return cache[index];
		
		var value = JSON.parse(localStorage[index]);
		cache[index] = value;
		return value;
	},
	
	clear = function(index){
		if(arguments.length === 0) {
			localStorage.clear();
			cache = {};
		}else{
			localStorage.removeItem(index);
			delete cache[index];
		}		
	};
	
	["storageSet", "storageGet", "storageClear"].forEach(function(m){
    	$[m] = function(prefix,key,val,callback){ return $.storage(m,prefix+key,val,callback);}
  	});	
})(Zepto)