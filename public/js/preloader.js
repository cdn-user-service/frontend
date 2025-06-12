// console.log('开始加载------------', performance.timing.navigationStart)
// const aa = new Date().getTime() - performance.timing.navigationStart
// console.log('结束加载------------', new Date().getTime())

function setOpacity(ele, opacity) {
  if (ele.style.opacity != undefined) {
    // 兼容FF和GG和新版本IE
    ele.style.opacity = opacity / 100
  } else {
    // 兼容老版本ie
    ele.style.filter = 'alpha(opacity=' + opacity + ')'
  }
}

function fadeOut(elem, speed, opacity) {
  /*
   * 参数说明
   * elem==>需要淡出的元素
   * speed==>淡出速度,正整数(可选)
   * opacity==>淡出到指定的透明度,0~100(可选)
   */
  speed = speed || 20
  opacity = opacity || 0
  // 初始化透明度变化值为0
  let val = 100
  // 循环将透明值以10递减,即淡出效果
  ;(function() {
    setOpacity(elem, val)
    val -= 10
    if (val >= opacity) {
      setTimeout(arguments.callee, speed)
    } else if (val < 0) {
      // 元素透明度为0后隐藏元素
      elem.style.display = 'none'
    }
  })()
}

function setLoading(loading = false) {
  const preloader = document.getElementById('preloader')
  if (loading) {
    preloader.style.display = 'block'
    preloader.style.opacity = 1
    document.getElementById('preloaderText').innerText = 'loading'
  } else {
    fadeOut(preloader, 10, 0)
  }
}

window.setLoading = setLoading

window.onload = function() {
  // setLoading(false)
}
