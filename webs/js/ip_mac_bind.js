var G = {};
var listMax = 0;
var lanIp = "";
var lanMask = "";
var dhttpIP = "";
var maxBindNum = 32;
var existFlag = false;

var ipBandInfo;
var pageview = R.pageView({ //页面初始化
    init: function () {
        top.loginOut();
        top.$(".main-dailog").removeClass("none");
        top.$(".save-msg").addClass("none");
    }
});
var pageModel = R.pageModel({
    getUrl: "goform/GetIpMacBind",
    setUrl: "goform/SetIpMacBind",
    translateData: function (data) {
        var newData = {};
        newData.ipBand = data;
        return newData;
    },
    afterSubmit: callback
});

/************************/
var view = R.moduleView({
    initEvent: initBandEvent
});

var moduleModel = R.moduleModel({
    initData: initValue,
    getSubmitData: function () {
        $("#msg-err").html("&nbsp;");
        var trArry = $("#portBody").children(),
            len = trArry.length,
            i = 0,
            bindNum = 0,
            data = "list=";
        for (i = 0; i < len; i++) {
            if (!$(trArry[i]).children().eq(4).find("span").hasClass("bind")) {
                data += encodeURIComponent($(trArry[i]).children().eq(0).find(".dev-name-txt").text() || "") + "\r";
                data += $(trArry[i]).children().eq(1).html() + "\r";
                data += $(trArry[i]).children().eq(2).html();
                data += "\n";
                bindNum++;
            }
        }
        data = "bindnum=" + bindNum + "&" + data.replace(/(\n)$/, "");
        return data;
    }
});

//模块注册
R.module("ipBand", view, moduleModel);

function initBandEvent() {
    top.initIframeHeight();

    checkData();

    $("#ipaddr").inputCorrect("ip");
    $("#macaddr").inputCorrect("mac");
    $('#devname').addPlaceholder(_("Optional"));

    clearDevNameForbidCode($("#devname")[0]);

    /***********Init Event Start****************/
    $(".add").on("click", function () {
        G.validate.checkAll();
    });
    $("table").on("click", ".delete", delBind);
    $("#portBody").on("click", ".bind", function () {

        var err_msg;
        var inputValue = $(this).parents('tr').children().eq(2).find('input:hidden').val();
        //inputValue = (inputValue === "0") ? ($(this).parents('tr').children().eq(2).find('.input-box').val()) : inputValue;
        //验证合法性时直接取输入框显示的值
        inputValue = $(this).parents('tr').children().eq(2).find('.input-box').val();
        //最大绑定数限制
        if (getCurrentBindNum() >= maxBindNum) {
            err_msg = _("Only a maximum of %s rules are allowed.", [maxBindNum]);
        }

        //select手动输入合法性判断
        if (!err_msg) {
            if ($.validate.valid.ip.all(inputValue)) {
                err_msg = $.validate.valid.ip.all(inputValue);
            } else if (!checkIpInSameSegment(inputValue, lanMask, lanIp, lanMask)) {
                err_msg = _("%s and %s (%s) must be in the same network segment.", [_("IP Address"), _("LAN IP Address"), lanIp]);
            } else if (inputValue === lanIp) {
                err_msg = _("The LAN IP address must not be the same as the login IP address (%s) of the router.", [lanIp]);
            } else if (inputValue == dhttpIP) {
                err_msg = _("The IP address cannot be %s.", [dhttpIP]);
            } else if (checkIsVoildIpMask(inputValue, lanMask)) {
                err_msg = checkIsVoildIpMask(inputValue, lanMask);
            }
        }

        //ip地址绑定判重处理
        if (!err_msg) {
            var $existTr = $("#portBody tr");

            for (var i = 0; i < $existTr.length; i++) {

                //判断为本条时，立即执行下一循环
                if ($existTr.eq(i) == $(this).parents("tr")) {
                    continue;
                }
                var existMac = $existTr.eq(i).find("td:eq(1)").html();
                var existIp = $existTr.eq(i).find("td:eq(2) .input-box").val() || $existTr.eq(i).find("td:eq(2)").html();

                //ip地址存在，并且是绑定状态时
                if (inputValue == existIp && $existTr.eq(i).find("td:eq(4)").find(".unbind").length > 0) {
                    err_msg = _("The IP address exists.");
                }
            }
        }


        if (err_msg) {
            $(this).parents('tr').children().eq(2).find('.input-box').focus();
            $("#msg-err").addClass("red").removeClass("text-success");
            $("#msg-err").html(err_msg);
            setTimeout(function () {
                $("#msg-err").html("&nbsp;");
            }, 3000);
            return;
        }

        $(this).removeClass("bind").addClass("unbind").attr("title", _("Click to Unbind"));
        $(this).parents('tr').find('td:eq(2)').removeClass("input-append").html($(this).parents('tr').find('.input-box').val());

        ipBandInfo.submit();
    });
    $("#portBody").on("click", ".unbind", function () {
        var ipVal = $(this).parents('tr').find('td:eq(2)').html();
        $(this).removeClass("unbind").addClass("bind").attr("title", _("Click to Bind"));
        $(this).parents('tr').find("td:eq(2)").html("<span></span>");
        $(this).parents('tr').find("td:eq(2)").find("span").toSelect({
            "initVal": ipVal,
            "editable": "1",
            "seeAsTrans": true,
            "size": "small",
            "options": [{
                "0": ipVal,
                ".divider": ".divider",
                ".hand-set": _("Manual")
            }]
        });
        $(this).parents('tr').find(".input-append input[type='text']").attr("maxlength", "15").inputCorrect("ip");
        ipBandInfo.submit();
    });

    $(".input-append ul").on("click", function (e) {
        $("#note")[0].value = ($(this).parents(".input-append").find("input")[0].value || "");
    });
    $("#portBody").delegate(".edit-btn", "click", function () {
        showEditNameArea($(this).parents("tr")[0], $(this).parents("tr").find(".dev-name").attr("title"));
    });
    $("#portBody").delegate(".btn-save", "click", function () {
        var mac = $(this).parent().parent().next().html(),
            newName = $(this).parents("tr").find("input.dev-name-input").val();
        changeDevName(mac, newName);
    });
    /***********Init Event End****************/

}

function getCurrentBindNum() {
    var currentBindNum = 0;
    $("#portBody tr").each(function () {
        if ($(this).children().eq(4).find("span").hasClass("unbind")) {
            currentBindNum++;
        }
    });
    return currentBindNum;
}

function delBind() {
    $(this).parents("tr").remove();
    ipBandInfo.submit();
    top.initIframeHeight();
}

function showEditNameArea(rowEle, name) {
    var htmlStr = '<div class="table-btn-group"><input type="text" style="width:40px;" class="input-small dev-name-input" maxlength="20"/><input type="button" class="btn btn-mini btn-save" value="' + _("Save") + '" /></div>';
    $(rowEle).find(".dev-name").html(htmlStr);

    $(rowEle).find(".dev-name .dev-name-input").val(name);
    clearDevNameForbidCode($(rowEle).find(".dev-name .dev-name-input")[0]);
}

function hideEditNameArea(rowEle, devName) {
    $(rowEle).find(".dev-name").text(devName).append('<img class="edit-btn none edit-btn-txt-append" src="img/edit.png" />');
}

function changeDevName(macAddress, newName) {
    var submitStr = "mac=" + macAddress + "&devName=" + newName;

    $("#msg-err").addClass("red").removeClass("text-success");

    var msg = checkDevNameValidity(newName);

    if (msg) {
        showErrMsg("msg-err", msg);
        return;
    }

    $.post("goform/SetOnlineDevName", submitStr, function (str) {
        if ($.parseJSON(str).errCode == "0") {
            $("#msg-err").removeClass("red").addClass("text-success");
            showErrMsg("msg-err", _("Modification success"));
            $("#portBody tr").each(function () {
                if ($(this).children().eq(1).html() == macAddress) {
                    $(this).find(".dev-name").attr("title", newName).find(".dev-name-txt").text(newName);
                    hideEditNameArea(this, newName);
                    return false;
                }
            });
            top.staInfo.initValue();
        } else {
            showErrMsg("msg-err", _("Modification failure"));
        }

    });
}


function addList() {
    var str = "";

    str += "<tr>";
    str += "<td class='dev-name fixed edit-td' title='" + "'><span class='dev-name-txt dev-target'>" + "</span><img class='edit-btn none edit-btn-txt-append' src='img/edit.png' /></td>";
    str += "<td id='macaddr" + (listMax + 1) + "'>" + $("#macaddr").val() + "</td>";
    str += "<td id='ipaddr" + (listMax + 1) + "'>" + $("#ipaddr").val() + "</td>";
    str += "<td><div class='offline'></div></td>";
    str += "<td><div class='operate'><span class='unbind' title='" + _("Click to Unbind") + "'></span><span class='delete' title='" + _("Delete") + "'></span></div></td></tr>";

    $("#portBody").append(str);
    $("#portBody").find(".dev-target").text(($("#devname").val() || ""));
    $("#portBody").find(".dev-target").parent().attr("title", $("#devname").val());
    $("#portBody").find(".dev-target").removeClass("dev-target");

    $("#ipaddr").val("");
    $("#macaddr").val("");
    $("#devname").val("");
    listMax++;
    top.initIframeHeight();
}

function checkData() {
    G.validate = $.validate({
        custom: function () {
            var deviceName = "",
                ipaddr = "",
                macaddr = "",
                i = 0;

            deviceName = $("#devname").val();
            ipaddr = $("#ipaddr").val();
            macaddr = $("#macaddr").val();


            var msg = checkDevNameValidity(deviceName, true);

            if (msg) {
                return msg;
            }

            if ($.validate.valid.mac.all(macaddr)) {
                $("#macaddr").focus();
                return $.validate.valid.mac.all(macaddr);
            }

            if ($.validate.valid.ip.all(ipaddr)) {
                $("#ipaddr").focus();
                return $.validate.valid.ip.all(ipaddr);
            }

            if (!checkIpInSameSegment(ipaddr, lanMask, lanIp, lanMask)) {
                $("#ipaddr").focus();
                return _("The LAN IP address must be in the same network segment as the login IP address (%s) of the router.", [lanIp]);
            }

            if (ipaddr === lanIp) {
                $("#ipaddr").focus();
                return _("The LAN IP address must not be the same as the login IP address (%s) of the router.", [lanIp]);
            }

            if (ipaddr == dhttpIP) {
                $("#ipaddr").focus();
                return _("The IP address cannot be %s.", [dhttpIP]);
            }

            msg = checkIsVoildIpMask(ipaddr, lanMask);
            if (msg) {
                $("#ipaddr").focus();
                return msg;
            }

            var $existTr = $("#portBody tr"),
                existMac,
                existIp;

            for (i = 0; i < $existTr.length; i++) {
                existIp = $existTr.eq(i).find("td:eq(2) .input-box").val() || $existTr.eq(i).find("td:eq(2)").html();

                //ip地址存在，并且是绑定状态时
                if (ipaddr == existIp) {
                    $("#ipaddr").focus();
                    return _("The IP address exists.");
                }
            }

            for (i = 0; i < $existTr.length; i++) {
                existMac = $existTr.eq(i).find("td:eq(1)").html().toLowerCase();

                if (macaddr.toLowerCase() == existMac) {
                    // $existTr.eq(i).remove();
                    //MAC地址相同时覆盖原mac地址相同的项，同时去掉下拉框的类
                    $existTr.eq(i).find('td:eq(2)').removeClass("input-append");
                    $existTr.eq(i).find('td:eq(1)').html(macaddr);
                    $existTr.eq(i).find('td:eq(2)').html(ipaddr);
                    $existTr.eq(i).find('td:eq(0) span').html((deviceName !== "") ? deviceName : $existTr.eq(i).find('td:eq(0) span').html());
                    if ($existTr.eq(i).find('td:eq(4) span:eq(0)').hasClass("bind")) {
                        $existTr.eq(i).find('td:eq(4) span:eq(0)').removeClass("bind").addClass("unbind");
                    }
                    existFlag = true;
                    return;
                }

            }
        },

        success: function () {
            if (getCurrentBindNum() >= maxBindNum && !existFlag) {
                $("#msg-err").removeClass("text-success").addClass("red").html(_("Only a maximum of %s rules are allowed.", [maxBindNum]));
                setTimeout(function () {
                    $("#msg-err").html("&nbsp;");
                }, 3000);
                $("#ipaddr").val("");
                $("#macaddr").val("");
                $("#devname").val("");
                return;
            }

            if (existFlag === false) {
                addList();
            } else {
                $("#ipaddr").val("");
                $("#macaddr").val("");
                $("#devname").val("");
                existFlag = false;
            }

            ipBandInfo.submit();
        },

        error: function (msg) {
            if (msg) {
                $("#msg-err").addClass("red").removeClass("text-success");
                $("#msg-err").html(msg);
                setTimeout(function () {
                    $("#msg-err").html("&nbsp;");
                }, 3000);
            }
            return;
        }
    });
}

function initValue(obj) {
    var bindList = obj.bindList,
        dhcpClientList = obj.dhcpClientList,
        bindArray = [],
        dhcpClientArray = [],
        i = 0,
        j = 0,
        str = "";

    lanIp = obj.lanIp;
    lanMask = obj.lanMask;
    dhttpIP = obj.dhttpIP;
    for (i = 0; i < dhcpClientList.length; i++) {
        dhcpClientArray[i] = dhcpClientList[i];
    }

    dhcpClientArray.sort((function () {
        var splitter = /^(\d)$/;
        return function (item1, item2) {
            var a = item1.status.match(splitter),
                b = item2.status.match(splitter);
            var anum = parseInt(a[1], 10),
                bnum = parseInt(b[1], 10);
            return bnum - anum;
        };
    })());
    $("#portBody").html('');
    for (i = 0; i < dhcpClientArray.length; i++) {
        str = "<tr>";
        str += "<td class='dev-name fixed edit-td' title='" + "'><span class='dev-name-txt dev-target'>" + "</span><img class='edit-btn none edit-btn-txt-append' src='img/edit.png' /></td>";
        str += "<td id='macaddr" + (i + 1) + "'>" + (dhcpClientArray[i].macaddr || "") + "</td>";
        str += "<td><span class='validatebox input-append' id='ipaddr" + (i + 1) + "'>" + (dhcpClientArray[i].ipaddr || "") + "</span></td>";

        if (dhcpClientArray[i].status === "0") {
            str += "<td><div class='offline'></div></td>";
        } else {
            str += "<td><div class='online'></div></td>";
        }

        str += "<td><div class='operate'><span class='bind' title='" + _("Click to Bind") + "'></span>";
        if (dhcpClientArray[i].status === "0") {
            str += "<span class='delete' title='" + _("Delete") + "'></span>";
        }
        str += "</div></td></tr>";
        $("#portBody").append(str);
        $("#portBody").find(".dev-target").text((dhcpClientArray[i].devname || ""));
        $("#portBody").find(".dev-target").parent().attr("title", (dhcpClientArray[i].devname || ""));
        $("#portBody").find(".dev-target").removeClass("dev-target");
    }

    for (j = 0; j < bindList.length; j++) {
        bindArray[j] = bindList[j];
    }
    bindArray.sort((function () {
        var splitter = /^(\d)$/;
        return function (item1, item2) {
            var a = item1.status.match(splitter),
                b = item2.status.match(splitter);
            var anum = parseInt(a[1], 10),
                bnum = parseInt(b[1], 10);
            return bnum - anum;
        };
    })());
    for (j = 0; j < bindArray.length; j++) {
        str = "<tr>";
        str += "<td class='dev-name fixed edit-td' title='" + "'><span class='dev-name-txt dev-target'>" + "</span><img class='edit-btn none edit-btn-txt-append' src='img/edit.png' /></td>";
        str += "<td id='macaddr" + (dhcpClientList.length + j + 1) + "'>" + (bindArray[j].macaddr || "") + "</td>";
        str += "<td id='ipaddr" + (dhcpClientList.length + j + 1) + "'>" + (bindArray[j].ipaddr || "") + "</td>";

        if (bindArray[j].status === "0") {
            str += "<td><div class='offline'></div></td>";
        } else {
            str += "<td><div class='online'></div></td>";
        }

        str += "<td><div class='operate'><span class='unbind' title='" + _("Click to Unbind") + "'></span>";

        if (bindArray[j].status === "0") {
            str += "<span class='delete'title='" + _("Delete") + "'></span>";
        }

        str += "</div></td></tr>";
        $("#portBody").append(str);
        $("#portBody").find(".dev-target").text((bindArray[j].devname || ""));
        $("#portBody").find(".dev-target").parent().attr("title", (bindArray[j].devname || ""));
        $("#portBody").find(".dev-target").removeClass("dev-target");
    }

    listMax = bindList.length + dhcpClientList.length;
    for (i = 0; i < dhcpClientList.length; i++) {
        $("#ipaddr" + (i + 1)).toSelect({
            "initVal": $("#ipaddr" + (i + 1)).html(),
            "editable": "1",
            "seeAsTrans": true,
            "size": "small",
            "options": [{
                "0": $("#ipaddr" + (i + 1)).html(),
                ".divider": ".divider",
                ".hand-set": _("Manual")
            }]
        });
        $("#ipaddr" + (i + 1)).find("input[type='text']").attr("maxlength", "15").inputCorrect("ip");
    }
    top.initIframeHeight();
    initTableHeight();
}

function callback(str) {
    if (!top.isTimeout(str)) {
        return;
    }
    $("#msg-err").removeClass("red").addClass("text-success");
    $("#msg-err").html(_("The configuration is saved and will take effect as soon as your device connects to the router next time."));
    setTimeout(function () {
        $("#msg-err").html("&nbsp;");
    }, 3000);
    /*var num = $.parseJSON(str).errCode;


    top.showSaveMsg(num);
    if (num == 0) {
        top.advInfo.initValue();
    }*/

}

window.onload = function () {
    ipBandInfo = R.page(pageview, pageModel);
};