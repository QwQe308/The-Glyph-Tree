function getDEProc() {
    var proc = player.points.max(1).log10().pow(2)
    if (nerf[1].unlocked()) proc = proc.div(nerf[1].effect())
    return proc
}

function getSReq() {
    return n(2).pow(player.s.points).mul(10)
}

function getNerfUnlocked(id) { return nerf[id].unlocked() }
function getNerfEffect(id) { return nerf[id].effect() }
function inCelChall(chall) { return player.s.chall == chall }
var nerf = {
    1: {
        name: "能量衰竭(变数)",
        description() { return `暗能量获取速度/${format(this.effect())}. - [S1]` },
        effect() { return player.s.points.add(1).pow(4).mul(n(1.1).pow(player.s.points)) },
        unlocked() { return hasMilestone("s", 1) },
    },
    2: {
        name: "空间膨胀(恒定)",
        description() { return `古物碎片获取^${format(this.effect())}. - [S3]` },
        effect() {
            if (inCelChall("cc1")) {
                if (!hasMilestone("s", 3)) return n(0.55)
                return n(0.55 ** 2)
            }
            return n(0.55)
        },
        unlocked() {
            return hasMilestone("s", 3) || (inCelChall("cc1") && player.s.best.gte(3))
        },
    },
    3: {
        name: "现实过载(变数)",
        description() { return `古物碎片获取/${format(this.effect())}.对于每个装有符文的符文槽,该效果都会再次提升. - [S5]` },
        effect() {
            let nerf = player.s.points.add(1).pow(player.s.points.div(2).max(3).add(getActiveGlyphCount()*1.5))
            if(inCelChall("cc1") && hasMilestone("s",5)) nerf = nerf.pow(2)
            return nerf
        },
        unlocked() { return hasMilestone("s", 5) || (inCelChall("cc1") && player.s.best.gte(5))},
    },
}
function spawnNerfInfo() {
    let result = []
    result.push(["display-text", function () {
        return player.s.best.gte(1) ? "<i>变数惩罚</i>: 惩罚基础效果随奇点而增长." : ""
    }])
    result.push(["display-text", function () {
        return player.s.best.gte(3) ? "<i>恒定惩罚</i>: 惩罚基础效果恒定不变." : ""
    }])
    result.push("blank")
    result.push("blank")
    for (i in nerf) {
        result.push(["display-text", new Function(`if(nerf[${i}].unlocked()){return "<big><i>${nerf[i].name}</i> --- " + nerf[${i}].description() + "</big>"}else{return "<big>??? ???</big>"}`)])
        result.push("blank")
    }
    return result
}

addLayer("s", {
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            de: n(0),

            chall: "basic",

            basic: n(0),
            cc1: n(0),
        }
    },
    color: "gold",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "奇点", // Name of prestige currency
    baseResource: "暗能量", // Name of resource prestige is based on
    baseAmount() { return player.s.de }, // Get the current amount of baseResource
    //effectDescription(){return `暗能量产量: +${format(getDEProc())}/s.`},
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    base: 2,
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    /* hotkeys: [
        {key: "s", description: "S: 进行奇点重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ], */
    layerShown() { return true },
    update(diff) {
        if (!player.s.chall) player.s.chall = "basic"
        player.s.de = (player.s.chall !== "basic" && player.s.points.gte(player.s.basic) || player.s.points.gt(5)) ? n(0) : player.s.de.add(getDEProc().mul(diff))
        player.s.best = player.s.best.max(player.s.points)
        player.s[player.s.chall] = player.s[player.s.chall].max(player.s.points)
    },
    onPrestige() {
        player.s.de = n(0)
    },
    milestones: {
        1: {
            requirementDescription: `1奇点 - 重建现实(环节I)`,
            effectDescription: `
            1.${quickColor(`触发变数惩罚: 能量衰竭`, "red")}.<br>
            2.解锁现实.<br>
            3.解锁升级"反物质维度".
            `,
            done() { return player.s.points.gte(1) },
            style() {
                return {
                    width: "750px",
                    height: "100px"
                }
            },
        },
        2: {
            requirementDescription: `2奇点 - 重建符文(环节I)`,
            effectDescription: `
            1.解锁"维度符文".<br>
            2.解锁9个符文背包槽.<br>
            3.解锁升级"符文槽提升".
            `,
            done() { return player.s.points.gte(2) },
            unlocked() { return player.s.best.gte(Number(this.id) - 1) },
            style() {
                return {
                    width: "750px",
                    height: "100px"
                }
            },
        },
        3: {
            requirementDescription: `3奇点 - 重建[天体·现实] - ϞTeresaϞ(环节I)`,
            effectDescription: `
            1.${quickColor(`触发恒定惩罚: 空间膨胀`, "red")}.<br>
            2.古物碎片受本次现实重置持续时间加成.(x t^0.55)<br>
            3.解锁1个充能符文槽.<br>
            4.充能符文槽上的符文等级+ (奇点-1)^2.
            `,
            done() { return player.s.points.gte(3) },
            unlocked() { return player.s.best.gte(Number(this.id) - 1) },
            style() {
                return {
                    width: "750px",
                    height: "100px"
                }
            },
        },
        4: {
            requirementDescription: `4奇点 - 重建现实(环节II)`,
            effectDescription: `
            1.解锁升级"计时频率升级".<br>
            2.解锁升级"维度提升".<br>
            3."反物质维度"的价格增加,但是允许你用反物质购买.<br>
            (用反物质购买的物品现实时重置)
            `,
            done() { return player.s.points.gte(4) },
            unlocked() { return player.s.best.gte(Number(this.id) - 1) },
            style() {
                return {
                    width: "750px",
                    height: "100px"
                }
            },
        },
        5: {
            requirementDescription: `5奇点 - 重建[天体·现实] - ϞTeresaϞ(环节II)`,
            effectDescription: `
            1.${quickColor(`触发变数惩罚: 现实过载`, "red")}.<br>
            2.解锁"专精树".基于奇点数给予<b>S^2/5</b>专精点(向下取整)<i>${quickColor("[永久保留]", "blue")}</i><br>
            3.解锁1个充能符文槽.<br>
            4.解锁[天体·现实]挑战-"超现实".
            `,
            done() { return player.s.points.gte(5) },
            unlocked() { return player.s.best.gte(Number(this.id) - 1) },
            style() {
                return {
                    width: "750px",
                    height: "100px"
                }
            },
        },
        /* 6: {
            requirementDescription: `6奇点 - 重建现实(环节III)`,
            effectDescription: `
            1.${quickColor(`触发变数惩罚: 现实过载`, "red")}.<br>
            2.解锁"专精树".基于奇点数给予<b>S^2/5</b>专精点(向下取整)<i>${quickColor("[永久保留]", "blue")}</i><br>
            3.解锁1个充能符文槽.<br>
            4.解锁[天体·现实]挑战-"超现实".
            `,
            done() { return player.s.points.gte(5) },
            unlocked() { return player.s.best.gte(Number(this.id) - 1) },
            style() {
                return {
                    width: "750px",
                    height: "100px"
                }
            },
        }, */
    },
    tabFormat: {
        "特权": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-text", function () { return `暗能量产量: +${format(getDEProc())}/s` }],
                "blank",
                "milestones"
            ]
        },
        "惩罚": {
            content: spawnNerfInfo(),
            unlocked() { return player.s.total.gte(1) }
        }
    },
})