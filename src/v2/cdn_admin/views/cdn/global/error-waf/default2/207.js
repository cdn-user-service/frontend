export default `
<!DOCTYPE html>
<html lang='zh-CN'>

<head>
    <meta charset='utf-8' />
    <meta http-equiv='X-UA-Compatible' content='IE=edge' />
    <meta name='viewport' content='width=device-width,initial-scale=1.0' />
    <title>&#x5B89;&#x5168;&#x9632;&#x62A4;&#x7CFB;&#x7EDF;</title>
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
            padding: 20px 10px;
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
            justify-content: center;
            align-items: center;
            max-width: 400px;
            min-height: 60px;
            margin: 20px auto;
            padding: 10px;
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

        .check {
            font-size: 14px;
            font-weight: 400;
            max-width: 360px;
        }

        .imgdiv {
            position: relative;
            border: solid 0px#000;
            display: inline-block;
            margin: 0 0;
        }


        .imgdiv img {
            border-radius: 2px;
            width: 180px;
        }

        .imgdiv.marker {
            position: absolute;
            width: 15px;
            height: 15px;
            background: #ff000099;
            border: solid 1px#000;
            border-radius: 10px;
        }
    </style>
</head>

<body>
    <div class='main'>
        <svg t='1713323779478' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg'
            p-id='5098' width='50' height='50'>
            <path
                d='M829.6 960.6h-634c-35.9 0-65.8-23.9-65.8-65.8V434.2c0-35.9 29.9-65.8 65.8-65.8h634c35.9 0 65.8 29.9 65.8 65.8v460.5c6 41.9-23.9 65.9-65.8 65.9z m-634-532.3c-5.9 0-5.9 5.9 0 0l-6 466.5c0 6 0 6 6 6h634c6 0 6 0 6-6V434.2c0-6 0-6-6-6h-634z'
                p-id='5099' data-spm-anchor-id='a313x.search_index.0.i1.36733a81JCM4hs' class='selected' fill='#C6D8EB'>
            </path>
            <path
                d='M590.4 589.8c0-41.9-41.9-77.8-77.8-77.8-41.9 0-71.8 41.9-71.8 77.8 0 29.9 17.9 59.8 47.8 65.8v107.7c0 12 6 17.9 17.9 17.9h23.9c12 0 17.9-6 17.9-17.9V655.5c24.1-5.9 42.1-35.8 42.1-65.7zM763.8 392.4H704v-89.7c0-101.7-83.7-179.4-179.4-179.4-101.7 0-179.4 83.7-179.4 179.4v89.7h-59.8v-89.7c0-131.6 107.7-239.2 239.2-239.2s239.2 107.7 239.2 239.2v89.7z'
                p-id='5100' data-spm-anchor-id='a313x.search_index.0.i4.36733a81JCM4hs' class='selected' fill='#C6D8EB'>
            </path>
        </svg>

        <div class='title'>
            &#x8fd8;&#x9700;&#x8981;&#x4e00;&#x6b65;
        </div>

        <div class='info'>
            &#x60a8;&#x9700;&#x8981;&#x5b8c;&#x6210;&#x5b89;&#x5168;&#x9a8c;&#x8bc1;&#x540e;&#x624d;&#x80fd;&#x7ee7;&#x7eed;&#x8bbf;&#x95ee;           
            <span style="color:#409eff;" id="TargetUrl"></span>
        </div>

        <div class='handle'>
            <div class='check'>
                <div class='imgdiv' id='area'  >
                    <img  id="verify_img"  onclick='verify_func_check(event)' width="160"    />
                </div>
                <div id='canvas_img'></div>
            </div>
        </div>

        <div>&#x8bf7;&#x70b9;&#x51fb;&#x4e0a;&#x56fe;&#x4e2d;&#x7684; <span id="verify_char"></span></div>

    </div>

    <div class="footer">CC protection by XDPCLOUD</div>
</body>

<script>
   const TargetUrl = document.getElementById('TargetUrl')
   TargetUrl.innerText = location.hostname
   
   function verify_func_check(event) {
            verify_func(event);
            window.location.reload();
     }
    window.onload = function() {
            document.getElementById("verify_char").innerText=max_char;
            document.getElementById("verify_img").setAttribute("src",img_src);         
    }     
</script>

</html>
`
