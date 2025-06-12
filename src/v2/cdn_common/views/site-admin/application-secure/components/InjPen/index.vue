<template>
  <ants-form-card>
    <template slot="title">{{ antsT('网站漏洞防御') }}</template>
    <template slot="info">
      <ul class="space-y-6">
        <li>
          {{
            antsT(
              '注意: 此处配置仅对当前站点有效，可防御SQL注入、XSS攻击、恶意扫描等各种漏洞攻击。'
            )
          }}
        </li>
      </ul>
    </template>
    <template slot="content">
      <el-table
        :data="tableData"
        v-loading="loading"
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

        <ants-table-column
          label="关闭|开启"
          width="120"
          align="center"
          v-if="!$root.disabledCrud"
        >
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              :ref="`tableSwitchRef${$index}`"
              @change="changeStatus(row, `tableSwitchRef${$index}`)"
            >
            </ants-table-switch>
          </template>
        </ants-table-column>
      </el-table>
    </template>
  </ants-form-card>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      form: {
        inj_pen_selects: []
      },
      tableData: []
    }
  },
  created() {
    this.init()
  },
  computed: {},
  methods: {
    async init() {
      this.loading = true
      try {
        await this.getData()
      } finally {
        this.loading = false
      }
    },

    async getData() {
      const { data: res } = await this.$listeners.getSiteDetail(
        '',
        'inj_pen_selects'
      )
      const arr = res.attr || []
      arr.forEach(item => {
        if (item.pkey === 'inj_pen_selects') {
          if (!item.pvalue) return
          this.form.inj_pen_selects = item.pvalue.split(',')
        }
      })
      console.log(this.form.inj_pen_selects)
      this.getTableData()
    },

    async getTableData() {
      const { data: res } = await this.$listeners.getSiteDetail('injPenEnums')
      const arr = res.attr || []
      this.tableData = arr.map(item => {
        return {
          ...item,
          idPlus: item.id + 1,
          loading: false,
          status: this.form.inj_pen_selects.includes(item.id + '') ? 1 : 0
        }
      })
    },

    async changeStatus(row, switchRef) {
      this.$refs[switchRef].loading = true
      try {
        const res = await this.doSave()
        if (!res) {
          row.status = row.status ? 0 : 1
          return
        }
        this.$msg.success('操作成功')
      } finally {
        this.$refs[switchRef].loading = false
      }
    },

    async doSave() {
      const ids = []
      this.tableData.forEach(item => {
        if (item.status === 1) {
          ids.push(item.id)
        }
      })
      console.log(ids)
      const res = await this.$listeners.saveSiteAttr({
        inj_pen_selects: ids + ''
      })
      return res
    }
  }
}
</script>
