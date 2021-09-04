var G = {},
	//langStrs = {"en": "0", "cn": "1", "zh": "2"},
	//language = langStrs[B.getLang()];
	language = B.getLang();

var moduleId = window.location.href;

var wrlWpsInfo;
var pageview = R.pageView({ //页面初始化
	init: function () {
		top.loginOut();
		top.$(".main-dailog").removeClass("none");
		top.$(".save-msg").addClass("none");
	}
});
var pageModel = R.pageModel();

/************************/
var pwdview = R.moduleView({
	initEvent: function () {
		$(".tabs-title").on("click", function() {
			var targetId = $(this).attr("data-id");
			$(".tabs-title").removeClass("active");
			$(this).addClass("active");
			$(".legend-main").addClass("none");
			$("#"+targetId).removeClass("none");
		});

		$("#sys_pwd").on("click", function () {
			var oldPw = $('#SYSOPS').val(),
			newPw = $('#SYSPS').val(),
			confirmPw = $('#SYSPS2').val(),
			oldUn = $("#oldUsername").val(),
			newUn = $("#newUsername").val();
			if (!pwdview.checkData()) {
				return;
			}
			oldPw = (((oldPw === "") || $('#old_pwd').hasClass('none')) ? "" : hex_md5(oldPw));
			newPw = ((newPw === "") ? "" : hex_md5(newPw));
			confirmPw = ((confirmPw === "") ? "" : hex_md5(confirmPw));
			oldUn = ((oldUn === "") ? "" : oldUn);
			newUn = ((newUn === "") ? "" : newUn);
			if ($("#username").hasClass("none")) {
				document.forms[0].SYSOPS.value = oldPw;
				document.forms[0].SYSPS.value = newPw;
				document.forms[0].SYSPS2.value = confirmPw;
				document.forms[0].submit();
			} else {
				document.forms[1].oldUsername.value = oldUn;
				document.forms[1].newUsername.value = newUn;
				document.forms[1].submit();
			}
			top.$(".main-dailog").addClass("none");
		});
	},
	initHtml: function () {
		initPwd();
	},
	checkData: function () {
		if($("#username").hasClass("none")) {
			var oldPw = $('#SYSOPS').val(),
			newPw = $('#SYSPS').val(),
            confirmPw = $('#SYSPS2').val(),
            reg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*()_+{}])[A-Za-z\d~!@#$%^&*()_+{}]{8,32}$/;
			if ((newPw == oldPw) && ((!$('#old_pwd').hasClass('none')) || (oldPw === ""))) {
				showErrMsg("msg-err", _("The new password cannot be the same as the old password."));
				return false;
			}

            if (!reg.test(confirmPw) || !reg.test(newPw)) {
                showErrMsg("msg-err", _("It consists of 8-32-bit numbers, letters and special characters(~!@#$%^&*()_+{}) composition"));
                return false;
            }

			if (newPw != confirmPw) {
				showErrMsg("msg-err", _("New Password and Confirm Password must be the same."));
				return false;
			}

			if (newPw == "" && G.remoteEn == "1") {
				showErrMsg("msg-err", _("Web-based remote management has been enabled but no login password is set, leading to security risks. Please disable the Remote Management function on the System Settings page ."));
				return false;
			}
			return true;
		} else {
			var oldUn = $("#oldUsername").val(),
                newUn = $("#newUsername").val();
                // reg = /^[0-9A-Za-z]{1,8}$/;

			if(oldUn == "") {
				showErrMsg("msg-err", "旧用户名不能为空");
				return false;
			}
			if(newUn == "") {
				showErrMsg("msg-err", "新用户名不能为空");
				return false;
			}

			if ((oldUn == newUn) && ((!$('#old_unm').hasClass('none')))) {
				showErrMsg("msg-err", "新用户名和旧用户名不能相同");
				return false;
			}

            // if (reg.test(newUn)) {
            //     showErrMsg("msg-err", "用户名由1-8位字母、数字组成！");
			// 	return false;
			// }

			if (newUn.charAt(0) == " " || newUn.charAt(newUn.length - 1) == " ") {
				showErrMsg("msg-err", "新用户名前后不能为空格");
				G.index = 1;
				return false;
			}

			if ((newUn.length < 4) && (newUn !== "")) {
				showErrMsg("msg-err", "新用户名长度不能少于4位数！");
				return false;
			}
			return true;
		}

	}
});

var pwdModel = R.moduleModel({
	getSubmitData: function () {
		return "";
	}
});

//密码模块注册
if (moduleId.indexOf("system_password") != -1) {
	//模块注册
	R.module("sysPwd", pwdview, pwdModel);
}

var rebootView = R.moduleView({
	initEvent: function () {
		$("#sys_reboot").on("click", function () {
			document.forms[0].submit();
		});
	}
});

var rebootModel = R.moduleModel({
	getSubmitData: function () {
		return "";
	}
});

//重启模块注册
if (moduleId.indexOf("system_reboot") != -1) {
	//模块注册
	R.module("sysReboot", rebootView, rebootModel);
}


var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function utf16to8(str) {
	var out, i, len, c;

	out = "";
	len = str.length;
	for (i = 0; i < len; i++) {
		c = str.charCodeAt(i);
		if ((c >= 0x0001) && (c <= 0x007F)) {
			out += str.charAt(i);
		} else if (c > 0x07FF) {
			out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
			out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
			out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
		} else {
			out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
			out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
		}
	}
	return out;
}

function base64encode(str) {
	var out, i, len;
	var c1, c2, c3;


	len = str.length;
	i = 0;
	out = "";
	while (i < len) {
		c1 = str.charCodeAt(i++) & 0xff;
		if (i == len) {
			out += base64EncodeChars.charAt(c1 >> 2);
			out += base64EncodeChars.charAt((c1 & 0x3) << 4);
			out += "==";
			break;
		}
		c2 = str.charCodeAt(i++);
		if (i == len) {
			out += base64EncodeChars.charAt(c1 >> 2);
			out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
			out += base64EncodeChars.charAt((c2 & 0xF) << 2);
			out += "=";
			break;
		}
		c3 = str.charCodeAt(i++);
		out += base64EncodeChars.charAt(c1 >> 2);
		out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
		out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
		out += base64EncodeChars.charAt(c3 & 0x3F);
	}
	return out;
}

function str_encode(str) {
	return base64encode(utf16to8(str));
}

function initPwd() {
    var msg = location.search.substring(1) || "-1";
	if (msg == "1") {
		//if (!$('#old_pwd').hasClass('none')) {
		$("#msg-err").html(_("Incorrect old password."));
        top.$(".main-dailog").removeClass("none");
        $('#password').removeClass('none');
        $('#username').addClass('none');
        $(".tabs-title").removeClass("active");
        $(".tabs-title").eq(1).addClass("active");
		//}
	} else if (msg == "2") {
		$("#msg-err").html(_("旧用户名输入错误"));
        top.$(".main-dailog").removeClass("none");
        $('#password').addClass('none');
        $('#username').removeClass('none');
        $(".tabs-title").removeClass("active");
        $(".tabs-title").eq(0).addClass("active");
	} else {
		$("#msg-err").html("&nbsp;");
	}
	$('#SYSOPS').initPassword('', true, false);
	$('#SYSPS').initPassword('', true, false);
	$('#SYSPS2').initPassword('', true, false);
	$.getJSON("goform/SysToolpassword?" + Math.random(), function (obj) {
		G.ispwd = obj.ispwd || "0";
		G.remoteEn = obj.remoteEn || "0";
		if (G.ispwd == "1") {
			$("#old_pwd").removeClass("none");
		} else {
			$("#old_pwd").addClass("none");
		}
		top.initIframeHeight();
	});
}

/************************************/

/************************************/

var backupView = R.moduleView({
	initEvent: function () {
		$("#sys_backup").on("click", function () {
			if (confirm(_("Do you want to back up your configuration to your local host?"))) {
				window.location = "cgi-bin/DownloadCfg/RouterCfm.cfg";
			}
			// top.$("#gbx_overlay").remove();
			//document.forms[0].submit();
		});

		$("#filename").on("change", function () {
			if ($("#filename").val() == "") {
				showErrMsg("msg-err", _("Please select a backup file for restoring the configuration."));
				G.index = 1;
				return false;
			}
			if ($("#filename").val().substr($("#filename").val().length - 4) != ".cfg") {
				showErrMsg("msg-err", _("The backup file extension must be cfg."));
				G.index = 1;
				return false;
			}
			document.forms[0].submit();
		});
	},
	initHtml: function () {
		initBackup();
	}
});

var backupModel = R.moduleModel({});

//备份模块注册
if (moduleId.indexOf("system_backup") != -1) {
	R.module("sysBackup", backupView, backupModel);
}
//多国语言样式调整
if(B.lang == "pl"){
    $("#sys_reboot").css("width","150px");
    $("#sys_config").css("width","150px");
    $("#sys_backup").css("width","130px");
    $("#sys_restore").css("width","130px");
}
if(B.lang == "tr"){
    $("#sys_reboot").css("width","130px");
    $("#sys_config").css("width","130px");
}
if(B.lang == "hu"){
    $("#sys_backup").css("width","150px");
    $("#sys_restore").css("width","150px");
}

if(B.lang == "uk"){
	$("#sys_backup").css("width","130px");
	$("#sys_restore").css("width","130px");
    $("#sys_reboot").css("width","150px");
    $("#sys_config").css("width","150px");
}

function initBackup() {
	var msg = location.search.substring(1) || "0";
	if (msg == "1") {
		$("#msg-err").html(_("Restoration failure."));
	}
	top.initIframeHeight();
}
/************************************/

/************************************/
var resetView = R.moduleView({
	initEvent: function () {

		$("#sys_config").on("click", function () {
			document.forms[1].submit();
		});
	}
});

var resetModel = R.moduleModel({});

if (moduleId.indexOf("system_reboot") != -1) {
	R.module("sysReset", resetView, resetModel);
}

var system = {};


/*function callbackOnlineUp(str) {
	$("#begin_upgrade").attr("disabled", false);
	var num = $.parseJSON(str).errCode;

	//获取状态为6时，开始转圈圈

	if(num == 0) {
		checkingStatus(100);
		//window.location.href = "redirect.html?1";
	} else {
		alert(num);
	}
}
*/



window.onload = function () {
	wrlWpsInfo = R.page(pageview, pageModel);
};