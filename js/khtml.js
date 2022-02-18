/** javascript code by Kaloyan KRASTEV
    kaloyansen@gmail.com */


/*
  class kdoc extends HTMLDocument {
  static drop() {
  kalo.getObjClass(this);
  }
  }
*/

const FREQUENCE = 22; //Hz
const SPEEDNORM = 7;//pixels in a frame

let ROOT = window.document.getElementById("root");
const INFO = window.document.createElement("h6");
const SCREEN = window.document.createElement("canvas");
const PAUSE = window.document.createElement("button");
const RELOAD = window.document.createElement("button");

let BALL = [];

class kadv {
    static ctx2d(lm) {
        const cont = lm.getContext("2d", {antialias: true,
                                          alpha: true,
                                          depth: true});
        return cont;
    }

    static clear(lm) {
        const CTX = kadv.ctx2d(lm);
        CTX.clearRect(0, 0, lm.width, lm.height);
    }
    
    static drawCircleText(lm, vec, txt, size) {
        const CTX = kadv.ctx2d(lm);
        CTX.beginPath();
        let c = CTX.arc(vec.x, 50, size / 2, 0, 2 * Math.PI, true);
        CTX.stroke();
        CTX.clip();

        CTX.font = '30px sans-serif';
        CTX.strokeText(txt, vec.x, vec.y);
        CTX.stroke();
        return c;
    }
    
    static drawCircle(scr, lm, sw = 0) {
        const CTX = scr.ctx2d();
        //const CTX = kadv.ctx2d(scr);
        const radius = Math.round(lm.size / 2);
        CTX.beginPath();
        let c = CTX.arc(lm.space.x, lm.space.y, radius, 0, 2 * Math.PI, false);
        CTX.fillStyle = lm.bg;
        CTX.fill();

        CTX.font = `${radius}px sans-serif`;
        CTX.textBaseline = "middle";
        CTX.textAlign = "center";
        CTX.setLineDash([0, 0]);
        CTX.strokeText(lm.txt, lm.space.x, lm.space.y);
        //CTX.stroke();
        CTX.lineWidth = sw;
        CTX.setLineDash([5, 15]);
        CTX.strokeStyle = lm.fg;
        CTX.stroke();
    }

    static drawText(lm, vec, txt, size, fill = 0, stroke = 0, sw = 0) {
        const CTX = kadv.ctx2d(lm);
        CTX.beginPath();
        
        CTX.fillText(txt, vec.x - size / 2, vec.y, 2 * size);
        if (fill) {
            CTX.fillStyle = fill;
            CTX.fill();
        }

        if (stroke) {
            CTX.lineWidth = sw;
            CTX.strokeStyle = stroke;
            CTX.stroke();
        }
    }

}

class kalo {
    static hasardint(min, max) { return Math.round(kalo.hasard(min, max)); }
    static hasard(min, max) {
        let moi = Math.random();
        let delta = max - min;
        let hasa = min + moi * delta;
        return hasa;        
    }

    static get rien() { return 0; }

    static setContent(lm, texte) { lm.innerHTML = texte; }

    static dumProp(lm) {
        let prop;
        let log = "";
        for (prop in lm) {
            let val = lm[prop];
            if (val) log += `${prop}: ${val}, `;
        }
        //console.log(log);
        return log;
    }

    static getCenter(lm) {
        const [l, t, w, h] = kalo.ltwh(lm);
        let center = new Vector2(l + w / 2, t + h / 2);
        return center;
    }
    
    static setColor(lm, color, bgcolor) {
        lm.style.color = color;
        lm.style.borderColor = color;
        lm.style.backgroundColor = bgcolor;
    }
    
    static trans(lm, referenceVector) {
        const [l, t, w, h, r, b] = kalo.ltwhrb(lm);
        let pos = new Vector2(Math.round(l + w / 2), Math.round(t + h / 2));
        return pos.subtract(referenceVector);
    }
    
    static antitrans(lm, referenceVector) {
        const [l, t, w, h, r, b] = kalo.ltwhrb(lm);
        let s = Vector2.add(lm.position, referenceVector);
        s.x -= w / 2;
        s.y -= h / 2;
        return s; 
    }
    
    static updateFin(lm) {
        const [wf, hf] = this.wh(SCREEN);
        const [l, t, w, h] = this.ltwh(lm);
        lm.style.right = wf - l - w + "px";
        lm.style.bottom = hf - t - h + "px";
    }

    static lt(lm) { return [this.val(lm.style.left), this.val(lm.style.top)]; }
    //static wh(lm) { return [lm.style.width, lm.style.height]; }
    static wh(lm) { return [this.val(lm.style.width), this.val(lm.style.height)]; }
    static rb(lm) { return [this.val(lm.style.right), this.val(lm.style.bottom)]; }
    static ltwh(lm) {
        const [l, t] = this.lt(lm);
        const [w, h] = this.wh(lm);
        return [l, t, w, h];
    }

    static ltwhrb(lm) {
        this.updateFin(lm);
        const [l, t] = this.lt(lm);
        const [w, h] = this.wh(lm);
        const [r, b] = this.rb(lm);
        return [l, t, w, h, r, b];
    }

    static val(eleparam, unit = "px", hmm = 10) {
        return parseInt(eleparam.replace(unit, ""), hmm); }

    static isHit(ele1, ele2) {
        let w1 = kalo.val(ele1.style.width);
        let w2 = kalo.val(ele2.style.width);
        let dr = kalo.deltar(ele1, ele2);
        if (dr > (w1 + w2) / 2) return false;
        else return dr;
    }
    
    static deltar(ele1, ele2) {
        const [l1, t1, w1, h1] = kalo.ltwh(ele1);
        const [l2, t2, w2, h2] = kalo.ltwh(ele2);
        let vec1 = new Vector2(l1 + w1 / 2, t1 + h1 / 2);
        let vec2 = new Vector2(l2 + w2 / 2, t2 + h2 / 2);
        return vec1.distance(vec2);
    }

    static randomize(lm, size) {
        let l = kalo.hasardint(0, SCREEN.width - lm.width)
        let t = kalo.hasardint(0, SCREEN.height - lm.height)
        kalo.setPosition(lm, l, t);
    }

    static setPosition(lm, l = 0, t = 0, unit = "px") {
        lm.style.left = l + unit;
        lm.style.top = t + unit;
        lm.style.width = lm.width + unit;
        lm.style.height = lm.height + unit;
    }

    static touche(el, limit) { // element hit the wall or the circonférence c
        
        const [l, t, w, h, r, b] = kalo.ltwhrb(el);
        let free = "";
        let rvec = kalo.trans(el, SCREEN.center);
        if (rvec.length() > limit) free += "c";

        if (l < 0) free += "l";
        if (r < 0) free += "r";
        if (t < 0) free += "t";
        if (b < 0) free += "b";

        //if (free) INFO.inner(el.id + " " + free);
        return free;
    }

    static overlap(lm) {

	let bothobject = { element: 0, distance: 0, intvec: 0 };
	let both = Object.create(bothobject);
	let botharray = [];//storage
        let victime = false;
        let p2;
        let v2 = new Vector2();
	const sortfunc = (a, b) => a.distance < b.distance ? 1 : -1;

        BALL.forEach((p2) => {
            let id = p2.id;
            if (lm.id == id) {
                kalo.rien;
            } else {
               	//p2 = window.document.getElementById(id);
                victime = kalo.isHit(lm, p2);
                if (victime) {
                    both.element = p2;
                    both.distance = 5;//lm.space.subtract(p2.space);
                    both.intvec = 5;//lm.space.divide(p2.space);
                    botharray.push(both);
                } else {
                    kalo.rien;
                }
            }
        });

        const len = botharray.length;
        if (len == 0) return false;

	botharray.sort(sortfunc);
	if (len > 3) console.error(botharray.distance);

        return botharray[0];
    }


    static milli() {
        let mi = new Date().getTime();
        mi -= 1000 * 60 * 60 * 24 * 365 * 51; //from 1970

        return mi;
    }

    static getObjClass(obj) {
        if (obj && obj.constructor && obj.constructor.toString) {
            var arr = obj.constructor.toString().match(/function\s*(\w+)/);
            if (arr && arr.length == 2) { return arr[1]; }
        }

        return NaN;
    }

    static antigravity(x, y, x0, y0, delta) {
        const dx = x - x0;
        const dy = y - y0;
        //const r = (x ** 2 + y ** 2) ** (1 / 2);
        //const r0 = (x0 ** 2 + y0 ** 2) ** (1 / 2);
        //const dr = r - r0; 
        //const dr = (dx ** 2 + dy ** 2) ** (1 / 2);
        //const rval = delta / dr ** 2 + r0;
        const xVal = delta / dx - x0;
        const yVal = delta / dy - y0;
        return new Vector2(xVal / x, yVal / y);
    }
    
    static attraction(r, c, delta) {
        let d = Vector2.subtract(r, c);
        let length = d.length();
        //d.multiplyScalar(0.99);
        d.add(c);
        d.multiplyScalar(0.99);


        d.multiply(r.updown());
        return d;
        /*
          const dx = x - c.x;
          const dy = y - c.y;
          const xVal = dx * delta + c.x;
          const yVal = dy * delta + c.y;
          return new Vector2(xVal / x, yVal / y);
        */
    }

    static welcome() {
        return `
===========================================================
cgijsjcgijsjcgijsjcgijsjcgijsjcgijsjcgijsjcgijsjcgijsjcgiph
Gi    jsjp    giCGIjsj   ijsjCGip    cgijsjcgiCG      jsjcg
Icg    CG    cgiCGIjsj     ijsjCgi    cgijsjcgi          Cp
Cg    C    jsjCGIjsj       pcgiph    jsjcgiCG     CG     hp
G       jsjcgijsjc    g    jsjcg    cgijsjCG    cgiC    jsj
Ic        jsjCGIph    jsj    CGip    jsjcgiCG    jsjC    hp
Cgi    C    cgijsj             Gip    jsjcgiCG     CG     p
Gi    CGI    Gip    gijsjcg    pC            G          jsj
I    jsjp    c    jsjcgijsj    C            hpC      cgijsj
jsjcgijsjcgijsjcgijsjcgijsjcgijsjcgijsjcgijsjcgijsjcgiphpcg
===========================================================
                                                           
             *** common gateway interface ***              
                       in javascript                          
                            by                             
                      Kaloyan KRASTEV                      
                   kaloyansen@gmail.com                    
                https://freeshell.de/morla                

===========================================================
`;
    }

}



/*class lmnt_deprecated { //extends HTMLAnchorElement {
  constructor(tagID, tagElement = "div", tagX = 0, tagY = 0, tagW = 100, tagH = 100) {
  if (tagID == "texte") {
  let tnode = window.document.createTextNode(tagElement);
  this.htmlEle = this.addElement("t" + kalo.milli(), "div");
  this.htmlEle.appendChild(tnode);                
  } else if (tagID == "fichier") {
  let req = new XMLHttpRequest();
  let fileName = tagElement;
  req.open("GET", fileName);
  this.htmlEle = this.addElement("f" + fileName, "div");
  req.onload = function() {
  let message = req.status;
  if (message == 200) message = this.responseText;
  elem.innerHTML = message;
  }
  req.send();
  } else {
  this.htmlEle = this.addElement(tagID, tagElement);
  }
  
  kalo.setPosition(this.htmlEle, tagX, tagY, tagW, tagH);
  SCREEN.appendChild(this.htmlEle);

  }

  get() { return this.htmlEle; }
  //remove() { this.lmnta.removeElement(`this.htmlObj.nextElement`); }
  //removeElement(tagID) { this.htmlEle.remove(); }
  
  addElement(tagID, tagElement = "div") {
  const ele = window.document.createElement(tagElement);
  ele.id = tagID;
  // in css [id^="d"]
  //ele.style.position = "absolute";
  SCREEN.elementList.unshift(ele.id);
  return ele;
  }

  }
*/


class particle {
    constructor(size = 100, bgcolor = "green", fgcolor = "white") {

        let ampl = 15;
        this.fish = window.document.createElement("canvas");
        this.fish.id = `ball${++SCREEN.nextElement}`;
        this.fish.txt = this.fish.id;

        //SCREEN.elementList.unshift(this.fish.id);
        SCREEN.appendChild(this.fish);
        BALL.unshift(this.fish);

        this.fish.speed = new Vector2(kalo.hasardint(-1 * ampl, ampl),
                                      kalo.hasardint(-1 * ampl, ampl));
        this.fish.position = new Vector2();
        this.fish.space = new Vector2();
        this.fish.leftop = new Vector2();
        this.fish.spinmax = 66;
        this.fish.spin = Math.round(kalo.hasardint(-1 * this.fish.spinmax, this.fish.spinmax));
        this.fish.fg = fgcolor;
        this.fish.bg = bgcolor;
        this.fish.size = size;
        this.fish.width = size;
        this.fish.height = size;
        
        kalo.randomize(this.fish);
        while (kalo.overlap(this.fish)) kalo.randomize(this.fish);

        this.fish.ctx2d = function() { return kadv.ctx2d(this.fish); }

        this.fish.href = "#";
        this.fish.onmouseover = function(event) { event.target.style.borderColor = "yellow"; };
        this.fish.onmouseout = function(event) { event.target.style.borderColor = "black"; };
        this.fish.onclick = function(event) { event.target.leftop.divide(2); };

    }

    remove() { this.fish.remove(); }

    /*
    addElement(tagID, tagElement = "div") {
        const lm = window.document.createElement(tagElement);
        lm.id = tagID;
        //SCREEN.elementList.unshift(lm.id);
        return lm;
    }
    */
    affiche(event) {
        let ecc = event.charCode;
        let back = String.fromCharCode(ecc);
        return [e.offsetX, e.offsetY, back];
    }

    myMove() {
        //let outerintervalenght = 156;

        //console.log("myMove " + kalo.milli());
        //let id = null;

        this.download();            
        //let winterval = window.setInterval(() => {            setFrame(this);        }, intervalenght);

        let started = false;
        function play(what) {
            let winter;
            if (!started) {
                started = true;
                winter = setInterval(() => setFrame(what), Math.round(1000 / FREQUENCE));
            }
            return winter;
        }

        let winterval = play(this);
        //let winterval = window.setInterval(() => setFrame(this), Math.round(1000 / FREQUENCE));
        
        
        //id = setInterval(setFrame(obj, this.frame), outerintervalenght);
        
        const perturbation = 100;
        let victime = 0;

        let deg = Math.round(kalo.hasardint(0, 360));;

        let fgcolor = this.fish.fg;
        let bgcolor = this.fish.bg;
        kalo.setColor(this.fish, fgcolor, bgcolor);
        
        function setFrame(what) {            
            let lm = what.fish;//l'objet de type element
            //let fr = what.frame;//le cadre
            
            let normr = Math.round(SPEEDNORM / lm.speed.length());

            lm.leftop.add(lm.speed.multiplyScalar(normr));

            if (lm.speed.x == 0) lm.speed.x = 1;
            if (lm.speed.y == 0) lm.speed.y = 1;
            if (lm.speed.x == 4 & lm.speed.y == 1) lm.speed.y = 2;
            //lm.leftop.x += lm.leftop.x / perturbation;
            //lm.leftop.y += lm.leftop.y / perturbation;
            
            //let attr = kalo.attraction(lm.space, SCREEN.center, 0.99);

            //lm.leftop.multiply(attr);

            //what.teleport();
            what.uploadLeftop();
            what.reflexion();

            
            what.download();
            kadv.drawCircle(lm.space.x, lm.space.y, 10, lm.bg);
            fgcolor = lm.fg;
            bgcolor = lm.bg;
            
            //let victory = fr.overlap(lm);
            let victory = kalo.overlap(lm);
            let victime = 0;//HTMLAnchorElement();
            let distance = 0;
            let intvec = 0;
            if (victory) {
		victime = victory.element;
		distance = victory.distance;
		intvec = victory.intvec;
                bgcolor = "red";
                if (lm.spin < 0) lm.spin = kalo.hasardint(0, lm.spinmax);
                else lm.spin = kalo.hasardint(-1 * lm.spinmax, 0);
                victime.style.backgroundColor = "orange";
                victime.style.color = "white";
                //let dot = Vector2.dot(lm.speed, victime.speed);
                if (lm.speed === victime.speed) {
                    bgcolor = "black";
                    //lm.speed = intvec.divide(distance);
                    if (lm.leftop === victime.leftop) {
	                bgcolor = "white";
                        //victime.speed = lm.speed.invert();
                        //lm.speed.x = -1 * lm.speed.x;
                        //if (dot < 0.001) victime.speed = lm.speed.invert();
                    }
                }

                [lm.speed, victime.speed] = [victime.speed, lm.speed];
            }

            //let timeo = window.setTimeout(() => { setFishColor(what, fgcolor, bgcolor); }, 6000);
            //function setFishColor(that, fg, bg) { kalo.setColor(lm, fg, bg);}
            kalo.setColor(lm, fgcolor, bgcolor);

            //lm.innerHTML = ~~(6 * Math.random() + 1);
            deg += lm.spin;
            lm.style.webkitTransform = "rotate(" + deg + "deg)";
            lm.innerHTML = lm.id;
            //lm.innerHTML = "oo";
            //lm.innerHTML = Math.round(lm.speed.length());
            //lm.innerHTML = lm.speed.toStringInt();
            //lm.innerHTML = lm.style.width + lm.style.height;

        }
        return winterval;
    }




    reflexwall(h, sign, trig, after) {
        if (trig === "y") this.fish.speed.y = after;
        else if (trig === "x") this.fish.speed.x = after;
        else window.document.write("reflexwall: this is not expected to happen");
        this.fish.style.borderRadius = "100%";
        return h.replace(sign, "");
    }
    
    reflexion() {

        let radcan = Math.round((SCREEN.width + SCREEN.height) / 5);
        //kadv.drawCircle(SCREEN.width / 2, SCREEN.height / 2, radcan, "red");
        let hit = kalo.touche(this.fish, radcan);
        let hitcp = hit;
        if (hit.includes("c")) {/* colonel does not know yet how to change
                                   objects direction when objects beyond
                                   a circonférance */
            this.fish.style.borderStyle = "double";
            this.download();
            //this.fish.position.invert();
            this.uploadPosition();
            
            

        } else {
            this.fish.style.borderStyle = "dotted";
        }

        if (hit.includes("l")) hit = this.reflexwall(hit, "l", "x", Math.abs(this.fish.speed.x));
        if (hit.includes("t")) hit = this.reflexwall(hit, "t", "y", Math.abs(this.fish.speed.y));
        if (hit.includes("r")) hit = this.reflexwall(hit, "r", "x", -Math.abs(this.fish.speed.x));
        if (hit.includes("b")) hit = this.reflexwall(hit, "b", "y", -Math.abs(this.fish.speed.y));

        if (hit) {
            if (hitcp.length > 1) {
                //console.error("\nreflexion() {\n", hitcp, hit, "\n}\n");
            } else {
                kalo.rien;
            }
        } else {
            kalo.rien;
        }
    }

    teleport() {

        let hit = kalo.touche(this.fish);
	if (!hit) return;

	this.download();        
        let hitcp = hit;
        if (hit.includes("t")) {
            this.fish.space.y += SCREEN.height ;
            hit = hit.replace("t", "");
        }
        if (hit.includes("r")) {
            this.fish.space.x -= SCREEN.width ;
            hit = hit.replace("r", "");
        }                
        if (hit.includes("b")) {
            this.fish.space.y -= SCREEN.height ;
            hit = hit.replace("b", "");
        }
        if (hit.includes("l")) {
            this.fish.space.x += SCREEN.width ;
            hit = hit.replace("l", "");
        }
        if (hit) {
            if (hitcp.length > 1) {
                console.error("\nteleport() {\n", hitcp, hit, "\n}\n");
            } else {
                kalo.rien;
            }
        } else {
            kalo.rien;
        }
        this.uploadSpace();
    }


    download() {
        const [l, t, w, h] = kalo.ltwh(this.fish);
        this.fish.leftop.x = l;
        this.fish.leftop.y = t;
        this.fish.space.x = Math.round(l + w / 2);
        this.fish.space.y = Math.round(t + h / 2);
        this.fish.position = kalo.trans(this.fish, SCREEN.center);
    }

    uploadVector(vec, unit = "px") { this.upload(vec.x, vec.y, unit); }
    uploadPosition(unit = "px") { this.uploadVector(kalo.antitrans(this.fish, SCREEN.center), unit); }
    uploadLeftop(unit = "px") {
        this.uploadVector(this.fish.leftop, unit);
    }
    upload(left, top, unit = "px") {
        this.fish.style.left = Math.round(left) + unit;
        this.fish.style.top = Math.round(top) + unit;
    }

    uploadSpace(unit = "px") {
        const [w, h] = kalo.wh(this.fish);
        this.upload(this.fish.space.x - w / 2, this.fish.space.y - h / 2, unit);
    }       


}



class ecran {// html class
    constructor(width = 800, height = 600, numOfBalls, ballSize) {
        ecran.setInfo(INFO, "info");
        ecran.setButton(PAUSE, "pause", "10px", "p not implemented");
        ecran.setButton(RELOAD, "reload", "40px", "r not implemented");

        RELOAD.onclick = () => ecran.reload(numOfBalls);
        PAUSE.onclick = () => ecran.toggle();

        INFO.inner = function(txt) { kalo.setContent(this, txt);};
        PAUSE.inner = function(txt) { kalo.setContent(this, txt);};
        RELOAD.inner = function(txt) { kalo.setContent(this, txt);};

        ecran.setScreen("ecran", width, height);
        SCREEN.nextElement = 0;
        SCREEN.lastElement = null;
        SCREEN.center = new Vector2(Math.round(width / 2), Math.round(height / 2));
        SCREEN.get = function(i) {
            let name = ecran.get(i);
            return window.document.getElementById(name);
        }

        SCREEN.ctx2d = function() { return kadv.ctx2d(SCREEN); }

        if (ROOT) kalo.rien;
        else ROOT = ecran.getRoot();
        ROOT.append(INFO, SCREEN, PAUSE, RELOAD);
        ecran.started = false;
        ecran.winterval = 0;
        ecran.arret = false;
        ecran.numOfBalls = numOfBalls;
        ecran.ballSize = ballSize;
        ecran.addBalls(numOfBalls);
        ecran.play();

    }

    static removeBalls() {
        let idx = 0;
        while (BALL.length > idx++) BALL[idx - 1].remove();
        BALL = [];
        SCREEN.nextElement = 0;
    }
    
    static reload(num) {
        ecran.stop();
        ecran.addBalls(num);
        ecran.arret = false;
        ecran.play();
    }
        
    static addBalls(num) {
        ecran.removeBalls();
        let fg = ["black", "black", "white", "white", "black", "black", "black", "cyan", "white", "white", "white"];
        let bg = ["magenta", "cyan", "brown", "green", "magenta", "cyan", "white", "gray", "brown", "black", "green"];

        let idx = 0;
        let arr = [];
        while (num > idx++) arr[idx - 1] = new particle(ecran.ballSize,
                                                        bg[idx - 1],
                                                        fg[idx - 1]);
    }
    
    static stop() { ecran.arret = true; }    
    static toggle() {
        if (ecran.arret) {
            ecran.arret = false;
            ecran.started = false;
            ecran.play();
            PAUSE.inner("pause");
        } else {
            ecran.stop();
            PAUSE.inner("resume");
        }
    }

    static play() {

        if (!ecran.started) {
            ecran.started = true;
            ecran.winterval = setInterval(() => {
                kadv.clear(SCREEN);
                BALL.map(function(lm) {
                    kadv.drawCircle(SCREEN, lm, 3);
                    lm.txt = lm.id;
                });
                BALL.map(function(lm) {
                    ecran.downlm(lm);
                    ecran.animate(lm);
                });
                
                if (ecran.arret) clearInterval(ecran.winterval);
            }, Math.round(1000 / FREQUENCE));
        } else {;}
        return ecran.winter;

    }
    
    static animate(lm) {
        ecran.tick(lm);
        //requestAnimationFrame(ecran.animate(lm));
    }
    
    static tick(lm) {
        let normr = Math.round(SPEEDNORM / lm.speed.length());
        lm.speed.multiplyScalar(normr);
        lm.speed.round();
        lm.leftop.add(lm.speed);
        ecran.uplmLeftop(lm);
        ecran.reflexion(lm);
        ecran.downlm(lm);

        let victory = kalo.overlap(lm, lm.size);
        let victime = 0;//HTMLAnchorElement();
        let distance = 0;
        let intvec = 0;
        if (victory) {
	    victime = victory.element;
	    distance = victory.distance;
	    intvec = victory.intvec;
            lm.txt = "hit";
            if (lm.spin < 0) lm.spin = kalo.hasardint(0, lm.spinmax);
            else lm.spin = kalo.hasardint(-1 * lm.spinmax, 0);
            //victime.bg = "orange";
            //victime.fg = "white";
            if (lm.speed === victime.speed) {
                //lm.bg = "black";
                if (lm.leftop === victime.leftop) {
	            //lm.bg = "white";
                }
            }

            let dist = Vector2.subtract(lm.space, victime.space);
            let anspeed = Vector2.angle(lm.speed, victime.speed);
            let ansd = Vector2.angle(lm.speed, dist);
            let angle = Vector2.angle(lm.space, dist);
            if (anspeed < Math.PI / 2) lm.speed.rotate(2 * angle);
            else lm.speed.rotate(-2 * angle);
            //lm.speed.rotate(-2 * angle);
            
            let norm = anspeed / Math.PI * victime.speed.length();
            norm = victime.speed.length() / lm.speed.length();
            //console.log(norm);

            
            if (norm < 1 || norm == NaN || norm == Infinity) {
                ;
            } else {
                console.log(norm);
                lm.speed.multiplyScalar(norm);
                lm.speed.round();
            }
            //[lm.speed, victime.speed] = [victime.speed, lm.speed];
        }

        ecran.observe();

    }
    
    static observe() {
        let info = "";
        let idx = 0;
        while (BALL.length > idx) {
            let b = BALL[idx ++];
            info += b.bg + b.speed + b.leftop + b.space + b.position + "<br>";
        }
        INFO.inner(info);
    }
    
    static children() { return BALL; }
    static child(i) { return BALL[i]; }
    static getRoot() { return window.document.getElementById("root"); }

    static setScreen(id, w, h) {
        SCREEN.id = id;
        SCREEN.style.width = w + "px";
        SCREEN.style.height = h + "px";
        SCREEN.width = w;
        SCREEN.height = h;
    }
    
    static setButton(lm, id, top, hint) {
        lm.id = lm.innerHTML = id;
        lm.style.top = top;
        lm.style.right = "60px";
        lm.setAttribute("title", hint);
        return lm;
    }
    
    static setInfo(lm, id) {
        lm.id = id;
        lm.style.position = "absolute";
        lm.style.width = "90vw";
        lm.style.top = "0px";
        lm.style.margin = 0;
        //lm.style.height = "50px";
        lm.style.color = "white";
        lm.style.textAlign = "center";
        
        lm.style.border = 0;//"double 2px white";
        lm.style.borderRadius = "10%";
        lm.innerHTML = "wait";
        return lm;
    }
    
    static getLast(lm) {
        if (lm.lastElement) {;} else {
            console.error(`getLast() not found`);
        }

        return lm.lastElement;
    }

    static downlm(lm) {
        const [l, t, w, h] = kalo.ltwh(lm);
        lm.leftop.x = l;
        lm.leftop.y = t;
        lm.space.x = Math.round(l + w / 2);
        lm.space.y = Math.round(t + h / 2);
        lm.position = kalo.trans(lm, SCREEN.center);
    }

    static uplmVector(lm, vec, unit = "px") { ecran.uplm(lm, vec.x, vec.y, unit); }
    static uplmPosition(lm, unit = "px") { ecran.uplmVector(lm, kalo.antitrans(lm, SCREEN.center), unit); }
    static uplmLeftop(lm, unit = "px") {
        ecran.uplmVector(lm, lm.leftop, unit);
    }
    static uplm(lm, left, top, unit = "px") {
        lm.style.left = Math.round(left) + unit;
        lm.style.top = Math.round(top) + unit;
    }

    static uplmSpace(lm, unit = "px") {
        const [w, h] = kalo.wh(lm);
        ecran.uplm(lm, lm.space.x - w / 2, lm.space.y - h / 2, unit);
    }       

    static reflexwall(lm, h, sign, trig, after) {
        if (trig === "y") lm.speed.y = after;
        else if (trig === "x") lm.speed.x = after;
        else window.document.write("reflexwall: this is not expected to happen");
        lm.txt = "";
        return h.replace(sign, "");
    }

    static reflexion(lm) {
        let radcan = Math.round((SCREEN.width + SCREEN.height) / 5);
        let hit = kalo.touche(lm, radcan);
        let hitcp = hit;
        if (hit.includes("c")) {/* colonel does not know yet how to change
                                   objects direction when objects beyond
                                   a circonférance */
            lm.style.borderStyle = "double";
            ecran.downlm(lm);
            ecran.uplmPosition(lm);
        } else {
            lm.style.borderStyle = "dotted";
        }

        if (hit.includes("l")) hit = ecran.reflexwall(lm, hit, "l", "x", Math.abs(lm.speed.x));
        if (hit.includes("t")) hit = ecran.reflexwall(lm, hit, "t", "y", Math.abs(lm.speed.y));
        if (hit.includes("r")) hit = ecran.reflexwall(lm, hit, "r", "x", -Math.abs(lm.speed.x));
        if (hit.includes("b")) hit = ecran.reflexwall(lm, hit, "b", "y", -Math.abs(lm.speed.y));

    }    
}
