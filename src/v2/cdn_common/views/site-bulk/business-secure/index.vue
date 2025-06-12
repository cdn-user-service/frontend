<template>
  <CheckCards ref="CheckCardsRef" :cards="cards">
    <template #content="{ card }">
      <!-- 搜索引擎爬虫限制 -->
      <template v-if="card === 'x_robots_tag'">
        <ants-switch
          v-model="form.x_robots_tag"
          active-text="ON"
          inactive-text="OFF"
          inactive-color="#ff4949"
        />
      </template>

      <!-- 允许跨域请求 -->
      <template v-if="card === 'access_control_allow_origin'">
        <ants-switch
          v-model="form.access_control_allow_origin"
          active-text="ON"
          inactive-text="OFF"
        />
      </template>

      <!-- 防盗链 -->
      <template v-if="card === 'anti_theft_chain'">
        <AntiTheftChain ref="AntiTheftChainRef" />
      </template>
    </template>
  </CheckCards>
</template>

<script>
import CheckCards from '../CheckCards'
import AntiTheftChain from './AntiTheftChain'

const cards = {
  x_robots_tag: {
    title: '搜索引擎爬虫限制',
    info: '开启后将禁止搜索引擎对页面的索引和跟踪，默认为允许'
  },
  access_control_allow_origin: {
    title: '允许跨域请求',
    info:
      '开启后将允许来自其他域的请求访问资源，将会存在潜在的安全风险，谨慎开启！'
  },
  anti_theft_chain: {
    title: '防盗链',
    info:
      '保护网站资源不被外部盗用，开启白名单后只允许白名单中域名访问，开启黑名单后只禁止黑名单中域名访问'
  }
}

const defaultForm = {
  // 搜索引擎爬虫限制
  x_robots_tag: 0,
  // 允许跨域请求
  access_control_allow_origin: 0
}

export default {
  components: {
    CheckCards,
    AntiTheftChain
  },

  data() {
    return {
      cards,
      form: {
        ...defaultForm
      }
    }
  },
  methods: {
    getForm() {
      const { submit = () => {} } = this.$refs.CheckCardsRef
      const checkFormKeys = submit()
      if (!checkFormKeys) return false

      const form = {}
      const valid = checkFormKeys.every(key => {
        switch (key) {
          // 防盗链
          case 'anti_theft_chain':
            var antiTheftChainData = this.$refs.AntiTheftChainRef.submit()
            if (!antiTheftChainData) return false
            Object.assign(form, antiTheftChainData)
            break

          default:
            this.createForm(key, form)
            break
        }
        return true
      })

      if (!valid) return false

      return form
    },

    // 生成form-item
    createForm(prop, form) {
      const value = this.form[prop]

      // 如果为对象
      if (this.$valid.isObject(value)) {
        Object.keys(value).forEach(key => {
          form[key] = value[key]
        })
        return
      }

      // 如果为单个值
      form[prop] = value
    }
  }
}
</script>

<style lang="scss" scoped></style>
