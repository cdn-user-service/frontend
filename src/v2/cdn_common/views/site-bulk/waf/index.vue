<template>
  <CheckCards ref="CheckCardsRef" hide-check :cards="cards">
    <template #content="{ card }">
      <!-- 公共WAF规则 -->
      <template v-if="card === 'pri_precise_waf_selects'">
        <ul class="space-y-lg" >
          <li class="flex items-center" style="min-height:16px;">
            <!-- <span class="inline-block" style="min-width:80px;">系统规则</span> -->
            <ants-radio-group class="flex-1" v-model="form.pri_precise_waf_selects">
              <ants-radio
                v-for="item in pubWafList"
                :key="item.id"
                :label="item.id"
                :text="item.name"
              />
            </ants-radio-group>
          </li>
        </ul>
      </template>
    </template>
  </CheckCards>
</template>

<script>
import CheckCards from '../CheckCards'

const cards = {
  pri_precise_waf_selects: {
    title: '公共WAF规则',
    info: '通过精准访问控制，可以有效的拦截CC攻击和异常请求。'
  }
}

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getPubWaf } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

const defaultForm = {
  // 公共WAF规则
  pri_precise_waf_selects: ''
}

export default {
  components: {
    CheckCards
  },
  data() {
    return {
      cards,
      form: {
        ...defaultForm
      },
      rules: {},
      // 公共WAF列表
      pubWafList: []
    }
  },
  created() {
    this.getPubWafData()
  },
  methods: {
    getForm() {
      const { submit = () => {} } = this.$refs.CheckCardsRef
      const checkFormKeys = submit()
      if (!checkFormKeys) return false

      const form = {}
      const valid = checkFormKeys.every(key => {
        switch (key) {
          // 公共WAF规则
          case 'pri_precise_waf_selects':
            if (!this.form.pri_precise_waf_selects) {
              this.$msg.error('请选择公共WAF规则')
              return false
            }
            form.pri_precise_waf_selects = this.form.pri_precise_waf_selects
            break
        }
        return true
      })

      if (!valid) return false
      return form
    },

    // 获取公共WAF
    async getPubWafData() {
      const { data: res } = await getPubWaf()
      if (res.code !== 1) return

      const arr = (res.data || []).map(({ id, pvalue }) => {
        const obj = JSON.parse(pvalue || '{}')
        return {
          id,
          name: obj.name,
          remark: obj.remark
        }
      })

      this.pubWafList = arr
    }
  }
}
</script>

<style lang="scss" scoped></style>
