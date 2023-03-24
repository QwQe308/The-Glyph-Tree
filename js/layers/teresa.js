function getPerkPoints() {
    var pp = player.s.basic.pow(2).div(5)
    pp = pp.add(player.s.cc11.pow(2).div(5))
    return pp
}
function checkPerkReq(req) {
    for (i in req) {
        if (!hasUpgrade("c1", req[i])) return false
    }
    return true
}
function spawnPerkReqInfo(req) {
    if (!req.length) return ``
    let str = quickColor(`前置特权: `, "blue")
    for (i in req) {
        str += quickColor(req[i], hasUpgrade("c1", req[i]) ? "blue" : "red")
    }
    return str
}

addLayer("c1", {
    symbol: "Ϟ", // This appears on the layer's node. Default is the id with the first letter capitalized
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            used: n(0),
        }
    },
    color: "#5555FF",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "专精点", // Name of prestige currency
    //effectDescription(){return `暗能量产量: +${format(getDEProc())}/s.`},
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    base: 2,
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    layerShown() { return player.s.best.gte(5) },
    gainPP() {
        let total = getPerkPoints()
        player.c1.total = total.floor()
        player.c1.points = player.c1.total.sub(player.c1.used)
    },
    tabFormat: {
        "专精": {
            content: [
                "main-display",
                "blank",
                ["clickable","reset"],
                "upgrades"
            ],
        },
        "挑战": {
            content: [
                "main-display",
                "blank",
                ["clickable","cc11"],
                ["clickable","cc12"],
            ],
        }
    },
    upgrades: {
        11: {
            description(){return `${this.id}: "反物质维度"购买时,一次性购买到最大值而非一个,且不消耗资源.`},
            cost: n(2),
            canAfford() { return player.c1.points.gte(this.cost)},
            pay() { player.c1.points = player.c1.points.sub(this.cost); player.c1.used = player.c1.used.add(this.cost) },
            style(){return {height:"120px",width:"180px","font-size":"12px","border-radius": "0%"}},
        },
        12: {
            description(){return `${this.id}: "计时频率升级"购买时,一次性购买到最大值而非一个,且不消耗资源.`},
            cost: n(2),
            canAfford() { return player.c1.points.gte(this.cost)},
            pay() { player.c1.points = player.c1.points.sub(this.cost); player.c1.used = player.c1.used.add(this.cost) },
            style(){return {height:"120px",width:"180px","font-size":"12px","border-radius": "0%",}},
        },
        13: {
            description(){return `${this.id}: 增加3个符文仓库槽.允许你长按1秒删除按钮以清除所有仓库中的符文.<br>注意:重置该升级将会导致对应槽位符文被隐藏!`},
            cost: n(2),
            canAfford() { return player.c1.points.gte(this.cost)},
            pay() { player.c1.points = player.c1.points.sub(this.cost); player.c1.used = player.c1.used.add(this.cost) },
            style(){return {height:"120px",width:"180px","font-size":"12px","border-radius": "0%",}},
        },
        21: {
            description(){return `${this.id}: 自动以反物质购买"反物质维度".(无消耗)<br><i>${spawnPerkReqInfo(this.req)}</i>`},
            cost: n(2),
            req: [11],
            canAfford() { return player.c1.points.gte(this.cost) && checkPerkReq(this.req) },
            pay() { player.c1.points = player.c1.points.sub(this.cost); player.c1.used = player.c1.used.add(this.cost) },
            style(){return {height:"120px",width:"180px","font-size":"12px","border-radius": "0%",}},
        },
        22: {
            description(){return `${this.id}: 自动以反物质购买"计时频率升级".(无消耗)<br><i>${spawnPerkReqInfo(this.req)}</i>`},
            cost: n(2),
            req: [12],
            canAfford() { return player.c1.points.gte(this.cost) && checkPerkReq(this.req) },
            pay() { player.c1.points = player.c1.points.sub(this.cost); player.c1.used = player.c1.used.add(this.cost) },
            style(){return {height:"120px",width:"180px","font-size":"12px","border-radius": "0%",}},
        },
        23: {
            description(){return `${this.id}: 增加4个符文仓库槽.<br><i>${spawnPerkReqInfo(this.req)}</i>`},
            cost: n(2),
            req: [13],
            canAfford() { return player.c1.points.gte(this.cost) && checkPerkReq(this.req) },
            pay() { player.c1.points = player.c1.points.sub(this.cost); player.c1.used = player.c1.used.add(this.cost) },
            style(){return {height:"120px",width:"180px","font-size":"12px","border-radius": "0%",}},
        },
    },
    update(diff){
        if(hasUpgrade("c1",21)) buyMax("a1")
        if(hasUpgrade("c1",22)) buyMax("a3")
    },
    clickables: {
        reset:{
            display() {return `<big><big>重置专精</big></big>`},
            onClick() {
                player.c1.upgrades = []
                player.c1.used = n(0)
            },
            canClick: true,
        },
        cc11: {
            display() {
                return `<b><big>${inCelChall(11)?"退出":"进入"}天体挑战[超现实].</big></b>
                挑战外有关Teresa的特权*将会保留*;
                同时,挑战内再次获得这些特权*仍然生效*(这意味着效果触发两次).
                "充能符文槽"关于奇点的等级加成改为基于挑战内外的奇点数的平均数.

                <i>(天体挑战内奇点数不得超过挑战外)</i>
                进入/退出该天体挑战将会记录你当前的奇点数并暂时清零,在进入/退出时会返还.
                ${quickColor(`奖励: 挑战内有关Teresa的特权加成将会被保留(减益除外,Teresa重建I的充能槽效果加成以挑战奇点计数),并且挑战内可以获得特权点.<br>(当前已达到奇点数:${formatWhole(player.s.cc11)})`, "lime")}`
            },
            onClick() {
                if(!confirm("你确定进入/退出天体挑战吗?这将重置本次奇点,并将奇点数暂时归零!")) return
                if (player.s.chall == "cc11") {
                    player.s.de = n(0)
                    doReset("s", true)
                    player.s.milestones = []
                    player.s.points = player.s.basic
                    player.s.chall = "basic"
                } else {
                    player.s.de = n(0)
                    doReset("s", true)
                    player.s.milestones = []
                    player.s.points = player.s.cc11
                    player.s.chall = "cc11"
                }
            },
            style(){return {height:"200px",width:"600px","font-size":"12px","border-radius": "0%","background-color":inCelChall(11)?"purple":"#5555FF"}},
            canClick: true,
        },
        cc12: {
            display() {
                return `<b><big>${inCelChall(12)?"退出":"进入"}天体挑战[超现实II].</big></b>
                你需要6奇点以进入该挑战.
                挑战外有关现实的 *惩罚* 将会保留;
                同时,挑战内再次获得这些特权*仍然生效*(这意味着效果触发两次).
                
                <big><b>在挑战中,你的古物碎片也计入暗物质获取公式.<b></big>

                <i>(天体挑战内奇点数不得超过挑战外)</i>
                进入/退出该天体挑战将会记录你当前的奇点数并暂时清零,在进入/退出时会返还.
                ${quickColor(`奖励: 对于挑战中每个完成的奇点,符文仓库槽+1,古物的获取指数+0.025.<br>(当前已达到奇点数:${formatWhole(player.s.cc12)})`, "lime")}`
            },
            effect1(){return player.s.cc12},//仓库槽加成
            effect2(){return player.s.cc12.mul(0.025)},//古物产量加成
            onClick() {
                if(!confirm("你确定进入/退出天体挑战吗?这将重置本次奇点,并将奇点数暂时归零!")) return
                if (player.s.chall == "cc12") {
                    player.s.de = n(0)
                    doReset("s", true)
                    player.s.milestones = []
                    player.s.points = player.s.basic
                    player.s.chall = "basic"
                } else {
                    player.s.de = n(0)
                    doReset("s", true)
                    player.s.milestones = []
                    player.s.points = player.s.cc12
                    player.s.chall = "cc12"
                }
            },
            unlocked(){return player.s.cc11.gte(5)},
            style(){return {height:"200px",width:"600px","font-size":"12px","border-radius": "0%","background-color":inCelChall(12)?"purple":"#5555FF"}},
            canClick(){return player.s.basic.gte(6)},
        },
    },
})