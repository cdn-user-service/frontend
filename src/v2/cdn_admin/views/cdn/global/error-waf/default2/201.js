export default `
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <meta name='wait' content='width=device-width,initial-scale=1'>
    <style>
        .spinner {
            height: 85vh;
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-pack: center;
            -ms-flex-pack: center;
            justify-content: center;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center
        }

        .spinner>div {
            width: 18px;
            height: 18px;
            margin: 0 4px;
            background-color: #333;
            border-radius: 100%;
            display: inline-block;
            -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
            animation: sk-bouncedelay 1.4s infinite ease-in-out both
        }

        .spinner .bounce1 {
            -webkit-animation-delay: -.32s;
            animation-delay: -.32s;
            background-color: #f05125
        }

        .spinner .bounce2 {
            -webkit-animation-delay: -.16s;
            animation-delay: -.16s;
            background-color: #7fbb42
        }

        .spinner .bounce3 {
            background-color: #32a0da
        }

        @-webkit-keyframes sk-bouncedelay {

            0%,
            100%,
            80% {
                -webkit-transform: scale(0)
            }

            40% {
                -webkit-transform: scale(1)
            }
        }

        @keyframes sk-bouncedelay {

            0%,
            100%,
            80% {
                -webkit-transform: scale(0);
                transform: scale(0)
            }

            40% {
                -webkit-transform: scale(1);
                transform: scale(1)
            }
        }
    </style>
</head>
<body>
    <div class='spinner'>
        <div class='bounce1'></div>
        <div class='bounce2'></div>
        <div class='bounce3'></div>
    </div><a href='' id='a'></a>
    <script>
        setTimeout(() => { verify_func();window.location.reload(); }, 1000);
    </script>
</body>

</html>
`
