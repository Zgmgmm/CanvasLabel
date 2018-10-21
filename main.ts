class Point {
    constructor(public x: number, public y: number) { }
    public toString(): string {
        return `Point (${this.x},${this.y})`;
    }
    public in(rect: Label): boolean {
        return ((rect.x <= this.x && this.x <= rect.x + rect.w)
            && (rect.y <= this.y && this.y <= rect.y + rect.h));
    }
}

class Rect {
    constructor(public x: number, public y: number, public w: number, public h: number) { }

}
class Label extends Rect {

    get font() {
        return this.fontStyle + ' ' + this.fontSize + ' ' + this.fontFamily;
    }
    fontSize: string;
    fontStyle: string;
    fontFamily: string;
    textColor: string;
    background: string;
    text: string;
    borderColor: string;
    showBorder: boolean;

    constructor(public x: number, public y: number, public w: number, public h: number) {
        super(x, y, w, h);
        this.text = '';
        this.fontStyle = 'bold';
        this.fontSize = '24px';
        this.fontFamily = 'sans-serif';
        this.background = '#ffffff';
        this.textColor = '#000000';
        this.borderColor = '#00ff00';
        this.showBorder = false;
    }

    toImage(ctx: CanvasRenderingContext2D): ImageData {
        return ctx.getImageData(this.x, this.y, this.w, this.h);
    }
    paint(ctx: CanvasRenderingContext2D) {
        //update text and width
        this.text = `(${this.x},${this.y})`;
        let tm = ctx.measureText(this.text);
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
    }
}

function measureTextHeight(ctx: CanvasRenderingContext2D, txt: string): number {

    var tm = ctx.measureText(txt);
    var h;
    if (typeof tm.fontBoundingBoxAscent === "undefined") {

        // create a div element and get height from that
        let el = document.createElement('div');
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


function getMousePos(canvas, evt): Point {
    let rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
    let x = Math.round((evt.clientX - rect.left) * scaleX),
        y = Math.round((evt.clientY - rect.top) * scaleY);
    return new Point(x, y);
}

function clearCanvas(ctx: CanvasRenderingContext2D) {
    let canvas = ctx.canvas;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function between(num: number, min: number, max: number): boolean {
    return min <= num && num <= max;
}

function repaint() {
    clearCanvas(ctx);

    for (let pos of rects) {
        if (selected)
            selected.showBorder = true;
        pos.paint(ctx);
        // console.log(`paint ${pos.text}`);
    }
    preview();
}


const HEIGHT = 500;
const WIDTH = 1200;
const $canvas = $('#canvas');
const canvas = <HTMLCanvasElement>$canvas[0];
const ctx = canvas.getContext('2d');
canvas.width = WIDTH;
canvas.height = HEIGHT;
$canvas.width(WIDTH);
$canvas.height(HEIGHT);

var rects = []
for (let i = 0; i < 4; i++) {
    let r = new Label(i * 64, i * 64, 256, 128);
    r.text = `${r.x},${r.y}`;
    rects.push(r);
}
canvas.onmousemove = evt => {
    let p = getMousePos(canvas, evt);
    for (let pos of rects)
        pos.showBorder = false;

    for (let pos of rects) {//find a rect to be focused
        pos.showBorder = p.in(pos);
        if (pos.showBorder)
            break;
    }

    for (let pos of rects) {

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
}

let $posx = $('#posx'),
    $posy = $('#posy'),
    $width = $('#width'),
    $height = $('#height'),
    $color = $('#color'),
    $background = $('#background'),
    $bold = $('#bold'),
    $italic = $('#italic'),
    $fontSize = $('#fontSize');
$posx.on('input', e => {
    selected.x = parseInt($posx.val().toString(), 10);
    console.log(selected.x);
});

$posy.on('input', e => {
    selected.y = parseInt($posy.val().toString(), 10);
    console.log(selected.x);

});

$width.on('input', e => {
    selected.w = parseInt($width.val().toString(), 10);
    console.log(selected.x);

});
$height.on('input', e => {
    selected.h = parseInt($height.val().toString(), 10);
    console.log(selected.x);

});
$color.change(e => {
    selected.textColor = $color.val();
    console.log($color.val());
})
$background.change(e => {
    selected.background = $background.val();
    console.log($background.val());
})

function fontChange(evt) {
    let fontStyle = '';
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
$fontSize.on('input', evt => {
    selected.fontSize = $fontSize.val() + 'px';
    console.log($fontSize.val());
})

var selected = null;
var dragOffset;
canvas.onmousedown = evt => {
    let p = getMousePos(canvas, evt);
    selected = null;
    for (let rect of rects) {
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
                let style: string = selected.fontStyle;
                $bold.prop('checked', style.indexOf('bold') != -1);
                $italic.prop('checked', style.indexOf('italic') != -1);
                $fontSize.val(parseInt(selected.fontSize));
                console.log(`down ${p}`);
            }
            if (evt.which === 3) {
                console.log(rect.toImage(ctx));
            }
            return;
        }
    }
}
canvas.onmouseup = evt => {
    dragOffset = undefined;

}

function preview() {
    console.log('preview');
    let img: HTMLImageElement;
    let area = (selected == null) ? new Rect(0,0,canvas.width,canvas.height) : selected;
    let w = area.w * 0.5,
        h = area.h * 0.5;
    let temp = Canvas2Image.sliceCanvas(canvas, area.x, area.y, area.w, area.h);
    temp = Canvas2Image.scaleCanvas(temp, w, h);
    Canvas2Image.sliceIntoImage(temp, $('#preview')[0], 0, 0, w, h);

}


setInterval(repaint, 16);


