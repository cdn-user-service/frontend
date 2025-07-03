<template>
  <div class="ants-captcha ml-lg cursor-pointer" @click="changeCaptcha">
    <img
      style="opacity: 0"
      :src="imgSrc"
      alt="captcha"
      onload="this.style.opacity = '1'"
      @error="onError"
    />
  </div>
</template>

<script>
// 当前进程 cdn_users = CDN客户端，cdn_admin = CDN管理端
const urlObj = {
  cdn_users: 'app/account/kaptcha.jpg',
  cdn_admin: 'captcha.jpg',
  dns_users: 'app/account/kaptcha.jpg',
  dns_admin: 'sys_login_captcha.jpg'
}
const activeUrl = urlObj[process.env.VUE_APP_NAME]

export default {
  name: 'AntsCaptcha',
  props: {
    // 获取验证码的接口，不以 / 开头的，如: app/account/kaptcha.jpg
    url: String
  },
  data() {
    return {
      // 验证码随机数
      random: this.getRandom(),
      reloadTime: 0
    }
  },
  computed: {
    cptRUrl() {
      return this.url || activeUrl
    },
    imgSrc({ $root }) {
      const url = `${$root.webRootApi}${this.cptRUrl}?uuid=${this.random}`
      console.log('🟡 拼接出的验证码完整 URL:', url)
      return url
    }
  },
  methods: {
    /**
     * @description: 切换验证码
     */

    changeCaptcha() {
      this.random = this.getRandom()
    },

    onError(error) {
      if (this.reloadTime >= 5) return
      this.reloadTime++
      console.log('error', error)
      const reload = this.throttle(() => {
        this.changeCaptcha()
      }, 200)
      reload()
    },

    throttle(func, delay) {
      let timerId
      return function () {
        if (!timerId) {
          timerId = setTimeout(function () {
            func.apply(this, arguments)
            timerId = null
          }, delay)
        }
      }
    },
    /**
     * @description: 获取验证码随机数，这里需要长一点，不然会有几率造成浏览器卡死（随机数重复导致后端传递过来的数据相同，就会出错）
     */

    getRandom() {
      // 长度不超过 32 位，这里提取 30 位
      const randomStr = new Date().getTime() + '-' + Math.random() * 100
      return randomStr.substr(0, 30)
    }
  }
}
</script>

<style lang="scss">
// 给父 el-form-item 的类名
.ants-captcha_item {
  .el-form-item__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
.ants-captcha {
  min-width: 120px;
  height: 50px;
  border-radius: 6px;
  box-shadow: 0 0 15px rgba(23, 125, 255, 0.1);
  overflow: hidden;
  img {
    height: 100%;
    vertical-align: top;
  }
}
</style>
