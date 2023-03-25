let modInfo = {
	name: "符文树",
	id: "The-Glyph-Tree",
	author: "QwQe308 - 符文css by cyxw",
	pointsName: "反物质",
	modFiles: ["layers/sing.js", "layers/reality.js", "layers/teresa.js", "layers/glyph.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 0.5,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "beta-0.62",
	name: "",
}

let changelog = `<h1>更新日志:</h1><br><br>
    <h3>beta-0.62</h3><br>
		- 符文样式大改!感谢cyxw的css支援(哭).<br><br>
    <h3>beta-0.61</h3><br>
		- 切换符文现在不再生成符文.<br><br>
    <h3>beta-0.6</h3><br>
		- 制作了第六奇点.(好水好膨胀的样子)<br>
		- 为第五奇点添加了第二个天体挑战.<br>
		- 修改了Teresa的配色.<br>
		- 修复了购买最大计时频率升级使用点数而非古物碎片的错误.<br>
		- 为第五奇点添加了一个新的减益.<br>
		- 削弱了维度符文效果4.<br>
		- 添加了符文槽数上限.<br>
		- 修复了自动购买特权能在购买项未解锁时购买升级的问题.<br><br>
    <h3>beta-0.51</h3><br>
		- 增强了[能量衰减]减益.(x^4 -> x^4*1.1^x)<br>
		- 修复了[超现实]天体挑战内充能槽效果叠加三次的问题.<br>
		- 修复了[超现实]天体挑战外充能槽不增加的问题.<br><br>
    <h3>beta-0.5</h3><br>
		- 完成第五奇点.(大量内容!)<br>
		- 添加6个专精.<br>
		- 添加第一个天体挑战!<br>
		- 修复了充能槽不加成维度符文词条#1的问题.<br><br>
    <h3>beta-0.4</h3><br>
		- 完成第四奇点.<br>
		- 部分文本重命名.<br>
		- 加强减益"能量衰竭"(由"能量衰减"更名).<br>
		- 将S3.1的效果归类为恒定减益,而非排除于减益之外.<br>
        - 改善游戏样式.<br><br>
    <h3>beta-0.31</h3><br>
		- 进行大量数值调整.(符文稀有度概率下调,符文稀有度效果下调等)<br><br>
    <h3>beta-0.3</h3><br>
		- 完成第三奇点.<br>
		- 改善符文系统,修复符文系统的一系列问题.<br><br>
    <h3>beta-0.2</h3><br>
		- 完成第二奇点.<br>
		- 完成符文系统.<br><br>
	<h3>beta-0.1</h3><br>
		- 完成第一奇点.
    `

let winText = `恭喜！你 >暂时< 通关了！`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["buyMax"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	let gain = player.r.adNum.mul(buyableEffect("r",1)).add(1)
    gain = gain.mul(tmpEffectList.point)
    gain = gain.mul(tickspeed)
    return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	function(){
        if(player.s.chall!="basic" && player.s.points.gte(player.s.basic)) return quickColor(`当前挑战奇点数已达上限!在主游戏达到更高奇点以继续!`,"red")
		if(player.s.de.gte(getSReq())) return `${quickColor(`!奇点重置已就绪!`,"lime")}`
		return `暗能量: ${format(player.s.de)} / ${format(getSReq())} (+${format(getDEProc())}/s)`
	},
    function(){
        if(hasMilestone("s",2)) if(scanEmptyPlaces().length === 0) return `${quickColor(`!符文仓库已满!`,"red")}`
    },
    function(){
        if(inCelChall(11)) return `你正在 <超现实> 天体挑战中.`
        if(inCelChall(12)) return `你正在 <超现实II> 天体挑战中.`
    },
    function(){
        return `游戏终局: 到达第七奇点(以及尽可能多的挑战)`
    }
]

// Determines when the game "ends"
function isEndgame() {
	return false
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(1800) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
    player.s.cc11 = n(player.s.cc1).max(player.s.cc11)
}
