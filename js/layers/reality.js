var tickspeed = n(0)
function getAllDimBoost(){
    var mult = n(1)
    mult = mult.mul(buyableEffect("r",4))
    return mult
}
function buyMax(id){
    layers.r.buyables[id].buyMax()
}
/* function getGlyphDelay(){
    return 2
} */

addLayer("r", {
    symbol: "R",
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            adNum: n(0),
        }
    },
    color: "green",
    requires: new Decimal(10), 
    resource: "古物碎片", 
    baseResource: "反物质", 
    baseAmount() { return player.points },
    type: "normal",
    exponent: 1,
    gainMult() {
        mult = new Decimal(1)
        mult = mult.mul(tmpEffectList.relic)
        if (hasMilestone("s", 3)) mult = mult.mul(player.r.resetTime ** 0.55)
        if (inCelChall(11) && player.s.basic.gte(3) || player.s.cc11.gte(3)) mult = mult.mul(player.r.resetTime ** 0.55)

        if(getNerfUnlocked(3)) mult = mult.div(getNerfEffect(3))//减益3:现实过载
        return mult
    },
    gainExp() {
        exp = new Decimal(1)
        exp = exp.add(getCelChallEffect(12,2))//超现实II挑战奖励
        if(getNerfUnlocked(2)) exp = exp.mul(getNerfEffect(2))//减益2:空间膨胀
        return exp
    },
    row: 1,
    hotkeys: [
        { key: "r", description: "R: 进行现实重置", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
    ],
    onPrestige(gain) {
        spawnRandomGlyph()
    },
    doReset(resettingLayer){
        if(layers[resettingLayer].row>this.row){
            layerDataReset(this.layer)
            for (i in player.g.grid) player.g.grid[i] = layers.g.grid.getStartData(i)
            for (i in player.ghost.grid) player.ghost.grid[i] = layers.ghost.grid.getStartData(i)
        }
        clearTmpEffects(true)
        tickspeed = n(0)
        deleteMode = false
        player.r.buyables.a1 = n(0)
        player.r.buyables.a3 = n(0)
        player.points = n(0)
    },
    layerShown() { return hasMilestone("s", 1) },
    tabFormat: {
        "现实": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-text", function () { return `当前古物碎片获取倍率: x${format(layers.r.gainMult())} 获取指数: ^${format(layers.r.gainExp())}` }],
                ["display-text", function () { return `平均古物产量: ${format(getResetGain(this.layer).div(player.r.resetTime))}/s (本次现实已持续 ${formatTime(player.r.resetTime)})` }],
                //["display-text", function () { if(getGlyphDelay() > player.r.resetTime) return `${quickColor("!本次现实还需要"+format(n(getGlyphDelay()-player.r.resetTime))+"秒才能获得符文!","red")}` }],
                "blank",

                ["display-text", "<big>---------- 反物质 ----------</big>"], "blank",
                ["row", [
                    ["column",[["buyable", 1],["buyable","a1"]]], 
                    ["column",[["buyable", 3],["buyable","a3"]]], 
                ]], "blank",
                ["buyable", 4], "blank",

                ["display-text", function () { return hasMilestone("s", 2) ? "<big>----------- 现实 -----------</big>" : "<big>----------- ??? -----------</big>" }], "blank",
                ["buyable", 2], "blank",
            ]
        },
        "符文": {
            content: [
                "main-display",
                //['display-text',function(){return `符文获取间隔: ${formatTime(player.g.glyphTimer)}/${formatTime(getGlyphDelay())}`}],
                "prestige-button",
                ['display-text', function () { return `将符文放置在上方以触发,符文将会从左到右,从上到下依次生效!` }],
                ['display-text', function () {
                    var level = getStartLevel()
                    return `进行现实重置时将获得 ${formatWhole(level.floor())} 级符文(距离下级:${format(level.sub(level.floor()).mul(100))}%)(由暗能量与反物质决定)`
                }
                ],
                //["display-text", function () { if(getGlyphDelay() > player.r.resetTime) return `${quickColor("!本次现实还需要"+format(n(getGlyphDelay()-player.r.resetTime))+"秒才能获得符文!","red")}` }],
                ['display-text', function () { return `如果符文槽未加载成功,请重新打开该界面.` }],
                'blank',
                ['layer-proxy', ['ghost', ['grid']]],
                'blank',
                ['layer-proxy', ['g', ['clickables']]],
                ['layer-proxy', ['g', ['grid']]],
            ],
            unlocked() { return hasMilestone("s", 2) }
        }
    },
    buyables: {
        1: {
            display() { return `<big><big>反物质维度.<br>${formatWhole(player.r.adNum)} (x${format(this.effect())})<br>(购买数:${formatWhole(getBuyableAmount(this.layer, this.id))})<br>价格:${format(this.cost())}</big></big>` },
            cost(x = getBuyableAmount(this.layer, this.id)) {
                var cost = n(100).pow(x.div(10).floor())
                if(hasMilestone("s",4)) cost = cost.pow(2)
                return cost
            },
            effect() {//倍率
                var mult = n(2).pow(player.r.adNum.div(10).floor())
                mult = mult.mul(getAllDimBoost())
                return mult
            },
            buy() {
                if(!this.unlocked()) return
                if(hasUpgrade("c1",11)) return this.buyMax()
                player.r.points = player.r.points.sub(this.cost()).max(0)
                player.r.buyables[this.id] = player.r.buyables[this.id].add(1)
            },
            buyMax(){
                if(!this.unlocked()) return
                let amount = player.r.points.mul(100).max(1).log(100).floor().mul(10)
                if(hasMilestone("s",4)) amount = player.r.points.mul(10000).max(1).log(10000).floor().mul(10)
                player.r.buyables[this.id] = player.r.buyables[this.id].max(amount)
            },
            canAfford() {
                return player.r.points.gte(this.cost())
            },
            unlocked(){
                return hasMilestone("s",1)
            },
            style(){return {
                    "border-radius": "0%",
                    "height": layers.r.buyables["a"+this.id].unlocked()?"150px":"200px" 
            }}
        },
        a1: {
            display() { return `<big><big>用反物质购买(购买数:${formatWhole(getBuyableAmount(this.layer, this.id))})<br>价格:${format(this.cost())}</big></big>` },
            cost(x = getBuyableAmount(this.layer, this.id)) {
                var cost = n(1000).pow(x.div(10).floor())
                return cost
            },
            buy() {
                if(!this.unlocked()) return
                if(hasUpgrade("c1",11)) return this.buyMax()
                player.points = player.points.sub(this.cost()).max(0)
                player.r.buyables.a1 = player.r.buyables.a1.add(1)
            },
            buyMax(){
                if(!this.unlocked()) return
                let amount = player.points.mul(1000).max(1).log(1000).floor().mul(10)
                player.r.buyables[this.id] = player.r.buyables[this.id].max(amount)
            },
            canAfford() {
                return player.points.gte(this.cost())
            },
            unlocked(){
                return hasMilestone("s",4)
            },
            style(){
                return {
                    height: "50px",
                    "border-radius": "0%",
                }
            },
        },
        2: {
            display() { return `<big><big>符文槽解锁.<br>已解锁 ${format(getBuyableAmount(this.layer, this.id))} 个符文槽(总计上限16个)<br>价格:${format(this.cost())}</big></big>` },
            cost(x = getBuyableAmount(this.layer, this.id)) {
                //if(x.gte(9)) x = x.mul(n(1.05).pow(x.sub(8)))
                let cost = n(10).pow(x.add(1).pow(2))
                if(getNerfUnlocked(4)) cost = cost.pow(getNerfEffect(4))
                if(getEquipSlotCount() >= 16) return n('(e^100)1')
                //if(x.gte(9)) cost = expPow(cost,1.125)
                return cost
            },
            buy() {
                if(!this.unlocked()) return
                player.r.points = player.r.points.sub(this.cost()).max(0)
                player.r.buyables[this.id] = player.r.buyables[this.id].add(1)
            },
            canAfford() {
                return player.r.points.gte(this.cost())
            },
            unlocked() { return hasMilestone("s", 2) },
            style(){return {
                "border-radius": "0%",
            }}
        },
        3: {
            display() { return `<big><big>计时频率升级.<br>计时频率: ${format(this.effect())} tick/s<br>效果底数: x${format(this.base(),4)}<br>(影响维度符文以及维度)<br>价格:${format(this.cost())}</big></big>` },
            cost(x = getBuyableAmount(this.layer, this.id)) {
                return n(10).pow(x.add(1))
            },
            base(){
                return n(1.1245)
            },
            effect(x = getBuyableAmount(this.layer, this.id)) {
                x = x.add(getBuyableAmount(this.layer,"a"+this.id))
                return this.base().pow(x)
            },
            buy() {
                if(!this.unlocked()) return
                if(hasUpgrade("c1",12)) return this.buyMax()
                player.r.points = player.r.points.sub(this.cost()).max(0)
                player.r.buyables[this.id] = player.r.buyables[this.id].add(1)
            },
            buyMax(){
                if(!this.unlocked()) return
                let amount = player.r.points.max(1).log(10).floor()
                player.r.buyables[this.id] = player.r.buyables[this.id].max(amount)
            },
            canAfford() {
                return player.r.points.gte(this.cost())
            },
            unlocked() { return hasMilestone("s", 4) },
            style(){return {
                "border-radius": "0%",
                "height": layers.r.buyables["a"+this.id].unlocked()?"150px":"200px"
            }}
        },
        a3: {
            display() { return `<big><big>用反物质购买(购买数:${formatWhole(getBuyableAmount(this.layer, this.id))})<br>价格:${format(this.cost())}</big></big>` },
            cost(x = getBuyableAmount(this.layer, this.id)) {
                return n(10).pow(x.add(2))
            },
            buy() {
                if(!this.unlocked()) return
                if(hasUpgrade("c1",12)) return this.buyMax()
                player.points = player.points.sub(this.cost()).max(0)
                player.r.buyables[this.id] = player.r.buyables[this.id].add(1)
            },
            buyMax(){
                if(!this.unlocked()) return
                let amount = player.points.max(1).log(10).sub(1).floor()
                player.r.buyables[this.id] = player.r.buyables[this.id].max(amount)
            },
            canAfford() {
                return player.points.gte(this.cost())
            },
            unlocked(){
                return hasMilestone("s",4)
            },
            style(){
                return {
                    height: "50px",
                    "border-radius": "0%",
                }
            },
        },
        4: {
            display() {
                return `<big><big>维度提升.<br>已进行维度提升 ${format(getBuyableAmount(this.layer, this.id))} 次<br><br>所有维度(包括维度符文) x${format(this.effect())}(底数:x${format(this.base())})<br><br>要求:${format(this.cost())} 反物质维度<br>购买时强制进行一次现实重置(无收益).</big></big>`},
            cost(x = getBuyableAmount(this.layer, this.id)) {
                let cost = n(20).add(x.mul(20))
                if(hasMilestone('s',6)) cost = cost.add(20).mul(1.75)
                return cost
            },
            base(x = getBuyableAmount(this.layer, this.id)) {
                let base = n(2)
                if(hasMilestone('s',6)) base = base.mul(x.add(4).log(4))
                return base
            },
            effect() {
                return this.base().pow(getBuyableAmount(this.layer, this.id))
            },
            buy() {
                if(!this.unlocked()) return
                doReset(this.layer,true)
                player.r.buyables[this.id] = player.r.buyables[this.id].add(1)
            },
            canAfford() {
                return player.r.adNum.gte(this.cost())
            },
            unlocked() { return hasMilestone("s", 4) },
            style(){return {
                "border-radius": "0%",
            }}
        },
    },
    update(diff) {
        tickspeed = buyableEffect("r", 3)  //更新时间速率
        player.r.adNum = getBuyableAmount("r",1).add(getBuyableAmount("r","a1"))  //更新反物质维度数量
    }
})