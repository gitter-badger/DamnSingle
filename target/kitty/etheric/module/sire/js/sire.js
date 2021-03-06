/**
 * kitty交配
 */
var sireInit = function (params) {
    fadeInOutLoad(sirePageLoad, params);
};

/**
 * 当前页面全局变量管理
 */
var yourKittyId;
var kitties = new Array();

/**
 * 交配页面初始加载内容
 */
var sirePageLoad = function (params) {
    var sireKittyId = params.kitty_id;
    // var kitty_type = params.kitty_type;
    // var obj = {"page":"sireInit","kitty_id":sireKittyId,"kitty_type":kitty_type};
    var obj = {
        "page": "sireInit",
        "paramJson": params
    };
    leftToRightArray.push(obj);
    headerInit();
    removeHeaderLine(); //移除header的导航栏选中下划线
    $("#all-container").append(sireText);
    //动态显示信息
    findKittyInfo(sireKittyId);
    $(".select-input").append(my_kittiesSelect);
    //ok按钮
    $(".ok-btn").click(function () {
        var kittyValue = $(".select-input select").val();
        var s_id = $(".select-input select").val()=="" ? yourKittyId:kitties[kittyValue].id;
        if(!isNull(s_id)){      //验证交配的dog
            msgTipFunc(LText.Title, LText.DontHave + " " + LText.Kitty, 1, [LText.Ok], [OK]);
            return;
        }
        webToSire(s_id, sireKittyId, userId);
    });
};

/**
 * 发送请求进行交配
 * @param {*} sId 
 * @param {*} mId 
 * @param {*} uId 
 */
var webToSire = function (sId, mId, uId) {
    if (!alertHasShow()) {
        waitModel("");
    }
    $.ajax({
        type: "POST",
        url: Config.address + "sire/toSire",
        data: {
            sId: sId,
            mId: mId,
            uId: uId,
        },
        success: function (data) {
            // createShowChildCanvas(data);
            createShowChild(data);
        },
        error: function (XMLHttpRequest) {
            destory();
            failModel("", null);
        }
    });
};
/**
 * 显示页面信息
 * @param sire
 */
var showInfo = function (sire) {
    var sirePrice = sire.sire_kitty.current_price * ethRate;
    try {
        if(isNull(sire.your_kitty)){        //用户存在可交配的dog
            if (!isNull(sire.your_kitty.name)) {        //dog的名字为空 则显示dog的ID
                $(".left-name").html(LText.Kitty + " #" + sire.your_kitty.id);
                $(".left-date-tube").html(LText.Kitty + " #" + sire.your_kitty.id);
            } else {    //dog的名字不为空 则显示名字
                $(".left-name").html(LText.Generation + sire.your_kitty.generation + "-" + sire.your_kitty.name);
                $(".left-date-tube").html(LText.Generation + sire.your_kitty.generation + "-" + sire.your_kitty.name);
            }

            //显示用户的dog的信息(图片、代数、冷却等级等)
            $(".left-kitty").css("background-color", sire.your_kitty.color);
            $(".left-kitty").css("background-image", "url(" + sire.your_kitty.image_url + ")");

            $(".left-kitty-gen").html(LText.Kitty + " #" + sire.your_kitty.id + "-" + LText.Generation + " " + sire.your_kitty.generation);
            $(".left-kitty-cool").html(cooldown[sire.your_kitty.cooldown_index]);
        } else {        //不存在可交配的dog 提示信息
            $(".left-name").html(LText.Your + " " + LText.Kitty);
            $(".left-kitty").html(LText.DontHave + " " + LText.Kitty);
            $(".left-kitty").css("border", "1px dashed #ccc");
        }

        if(isNull(sire.sire_kitty)){
            if (!isNull(sire.sire_kitty.name)) {        //选择交配的dog名字为空 则显示ID
                $(".right-name").html(LText.Kitty + " #" + sire.sire_kitty.id);
                $(".right-date-tube").html(LText.Kitty + " #" + sire.sire_kitty.id);
            } else {        //选择的名字不为空 则显示名字
                $(".right-name").html(LText.Generation + sire.sire_kitty.generation + "-" + sire.sire_kitty.name);
                $(".right-date-tube").html(LText.Generation + sire.sire_kitty.generation + "-" + sire.sire_kitty.name);
            }

            //显示选择的dog信息(图片、代数、冷却等级等)
            $(".right-kitty").css("background-color", sire.sire_kitty.color);
            $(".right-kitty").css("background-image", "url(" + sire.sire_kitty.image_url + ")");
            $(".right-kitty-gen").html(LText.Kitty + " #" + sire.sire_kitty.id + "-" + LText.Generation + " " + sire.sire_kitty.generation);
            $(".right-kitty-cool").html(cooldown[sire.sire_kitty.cooldown_index]);

            //显示点击交配dog的交配价格
            $(".spend-sum").html(sirePrice.toFixed(4));
            $(".right-kitty-spend").html(LText.SirePrice + " " + sirePrice.toFixed(4));
        }
    } catch (e) {
        console.log(e);
    }
}

/**
 * 查询交配猫及我的猫信息
 * @param sireKittyId   交配猫ID
 */
var findKittyInfo = function (sireKittyId) {
    $.ajax({
        url: Config.address + "sire/getKittiesInfo",
        type: "POST",
        data: {
            "kittyId": sireKittyId,
            "uId": userId,
        },
        success: function (response) {
            console.log(response.msg);
            showInfo(response.msg.show_kitty);
            getMyKitty(response.msg.my_kitties);
            destory();
            if (response.msg.show_kitty.your_kitty != null) {
                yourKittyId = response.msg.show_kitty.your_kitty.id;
            }
        },
        error: function (error) {
            msgTipFunc(LText.Title, LText.False, buttonCountOne, [LText.Ok], [OK]);
        }
    });
}

var width = screen.width;
/**
 * 创建生成的小猫
 */
var createShowChildCanvas = function (data) {
    var msg = data.msg;
    var array;
    try {
        array = msg.attribute;
    } catch (e) {
        // hideWaitView();
        failModel("", null);
        destory();
        return;
    }
    $("body").append(
        "<div class='div-show-child'>" +
        "<div class='div-show-child-body'>" +
        "<canvas class=\"div-show-child-canvas\" " +
        "width=\"" + width + "px\" height=\"" + width + "px\">" +
        "</canvas>" +
        "<div class='div-show-child-content'>" +
        "<span>" + LText.Kitty + " #" + data.msg.id + "</span>" +
        "<br/>" +
        "<span>" + LText.FancyType + " : " + data.msg.fancy_type + "</span>" +
        "</div>" +
        "</div>" +
        "</div>"
    );

    var i1 = new Image();
    i1.src = "../kitty_svg/tail_" + array[0] + ".svg";
    var i2 = new Image();
    i2.src = "../kitty_svg/body_" + array[1] + ".svg";
    var i3 = new Image();
    i3.src = "../kitty_svg/eye_" + array[2] + ".svg";
    var i4 = new Image();
    i4.src = "../kitty_svg/mouth_" + array[3] + ".svg";
    document.body.appendChild(i1);
    document.body.appendChild(i2);
    document.body.appendChild(i3);
    document.body.appendChild(i4);
    i1.onload = function () {
        showChild(data, i1, i2, i3, i4);
    };
    i2.onload = function () {
        showChild(data, i1, i2, i3, i4);
    };
    i3.onload = function () {
        showChild(data, i1, i2, i3, i4);
    };
    i4.onload = function () {
        showChild(data, i1, i2, i3, i4);
    };
};

/**
 * 创建生成小狗
 */
var createShowChild = function (data) {
    var msg = data.msg;
    var array;
    try {
        array = msg.image;
    } catch (e) {
        // hideWaitView();
        failModel("", null);
        destory();
        return;
    }
    // 小dog显示区
    $("body").append(
        "<div class='div-show-child'>" +
        "<div class='div-show-child-body'>" +
        "<div class='div-show-dog-body' id='sppoty-total-div'>" +
        '<svg id="sppoty-total" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"' +
        'viewBox="0 0 3186.3 2724.3" enable-background="new 0 0 3186.3 2724.3"  xml:space="preserve"></svg>' +
        "</div>" +
        "<div class='div-show-child-content'>" +
        "<span>" + LText.Kitty + " #" + data.msg.id + "</span>" +
        "<br/>" +
        "<span>" + LText.FancyType + " : " + petType[data.msg.fancy_type - 1] + "</span>" +
        "</div>" +
        "</div>" +
        "</div>"
    );
    var color, stripe, form, eye, mouth;
    $.get(Config.address + "dog_svg/form_" + array[0] + "/color/" + array[1] + ".svg", function (data) {
        color = data;
        showDogChild(msg, color, stripe, form, eye, mouth)
    }, "text");
    $.get(Config.address + "dog_svg/form_" + array[0] + "/stripe/" + array[2] + "/" + array[3] + ".svg", function (data) {
        stripe = data;
        showDogChild(msg, color, stripe, form, eye, mouth)
    }, "text");
    $.get(Config.address + "dog_svg/form_" + array[0] + "/form_" + array[0] + ".svg", function (data) {
        form = data;
        showDogChild(msg, color, stripe, form, eye, mouth)
    }, "text");
    $.get(Config.address + "dog_svg/eye/eye_" + array[4] + ".svg", function (data) {
        eye = data;
        showDogChild(msg, color, stripe, form, eye, mouth)
    }, "text");
    $.get(Config.address + "dog_svg/mouth/mouth_" + array[5] + ".svg", function (data) {
        mouth = data;
        showDogChild(msg, color, stripe, form, eye, mouth)
    }, "text");
}

/**
 * 合成小狗并显示
 * @type {number}
 */
var partIndex = 0;  //已有几个部件加载完成
var partNum = 5;    //合成小dog的svg部件数量
var showDogChild = function (data, color, stripe, form, eye, mouth) {
    partIndex += 1;
    if (partIndex == partNum) {
        $("body").append(
            '<div id="svg_unit" style="display: none;"></div>'
        );
        $("#svg_unit").append(color);
        $("#svg_unit").append(stripe);
        $("#svg_unit").append(form);
        $("#svg_unit").append(eye);
        $("#svg_unit").append(mouth);
        color = $("#svg_unit svg").eq(0).children();
        stripe = $("#svg_unit svg").eq(1).children();
        form = $("#svg_unit svg").eq(2).children();
        eye = $("#svg_unit svg").eq(3).children();
        mouth = $("#svg_unit svg").eq(4).children();
        $("#sppoty-total").append(color);
        $("#sppoty-total").append(stripe);
        $("#sppoty-total").append(form);
        $("#sppoty-total").append(eye);
        $("#sppoty-total").append(mouth);
        $("#svg_unit").remove();
        partIndex = 0;
        saveDogImg(data);
    }
}

/**
 * 保存小狗的图片
 * @type {number}
 */
var saveDogImg = function (data) {
    var sppText = $("#sppoty-total-div")[0].innerHTML;
    setTimeout(function () {
        $.ajax({
            url: Config.address + "saveSVG",
            type: "POST",
            data: {
                id: data.id,
                sppSVGText: sppText,
            },
            success: function (data) {
                $(".div-show-child").on("click", hideChildView);
                // hideWaitView();
                destory();
                $(".div-show-child").on("click", hideChildView);
            },
            error: function (xht) {
                // hideWaitView();
                failModel();
            }
        });
    }, 1000);
}


var index = 0; //已有几个部件加载完成
/**
 * 画出小猫
 * @param data
 * @param i1
 * @param i2
 * @param i3
 * @param i4
 */
var showChild = function (data, i1, i2, i3, i4) {
    index += 1;
    if (index == 4) {
        var can = $(".div-show-child-canvas")[0];
        var g = can.getContext('2d');
        // g.scale(2, 2);
        g.drawImage(i1, 0, 0, width, width);
        g.drawImage(i2, 0, 0, width, width);
        g.drawImage(i3, 0, 0, width, width);
        g.drawImage(i4, 0, 0, width, width);
        i1.style.display = "none";
        i2.style.display = "none";
        i3.style.display = "none";
        i4.style.display = "none";
        document.body.removeChild(i1);
        document.body.removeChild(i2);
        document.body.removeChild(i3);
        document.body.removeChild(i4);

        setTimeout(function () {
            var url = can.toDataURL('image/png', 1.0);
            $.ajax({
                url: Config.address + "uploadV2",
                data: data.msg.id + "," + url,
                type: "POST",
                processData: false,
                contentType: false,
                cache: false,
            }).done(function (res) {
                $(".div-show-child").on("click", hideChildView);
                console.log(res);
                // hideWaitView();
                destory();
                $(".div-show-child").on("click", hideChildView);
            }).fail(function (res) {
                console.log(res);
                // hideWaitView();
                failModel();
            });
        }, 1000);
    }
};

//隱藏展示的小kitty界面
var hideChildView = function () {
    index = 0;
    $(".div-show-child").remove();
    marketInit();
};

/**
 * 查询可以交配的kitty
 */
var getNotSireKitties = function () {
    $.ajax({
        url: Config.address + "sire/getNotSiredKitties",
        type: "POST",
        data: {
            "kittyId": 0,
            "uId": userId
        },
        success: function (response) {
            console.log(response.msg);
            getMyKitty(response.msg);
        },
        error: function (error) {
            console.info(error);
            destory();
        }
    });
}

//查询我的能够交配的猫
var getMyKitty = function (my_kitties) {
    kitties = my_kitties;
    //我的猫数据 my_kitties
    for (var index in my_kitties) {
        var optionContent;
        try {
            optionContent = !isNull(my_kitties[index].name) ? ("Kitty #" + my_kitties[index].id) : my_kitties[index].name;
        } catch (e) {
            console.log(e);
        }
        var my_kittiesText =
            '<option value="' + index + '">' + optionContent + '</option>';
        $(".select-input select").append(my_kittiesText);
    }
}

//选择我的要交配的猫
var chooseSireKitty = function () {
    var kittyValue = $(".select-input select").val();
    if (kittyValue != null && kittyValue != "") {
        updateSireKitty(kitties[kittyValue]);
    }
}

/**
 * 更新我的要交配的狗
 * @param sireData
 */
var updateSireKitty = function (sireData) {
    try {
        if (!isNull(sireData.name)) {   //交配的dog名字为空 显示ID
            $(".left-name").html(LText.Kitty + " #" + sireData.id);
            $(".left-date-tube").html(LText.Kitty + " #" + sireData.id);
        } else {    //交配的dog名字不为空 显示名字
            $(".left-name").html(LText.Generation + sireData.generation + "-" + sireData.name);
            $(".left-date-tube").html(LText.Generation + sireData.generation + "-" + sireData.name);
        }

        //显示选择的dog信息(图片、代数、冷却等级等)
        $(".left-kitty").css("background-color", sireData.color);
        $(".left-kitty").css("background-image", "url(" + sireData.image_url + ")");

        $(".left-kitty-gen").html(LText.Kitty + " #" + sireData.id + "-" + LText.Generation + " " + sireData.generation);
        $(".left-kitty-cool").html(cooldown[sireData.cooldown_index]);
    } catch (e) {
        console.log(e);
    }
}