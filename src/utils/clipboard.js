import Vue from 'vue'
import Clipboard from 'clipboard'
import { isBlank } from './validate'

/**
 * @description 复制数据
 * @param text 复制的内容
 * @param event 触发对象事件，传 $event 即可
 * @param name 复制对象的名称，可不传
 */
export default function handleClipboard(text, event, name = '') {
  if (isBlank(text)) {
    Vue.prototype.$msg.error(`${name}复制失败，内容为空`)
    return
  }

  const clipboard = new Clipboard(event.target, {
    text: () => text
  })

  clipboard.on('success', () => {
    Vue.prototype.$msg.success(`${name}复制成功`)
    clipboard.destroy()
  })
  clipboard.on('error', () => {
    Vue.prototype.$msg.error(`${name}复制失败，该浏览器不支持自动复制`)
    clipboard.destroy()
  })

  // 触发点击事件，不然第一次点击不会生效
  clipboard.onClick(event)
}

Vue.prototype.$handleClipboard = handleClipboard
