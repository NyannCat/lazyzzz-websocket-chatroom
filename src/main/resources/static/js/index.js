window.onfocus = () => {
    focus = false;
}
window.onblur = () => {
    focus = true;
}

let nickname = null;
let roomName = null;
let avatarSrc = './dist/avatar/4.png';

$('.login .login-avatar li').on('click', function () {
    $(this)
        .addClass('now')
        .siblings()
        .removeClass('now');
    avatarSrc = $(this).children("img").attr("src");
    console.log(avatarSrc);
})

//设置房间号和昵称并发送，再模拟‘#btn’的点击事件，以弹出侧边栏
function login() {
    nickname = $("#nickname").val();
    roomName = $("#roomName").val();
    if (nickname === "" || roomName === "") {
        layer.msg("房间号和昵称不能为空！", {anim: 6});
        return;
    }
    //检查房间内是否存在同名用户
    $.ajax({
        type: 'GET',
        url: '/websocket/exists?roomName=' + roomName + '&username=' + nickname,
        success: data => {
            let hasDuplicateUser = JSON.parse(data);
            console.log("是否存在重名: " + hasDuplicateUser);
            if (hasDuplicateUser) {
                layer.msg("该房间存在已存在同名用户！", {anim: 6});
            } else {
                initWebsocket();
            }
        }
    })
}

function initAnimation() {
    document.getElementById('text').innerHTML = null;
    document.getElementById('activeRoom').innerText = '房间：' + roomName;
    document.getElementById('activeUser').innerText = '昵称：' + nickname;

    getOnlineUsers();

    $('#btn').trigger("click");
    $('body').css("background-image", "none");
    $("#window").animate({top: '-100%'}, 500);
    $("#footer").animate({bottom: '0px'}, 400);
    $("#message").show();
    //因为该方法会引起较近的动画卡顿，所以让他先老实一会儿
    setTimeout(() => loadEmoji(), 500);
}

function initWebsocket() {
    if (typeof (WebSocket) == 'undefined') {
        alert("浏览器不支持websocket")
        return
    }

    let socketUrl = 'ws://localhost:8080/websocket/' + roomName + '/' + nickname;
    if (websocket == null) {
        websocket = new WebSocket(socketUrl);
    }

    websocket.onopen = () => {
        console.log("websocket已打开");
    }

    websocket.onmessage = msg => {
        let serverMsg = JSON.parse(msg.data)
        let fromUserName = serverMsg['username'] == null ? '[System]' : serverMsg['username']
        let message = serverMsg['message']
        let avatar = serverMsg['avatar']
        console.log(serverMsg);
        if (serverMsg['system'] === true) {
            avatar = './dist/avatar/14.png'
            getOnlineUsers();
        }
        setOtherMessage(fromUserName, text2Emoji2(message), avatar, serverMsg['image']);
        playSound();
    }

    websocket.onclose = () => {
        layer.alert(oncloseMsg, {icon: 2});
        console.log("websocket已关闭")
    }

    websocket.onerror = () => {
        layer.msg(onerrorMsg, {anim: 6});
        console.log("websocket发生错误")
    }

    initAnimation();
}

//清空屏幕
function emptyScreen() {
    layer.msg('是否清空屏幕？', {
        anim: 6,
        time: 0 //不自动关闭
        , btn: ['确定', '取消']
        , yes: function (index) {
            layer.close(index);
            $("#message").empty();
        }
    });
}

//将消息显示在网页上
function setOtherMessage(nick, msg, avatar, isImage) {

    let currentTime = new Date().toLocaleTimeString();
    if (isImage) {
        $("#message").append(`
        <div class='sendUser' style='text-align: left;'><b/>${nick} ${currentTime}</div>
        <div class="botui-message-left">
            <img class="avatar" style="width: 30px; height: 30px; margin: 10px" src="${avatar}">
            <div class="botui-message-content shake-constant shake-constant--hover">
                <img src="${msg}">
            </div>
        </div>
        `)
    } else {
        $("#message").append(`
        <div class='sendUser' style='text-align: left;'><b/>${nick} ${currentTime}</div>
        <div class="botui-message-left">
            <img class="avatar" style="width: 30px; height: 30px; margin: 10px" src="${avatar}">
            <div class="botui-message-content shake-constant shake-constant--hover">${msg}</div>
        </div>
        `)
    }

    scrollToEnd();
    $(".botui-message-content").animate({'margin-left': '0px'}, 200);
}

//将自己发的消息显示在网页上
function setSelfMessage(nick, msg, isImage) {

    let currentTime = new Date().toLocaleTimeString();
    if (isImage) {
        $("#message").append(`
        <div class='sendUser' style='text-align: right;'><b/>${nick} ${currentTime}</div>
        <div class="botui-message-right">
            <div class="botui-message-content2 shake-constant shake-constant--hover">
                <img src="${msg}">
            </div>
            <img class="avatar" style="width: 30px; height: 30px; margin: 10px" src="${avatarSrc}">
        </div>
        `)
    } else {
        $("#message").append(`
        <div class='sendUser' style='text-align: right;'><b/>${nick} ${currentTime}</div>
        <div class="botui-message-right">
            <div class="botui-message-content2 shake-constant shake-constant--hover">${msg}</div>
            <img class="avatar" style="width: 30px; height: 30px; margin: 10px" src="${avatarSrc}">
        </div>
        `)
    }
    scrollToEnd();
    $(".botui-message-content2").animate({'margin-right': '0px'}, 200);
}

//发送消息
function send() {
    // 转换emoji
    $($("#text").children(".emoji_icon")).each(function () {
        $(this).prop('outerHTML', textHead + $(this).attr("src").split(emojiPath)[1] + textFoot);
    });
    let msg = document.getElementById('text').innerHTML;
    if (msg != null && msg !== "") {
        let request = {
            'roomNumber': roomName,
            'username': nickname,
            'message': msg,
            'avatar': avatarSrc
        }
        let json = JSON.stringify(request)
        document.getElementById('text').innerHTML = null;
        setSelfMessage(nickname, text2Emoji2(msg), null);
        websocket.send(json);
    } else {
        layer.msg("发空消息是什么意思呢？🤔", {anim: 6});
    }
}

// 将文本转换回emoji图片
function text2Emoji2(emojiMsg) {
    return emojiMsg.replace(new RegExp(textHead, "g"), emojiHead).replace(new RegExp(textFoot, "g"), emojiFoot);
}

// 加载表情，这个方法需要一定时间，因此可能造成肉眼可见的卡顿
function loadEmoji() {
    $("#text").emoji({
        button: "#emoji",
        showTab: true,
        animation: 'slide',
        icons: [{
            name: "QQ表情",
            path: "dist/img/qq/",
            maxNum: 154,
            file: ".gif"

        }, {
            name: "坏坏GIF",
            path: "dist/img/huaiGif/",
            maxNum: 26,
            file: ".gif"
        }, {
            name: "猥琐萌",
            path: "dist/img/xiaoren/",
            maxNum: 186,
            file: ".gif"
        }]
    });
}

//监听按键
$(document).keydown(e => {
    // 回车键发送消息
    if (e.keyCode === 13) {
        let topValue = $("#window").css('top');
        let topPx = topValue.substring(0, topValue.length - 2);
        if (topPx > 0) {
            login();
        } else {
            send();
            return false;
        }
    }
});

//发送消息后自动滚到底部
function scrollToEnd() {
    let h = $("html,body").height() - $(window).height();
    $("html,body").animate({scrollTop: h}, 200);
}

//获得当前房间中的所有用户
function getOnlineUsers() {
    $.ajax({
        type: "GET",
        url: "/websocket/online?roomName=" + roomName,
        success: users => {
            $("#cebian").html("");
            console.log(users);
            users.forEach(function (user) {
                console.log(user);
                if (user !== nickname) {
                    let html = '<li>\n' +
                        '                <a class="canvi-navigation__item">\n' +
                        '                    <span  id="user-' + user.id + '" class="canvi-navigation__icon-wrapper" style="background: #00ce46;">\n' +
                        '                        <span class="canvi-navigation__icon icon-iconmonstr-code-13"></span>\n' +
                        '                    </span>\n' +
                        '                    <span class="canvi-navigation__text">' + user + '</span>\n' +
                        '                </a>\n' +
                        '            </li>';
                    $("#cebian").append(html);
                } else {
                    let html = '<li>\n' +
                        '                <a class="canvi-navigation__item">\n' +
                        '                    <span  id="user-' + user.id + '" class="canvi-navigation__icon-wrapper" style="background:#FF3A43;">\n' +
                        '                        <span class="canvi-navigation__icon icon-iconmonstr-code-13"></span>\n' +
                        '                    </span>\n' +
                        '                    <span class="canvi-navigation__me_text">本人</span>\n' +
                        '                </a>\n' +
                        '            </li>';
                    $("#cebian").append(html);
                }
            });
        }
    });
}

//播放提示音
function playSound() {
    //非IE内核浏览器
    let strAudio = "<audio id='audioPlay' src='./audio/ding.mp3' hidden='true' volume='0.2'>";
    if ($("body").find("audio").length <= 0)
        $("body").append(strAudio);
    let audio = document.getElementById("audioPlay");
    audio.volume = 0.2;
    //浏览器支持 audion
    audio.play();
}

let t = new Canvi({
    content: ".js-canvi-content",
    isDebug: !1,
    navbar: ".myCanvasNav",
    openButton: ".js-canvi-open-button--left",
    position: "left",
    pushContent: !1,
    speed: "0.2s",
    width: "100vw",
    responsiveWidths: [{
        breakpoint: "600px",
        width: "21%"
    }, {
        breakpoint: "1280px",
        width: "21%"
    }, {
        breakpoint: "1600px",
        width: "21%"
    }]
})

function allRoom(obj) {
    $.ajax({
        type: "GET",
        url: "/websocket/allRoom",
        dataType: "json",
        success: rooms => {
            $("#rooms").empty();
            if (rooms.length > 0) {
                layer.tips("双击或点这里可选择已存在的房间", obj);
            }
            rooms.forEach(function (room) {
                let html = '<option value="' + room + '">';
                $("#rooms").append(html);
            });
        }
    });
}

function upload(e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = e => {
        let imgCode = e.target.result;
        let request = {
            'roomNumber': roomName,
            'username': nickname,
            'message': imgCode,
            'avatar': avatarSrc,
            'image': true
        };
        let json = JSON.stringify(request);
        setSelfMessage(nickname, imgCode, true);
        websocket.send(json);
    }
}

new Vue({
    el: '#toolbar',
    data: {
        emojiTips: emojiTips,
        clearTips: clearTips,
        sendTips: sendTips,
    }
})

new Vue({
    el: '#canvi',
    data: {
        msgSwitchTips: msgSwitchTips
    }
})
