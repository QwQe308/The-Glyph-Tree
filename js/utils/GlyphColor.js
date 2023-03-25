//Author:cyxw
//0:维度符文

const GlyphBGColor = {
    0:"#add8e6",//Lightblue
    //TODO
}

const GlyphChargeColor = {
    "inactivate":"#5151ec",
    0:"#ffc0cb",//Pink
    //TODO
}

const Unselected = "#bf8f8f"
const Selected = "#00ff00" //lime
const Locked = "#ff0000" //Red
const Empty = "#888888"

function CalcCSS(bgcolor,bordercolor = bgcolor){//What CSS Object Should this grid return.
    let jss = {
        margin: '1px',
        borderRadius: 0,
        color: bgcolor,//textcolor
        borderColor: bordercolor,
        backgroundColor: `${bgcolor}40`,
        borderWidth: '2px',
    }

    return jss;
}

function GlyphtoCSS(layer,gridID){//真正的泛用函数
    if (layer != "g" && layer != "ghost")
        {
            throw "The layer you input probably doesn't have a grid. Check layer id or GlyphtoCSS() function."
        }
    let jss = {};
    jss.borderRadius = 0;
    let tmpData = player[layer].grid
    let canClick = tmp[layer].grid.getCanClick(tmpData,gridID);
    if (tmpData[gridID].type !== null)jss.color = GlyphBGColor[tmpData[gridID].type]
    else jss.color = Empty

    if(layer == "g")
        if (canClick&&selecting[1] == gridID && selecting[0] == "g")jss.color = Selected;//不需要再额外判定empty，因为归到上方的默认判断里了
    if(layer == "ghost")//这个最鸡儿磨人
        {
            if (!getEquipSlotUnlocked(gridID)) jss.color = Locked
            else {//这里挂一个空充能槽判定
                if (tmpData[gridID].type === null && isChargedSlot(gridID)) jss.color = GlyphChargeColor["inactivate"];
                if (canClick&&selecting[1] == gridID && selecting[0] == "ghost") jss.color = Selected;
            }
        }

    jss.backgroundColor = `${jss.color}40`
    if (layer == "ghost"&&isChargedSlot(gridID)&&tmpData[gridID].type!==null)
    jss.borderColor = GlowingColor(jss.color,1,GlyphChargeColor[tmpData[gridID].type])
    else jss.borderColor = jss.color;

    return jss;
}