<template>
  <CheckCards ref="CheckCardsRef" :cards="cards">
    <template #content="{ card }">
      <!-- 回源重试设置 -->
      <template v-if="card === 'inj_pen_selects'">
        <el-table
          :data="tableData"
          style="margin-top:0;"
          size="mini"
          border
          max-height="360"
        >
          <ants-table-column label="#" type="index" width="60">
          </ants-table-column>
          <ants-table-column label="名称" prop="name" width="150">
          </ants-table-column>
          <ants-table-column label="分类" prop="group" width="120">
          </ants-table-column>
          <ants-table-column label="描述" prop="remark" min-width="200">
          </ants-table-column>

          <ants-table-column label="关闭|开启" width="120" align="center">
            <template #default="{ row }">
              <ants-table-switch v-model="row.status"> </ants-table-switch>
            </template>
          </ants-table-column> </el-table
      ></template>

      <!-- IP白名单 -->
      <template v-if="card === 'ip_white'">
        <IpWhite ref="IpWhiteRef" />
      </template>

      <!-- IP黑名单 -->
      <template v-if="card === 'ip_black'">
        <IpBlack ref="IpBlackRef" />
      </template>
    </template>
  </CheckCards>
</template>

<script>
import CheckCards from '../CheckCards'
import IpWhite from './IpWhite'
import IpBlack from './IpBlack'

const cards = {
  inj_pen_selects: {
    title: '网站漏洞防御',
    info:
      '注意：此处配置仅对当前站点有效，可防御SQL注入、XSS攻击、恶意扫描等各种漏洞攻击。'
  },
  ip_white: {
    title: 'IP白名单',
    info: ''
  },
  ip_black: {
    title: 'IP黑名单',
    info: ''
  }
}

const defaultForm = {
  inj_pen_selects: ''
}

export default {
  components: {
    CheckCards,
    IpWhite,
    IpBlack
  },
  data() {
    return {
      cards,
      form: {
        ...defaultForm
      },
      loading: false,
      tableData: []
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
          // 网站漏洞防御
          case 'inj_pen_selects':
            var checkIds = this.tableData
              .filter(it => it.status)
              .map(it => it.id)
            form.inj_pen_selects = checkIds + ''
            break

          // IP白名单
          case 'ip_white':
            var ipWhiteData = this.$refs.IpWhiteRef.submit()
            if (!ipWhiteData) return false
            Object.assign(form, ipWhiteData)
            break

          // IP黑名单
          case 'ip_black':
            var ipBlackData = this.$refs.IpBlackRef.submit()
            if (!ipBlackData) return false
            Object.assign(form, ipBlackData)
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
