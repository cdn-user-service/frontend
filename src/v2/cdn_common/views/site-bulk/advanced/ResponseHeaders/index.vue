<template>
  <div>
    <ul class="space-y-8 mb-lg">
      <li class="flex justify-between items-center">
        <ants-switch v-model="status" active-text="ON" inactive-text="OFF" />
        <ants-button
          size="mini"
          type="primary"
          icon="el-icon-plus"
          @click="toSave()"
          text="添加"
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
                @click="toSave(row)"
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

    <CreateUpdate bulk @save="doSave" ref="CreateUpdateRef" />

    <Clear ref="ClearRef" />
  </div>
</template>

<script>
import CreateUpdate from '@/v2/cdn_common/views/site-admin/advanced/components/ResponseHeaders/createUpdate'
import Clear from './clear.vue'

export default {
  components: {
    Clear,
    CreateUpdate
  },
  data() {
    return {
      status: 1,
      tableData: []
    }
  },
  methods: {
    toSave(row = {}) {
      this.$refs.CreateUpdateRef.showDialog(row)
    },

    toDel(row, idx) {
      this.tableData.splice(idx, 1)
    },

    // 添加修改提交
    doSave({ prop = '', data = {} }) {
      // 添加保存
      if (!data.id) {
        this.tableData.unshift({
          ...data,
          // 设置唯一标识，用于修改
          id: `${Date.now()}_${this.tableData.length}`
        })
      } else {
        // 修改保存
        const idx = this.tableData.findIndex(item => item.id === data.id)
        this.tableData.splice(idx, 1, data)
      }
    },

    // 提交数据
    submit() {
      const tableData = this.tableData.map(item => {
        item.id = 0
        return item
      })

      if (this.status && !tableData.length) {
        this.$msg.error('请添加自定义HTTP响应头')
        return false
      }

      // clear
      const clearData = this.$refs.ClearRef.submit()
      if (!clearData) return false

      return {
        ...clearData,
        add_header: JSON.stringify(tableData)
      }
    }
  }
}
</script>
