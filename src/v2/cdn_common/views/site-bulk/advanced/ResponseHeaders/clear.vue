<template>
  <div>
    <ul class="space-y-8">
      <li class="flex justify-between items-center">
        <TitleBorder title="多余HTTP响应头" />

        <ants-button
          size="mini"
          type="primary"
          icon="el-icon-plus"
          @click="toAdd()"
          text="添加多余响应头"
        />
      </li>

      <li>
        <el-table :data="tableData" border size="small">
          <ants-table-column
            label="Header类型"
            prop="header"
            min-width="140"
            align="center"
          >
            <template #default="{ row }">
              <el-tag size="mini" v-if="row.type === 'custom'"
                >{{ antsT('自定义') }}
              </el-tag>
              {{ row.header }}
            </template>
          </ants-table-column>
          <ants-table-column
            label="匹配内容"
            prop="content"
            min-width="300"
            align="center"
          >
          </ants-table-column>

          <ants-table-column
            label="备注信息"
            prop="info"
            min-width="140"
            align="center"
          >
          </ants-table-column>

          <ants-table-column label="操作" width="160" align="center">
            <template #default="{ row, $index }">
              <ants-button
                size="mini"
                type="primary"
                @click="toEdit(row)"
                text="编辑"
              />
              <ants-button
                size="mini"
                type="danger"
                @click="toDel(row, $index)"
                text="删除"
              />
            </template>
          </ants-table-column>
        </el-table>
      </li>
    </ul>

    <CreateDialog bulk @save="doAdd" ref="CreateDialogRef" />
    <UpdateDialog bulk @save="doEdit" ref="UpdateDialogRef" />
  </div>
</template>

<script>
import CreateDialog from '@/v2/cdn_common/views/site-admin/advanced/components/ResponseHeaders/clearCreateDialog'
import UpdateDialog from '@/v2/cdn_common/views/site-admin/advanced/components/ResponseHeaders/clearUpdateDialog'

export default {
  components: {
    CreateDialog,
    UpdateDialog
  },
  data() {
    return {
      status: 1,
      tableData: []
    }
  },
  methods: {
    toAdd() {
      this.$refs.CreateDialogRef.showDialog()
    },

    toEdit(row = {}) {
      this.$refs.UpdateDialogRef.showDialog(row)
    },

    toDel(row, idx) {
      this.tableData.splice(idx, 1)
    },

    // 添加保存
    doAdd({ prop = '', data = [] }) {
      const tableData = data.map((item, idx) => {
        return {
          ...item,
          // 设置唯一标识，用于修改
          id: `${Date.now()}_${this.tableData.length}_${idx}`
        }
      })
      
      this.tableData.unshift(...tableData)
    },

    // 修改保存
    doEdit({ prop = '', data = {} }) {
      const idx = this.tableData.findIndex(item => item.id === data.id)
      this.tableData.splice(idx, 1, data)
    },

    // 提交数据
    submit() {
      const tableData = this.tableData.map(item => {
        item.id = 0
        return item
      })

      if (this.status && !tableData.length) {
        this.$msg.error('请添加多余HTTP响应头')
        return false
      }

      return {
        more_clear_headers: JSON.stringify(tableData)
      }
    }
  }
}
</script>
