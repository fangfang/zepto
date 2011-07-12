(function($) {

    var REG_TRANS = /(.+,)([^,]+,[^,]+\))$/;
    function translate(zobj, x, y) {
        var trans = zobj.css("-webkit-transform");
        trans = (trans == "none" ? "matrix(1,0,0,1,0,0)" : trans);
        var m = REG_TRANS.exec(trans);
        zobj.css("-webkit-transform", m[1] + "" + x + ", " + y + ")");
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
            power: 200
        }, options), me = this, body = $(document.body);
        
        me.each(function(index) {
            var thiz = this, that = $(thiz), slider = that.children(), ontouchmove = function(e) {
                var tmp = getpos(e, opt.direction);
                last = {
                    x: last.x + tmp.x - cmove.x,
                    y: last.y + tmp.y - cmove.y
                };
                translate(slider, last.x, last.y);
                lmove = cmove;
                cmove = tmp;
                
                opt.ontouchmove.call(thiz, cmove, lmove, last);
            }, ontouchend = function(e) {
                body.unbind("mousemove", ontouchmove);
                body.unbind("mouseup", ontouchend);
                
                if (opt.power <= 0) {
                    return;
                }
                
                if (lmove) {
                    cmove = getpos(e, opt.direction);
                    var dtime = cmove.time - lmove.time;
                    
                    last = computepos(slider, last, cmove, lmove, dtime, opt.power);
                    
                    slider.addClass("zepto-bigslide-force");
                    translate(slider, last.x, last.y);
                    slider.one("webkitTransitionEnd", function(e) {
                        slider.removeClass("zepto-bigslide-force");
                    });
                }
            }, cmove, lmove, last = {
                x: 0,
                y: 0
            };
            that.bind("mousedown", function(e) {
                cmove = getpos(e, opt.direction);
                slider.removeClass("zepto-bigslide-force");
                body.bind("mousemove", ontouchmove);
                body.bind("mouseup", ontouchend);
                e.preventDefault();
            });
        });
    }
    
})(Zepto);
