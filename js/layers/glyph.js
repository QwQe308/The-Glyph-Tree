
//起始全局效果
var getEffStartValue = {
    point() { return n(1) },
    relic() { return n(1) },
    extraLevel() { return n(0) },
}
//起始单格效果
var getSingleEffStartValue = {
    extraLevel() { return n(0) },
    proc() { return n(0) },
}
var deleteMode = false//←你丫你这玩意全局变量几个意思

//充能槽数
function getChargedSlotCount() {
    var chargedCount = n(0)
    if (hasMilestone("s", 3)) chargedCount = chargedCount.add(1)
    if (hasMilestone("s", 5)) chargedCount = chargedCount.add(1)
    if (inCelChall(11)) {
        if (player.s.basic.gte(3)) chargedCount = chargedCount.add(1)
        if (player.s.basic.gte(5)) chargedCount = chargedCount.add(1)
    } else {
        if (player.s.cc11.gte(3)) chargedCount = chargedCount.add(1)
        if (player.s.cc11.gte(5)) chargedCount = chargedCount.add(1)
    }
    return chargedCount.toNumber()
}
//充能槽额外等级
function getChargedSlotEffect() {
    var chargedLevel = n(0)
    if (inCelChall(11)) {
        if (hasMilestone("s", 3)) chargedLevel = chargedLevel.add(player.s.points.add(player.s.basic).div(2).sub(1).pow(2).mul(2))
        else chargedLevel = chargedLevel.add(player.s.points.add(player.s.basic).div(2).sub(1).pow(2))
    }
    else {
        if (hasMilestone("s", 3)) chargedLevel = chargedLevel.add(player.s.points.sub(1).pow(2))
        if (player.s.cc11.gte(3)) chargedLevel = chargedLevel.add(player.s.cc11.sub(1).pow(2))
    }
    return chargedLevel
}

//符文槽数
function getEquipSlotCount() {
    var count = getBuyableAmount("r", 2)
    count = count.add(getChargedSlotCount())
    return count.toNumber()
}
//仓库槽数
function getStorageSlotCount() {
    var count = n(9)
    if (hasUpgrade("c1", 13)) count = count.add(3)
    if (hasUpgrade("c1", 23)) count = count.add(4)
    count = count.add(getCelChallEffect(12,1))//超现实II奖励
    return count.toNumber()
}
//点数对等级的加成
function getPointBoostToLevel() {
    return player.points.add(10).log10().pow(0.65)
}
//暗物质对等级的加成
function getDEBoostToLevel() {
    return player.s.de.mul(10).add(10).log10().pow(0.45)
}
//等级计算
function getStartLevel(type = null) {
    var startLevel = getPointBoostToLevel().mul(getDEBoostToLevel())
    startLevel = startLevel.add(tmpEffectList.extraLevel)
    return startLevel
}
//品质计算
function randomRarity(type, level) {
    var influenceStat = n(1)
    var finalStat = n(100).root(influenceStat.mul(9).add(1).log10())
    var rarity = finalStat.pow((1 - Math.random() ** (0.3)) ** 0.5).sub(1).div(finalStat.sub(1))
    return rarity
}

//稀有度测试代码
function testRarity(times, target, type, level) {
    var result = 0
    for (i = 1; i <= times; i++) {
        if (randomRarity(type, level) > target) result++
    }
    return format(n(result / times * 100), 3) + "%"
}

//符文列表
var glyphList = [
    {
        name: '维度符文',
        icon: '<i><big><b>D</b></big></i>',
        effect: [
            //注意：词条从上到下触发！
            {//1
                id: 'proc',//id判断属性类型 同种进行叠加运算
                affect(id) { return [id - 100, id - 1] },
                stack(prevEff, thisEff) {//叠加运算
                    return prevEff.add(thisEff)
                },
                active(id, data) {//生效时触发,id为目标id,data为自身数据
                    let level = data.level.add(data.extraLevel)
                    var proc = this.effect(level, data.rarity).mul(data.number.add(1).pow(0.5))
                    //时间速率
                    proc = proc.mul(tickspeed)
                    if (player.ghost.grid[id].number) player.ghost.grid[id].number = player.ghost.grid[id].number.add(proc.mul(outerDiff))
                },
                description(level, rarity) {//说明
                    return `生产左方和上方的维度符文 (+${format(this.effect(level, rarity))} * (数量+1)^0.5/s)`
                },
                effect(level, rarity) {//效果
                    var strength = rarity.add(1).mul(level)
                    var eff = n(1.4).pow(strength.add(1.5)).sub(1).div(5)
                    //维度倍率
                    eff = eff.mul(getAllDimBoost())
                    return eff
                },
                chance() {//词条出现率(先在所有词条中随机选择再进行这一判定)
                    return n(1)
                },
            },
            {//2
                id: 'point',//id判断属性类型 同种进行叠加运算
                stack(prevEff, thisEff, data) {//叠加运算
                    return prevEff.add(thisEff.mul(data.number.add(1).pow(0.4)))
                },
                description(level, rarity) {
                    return `反物质获取+x (${format(this.effect(level, rarity))} * (数量+1)^0.4)(多效果间叠加)`
                },
                effect(level, rarity) {
                    var strength = rarity.add(1).mul(level)
                    return n(1.35).pow(strength.add(1.5)).sub(1)
                },
                chance() {
                    return n(1)
                },
            },
            {//3
                id: 'relic',//id判断属性类型 同种进行叠加运算
                stack(prevEff, thisEff, data) {//叠加运算
                    return prevEff.add(thisEff.mul(data.number.add(1).pow(0.6)))
                },
                description(level, rarity) {
                    return `古物碎片获取+x (${format(this.effect(level, rarity))} * (数量+1)^0.6)(多效果间叠加)`
                },
                effect(level, rarity) {
                    var strength = rarity.add(1).mul(level)
                    return n(1.45).pow(strength.add(1.5)).sub(1)
                },
                chance() {
                    return n(1)
                },
            },
            {//4
                id: 'extraLevel',//id判断属性类型 同种进行叠加运算
                stack(prevEff, thisEff, data) {//叠加运算
                    return prevEff.add(thisEff.mul(data.number.add(10).log10().pow(0.5)))
                },
                description(level, rarity) {
                    return `获取符文等级+ (${format(this.effect(level, rarity))} * lg(数量+10)^0.5)(多效果间叠加)`
                },
                effect(level, rarity) {
                    var strength = rarity.add(1).mul(level)
                    return strength.mul(1.5).add(1).log10().div(1.5)
                },
                chance() {
                    return n(1)
                },
            },
        ],
        chance() {
            return n(1)
        },
        extraValues: {
            number: n(0)
        },
    },
]

let chargedSlotCount = 0
let equipSlotCount = 0//getEquipSlotCount()
let storageSlotCount = 0//getStorageSlotCount()

function isChargedSlot(id) {
    id = Number(id)
    let slotCol = id % 100; let slotRow = (id - slotCol) / 100
    return (Math.max(slotCol, slotRow) - 1) ** 2 + slotRow + ((slotRow >= slotCol) ? slotCol - 1 : 0) <= chargedSlotCount
}
function getEquipSlotUnlocked(id) {
    id = Number(id)
    let slotCol = id % 100; let slotRow = (id - slotCol) / 100
    return (Math.max(slotCol, slotRow) - 1) ** 2 + slotRow + ((slotRow >= slotCol) ? slotCol - 1 : 0) <= equipSlotCount
}
function getStorageSlotUnlocked(id) {
    id = Number(id)
    let slotCol = id % 100; let slotRow = (id - slotCol) / 100
    return (Math.max(slotCol, slotRow) - 1) ** 2 + slotRow + ((slotRow >= slotCol) ? slotCol - 1 : 0) <= storageSlotCount
}
function showEffects(effects) {
    var result = ``
    for (i in effects) {
        result += `,` + (effects[i] + 1)
    }
    if (result.length > 1) return result.substr(1)
    return `...无...`
}


function clearTmpEffects(clearAmount = false) {
    for (i in getEffStartValue) {//清空上帧的临时效果
        tmpEffectList[i] = getEffStartValue[i]()
    }
    for (i in player.ghost.grid) {
        player.ghost.grid[i].tmpEffect = {}
        if (player.ghost.grid[i].number && clearAmount) player.ghost.grid[i].number = n(0)
    }
}
function resetGrid(layer, id, data) {
    player[layer].grid[id] = {
        type: data.type,
        level: typeof data.level == "string" ? n(data.level) : data.level,
        rarity: typeof data.rarity == "string" ? n(data.rarity) : data.rarity,
        effect: data.effect,
        extraLevel: typeof data.rarity == "string" ? n(data.extraLevel) : data.extraLevel,
        //extraValues:{}
    }
    if (data.type === null) return
    if (glyphList[data.type].extraValues) {
        for (k in glyphList[data.type].extraValues) {
            if (!data[k]) player[layer].grid[id][k] = glyphList[data.type].extraValues[k]
            else player[layer].grid[id][k] = (typeof data[k] == "string") ? n(data[k]) : data[k]
        }
    }
}
//都写完了才想起来有这个屑函数function refreshGlyphEffect(){}//以后再说
function randomEffect(type, level, rarity) {
    var strength = rarity.add(1).mul(level)
    var effectList = glyphList[type].effect
    var maxEff = strength.mul(1.8).add(10).log10().pow(0.66).add(1.6 - Math.random() ** 0.6 * 1.6).max(1).floor().min(effectList.length).toNumber()
    var eff = []
    var tries = 0
    while (eff.length < maxEff && tries < 60) {
        let tryID = Math.floor(Math.random() * effectList.length)
        if (eff.includes(tryID)) continue
        if (glyphList[type].effect[tryID].chance().gt(Math.random())) eff.push(tryID)
        tries++
    }
    return eff.sort()
}
function randomType() {
    var type = Math.floor(Math.random() * glyphList.length)
    while (glyphList[type].chance().lt(Math.random())) {
        type = Math.floor(Math.random() * glyphList.length)
    }
    return type
}
var selecting = [null, null]//←这个也是//0: 网格所在层级，1: id
function scanEmptyPlaces() {
    var places = []
    for (i in player.g.grid) {
        if (player.g.grid[i].type === null && getStorageSlotUnlocked(i)) places.push(i)
    }
    return places
}
function getActiveGlyphCount() {
    var count = 0
    for (i in player.ghost.grid) {
        if (player.ghost.grid[i].type !== null && getEquipSlotUnlocked(i)) count++
    }
    return count
}
function spawnRandomGlyph() {
    var emptyPlaces = scanEmptyPlaces()
    if (!emptyPlaces.length) return
    var id = Math.floor(Math.random() * emptyPlaces.length)
    player.g.grid[emptyPlaces[id]] = {}
    var tmpObject = player.g.grid[emptyPlaces[id]]
    tmpObject.type = randomType()
    tmpObject.level = getStartLevel(tmpObject.type).floor()
    tmpObject.rarity = randomRarity(tmpObject.type, tmpObject.level)
    tmpObject.effect = randomEffect(tmpObject.type, tmpObject.level, tmpObject.rarity)
}

addLayer("g", {
    symbol: "😏", // This appears on the layer's node. Default is the id with the first letter capitalized
    startData() {
        return {
            unlocked: true,
            glyphTimer: n(0),
            deleteAllTimer: n(2),
            notHoldingCheck: n(0.2),
        }
    },
    color: "lightblue",
    //resource: "符文能量", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: 3, // Row the layer is in on the tree (0 is the first row)
    layerShown() { return false },
    grid: {
        rows: 6,
        cols: 6,
        getStartData(id) {
            return {
                type: null,
                level: n(0),
                rarity: n(0),
                effect: [],
                extraLevel: n(0),
            }
        },
        getCanClick(data, id) {
            if (selecting[1]) return true
            return data.type !== null
        },
        onClick(data, id) {
            if (deleteMode) player.g.grid[id] = this.getStartData(id)
            else if (!selecting[1] && (data.type !== null)) {
                selecting = ['g', id]
                resetGrid("g", id, data)

            } else if (selecting[1] == id && selecting[0] == 'g') {
                selecting = [null, null]
                resetGrid("g", id, data)
            } else if (player[selecting[0]].grid[selecting[1]]) {
                clearTmpEffects(selecting[0] == "ghost")//清空上帧的临时效果
                if (selecting[0] == "ghost") {
                    //doReset("r")
                    player.r.points = player.r.points.add(getResetGain('r'))
                    doReset("r", true)
                }
                let tmpGlyphData = player[selecting[0]].grid[selecting[1]]
                player[selecting[0]].grid[selecting[1]] = player.g.grid[id]
                player.g.grid[id] = tmpGlyphData
                if (player.g.grid[id].tmpEffect) player.g.grid[id].tmpEffect = {}
                selecting = [null, null]
            }
        },
        getUnlocked(id) {
            return getStorageSlotUnlocked(id)
        },
        getDisplay(data, id) {
            if (data.type === null) return ''
            return `<big>${glyphList[data.type].icon}</big>\n等级:${formatWhole(data.level)}\n品质:${format(data.rarity.mul(100))}%\n<b>词条:${showEffects(data.effect)}</b>`
        },
        getTooltip(data, id) {
            if (!data) return false
            if (data.type === null) return
            var glyphInfo = glyphList[data.type]
            var str = glyphInfo.name + glyphInfo.icon + `<br>`
            for (i in data.effect) str += `词条#${data.effect[i] + 1}: ${glyphInfo.effect[data.effect[i]].description(data.level, data.rarity)}<br>`
            return str
        },
        getStyle(data, id) {
            var canClick = this.getCanClick(data, id)
            if (!canClick && selecting[0] == 'g' && selecting[1] == id) selecting = [null, null]
            return GlyphtoCSS(this.layer,id)
        }
    },
    /* tabFormat: [
        "main-display",
        //['display-text',function(){return `符文获取间隔: ${formatTime(player.g.glyphTimer)}/${formatTime(getGlyphDelay())}`}],
        ['display-text',function(){return `将符文放置在上方以触发,符文将会从左到右,从上到下依次生效!`}],
        ['display-text',function(){return `预获取符文等级+ ${format(tmpEffectList.extraLevel)}`}],
        ['layer-proxy',['ghost',['grid']]],
        'blank',
        'clickables',
        'grid',
        'buyables'
    ], */
    update(diff) {
        player.g.notHoldingCheck = player.g.notHoldingCheck.sub(0.05).max(0)
        if (player.g.notHoldingCheck.eq(0)) {
            player.g.deleteAllTimer = n(1)
            //selecting = [null, null]
        }

        chargedSlotCount = getChargedSlotCount()
        equipSlotCount = getEquipSlotCount()
        storageSlotCount = getStorageSlotCount()
    },
    hotkeys: [
        {
            key: "d",
            description: "d: 开/关“符文删除模式”",
            onPress() {
                deleteMode = !deleteMode
                selecting = [null, null]
            },
        }
    ],
    clickables: {
        11: {
            display() {
                if (player.g.deleteAllTimer.lt(1)) return `<big><big>${quickColor("再长按 " + format(player.g.deleteAllTimer, 2) + "秒 以清除所有符文!", "red")}</big></big>`
                return `<big>${(deleteMode ? '关闭' : '打开')}“符文删除模式”</big>(覆盖我查看符文状态!)`
            },
            style() {
                return {
                    'background-color': deleteMode ? 'pink' : 'lightblue',
                    width: '300px',
                    height: '60px',
                    'border-radius': '5px',
                    position: 'relative',
                }
            },
            canClick: true,
            onClick() {
                deleteMode = !deleteMode
                selecting = [null, null]
            },
            onHold() {
                if (!hasUpgrade("c1", 13)) return
                player.g.notHoldingCheck = n(0.2)
                player.g.deleteAllTimer = player.g.deleteAllTimer.sub(outerDiff)
                if (player.g.deleteAllTimer.lte(0)) {
                    player.g.deleteAllTimer = n(1)
                    for (i in player.g.grid) player.g.grid[i] = layers.g.grid.getStartData(i)
                    selecting = [null, null]
                }
            },
            tooltip() {
                var str = `当前符文总属性:<br>`
                if (tmpEffectList.point.neq(1)) str += `- 反物质加成: x${format(tmpEffectList.point)}<br>`
                if (tmpEffectList.relic.neq(1)) str += `- 古物碎片加成: x${format(tmpEffectList.relic)}<br>`
                if (tmpEffectList.extraLevel.neq(0)) str += `- 额外符文等级加成: +${format(tmpEffectList.extraLevel)}<br>`
                if (str === `当前符文总属性:<br>`) str += `- 暂无!移动符文到符文槽以生效<br>(需在现实界面购买解锁)<br>`

                str += `<br>当前符文等级来源:(依次计算)<br>`
                str += `基础等级(基于点数): ${format(getPointBoostToLevel())}<br>`
                if (getDEBoostToLevel().neq(1)) str += `- 暗物质加成: x${format(getDEBoostToLevel())}<br>`
                if (tmpEffectList.extraLevel.neq(0)) str += `- 符文额外等级加成: +${format(tmpEffectList.extraLevel)}<br>`
                let level = getStartLevel()
                str += `最终值: ${formatWhole(level.floor())}(距离下级: ${format(level.sub(level.floor()).mul(100))}%)<br>`

                if (getChargedSlotCount() > 0) str += `<br>充能符文槽效果: +${formatWhole(getChargedSlotEffect())} 符文等级<br>`

                return str
            },
        }
    }
})

var tmpEffectList = {}
var tmpSingleEffectList = {}
for (i in getEffStartValue) {
    tmpEffectList[i] = getEffStartValue[i]()
}
addLayer("ghost", {
    startData() {
        return {
            unlocked: true,
        }
    },
    color: "lightblue",
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: 3, // Row the layer is in on the tree (0 is the first row)
    layerShown() { return false },

    //刷新符文槽...辣鸡代码(哭
    update(diff) {
        for (i in getEffStartValue) {//清空上帧的临时效果
            tmpEffectList[i] = getEffStartValue[i]()
        }
        for (a in player.ghost.grid) {//刷新该帧的临时效果

            if (!player.ghost.grid[a].tmpEffect) {
                player.ghost.grid[a].tmpEffect = {}
                for (i in getSingleEffStartValue) player.ghost.grid[a].tmpEffect[i] = getSingleEffStartValue[i]()
            }

            resetGrid("ghost", a, player.ghost.grid[a])
            let tmpObject = player.ghost.grid[a]
            let level = typeof tmpObject.level == "string" ? n(tmpObject.level) : tmpObject.level

            //额外等级
            if (tmpObject.tmpEffect) {
                level = level.add(tmpObject.tmpEffect.extraLevel)
            }
            //充能槽
            if (isChargedSlot(a)) level = level.add(getChargedSlotEffect())
            if (tmpObject.tmpEffect) player.ghost.grid[a].extraLevel = tmpObject.tmpEffect.extraLevel.add(isChargedSlot(a) ? getChargedSlotEffect() : 0)
            else player.ghost.grid[a].extraLevel = isChargedSlot(a) ? getChargedSlotEffect() : n(0)

            let rarity = typeof tmpObject.rarity == "string" ? n(tmpObject.rarity) : tmpObject.rarity

            for (b in tmpObject.effect) {
                let tmpEffObject = glyphList[tmpObject.type].effect[tmpObject.effect[b]]
                let tmpEff = tmpEffObject.effect(level, rarity)
                let affect = tmpEffObject.affect ? tmpEffObject.affect(Number(a)) : null
                //console.log(affect)

                if (!affect) {
                    tmpEffectList[tmpEffObject.id] = tmpEffObject.stack(tmpEffectList[tmpEffObject.id], tmpEff, tmpObject)
                    if (tmpEffObject.active) tmpEffObject.active(tmpObject)
                }
                else for (toAffect in affect) {
                    toAffect = affect[toAffect]
                    if (player.ghost.grid[toAffect]) {
                        if (player.ghost.grid[toAffect].type !== null) {
                            if (player.ghost.grid[toAffect].tmpEffect)
                                //console.log(player.ghost.grid[toAffect].tmpEffect[tmpEffObject.id])
                                player.ghost.grid[toAffect].tmpEffect[tmpEffObject.id] = tmpEffObject.stack(player.ghost.grid[toAffect].tmpEffect[tmpEffObject.id], tmpEff, tmpObject)
                            if (tmpEffObject.active) tmpEffObject.active(toAffect, tmpObject)
                        }
                    }
                }
            }

            resetGrid("ghost", a, tmpObject)
            player.ghost.grid[a].tmpEffect = {}
            for (i in getSingleEffStartValue) {
                player.ghost.grid[a].tmpEffect[i] = getSingleEffStartValue[i]()
            }
        }
    },
    grid: {
        rows: 4,
        cols: 4,
        getStartData(id) {
            return {
                type: null,
                level: n(0),
                rarity: n(0),
                effect: [],
                extraLevel: n(0),
                //tmpEffect:{},
            }
        },
        getCanClick(data, id) {
            if (!getEquipSlotUnlocked(id)) return false
            if (selecting[1]) return true
            return data.type !== null
        },
        onClick(data, id) {
            if (!selecting[1] && (data.type !== null)) {
                selecting = ['ghost', id]
                resetGrid("ghost", id, data)
                deleteMode = false
            } else if (selecting[1] == id && selecting[0] == 'ghost') {
                selecting = [null, null]
                resetGrid("ghost", id, data)

            } else if (player[selecting[0]].grid[selecting[1]]) {
                clearTmpEffects(true)//清空上帧的临时效果
                //doReset("r")
                player.r.points = player.r.points.add(getResetGain('r'))
                doReset("r", true)
                let tmpGlyphData = player[selecting[0]].grid[selecting[1]]
                player[selecting[0]].grid[selecting[1]] = player.ghost.grid[id]
                player.ghost.grid[id] = tmpGlyphData
                selecting = [null, null]
            }
        },
        getUnlocked(id) {
            id = Number(id)
            return (Math.max(id % 100, (id - id % 100) / 100) - 1) ** 2 < equipSlotCount
        },
        getDisplay(data, id) {
            if (data.type === null) {
                if (isChargedSlot(id)) return `<big><big><b>Ϟ</b></big></big>`
                if (!getEquipSlotUnlocked(id)) return "🔒"
                return ``
            }
            return `<big>${glyphList[data.type].icon}${(isChargedSlot(id) ? `(<b>Ϟ</b>)` : ``)}</big>\n等级:${(data.extraLevel.gt(0) ? quickColor(formatWhole(data.level.add(data.extraLevel)) + "↑", RGBArrayToString(MostReadable([0,128,0],RGBStringToArray(HexToRGBString(GlyphBGColor[data.type])),1.25,1))) : formatWhole(data.level.add(data.extraLevel)))}\n品质:${format(data.rarity.mul(100))}%\n<b>词条:${showEffects(data.effect)}</b>`
        },
        getTooltip(data, id) {
            if (!data) return
            if (data.type === null) return
            var glyphInfo = glyphList[data.type]
            var str = glyphInfo.name + glyphInfo.icon + `<br>`
            if (data.type === 0) str += `数量: ${format(n(data.number))}<br>`
            for (i in data.effect) str += `词条#${data.effect[i] + 1}: ${glyphInfo.effect[data.effect[i]].description(data.level.add(data.extraLevel ? data.extraLevel : 0), data.rarity)}<br>`
            return str
        },
        getStyle(data, id) {
            var canClick = this.getCanClick(data, id)
            if (!canClick && selecting[1] == id && selecting[0] == 'ghost') selecting = [null, null]
            return GlyphtoCSS(this.layer,id)
        }
    },
})