// tip: 重复调用 message组件，会形成消息队列，消息提示会越来越多，体验感差
// 利用element-ui中message的close方法，在下一个弹框弹出前先把上一个弹框实例关闭掉
import Vue from 'vue'
import { Message } from 'element-ui' // 引入message

let messageInstance = null
const resetMessage = (options) => {
  if (messageInstance) {
    messageInstance.close() // 关闭
  }
  messageInstance = Message(options)
}

;['error', 'success', 'info', 'warning'].forEach((type) => {
  resetMessage[type] = (options) => {
    if (typeof options === 'string') {
      options = {
        message: options
      }
    }
    options.type = type
    // options.duration = 0
    return resetMessage(options)
  }
})

Vue.prototype.$msg = resetMessage
export const msg = resetMessage
