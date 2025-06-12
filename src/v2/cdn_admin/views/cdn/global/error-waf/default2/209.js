export default `
<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>&#x5b89;&#x5168;&#x68c0;&#x6d4b;</title>

    <style>
        body {
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 360px;
            min-height: 100vh;
            padding-bottom: 30px;
            margin: 0;
        }

        div,
        span {
            box-sizing: border-box;
        }

        .main {
            text-align: center;
            padding: 20px 10px 60px;
            background-color: #fff;
            border-radius: 15px;
            width: 400px;
        }

        .title {
            margin: 30px 0 20px;
            color: #333;
            font-weight: 600;
            font-size: 20px;
        }

        .info {
            font-size: 13px;
            color: #999;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        .handle {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 400px;
            min-height: 60px;
            margin: 20px auto;
            padding: 30px;
            border: 1px solid #eee;
        }

        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #999;
        }

        .captcha {
            height: 60px;
            width: 180px;
            border: 1px dashed #999;
        }

        .captcha-btn {
            display: inline-block;
            padding: 10px;
            margin-left: 20px;
            font-size: 16px;
            color: #F25315;
            font-weight: 600;
            cursor: pointer;
        }

        .captcha-form {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
        }

        .captcha-input {
            height: 46px;
            flex: 1;
            border: none;
            border-bottom: 2px solid #eee;
            font-size: 15px;
            outline: none;
        }

        .captcha-submit {
            padding: 6px 25px;
            margin-left: 30px;
            font-size: 15px;
            color: #fff;
            background-color: #3FAC70;
            border: none;
            cursor: pointer;
            white-space: nowrap;
        }
    </style>
</head>

<body>
    <div class="main">
        <svg t="1713323779478" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
            p-id="5098" width="50" height="50">
            <path
                d="M829.6 960.6h-634c-35.9 0-65.8-23.9-65.8-65.8V434.2c0-35.9 29.9-65.8 65.8-65.8h634c35.9 0 65.8 29.9 65.8 65.8v460.5c6 41.9-23.9 65.9-65.8 65.9z m-634-532.3c-5.9 0-5.9 5.9 0 0l-6 466.5c0 6 0 6 6 6h634c6 0 6 0 6-6V434.2c0-6 0-6-6-6h-634z"
                p-id="5099" data-spm-anchor-id="a313x.search_index.0.i1.36733a81JCM4hs" class="selected" fill="#C6D8EB">
            </path>
            <path
                d="M590.4 589.8c0-41.9-41.9-77.8-77.8-77.8-41.9 0-71.8 41.9-71.8 77.8 0 29.9 17.9 59.8 47.8 65.8v107.7c0 12 6 17.9 17.9 17.9h23.9c12 0 17.9-6 17.9-17.9V655.5c24.1-5.9 42.1-35.8 42.1-65.7zM763.8 392.4H704v-89.7c0-101.7-83.7-179.4-179.4-179.4-101.7 0-179.4 83.7-179.4 179.4v89.7h-59.8v-89.7c0-131.6 107.7-239.2 239.2-239.2s239.2 107.7 239.2 239.2v89.7z"
                p-id="5100" data-spm-anchor-id="a313x.search_index.0.i4.36733a81JCM4hs" class="selected" fill="#C6D8EB">
            </path>
        </svg>

        <div class="title">&#x8fd8;&#x9700;&#x4e00;&#x6b65;</div>

        <div class="info">
            &#x60a8;&#x9700;&#x8981;&#x5b8c;&#x6210;&#x5b89;&#x5168;&#x9a8c;&#x8bc1;&#x540e;&#x624d;&#x80fd;&#x7ee7;&#x7eed;&#x8bbf;&#x95ee;
            <span style="color:#409eff;" id="TargetUrl"></span>
        </div>

        <div class="handle">
            <img id="Captcha" class="captcha" src="" />

            <span class="captcha-btn" onclick="changeCode()">&#x6362;&#x4e00;&#x5f20;</span>
        </div>

        <form action="" class="captcha-form" id="CaptchaForm">
            <input id="CaptchaInput" type="text" maxlength="4" class="captcha-input"
                placeholder="&#x8bf7;&#x5728;&#x6b64;&#x5904;&#x8f93;&#x5165;&#x9a8c;&#x8bc1;&#x7801;"
                autocomplete="off">

            <button type="submit" id="SubmitBtn" class="captcha-submit">&#x8fdb;&#x5165;&#x7f51;&#x7ad9;</button>
        </form>

        <div class="footer">CC protection by XDPCLOUD</div>
    </div>

    <script src="https://cdnjs.tacool.com/jquery/3.5.1/jquery.min.js"></script>

    <script>
        const TargetUrl = document.getElementById('TargetUrl')
        TargetUrl.innerText = location.hostname

        if (typeof img_src === "undefined") {

        } else {
            document.getElementById('Captcha').src = img_src
        }

        function changeCode() {
            location.reload()
        }

        const SubmitBtn = document.getElementById('SubmitBtn')

        SubmitBtn.onclick = () => {
            event.preventDefault()
            const code = document.getElementById('CaptchaInput').value
            if (!code) return
            verify_func(code)
            document.location.reload()
        }
    </script>
</body>

</html>
`
