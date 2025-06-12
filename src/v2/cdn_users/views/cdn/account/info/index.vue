<template>
  <div class="userinfo_box">
    <div class="content-box animated fadeIn" v-loading="$root.loading">
      <el-row :gutter="20">
        <el-col
          :xs="{ span: 24 }"
          :sm="{ span: 12 }"
          :md="{ span: 12 }"
          :lg="{ span: 12 }"
          :xl="{ span: 12 }"
        >
          <el-card class="mb-lg">
            <strong>{{ antsT('完善您的账户信息') }}</strong>
            <el-progress
              class="mt-df flex items-center"
              :stroke-width="15"
              :percentage="selfPercent"
              :format="format"
              :color="customColors"
            />
          </el-card>

          <LeftCard :userinfo="userinfo" ref="leftCardRef" />
        </el-col>
        <el-col
          :xs="{ span: 24 }"
          :sm="{ span: 12 }"
          :md="{ span: 12 }"
          :lg="{ span: 12 }"
          :xl="{ span: 12 }"
        >
          <RightCard :userinfo="userinfo" @getUserData="getUserData" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
// 组件
import LeftCard from './components/LeftCard'
import RightCard from './components/RightCard'

export default {
  components: {
    LeftCard,
    RightCard
  },
  data() {
    return {
      customColors: [
        { color: '#ff6666', percentage: 35 },
        { color: '#177dff', percentage: 70 },
        { color: '#1FAE1E', percentage: 100 }
      ],
      // 安全等级进度条数据
      selfPercent: 10,

      // 用户信息
      userinfo: {}
    }
  },
  created() {
    // 获取用户信息
    this.getUserData()
  },
  methods: {
    /**
     * @description: 获取账户信息
     */

    async getUserData() {
      this.$root.loading = true
      const data = await this.$root.getUserinfo()
      this.$root.loading = false
      const user = data || {}

      // 对手机号进行加密
      if (user.mobile) {
        if (user.username === user.mobile) {
          user.username = this.encrypMobile(user.username)
        }
        user.mobile = this.encrypMobile(user.mobile)
      }

      // 对邮箱进行加密
      if (user.mail) {
        if (user.username === user.mail) {
          user.username = this.encrypMobile(user.username)
        }
        user.mail = this.encrypMail(user.mail)
      }

      // 对微信号进行加密
      if (user.note) {
        if (user.username === user.note) {
          user.username = this.encrypMobile(user.username)
        }
        user.note = this.encrypWx(user.note)
      }

      // 对谷歌验证码进行加密
      if (user.googleAuthSecretKey) {
        user.googleAuthSecretKey =
          user.googleAuthSecretKey.substr(0, 1) +
          '******' +
          user.googleAuthSecretKey.substr(-1)
      }

      /** 安全等级进度条显示情况
       *  实名认证 + 20
       *  绑定手机 + 20
       *  绑定邮箱 + 20
       *  绑定微信 + 20
       *  设置支付密码 + 10
       */
      // 如果实名认证
      this.selfPercent = 10
      if (user.realnameStatus) {
        this.selfPercent += 20
      }

      // 绑定手机
      if (user.mobile) {
        this.selfPercent += 20
      }

      // 绑定邮箱
      if (user.mail) {
        this.selfPercent += 20
      }

      // 绑定微信
      if (user.wechatOpenid) {
        this.selfPercent += 20
      }

      // 设置支付密码
      if (user.propertyPayPassword) {
        this.selfPercent += 10
      }

      this.userinfo = user || {}
    },

    /**
     * @description: 账号信息加密显示
     */

    // 手机号加密
    encrypMobile(mobile) {
      return mobile.substr(0, 3) + '****' + mobile.substr(7)
    },

    // 邮箱加密
    encrypMail(mail) {
      const mailArr = mail.split('@')
      let string1 = mailArr[0].substr(0, 3)
      for (let i = 0; i < mailArr[0].length - 3; i++) {
        string1 += '*'
      }

      return string1 + '@' + mailArr[1]
    },

    // 微信号加密
    encrypWx(wx) {
      return wx.substr(0, 3) + '****' + wx.substr(7)
    },

    /**
     * @description: 计算账户信息完善程度
     * @param {*} percentage
     */
    format(percentage) {
      return `${percentage}%`
    }
  }
}
</script>
