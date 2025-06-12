<template>
  <el-card class="animated fadeIn content-box" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('网站权限配置') }}</strong>
    </div>

    <ul class="p-lg bg-ants-bg-3 rounded-2xl switch-wrap switch-loading">
      <li
        class="p-lg bg-ants-bg-1 rounded-2xl mb-lg flex justify-between"
        v-for="(item, idx) in setList"
        :key="idx"
      >
        <div>
          <div class="font-bold">{{ item.title }}</div>
          <div class="mt-lg text-ants-text-3 text-sm" v-html="item.info"></div>
        </div>

        <el-switch
          v-model="item.value"
          active-color="#02B340"
          :active-value="1"
          :inactive-value="0"
          @change="(val) => changeSwitch(val, item)"
          v-loading="loading"
          element-loading-spinner="el-icon-loading"
        >
        </el-switch>
      </li>
    </ul>
  </el-card>
</template>

<script>
const setList = {
  realName: {
    title: '强制实名认证',
    info: '开启实名认证后，将强制用户进行实名认证，否则不能进行购买套餐、添加域名、添加解析等操作。',
    value: 0,
    url: ''
  },
  bindMobile: {
    title: '强制绑定手机号',
    info: '将强制用户绑定手机号，否则不能进行购买套餐、添加域名、添加解析等一系列操作。需要配置 <a href="#/system/config/sms">短信模板</a>。',
    value: 0,
    url: ''
  },
  stopWork: {
    title: '流量超限或套餐过期停用业务',
    info: '开启后，用户流量超限或者套餐过期，将会自动停用套餐所绑定业务。',
    value: 0,
    url: ''
  },
  registerCommon: {
    title: '普通账号注册',
    info: '开启后，用户将使用普通账号注册，不需要验证手机号和邮箱。',
    closeInfo:
      '关闭后，将强制用户使用邮箱和手机号进行注册，你需要配置手机号和邮箱的验证码模版。',
    value: 0
  }
}

export default {
  data() {
    return {
      power: {
        // 实名认证
        realName: 0,
        // 强制绑定手机号
        bindMobile: 0,
        // 停用业务
        stopWork: 0,
        // 是否开启普通账号注册功能
        registerCommon: 0
      },

      loading: false,

      setList
    }
  },
  created() {
    this.getData()
  },
  methods: {
    /**
     * @description: 获取数据
     */

    async getData() {
      const { power } = await this.$listeners.getBasicConfig()
      Object.keys(power).forEach((item) => {
        if (this.setList[item]) {
          this.setList[item].value = power[item] || 0
        }
      })
      this.power = power || {}
    },

    /**
     * @description: 开关
     * @param {*} val
     */
    async changeSwitch(val, item) {
      // 关闭
      let text = '关闭'
      let resetValue = 1
      const title = item.title
      if (val == 1) {
        text = '开启'
        resetValue = 0
      }

      const result = await this.$doDelete({
        title: `${text}提示`,
        content: `该操作将会${text}${title}功能，是否继续？`,
        cancelInfo: `已取消${text}${title}功能`
      })

      if (!result) {
        item.value = resetValue
        return
      }

      this.loading = true
      try {
        Object.keys(this.power).forEach((item) => {
          if (this.setList[item]) {
            this.power[item] = this.setList[item].value
          }
        })

        const res = await this.$listeners.updateBasicConfig({
          power: this.power
        })

        if (res.code !== 1) return
        this.$msg.success(`${text}${title}功能成功`)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.switch-wrap {
  > li {
    &:last-child {
      margin-bottom: 0;
    }
  }

  @media screen and (max-width: 767px) {
    padding: 10px;
    > li {
      margin-bottom: 10px;
    }
  }
}
</style>
