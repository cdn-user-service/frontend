<template>
  <ul class="space-y-8">
    <li class="flex justify-between items-center">
      <ants-button
        size="mini"
        type="primary"
        icon="el-icon-plus"
        @click="toSave()"
        text="添加IP白名单"
      />
    </li>

    <li>
      <el-table :data="tableData" border size="small" max-height="400px">
        <ants-table-column label="IP地址" prop="ip" min-width="150">
        </ants-table-column>
        <ants-table-column label="备注信息" prop="remark" min-width="300">
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

    <CreateUpdate bulk @save="doSave" ref="CreateUpdateRef" />
  </ul>
</template>

<script>
import CreateUpdate from '@/v2/cdn_common/views/site-admin/application-secure/components/IpWhite/createUpdate'

export default {
  components: {
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
    doSave({ isEdit = false, prop = '', data = [] }) {
      // 添加保存
      if (!isEdit) {
        const tableData = data.map((item, idx) => {
          return {
            ...item,
            // 设置唯一标识，用于修改
            id: `${Date.now()}_${this.tableData.length}_${idx}`
          }
        })
        this.tableData.unshift(...tableData)
      } else {
        const rowData = data[0] || {}
        // 修改保存
        const idx = this.tableData.findIndex(item => item.id === rowData.id)
        this.tableData.splice(idx, 1, rowData)
      }
    },

    // 提交数据
    submit() {
      const tableData = this.tableData.map(item => {
        item.id = 0
        return item
      })

      if (this.status && !tableData.length) {
        this.$msg.error('请添加IP白名单')
        return false
      }

      return {
        server_waf_white_ip: JSON.stringify(tableData)
      }
    }
  }
}
</script>
