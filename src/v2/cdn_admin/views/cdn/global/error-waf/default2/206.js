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
            padding: 15px;
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


        #dragContainer {
            position: relative;
            display: inline-block;
            background: #f1f1f1;
            width: 100%;
            max-width: 300px;
            height: 50px;
            border: 3px solid#f1f1f1;
            overflow: hidden;
        }

        #dragBg {
            position: absolute;
            background-color: #177dff;
            width: 0px;
            height: 100%;
            cursor: pointer;
        }

        #dragText {
            position: absolute;
            width: 100%;
            height: 100%;
            text-align: center;
            line-height: 50px;
            color: #177dff;
            user-select: none;
            -webkit-user-select: none;
        }

        #dragHandler {
            position: absolute;
            width: 50px;
            height: 100%;
            cursor: move;
            left: 0;
        }

        .dragHandlerBg {
            background: #fff no-repeat center url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0ZDhlNWY5My05NmI0LTRlNWQtOGFjYi03ZTY4OGYyMTU2ZTYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NTEyNTVEMURGMkVFMTFFNEI5NDBCMjQ2M0ExMDQ1OUYiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTEyNTVEMUNGMkVFMTFFNEI5NDBCMjQ2M0ExMDQ1OUYiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2MTc5NzNmZS02OTQxLTQyOTYtYTIwNi02NDI2YTNkOWU5YmUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NGQ4ZTVmOTMtOTZiNC00ZTVkLThhY2ItN2U2ODhmMjE1NmU2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+YiRG4AAAALFJREFUeNpi/P//PwMlgImBQkA9A+bOnfsIiBOxKcInh+yCaCDuByoswaIOpxwjciACFegBqZ1AvBSIS5OTk/8TkmNEjwWgQiUgtQuIjwAxUF3yX3xyGIEIFLwHpKyAWB+I1xGSwxULIGf9A7mQkBwTlhBXAFLHgPgqEAcTkmNCU6AL9d8WII4HOvk3ITkWJAXWUMlOoGQHmsE45ViQ2KuBuASoYC4Wf+OUYxz6mQkgwAAN9mIrUReCXgAAAABJRU5ErkJggg==');
        }

        .dragHandlerOkBg {
            background: #fff no-repeat center url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0ZDhlNWY5My05NmI0LTRlNWQtOGFjYi03ZTY4OGYyMTU2ZTYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDlBRDI3NjVGMkQ2MTFFNEI5NDBCMjQ2M0ExMDQ1OUYiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDlBRDI3NjRGMkQ2MTFFNEI5NDBCMjQ2M0ExMDQ1OUYiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDphNWEzMWNhMC1hYmViLTQxNWEtYTEwZS04Y2U5NzRlN2Q4YTEiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NGQ4ZTVmOTMtOTZiNC00ZTVkLThhY2ItN2U2ODhmMjE1NmU2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+k+sHwwAAASZJREFUeNpi/P//PwMyKD8uZw+kUoDYEYgloMIvgHg/EM/ptHx0EFk9I8wAoEZ+IDUPiIMY8IN1QJwENOgj3ACo5gNAbMBAHLgAxA4gQ5igAnNJ0MwAVTsX7IKyY7L2UNuJAf+AmAmJ78AEDTBiwGYg5gbifCSxFCZoaBMCy4A4GOjnH0D6DpK4IxNSVIHAfSDOAeLraJrjgJp/AwPbHMhejiQnwYRmUzNQ4VQgDQqXK0ia/0I17wJiPmQNTNBEAgMlQIWiQA2vgWw7QppBekGxsAjIiEUSBNnsBDWEAY9mEFgMMgBk00E0iZtA7AHEctDQ58MRuA6wlLgGFMoMpIG1QFeGwAIxGZo8GUhIysmwQGSAZgwHaEZhICIzOaBkJkqyM0CAAQDGx279Jf50AAAAAABJRU5ErkJggg==');
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
            &#x60a8;&#x9700;&#x8981;&#x6ed1;&#x52a8;&#x6ed1;&#x5757;&#x540e;&#x624d;&#x80fd;&#x7ee7;&#x7eed;&#x8bbf;&#x95ee;       
            <span style="color:#409eff;" id="TargetUrl"></span>
        </div>

        <div class='handle'>
            <div id='dragContainer'>
                <div id='dragBg'></div>
                <div id='dragText'>&#x5411;&#x53f3;&#x6ed1;&#x52a8;&#x6ed1;&#x5757;&#x4ee5;&#x5b8c;&#x6210;&#x64cd;&#x4f5c;</div>
                <div id='dragHandler' class='dragHandlerBg'></div>
            </div>
        </div>
    </div>

    <div class="footer">CC protection by XDPCLOUD</div>
    
    <script>
        const TargetUrl = document.getElementById('TargetUrl')
        TargetUrl.innerText = location.hostname

        window.onload = function () {
            const dragContainer = document.getElementById('dragContainer');
            const dragBg = document.getElementById('dragBg');
            const dragText = document.getElementById('dragText');
            const dragHandler = document.getElementById('dragHandler');
            let isVertifySucc = false; const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            initDrag();
            function initDrag() { if (isMobile) { dragHandler.addEventListener('touchstart', onDragHandlerTouchStart) } else { dragHandler.addEventListener('mousedown', onDragHandlerMouseDown) } }
            function onDragHandlerMouseDown(event) { event.preventDefault(); document.addEventListener('mousemove', onDragHandlerMouseMove); document.addEventListener('mouseup', onDragHandlerMouseUp) }
            function onDragHandlerTouchStart(event) { event.preventDefault(); document.addEventListener('touchmove', onDragHandlerTouchMove); document.addEventListener('touchend', onDragHandlerTouchEnd) }
            const containerWidth = dragContainer.clientWidth;
            const handlerWidth = dragHandler.clientWidth;
            const sildeWidth = containerWidth - handlerWidth;
            function onDragHandlerMouseMove(event) {
                let left = event.clientX - dragContainer.offsetLeft - handlerWidth / 2; if (left < 0) {
                    left = 0
                } else if (left > sildeWidth) {
                    left = sildeWidth; verifySucc()
                }
                dragHandler.style.left = dragBg.style.width = left + 'px'
            }
            function onDragHandlerTouchMove(event) {
                event.preventDefault();
                let touch = event.changedTouches[0];
                let left = touch.clientX - dragContainer.offsetLeft - handlerWidth / 2;
                if (left < 0) { left = 0 } else if (left > sildeWidth) { left = sildeWidth; verifySucc() } dragHandler.style.left = dragBg.style.width = left + 'px'
            }
            function onDragHandlerMouseUp(event) { document.removeEventListener('mousemove', onDragHandlerMouseMove); document.removeEventListener('mouseup', onDragHandlerMouseUp); resetDrag() }
            function onDragHandlerTouchEnd(event) { document.removeEventListener('touchmove', onDragHandlerTouchMove); document.removeEventListener('touchend', onDragHandlerTouchEnd); resetDrag() }
            function resetDrag() { dragHandler.style.left = 0; dragBg.style.width = 0 }
            function verifySucc() {
                isVertifySucc = true;
                dragText.style.color = 'white';
                dragHandler.setAttribute('class', 'dragHandlerOkBg');
                dragHandler.removeEventListener('mousedown', onDragHandlerMouseDown);
                document.removeEventListener('mousemove', onDragHandlerMouseMove);
                document.removeEventListener('mouseup', onDragHandlerMouseUp);
                dragHandler.removeEventListener('touchstart', onDragHandlerTouchStart);
                document.removeEventListener('touchmove', onDragHandlerTouchMove);
                document.removeEventListener('touchend', onDragHandlerTouchEnd);
                verify_func();
                document.location.reload();
                }
        };
    </script>
</body>

</html>
`
