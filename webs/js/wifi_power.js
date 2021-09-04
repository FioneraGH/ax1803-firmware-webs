var wrlPowerInfo;
var G = {};
var pageview = R.pageView({ //页面初始化
    init: function () {
        $("#submit").on("click", function () {
            G.validate.checkAll();
        });
        top.loginOut();
        top.$(".main-dailog").removeClass("none");
        top.$(".save-msg").addClass("none");
    }
});

var pageModel = R.pageModel({
    getUrl: "goform/WifiPowerGet",
    setUrl: "goform/WifiPowerSet",
    translateData: function (data) {
        var newData = {};
        newData.wrlPower = data;
        return newData;
    },
    afterSubmit: callback
});

/************************/
var view = R.moduleView({
    initEvent: initEvent
});
var moduleModel = R.moduleModel({
    initData: initValue,
    getSubmitData: function () {
        return "power=" + $("#power").val() + "&power_5g=" + $("#power_5g").val();
    }
});

//模块注册
R.module("wrlPower", view, moduleModel);

function changeImg(imgID, powerValue) {
    var $imgDom = $("#" + imgID);

    if (powerValue == "low") {
        $imgDom.attr("src", "../img/icon-power-gray1.png");
    } else if (powerValue == "middle") {
        $imgDom.attr("src", "../img/icon-power-gray2.png");
    } else {
        $imgDom.attr("src", "../img/icon-power.png");
    }
}

function initEvent() {
    checkData();
}

function checkData() {
    G.validate = $.validate({
        custom: function () { },

        success: function () {
            wrlPowerInfo.submit();
        },

        error: function (msg) {
            return;
        }
    });
}

function initValue(obj) {
    top.$(".main-dailog").removeClass("none");
    top.$("iframe").removeClass("none");
    top.$(".loadding-page").addClass("none");

    /*$("[name='power'][value='" + obj.power + "']").prop("checked", true);
    changeImg("powerImg",obj.power);

    $("[name='power_5g'][value='" + obj.power_5g + "']").prop("checked", true);
    changeImg("powerImg5",obj.power_5g);*/
    $("#power").val(obj.power);
    $("#power_5g").val(obj.power_5g);

    /*if(obj.power_limit_enable == "1"){
        $("#insert_power_limit").val(obj.insert_power_limit);
        $("#strengthEnWrap").removeClass("hiddenImportant");
        $("#sgenable")[0].checked = true;
    }else{
        $("#insert_power_limit").val(obj.insert_power_limit);
        $("#strengthEnWrap").addClass("hiddenImportant");
        $("#sgdisable")[0].checked = true;
    }*/

    $("#goPage").attr("href", top.G.homePage);
}

function callback(str) {
    if (!top.isTimeout(str)) {
        return;
    }
    var num = $.parseJSON(str).errCode;
    top.showSaveMsg(num);
    if (num == 0) {
        //getValue();
        top.advInfo.initValue();
        top.wrlInfo.initValue();
    }
}

function getHomePage() {
    var homePage = "";
    if (B.getLang() == "cn") {
        $("#goPage").addClass("disabled");
        $.GetSetData.getData("goform/getHomeLink", function (str) {
            var obj = $.parseJSON(str);
            homePage = obj.homePageLink;
            $("#goPage").attr("href", homePage);
            $("#goPage").removeClass("disabled");
        });
    } else {
        homePage = "http://www.tendacn.com/en/product/A9.html";
        $("#goPage").attr("href", homePage);
        return;
    }
}

window.onload = function () {
    wrlPowerInfo = R.page(pageview, pageModel);
   // getHomePage();
};
