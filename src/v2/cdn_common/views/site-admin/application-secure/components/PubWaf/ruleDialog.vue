<template>
  <ants-dialog
    :title="`${antsT('网站规则')}${title}`"
    v-model="dialogVisible"
    width="800px"
    ref="dialogRef"
  >
    <ul class="ants-tips_box space-y-3 -mt-df">
      <li>{{antsT('1、此处继承全局设置中已启用的规则；')}}</li>
      <li>{{antsT('2、此处的设置仅对当前站点有效。')}}</li>
    </ul>
    <el-table
      :data="tableData"
      style="margin-top:10px;"
    >
      <div slot="empty">
        <el-empty :description="antsT('暂无数据')"> </el-empty>
      </div>
      <ants-table-column label="规则" prop="rule" min-width="300">
      </ants-table-column>
      <ants-table-column label="描述" prop="remark" min-width="200">
      </ants-table-column>
      <ants-table-column label="状态" width="100" align="right">
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
    <template slot="footer">
      <ants-button
        size="small"
        type="info"
        text="关 闭"
        @click="dialogVisible = false"
      />
    </template>
  </ants-dialog>
</template>

<script>
export default {
  data() {
    return {
      title: '',
      dialogVisible: false,
      tableData: []
    }
  },
  methods: {
    /**
     * @description: 对话框显示
     * @param {*} row
     */
    showDialog(row = {}) {
      this.dialogVisible = true
      this.title = `【${row.name}】`

      const arr = row.child.map(item => {
        const obj = JSON.parse(item.pvalue)
        return {
          ...item,
          ...obj
        }
      })
      this.tableData = arr
    },

    /**
     * @description: 切换状态
     * @param {*} row
     */

    async changeStatus(row, switchRef) {
      this.$refs[switchRef].loading = true
      const data = await this.$listeners.saveSiteAttr({
        pub_waf_forbid_selects: [
          {
            // 这个ID只是为了格式需求，并不起作用，全部设为 0
            id: 0, 
            // 按照这个格式拼接： ID#status(0 = 关，1 = 开)
            value: `${row.id}#${row.status}`
          }
        ]
      })
      this.$refs[switchRef].loading = false
      if (!data) {
        row.status = row.status ? 0 : 1
        return
      }
      this.$emit('refreshData')
      this.$msg.success(this.antsT('操作成功'))
    }
  }
}
</script>
