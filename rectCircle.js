// rectCircle.js
class Circle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
    }
    collidesRect(rect) {
        // Colisión círculo-rectángulo
        const distX = Math.abs(this.x - rect.x - rect.w / 2);
        const distY = Math.abs(this.y - rect.y - rect.h / 2);
        if (distX > (rect.w / 2 + this.r)) return false;
        if (distY > (rect.h / 2 + this.r)) return false;
        if (distX <= (rect.w / 2)) return true;
        if (distY <= (rect.h / 2)) return true;
        const dx = distX - rect.w / 2;
        const dy = distY - rect.h / 2;
        return (dx * dx + dy * dy <= this.r * this.r);
    }
}

class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.w, this.h);
        ctx.fill();
    }
    collidesCircle(circle) {
        return circle.collidesRect(this);
    }
}

window.Circle = Circle;
window.Rectangle = Rectangle;
window.RectCircleUtils = { Circle, Rectangle };
