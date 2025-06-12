<template>
  <div>
    <ants-form-card>
      <template slot="title">{{antsT('网站漏洞防御')}}</template>
      <template slot="info">
        <ul class="space-y-6">
          <li>
            {{antsT('注意: 此处配置仅对当前站点有效，可防御SQL注入、XSS攻击、恶意扫描等各种漏洞攻击。')}}
          </li>
        </ul>
      </template>
      <template slot="content">
        <ul class="space-y-8">
          <li>
            <el-table
              :data="tableData"
              v-loading="$root.loading"
              style="margin-top:0;"
              size="small"
              border
            >
              <ants-table-column label="名称" prop="name" min-width="140">
              </ants-table-column>
              <ants-table-column label="描述" prop="remark" min-width="300">
              </ants-table-column>
              <!-- <ants-table-column label="状态" width="120">
                <template #default="{ row, $index }">
                  <ants-table-switch
                    v-model="row.status"
                    :ref="`tableSwitchRef${$index}`"
                    @change="changeStatus(row, `tableSwitchRef${$index}`)"
                  >
                  </ants-table-switch>
                </template>
              </ants-table-column> -->

              <ants-table-column label="操作" width="120">
                <template #default="{ row }">
                  <ants-button
                    size="mini"
                    type="primary"
                    @click="showRuleDialog(row)"
                    text="规则"
                  />
                </template>
              </ants-table-column>
            </el-table>
          </li>
        </ul>
      </template>
    </ants-form-card>

    <RuleDialog
      ref="RuleDialogRef"
      v-on="$listeners"
      v-bind="$attrs"
      @refreshData="getTableData"
    />
  </div>
</template>

<script>
import RuleDialog from './ruleDialog'

export default {
  components: {
    RuleDialog
  },
  data() {
    return {
      form: {
        // 开关
        status: 0
      },
      switchLoading: false,

      tableData: []
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取表格数据
     * @return {*}
     */

    async getTableData() {
      const { data: res } = await this.$listeners.getSiteDetail('pub_waf')
      if (!res.attr.length) {
        this.tableData = []
        return
      }

      let forbidArr = []
      res.attr.forEach(item => {
        if ('pub_waf_forbid_selects' in item) {
          forbidArr = item.pub_waf_forbid_selects.map(item => {
            const obj = JSON.parse(item.pvalue)
            return {
              ...item,
              ...obj
            }
          })
        }

        if ('pub_waf_pass_selects' in item) {
          
        }
        
        if ('pub_waf_suspicious_selects' in item) {
          
        }
      })

      this.tableData = forbidArr.reverse()
    },

    showRuleDialog(row = {}) {
      this.$refs.RuleDialogRef.showDialog(row)
    },

    /**
     * @description: 切换状态
     * @param {*} row
     */

    async changeStatus(row, switchRef) {
      //   if (row.status === 0) {
      //     const result = await this.$doDelete({
      //       title: '禁用产品参数',
      //       content: `此操作将禁用产品参数“ <strong style="color: #F78989;">${row.name}</strong> ”，是否继续？`
      //     })
      //     if (!result) {
      //       row.status = 1
      //       return
      //     }
      //   }
      this.$refs[switchRef].loading = true
      //   const { data: res } = await doCreateUpdateProductAttr(row)
      this.$refs[switchRef].loading = false

      //   if (res.code !== 1) {
      //     row.status = row.status ? 0 : 1
      //     return
      //   }

      // this.getTableData()
      this.$msg.success('操作成功')
    }
  }
}
</script>
