var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.toString = function () {
        return "Point (" + this.x + "," + this.y + ")";
    };
    Point.prototype.in = function (rect) {
        return ((rect.x <= this.x && this.x <= rect.x + rect.w)
            && (rect.y <= this.y && this.y <= rect.y + rect.h));
    };
    return Point;
}());
var Rect = /** @class */ (function () {
    function Rect(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    return Rect;
}());
var Label = /** @class */ (function (_super) {
    __extends(Label, _super);
    function Label(x, y, w, h) {
        var _this = _super.call(this, x, y, w, h) || this;
        _this.x = x;
        _this.y = y;
        _this.w = w;
        _this.h = h;
        _this.text = '';
        _this.fontStyle = 'bold';
        _this.fontSize = '24px';
        _this.fontFamily = 'sans-serif';
        _this.background = '#ffffff';
        _this.textColor = '#000000';
        _this.borderColor = '#00ff00';
        _this.showBorder = false;
        return _this;
    }
    Object.defineProperty(Label.prototype, "font", {
        get: function () {
            return this.fontStyle + ' ' + this.fontSize + ' ' + this.fontFamily;
        },
        enumerable: true,
        configurable: true
    });
    Label.prototype.toImage = function (ctx) {
        return ctx.getImageData(this.x, this.y, this.w, this.h);
    };
    Label.prototype.paint = function (ctx) {
        //update text and width
        this.text = "(" + this.x + "," + this.y + ")";
        var tm = ctx.measureText(this.text);
        // this.w = tm.width;
        //background
        ctx.fillStyle = this.background;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        //border
        if (this.showBorder) {
            ctx.strokeStyle = this.borderColor;
            ctx.strokeRect(this.x, this.y, this.w, this.h);
        }
        //text
        ctx.fillStyle = this.textColor;
        ctx.font = this.font;
        ctx.fillText(this.text, this.x, this.y + this.h - 8);
    };
    return Label;
}(Rect));
function measureTextHeight(ctx, txt) {
    var tm = ctx.measureText(txt);
    var h;
    if (typeof tm.fontBoundingBoxAscent === "undefined") {
        // create a div element and get height from that
        var el = document.createElement('div');
        el.style.cssText = "position:fixed;font:" + ctx.font +
            ";padding:0;margin:0;left:-9999px;top:-9999px";
        el.innerHTML = txt;
        document.body.appendChild(el);
        h = parseInt(getComputedStyle(el).getPropertyValue('height'), 10);
        document.body.removeChild(el);
    }
    else {
        // in the future ...
        h = tm.fontBoundingBoxAscent + tm.fontBoundingBoxDescent;
    }
    return Math.round(h);
}
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
    scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y
    var x = Math.round((evt.clientX - rect.left) * scaleX), y = Math.round((evt.clientY - rect.top) * scaleY);
    return new Point(x, y);
}
function clearCanvas(ctx) {
    var canvas = ctx.canvas;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function between(num, min, max) {
    return min <= num && num <= max;
}
function repaint() {
    clearCanvas(ctx);
    for (var _i = 0, rects_1 = rects; _i < rects_1.length; _i++) {
        var pos = rects_1[_i];
        if (selected)
            selected.showBorder = true;
        pos.paint(ctx);
        // console.log(`paint ${pos.text}`);
    }
    preview();
}
var HEIGHT = 500;
var WIDTH = 1200;
var $canvas = $('#canvas');
var canvas = $canvas[0];
var ctx = canvas.getContext('2d');
canvas.width = WIDTH;
canvas.height = HEIGHT;
$canvas.width(WIDTH);
$canvas.height(HEIGHT);
var rects = [];
for (var i = 0; i < 4; i++) {
    var r = new Label(i * 64, i * 64, 256, 128);
    r.text = r.x + "," + r.y;
    rects.push(r);
}
canvas.onmousemove = function (evt) {
    var p = getMousePos(canvas, evt);
    for (var _i = 0, rects_2 = rects; _i < rects_2.length; _i++) {
        var pos = rects_2[_i];
        pos.showBorder = false;
    }
    for (var _a = 0, rects_3 = rects; _a < rects_3.length; _a++) { //find a rect to be focused
        var pos = rects_3[_a];
        pos.showBorder = p.in(pos);
        if (pos.showBorder)
            break;
    }
    for (var _b = 0, rects_4 = rects; _b < rects_4.length; _b++) {
        var pos = rects_4[_b];
        if (selected === pos) {
            pos.showBorder = true;
            if (dragOffset) { //dragging
                pos.x = p.x - dragOffset.x;
                pos.y = p.y - dragOffset.y;
                $('#posx').val(pos.x);
                $('#posy').val(pos.y);
            }
        }
    }
};
var $posx = $('#posx'), $posy = $('#posy'), $width = $('#width'), $height = $('#height'), $color = $('#color'), $background = $('#background'), $bold = $('#bold'), $italic = $('#italic'), $fontSize = $('#fontSize');
$posx.on('input', function (e) {
    selected.x = parseInt($posx.val().toString(), 10);
    console.log(selected.x);
});
$posy.on('input', function (e) {
    selected.y = parseInt($posy.val().toString(), 10);
    console.log(selected.x);
});
$width.on('input', function (e) {
    selected.w = parseInt($width.val().toString(), 10);
    console.log(selected.x);
});
$height.on('input', function (e) {
    selected.h = parseInt($height.val().toString(), 10);
    console.log(selected.x);
});
$color.change(function (e) {
    selected.textColor = $color.val();
    console.log($color.val());
});
$background.change(function (e) {
    selected.background = $background.val();
    console.log($background.val());
});
function fontChange(evt) {
    var fontStyle = '';
    console.log($bold.attr("checked") + ' ' + $italic.attr("checked"));
    if ($bold.prop('checked'))
        fontStyle += 'bold ';
    if ($italic.prop("checked"))
        fontStyle += 'italic ';
    selected.fontStyle = fontStyle;
    console.log(fontStyle);
}
$bold.change(fontChange);
$italic.change(fontChange);
$fontSize.on('input', function (evt) {
    selected.fontSize = $fontSize.val() + 'px';
    console.log($fontSize.val());
});
var selected = null;
var dragOffset;
canvas.onmousedown = function (evt) {
    var p = getMousePos(canvas, evt);
    selected = null;
    for (var _i = 0, rects_5 = rects; _i < rects_5.length; _i++) {
        var rect = rects_5[_i];
        if (p.in(rect)) {
            if (evt.which === 1) {
                dragOffset = new Point(p.
                    x - rect.x, p.y - rect.y);
                selected = rect;
                $posx.val(selected.x);
                $posy.val(selected.y);
                $width.val(selected.w);
                $height.val(selected.h);
                $color.val(selected.textColor);
                $background.val(selected.background);
                var style = selected.fontStyle;
                $bold.prop('checked', style.indexOf('bold') != -1);
                $italic.prop('checked', style.indexOf('italic') != -1);
                $fontSize.val(parseInt(selected.fontSize));
                console.log("down " + p);
            }
            if (evt.which === 3) {
                console.log(rect.toImage(ctx));
            }
            return;
        }
    }
};
canvas.onmouseup = function (evt) {
    dragOffset = undefined;
};
function preview() {
    console.log('preview');
    var img;
    var area = (selected == null) ? new Rect(0, 0, canvas.width, canvas.height) : selected;
    var w = area.w * 0.5, h = area.h * 0.5;
    var temp = Canvas2Image.sliceCanvas(canvas, area.x, area.y, area.w, area.h);
    temp = Canvas2Image.scaleCanvas(temp, w, h);
    Canvas2Image.sliceIntoImage(temp, $('#preview')[0], 0, 0, w, h);
}
setInterval(repaint, 16);
//# sourceMappingURL=main.js.map