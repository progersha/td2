var UIButton = function (sprite, x, y, width, height) {
    this.x = x;
    this.y = y;
    this.defX = x;
    this.defY = y;
    this.width = width;
    this.height = height || width;
    this.clicked = false;
    this.hovered = false;
    this.sprite = sprite;
    this.activated = true;
    this.update = function() {
        var wasNotClicked = !this.clicked;
        this.updateStats();
        if (this.clicked && wasNotClicked) {
            this.y = this.defY + 1;
            if (this.handler !== undefined) {
                this.handler();
            }
        }
    };
    this.draw = function() {
        Game.renderEntity(this, null);
    }
    this.updateStats = function(){
        if (intersects(this, Game.mouse)) {
            this.hovered = true;
            if (Game.mouse.clicked) {
                this.clicked = true;
            }
        } else {
            this.hovered = false;
            this.y = this.defY;
        }

        if(this.hovered) {
            this.y = this.defY - 2;
        }

        if (!Game.mouse.down) {
            this.clicked = false;
        }
    };
}

var UIText = function (text, x, y, size, color) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color || "#000";
    this.activated = true;
    this.update = function() {
        if(color)
            return;
        if(Game.cash - parseInt(this.text) >= 0 ) {
            this.color = "#ffe500";
        } else {
            this.color = "#f00";
        }
    };
    this.draw = function() {
        Game.ctx.beginPath();
        Game.ctx.font = this.size + "px Verdana";
        Game.ctx.fillStyle = this.color;
        if(color) {
            Game.ctx.strokeStyle = '#000';
            Game.ctx.strokeText(this.text, this.x, this.y);
        }
        Game.ctx.fillText(this.text, this.x, this.y);
        Game.ctx.closePath();
    };

}

var UITextAlert = function (text) {
    this.text = text;
    this._index = 0;
    this.i = 0;
    this.activated = true;
    this.lifeTime = 5;
    this.update = function() {
        this._index += Game.delta;
        if(this._index > this.lifeTime) {
            this.activated = false;
        }
    };
    this.draw = function() {
        Game.ctx.beginPath();
        Game.ctx.font="24px Verdana";
        if(this._index > this.lifeTime - 2) {
            Game.ctx.fillStyle = "rgba(255, 0, 0, "+( 1 - this.i)+")";
            this.i += .01;
        } else {
            Game.ctx.fillStyle = "rgba(255, 0, 0, 1)";
        }
        Game.ctx.fillText(this.text, Game.width / 2 - this.text.length * 6, Game.height / 2);
        Game.ctx.closePath();
    }
}

var UITowerInfo = function(sprite, x, y) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.width = sprite.size[0];
    this.height = sprite.size[1];
    this.activated = true;

    this.btnUpgrate = new UIButton(
        new Sprite("img/sprite64.png", [0, 486], [90, 36]),
        this.x + this.width - 90 - 5, this.y + this.height - 36 * 2 - 3, 90, 36
    );
    this.btnUpgrate.handler = function() {
        Game.mouse.selection.tower.upgrate();
    };
    this.btnSell = new UIButton(
        new Sprite("img/sprite64.png", [0, 521], [90, 36]),
        this.x + this.width - 90 - 5, this.y + this.height - 36 - 5, 90, 36
    );
    this.btnSell.handler = function() {
        Game.mouse.selection.tower.sell();
    };
    this.draw = function() {
        if(Game.mouse.selection.selected) {
            Game.renderEntity(this);

            this.drawBtn();

            Game.ctx.beginPath();
            Game.ctx.fillStyle = "#fff";
            Game.ctx.font="14px Verdana";
            var tx = this.x + 20,
                ty = this.y + 40,
                lineHeight = 20;
            Game.ctx.fillText("Урон: " + Game.mouse.selection.tower.damage, tx, ty);
            ty += lineHeight;
            Game.ctx.fillText("Дальность: " + Game.mouse.selection.tower.range / Game.cell.width, tx, ty);
            ty += lineHeight;
            Game.ctx.fillText("Скор. стелб.: " + Game.mouse.selection.tower.rate, tx, ty);
            ty += lineHeight;

            Game.ctx.closePath();

            Game.ctx.beginPath();

            Game.ctx.fillText(
                Game.mouse.selection.tower.name + " (Уровень " + (Game.mouse.selection.tower.level+1) + ")",
                this.x + 20, this.y + 15
            );
            Game.ctx.closePath();

        }
    };
    this.update = function() {
        if(Game.mouse.selection.selected) {
            if(Game.mouse.selection.tower.level < Game.mouse.selection.tower.levels.length - 1) {
                this.btnUpgrate.update();
            }
            this.btnSell.update();
        }
    };
    this.drawBtn = function() {
        var t = Game.mouse.selection.tower;
        Game.renderEntity(this.btnSell);
        Game.ctx.beginPath();
        Game.ctx.fillStyle = "#fff";
        Game.ctx.fillText(t.price, this.btnSell.x + this.btnSell.width / 2 - 10, this.btnSell.y + 30);
        Game.ctx.closePath();

        Game.ctx.beginPath();

        if(Game.cash - t.levels[t.level + 1].cost >= 0) {
            Game.ctx.fillStyle = "#fff";
        } else {
            Game.ctx.fillStyle = "#F00";
        }

        Game.ctx.font="14px Verdana";
        if(t.level < t.levels.length - 1) {
            Game.renderEntity(this.btnUpgrate);
            Game.ctx.fillText(t.levels[t.level + 1].cost, this.btnUpgrate.x + this.btnUpgrate.width / 2 - 10, this.btnUpgrate.y + 30);

        } else {
            Game.ctx.fillStyle = "#fff";
            Game.ctx.fillText("Макс. ур", this.btnUpgrate.x + this.btnUpgrate.width / 2 - 30, this.btnUpgrate.y + 20);
        }

        Game.ctx.closePath();

    };
}

var UI = function() {
    var ui = {};

    ui.btnNextWave;

    ui.actor = [];

    ui.towerInfo;
    ui.fps = new UIText('FPS: ', 10, 30, 12, '#fff');

    ui.init = function () {
        initTower();

        ui.btnNextWave = new UIButton(
            new Sprite("img/sprite64.png", [0, 558], [90, 36]),
            Game.cell.width/2, Game.height - 58, 90, 36
        );
        ui.btnNextWave.handler = function() {
            Game.nextWave();
        };
        ui.actor.push(ui.btnNextWave);
    }

    function initTower() {
        var marginLeft = 15,
            y = Game.height - 80;
        var towerArch = new UIButton(
            new Sprite("img/sprite64.png", [0, 416], [68, 68]),
            Game.width - 68 * 4 - 4 * marginLeft, y, 68
        );
        towerArch.handler = function() {
            addTower(Game.defs.gun);
        };

        var towerMortal = new UIButton(
            new Sprite("img/sprite64.png", [68, 416], [68, 68]),
            Game.width - 68 * 3 - 3 * marginLeft, y,  68
        );
        towerMortal.handler = function() {
            addTower(Game.defs.mortal);
        };

        var towerLaser = new UIButton(
            new Sprite("img/sprite64.png", [136, 416], [68, 68]),
            Game.width - 68 * 2 - 2 * marginLeft, y, 68
        );
        towerLaser.handler = function() {
            addTower(Game.defs.laser);
        };

        var towerFreeze = new UIButton(
            new Sprite("img/sprite64.png", [204, 416], [68, 68]),
            Game.width - 68 - marginLeft, y, 68
        );
        towerFreeze.handler = function() {
            addTower(Game.defs.freezing);
        };

        ui.towerInfo = new UITowerInfo(
            new Sprite("img/sprite64.png", [96, 486], [256, 100]),
            Game.width/2 - 256 / 2 + 50, Game.height - 110
        );


        ui.actor.push(towerArch);
        ui.actor.push(towerMortal);
        ui.actor.push(towerLaser);
        ui.actor.push(towerFreeze);
        ui.actor.push(new UIText(Game.defs.gun.levels[0].cost, towerArch.x + 18, towerArch.y + towerArch.height - 8, 14));
        ui.actor.push(new UIText(Game.defs.mortal.levels[0].cost, towerMortal.x + 18, towerMortal.y + towerMortal.height - 8, 14));
        ui.actor.push(new UIText(Game.defs.laser.levels[0].cost, towerLaser.x + 18, towerLaser.y + towerLaser.height - 8, 14));
        ui.actor.push(new UIText(Game.defs.freezing.levels[0].cost, towerFreeze.x + 18, towerFreeze.y + towerFreeze.height - 8, 14));
        ui.actor.push(new UIText('Version: ' + Game.version, 10, 10, 12, '#fff'));
        ui.actor.push(ui.towerInfo);

    };

    function addTower(tower) {
        if(Game.cash - tower.levels[0].cost >= 0 ) {
            Game.mouse.drag = {
                active: true,
                tower: tower
            }
            return true;
        }

        ui.alert("Не хватает золота");
        return false;
    }

    ui.alert = function(text) {
        ui.actor.push(new UITextAlert(text));
    };

    var ind = 0;
    ui.update = function() {
        if(++ind % 30 == 0) {
            ui.fps.text = ~~(1/Game.delta) + 'FPS';

        }

        ui.actor.forEach(function(act, i, a) {
            if(!act.activated) {
                delete a[i];
            } else {
                act.update();
            }
        });
    }

    ui.draw = function() {
        var y = 40;
        if(Game.cash > 99999) {
            Game.ctx.font="20px Verdana";
            y = 38;
        } else {
            Game.ctx.font="22px Verdana";
        }

        Game.ctx.fillStyle = "#d8ff00";
        Game.ctx.fillText("Волна: " + Game.wave, Game.width / 2 - 75, y);
        Game.ctx.fillText(Game.cash, Game.width / 2 - 195, y);
        Game.ctx.fillText(Game.live, Game.width / 2 + 145, y);

        ui.actor.forEach(function(act, i, a) {
            act.draw();
        });
        ui.fps.draw();
    };

    return ui;
}
