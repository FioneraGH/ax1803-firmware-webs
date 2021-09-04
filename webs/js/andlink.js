var andlinkInfo;
var pageview = R.pageView({ //页面初始化
    init: function () {
        top.loginOut();
        top.$(".main-dailog").removeClass("none");
        top.$(".save-msg").addClass("none");
    }
});
var pageModel = R.pageModel({
    getUrl: "goform/GetAndLink",
    setUrl: "goform/SetAndLink",
    translateData: function (data) {
        var newData = {};
        newData.andlink = data;
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
        return "andlinkEn=" + $("#andlinkEn").val();
    }
});

//模块注册
R.module("andlink", view, moduleModel);

function initEvent() {
    $("#andlinkEn").on("click", function () {
        if ($(this).hasClass("btn-on")) {
            $(this).attr("class", "btn-off");
            $(this).val('0');
        } else {
            $(this).attr("class", "btn-on");
            $(this).val('1');
        }
    });
    $("#andlink-save").on("click", function () {
        andlinkInfo.submit();
    });
}

function callback(str) {
    if (!top.isTimeout(str)) {
        return;
    }
    var num = $.parseJSON(str).errCode;
    top.showSaveMsg(num);
    if (num == 0) {
        top.advInfo.initValue();
    }
}

function initValue(obj) {
    $("#andlinkEn").attr("class", (obj.andlinkEn === "1") ? "btn-on" : "btn-off");
    obj.andlinkEn === "1" ? $('#andlinkEn').val('1') : $('#andlinkEn').val('0');
}

window.onload = function () {
    andlinkInfo = R.page(pageview, pageModel);
};