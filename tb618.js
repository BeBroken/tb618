/**
 * @file   tb618.js
 * @brief  淘宝618活动自动领喵币脚本
 * @author ZehuanZhang (https://github.com/ZehuanZhang)
 * @detail 本脚本任何人可自由使用，不包含任何收费、协助点击、分享等内容，
 *         若需移植、修改或分享，请保留该文件头，尊重劳动成果！
 */

///////////////////////////////////////////////////////////////////////////////
// 主要操作部分
///////////////////////////////////////////////////////////////////////////////

// 检查无障碍模式是否启用
if ("undefined" == typeof GlobalDisableWaitFor) var GlobalDisableWaitFor = false;
if (!GlobalDisableWaitFor) {
    ShowMessage("检测无障碍模式是否开启");
    if (app.versionCode >= 400) {
        auto.waitFor();
    }
    else {
        ShowMessage("版本号低于400，请手动检查无障碍模式")
    }
}
else {
    ShowMessage("无障碍模式检测已关闭");
}

// 获取设备屏幕信息
var height = device.height;
var width = device.width;

ShowMessage(
    "欢迎来到领喵币脚本\n" +
    "Github项目: tb618\n" +
    "设备宽: " + width + "\n" +
    "设备高: " + height + "\n" +
    "手机型号: " + device.model + "\n" +
    "安卓版本: " + device.release + "\n" +
    "脚本版本: " + "20200618.U3");

var appName = "手机淘宝";
if (!IsOnTaobao() && !IsOnMainForm() && !IsOnActivityForm() && !IsOnSearching() && !IsOnActivitySheet()) {
    ShowMessage("打开" + appName)
    launchApp(appName);
    sleep(3000);
}
// 进入活动界面
CheckAndGoActivity(true);
// 签到
PerformClick("签到");
// 执行领喵币操作
while(PerformActions());

ShowMessage("操作已全部完成，共分析" + ActList.length + "个操作")
ShowMessage(
    "Github项目: tb618\n" +
    "好用的话请点个Star哦!");

///////////////////////////////////////////////////////////////////////////////
// 函数部分
///////////////////////////////////////////////////////////////////////////////

/**
 * @brief Show message and print it on console
 * 
 * @param msg The message 
 */
function ShowMessage(msg) {
    log(msg);
    sleep(1500);
    toast(msg);
    sleep(1500);
}

/**
 * @brief Analysis actions and perform it
 */
function PerformActions() {
    if("undefined" == typeof ActList)
        ActList = new Array();
    
    var ActionsList = className("android.widget.ListView").depth(16).findOnce();
    var retVal = false;
    if (ActionsList) {
        var NBChild = ActionsList.childCount();
        var incFlag = true;
        for (var i = 0; incFlag && i < NBChild; ++i) {
            incFlag = false;
            var ActionContext = ActionsList.child(i);
            var ActBtn = ActionContext.child(1);
            var ActContent = ActionContext.child(0);
            var ActText = ActContent.text();
            ActText = ActText.substring(0, ActText.indexOf("("));
            if(ActList.indexOf(ActText) != -1) {
                incFlag = true;
                continue;
            }
            switch (ActBtn.text()) {
                case "去浏览":
                case "去逛逛":
                case "去完成":
                case "去围观":
                case "去进店":
                    {
                        var re = new RegExp("(浏览|逛一逛).*喵币");
                        if (re.test(ActContent.text())) {
                            PerformVisit(ActBtn);
                        }
                        else {
                            var astr = ActContent.text();
                            astr = astr.substring(0, astr.indexOf("("));
                            ShowMessage("不支持\"" + ActText + "\"");
                            incFlag = true;
                        }
                    } break;
                case "签到":
                case "去兑换":
                    PerformClick(ActBtn.text()); break;
                case "去观看":
                    PerformLook("去观看"); break;
                case "去收菜":
                    PerformFarming(); break;
                default:
                    incFlag = true;
                    break;
            }
            ActList.push(ActText);
        }
        if(!incFlag) retVal = true;
    }
    return retVal;
}

/**
 * @brief Wait visit action finished (by searching keyword)
 * 
 * @param Timeout The timeout value (default is 15s)
 */
function WaitVisitFinished(Timeout) {
    if (!Timeout) Timeout = 15000;

    var Timer = 0
    // 这个等待最多15s
    while (
        Timer <= 15000 &&
        !descMatches("(.*)?任务已?完成(.*)?").exists() &&
        !textMatches("(.*)?任务已?完成(.*)?").exists()
    ) {
        sleep(500);
        Timer += 500;
    }
}

/**
 * @brief Perform visit action
 * 
 * @param ActBtn The trigger button for a visit action
 */
function PerformVisit(ActBtn) {
    if(!ActBtn) return;

    var actionName = ActBtn.text();
    ShowMessage("准备" + actionName);
    ActBtn.click();
    sleep(1500);
    swipe(width / 2, height - 400, width / 2, 0, 1000);
    sleep(5000);
    swipe(width / 2, height - 400, width / 2, 0, 1000);
    sleep(5000);
    swipe(width / 2, height - 400, width / 2, 0, 1000);
    // 鉴于前面操作需要一部分时间，这里减少一些
    WaitVisitFinished(8000);
    back();
    // 防止淘宝骚操作，若返回主界面，尝试重新进入活动界面
    CheckAndGoActivity();
    ShowMessage("完成" + actionName);
}

/**
 * @brief Perform click action
 * 
 * @param actionName The click action name
 */
function PerformClick(actionName) {
    if (!text(actionName).exists()) return;

    ShowMessage("准备" + actionName)
    if (text(actionName).exists()) {
        text(actionName).findOnce().click();
        ShowMessage("完成" + actionName);
    }
    else {
        ShowMessage("不存在" + actionName)
    }
}

/**
 * @brief Perform look action
 * 
 * @param actionName The trigger button name
 */
function PerformLook(actionName) {
    if (!text(actionName).exists()) return;

    ShowMessage("准备" + actionName)
    while (text(actionName).exists()) {
        ShowMessage("存在" + actionName);
        text(actionName).findOnce().click();
        WaitVisitFinished();
        ShowMessage("完成" + actionName);
        back();
        sleep(1000);
    }
    ShowMessage("完成" + actionName);
}

/**
 * @brief Perform farming
 */
function PerformFarming() {
    actionName = "去收菜";
    var Btn = text(actionName).findOnce();
    if (Btn)
        Btn.click();
    else
        return;
    ShowMessage("准备" + actionName);
    var JumpBtn = className("android.view.View").clickable(true).depth(15).indexInParent(0).findOnce();
    if (JumpBtn) JumpBtn.click();
    sleep(4000);
    var GatherBtn = className("android.view.View").text("立即去收").findOnce();
    if (GatherBtn) {
        var GatherBtnBounds = GatherBtn.bounds();
        click(GatherBtnBounds.centerX(), GatherBtnBounds.centerY());
        sleep(2000);
    }
    var GameRegion = className("android.view.View").depth(8).indexInParent(1).findOnce();
    if (GameRegion) {
        var aBnd = GameRegion.bounds();
        var X = aBnd.left;
        var Y = aBnd.top;
        var HStep = aBnd.height() / 5;
        var WStep = aBnd.width() / 4;
        click(X + WStep * 2, Y + HStep * 4)
        click(X + WStep * 2, Y + HStep * 4 - 150)
        sleep(1500);
        click(X + WStep * 2, Y + HStep * 4)
        click(X + WStep * 2, Y + HStep * 4 - 150)
        sleep(1500);
        click(X + WStep * 2, Y + HStep * 4)
        click(X + WStep * 2, Y + HStep * 4 - 150)
        sleep(1500);
    }
    else {
        ShowMessage("无法定位界面");
    }
    // 退回至活动表、活动窗口、主界面中的任一个
    while(!IsOnActivitySheet() && !IsOnActivityForm() && !IsOnMainForm()) back();
    sleep(1500);
    // 防止意外返回主界面
    CheckAndGoActivity();
    ShowMessage("完成" + actionName);
}
/**
 * @brief Check wheter is on Taobao
 */
function IsOnTaobao() {
    return id("iv_image").exists() || desc("跳转到猜你喜欢").exists();
}
/**
 * @brief Check whether is on main form
 */
function IsOnMainForm() {
    return id("uik_refresh_header").exists();
}

/**
 * @brief Check whether is on searching form
 */
function IsOnSearchingForm() {
    return className("android.widget.EditText").clickable(true).exists();
}

/**
 * @brief Check whether is on activity form
 */
function IsOnActivityForm() {
    return descMatches("(.+)?我的列车(.+)?").exists() || textMatches("(.+)?我的列车(.+)?").exists();
}

/**
 * @brief Check whether is on activity sheet
 */
function IsOnActivitySheet(){
    return id("taskBottomSheet").exists() ||
           text("关闭").indexInParent(2).exists() ||
           id("viewpager").exists() ||
           id("title_container").exists();
}

/**
 * @brief Check whether on the activity sheet and try switch to it
 * 
 * @param isBegining Is this calling at the begining of all activity performing
 */
function CheckAndGoActivity(isBegining) {
    if (IsOnActivityForm() || IsOnActivitySheet()) return;

    if (!IsOnTaobao()) {
        ShowMessage("不在淘宝界面！");
        exit();
    }
    if (!IsOnMainForm()) {
        ClickMainPage();
    }
    if (IsOnMainForm() || IsOnSearchingForm()) {
        ShowMessage("尝试进入618列车界面");

        GoActivityBySearching();

        if(!IsOnActivityForm()) {
            ShowMessage("进入主互动界面失败！");
            exit();
        }
    }

    // 跳出领取祝福的处理
    var giftBtn = className("android.widget.Button").text("收下祝福").findOnce();
    if (giftBtn) {
        ShowMessage("领取祝福");
        giftBtn.click();
        sleep(1500);
    }

    if (IsOnActivityForm()) {
        if (isBegining && !IsOnActivitySheet()) {
            ShowMessage("收取喵币");
            var CoinsNavElem = className("android.widget.Button").text("打开图鉴").findOnce();
            if (CoinsNavElem) {
                click(width / 2, CoinsNavElem.bounds().centerY());
            }
        }
        if (!IsOnActivitySheet()) {
            ShowMessage("进入领喵币页面");
            ClickLingmiaobi();
        }
        if (IsOnActivitySheet()) {
            if (isBegining) ShowMessage("开始领取喵币");
        }
        else {
            ShowMessage("无法检测到领喵币窗口");
            exit();
        }
    }
    else {
        ShowMessage("无法找到领喵币界面");
        exit();
    }
}

/**
 * @brief Click the Lingmiaobi button
 */
function ClickLingmiaobi() {
    if (!IsOnActivitySheet()) {
        var mbbtn =
            className("android.widget.Button").text("做任务，领喵币").findOnce() ||
            className("android.view.View").depth(14).indexInParent(3).clickable(false).findOnce();
        if (mbbtn) {
            var mbbnd = mbbtn.bounds();
            click(mbbnd.centerX(), mbbnd.centerY());
            sleep(1500);
        }
    }
    if (!IsOnActivitySheet()) {
        ShowMessage("识别领喵币按钮失败，尝试通过位置比例点击领喵币按钮，默认比例：(0.9, 0.9)")
        click(width * 0.9, height * 0.9);
        sleep(1500);
    }
}

/**
 * @brief Click the main page button
 */
function ClickMainPage() {
    // 查找淘宝按钮
    var MainPageBtn = 
        desc("猜你喜欢").clickable(false).findOnce() || 
        id("iv_image").clickable(false).findOnce();
    if (MainPageBtn) { // 找到
        click(MainPageBtn.bounds().centerX(), MainPageBtn.bounds().centerY());
        sleep(1200);
    }
    else { //没有找到
        click(width * 0.125, height - 50);
        sleep(1200);
    }
}

/**
 * @brief Go to activity form by clicking the interface button
 */
function GoActivityByButton() {
    var GoActivityFlag = false;
    if (!(GoActivityFlag = TryClickGoAcivityBtn())) {
        ClickMainPage();
        sleep(2000);
        var RetryCoutner = 0;
        while (++RetryCoutner <= 3 && !(GoActivityFlag = TryClickGoAcivityBtn())) {
            swipe(width / 2, 400, width / 2, height * 0.4, 1000);
            sleep(1000);
        }
    }
    return GoActivityFlag;
}

/**
 * @brief Trying to click the interface button of activity
 */
function TryClickGoAcivityBtn() {
    var GoPage = className("android.widget.FrameLayout").clickable(true).
        depth(12).indexInParent(11).boundsInside(0, 200, device.width, device.height - 300).findOnce();
    if (GoPage) {
        GoPage.click();
        return !IsOnMainForm();
    }
    else {
        return false;
    }
}

/**
 * @brief Go to activity page by searching method
 * 
 * @return true if successed
 */
function GoActivityBySearching() {
    if (IsOnMainForm()) {
        var searchButton =
            className("android.view.View").clickable(true).desc("拍立淘").findOnce() ||
            className("android.view.View").indexInParent(2).desc("搜索").findOnce();
        if (searchButton) {
            var SearchContainer = searchButton.parent();
            var X = (searchButton.bounds().left - SearchContainer.bounds().left) / 2;
            var Y = SearchContainer.bounds().centerY();
            click(X, Y);
            sleep(1000);
        }
    }

    if (IsOnSearching()) {
        searchContext = className("android.widget.EditText").clickable(true).findOnce();
        searchButton = className("android.widget.Button").desc("搜索").findOnce();
        if (!searchContext) {
            toast("搜索输入框不存在")
            return false;
        }
        else if (!searchContext) {
            toast("搜索按钮不存在")
            return false;
        }
        else {
            searchContext.setText("618列车");
            searchButton.click();
            sleep(6000);
        }
    }
}

/**
 * @brief check whether is on the second step of searching
 */
function IsOnSearching() {
    return className("android.view.View").depth(8).desc("语音搜索").exists();
}