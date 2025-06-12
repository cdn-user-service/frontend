<template>
  <el-card class="animated fadeIn" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('网站权限配置') }}</strong>
    </div>

    <ul class="p-sm sm:p-lg space-y-8 bg-ants-bg-5 rounded-2xl switch-wrap">
      <li
        class="p-lg bg-ants-bg-1 rounded-2xl flex justify-between"
        v-for="(item, idx) in setList"
        :key="idx"
      >
        <div>
          <div class="font-semibold">{{ antsT(item.title) }}</div>
          <div
            class="mt-df text-sm"
            :class="item.color || 'text-ants-text-3'"
            v-html="antsT(item.info)"
          ></div>
        </div>

        <ants-switch
          v-model="item.value"
          :active-value="1"
          :inactive-value="0"
          active-color="#00AF57"
          v-loading="loading"
          @change="val => changeSwitch(val, item)"
        />
      </li>
    </ul>
  </el-card>
</template>

<script>
import { $mode } from '@/utils/env'

const setList = {
  realName: {
    title: '强制实名认证',
    info:
      '开启实名认证后，将强制用户进行实名认证，否则不能进行购买套餐、添加域名、添加转发等操作。',
    closeInfo: '关闭后将不再强制用户进行实名认证。',
    value: 0
  },
  bindMobile: {
    title: '强制绑定手机号',
    info:
      '将强制用户绑定手机号，否则不能进行购买套餐、添加域名、添加转发等一系列操作。需要配置 <a href="#/system/config/sms">短信模板</a>。',
    closeInfo: '关闭后将不再强制用户绑定手机号。',
    value: 0
  },
  stopWork: {
    title: '流量超限或套餐过期停用业务',
    info: '开启后，用户流量超限或者套餐过期，将会自动停用套餐所绑定业务。',
    closeInfo: '关闭后，用户流量超限或套餐过期将不会自动停用业务。',
    value: 0
  },
  register: {
    title: '关闭注册功能',
    info: '特别提醒：开启后，注册功能将会关闭，用户不能进行账号注册！！！',
    closeInfo: '关闭后，注册功能将会开启，用户正常可以进行账号注册。',
    value: 0,
    color: 'text-error'
  },
  registerCommon: {
    title: '普通账号注册',
    info: '开启后，用户将使用普通账号注册，不需要验证手机号和邮箱。',
    closeInfo: '关闭后，将强制用户使用邮箱和手机号进行注册，你需要配置手机号和邮箱的验证码模版。',
    value: 0
  }
}

// 定制的功能，需要限制
if ($mode.tw) {
  setList.disabledCrud = {
    title: '禁用添加、修改、删除功能',
    info: '开启后，用户将不能使用添加、修改、删除等功能！',
    closeInfo: '关闭后，用户可以正常使用添加、修改、删除等功能。',
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
        // 是否开启注册功能
        register: 0,
        // 是否开启普通账号注册功能
        registerCommon: 0,
        // 是否禁用用户平台增删改功能，默认为不禁用
        disabledCrud: 0
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
      Object.keys(power).forEach(item => {
        if (this.setList[item]) {
          this.setList[item].value = power[item] || 0
        }
      })

      this.power = {
        ...this.power,
        ...power
      }
    },

    /**
     * @description: 开关
     * @param {*} val
     */
    async changeSwitch(val, item) {
      const result = await this.$doDelete({
        title: item.title,
        content: `${val == 1 ? item.info : item.closeInfo}是否继续？`
      })

      if (!result) {
        item.value = val == 1 ? 0 : 1
        return
      }

      this.loading = true
      try {
        Object.keys(this.power).forEach(item => {
          if (this.setList[item]) {
            this.power[item] = this.setList[item].value
          }
        })

        const res = await this.$listeners.updateBasicConfig({
          power: this.power
        })

        if (res.code !== 1) return
        this.$msg.success('操作成功')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
