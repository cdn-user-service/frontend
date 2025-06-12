<template>
  <div>
    <div class="mb-df">
      <ants-button
        size="mini"
        type="primary"
        icon="el-icon-plus"
        @click="toAdd()"
        text="添加源站"
      />
    </div>

    <el-table :data="tableData" border max-height="400px">
      <ants-table-column
        min-width="100"
        prop="protocol"
        label="协议类型"
        align="center"
      >
      </ants-table-column>
      <ants-table-column
        min-width="100"
        prop="port"
        label="监听端口"
        align="center"
      >
      </ants-table-column>
      <ants-table-column
        min-width="100"
        prop="s_protocol"
        label="取源协议"
        align="center"
      >
        <template #default="{ row }">
          {{ row.s_protocol === '$scheme' ? '协议跟随' : row.s_protocol }}
        </template>
      </ants-table-column>
      <ants-table-column
        min-width="200"
        prop="ip"
        label="源站地址"
        align="center"
      >
        <template #default="{ row, $index }">
          <ul>
            <li v-for="(item, idx) in row.line" :key="idx + '_' + $index">
              <el-tag
                size="mini"
                :type="item.line == 1 ? 'primary' : 'info'"
                plain
              >
                {{ antsT(item.line == 1 ? '主' : '备') }}
              </el-tag>
              {{ row.source_set === 'ip' ? item.ip : item.domain }} :
              {{ item.port }}
            </li>
          </ul>
        </template>
      </ants-table-column>
      <ants-table-column prop="domain" label="操作" width="160" align="center">
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

    <CreateUpdate bulk @save="doSave" ref="CreateUpdateRef" />
  </div>
</template>

<script>
import CreateUpdate from '@/v2/cdn_common/views/site-admin/backsource/components/SourceSiteSetting/createUpdate'

export default {
  components: {
    CreateUpdate
  },
  data() {
    return {
      tableData: []
    }
  },
  created() {},
  methods: {
    toAdd() {
      this.$refs.CreateUpdateRef.showDialog('create', {})
    },

    toEdit(row = {}) {
      this.$refs.CreateUpdateRef.showDialog('update', row)
    },

    // 添加修改提交
    doSave({ type = '', data = {} }) {
      // 添加保存
      if (type === 'create') {
        this.tableData.unshift({
          ...data,
          // 设置唯一标识，用于修改
          id: `${Date.now()}_${this.tableData.length}`
        })
      }

      // 修改保存
      if (type === 'update') {
        const idx = this.tableData.findIndex(item => item.id === data.id)
        this.tableData.splice(idx, 1, data)
      }
    },

    toDel(row, idx) {
      // 删除一行
      this.tableData.splice(idx, 1)
    },

    // 提交数据
    submit() {
      const tableData = this.tableData.map(item => {
        item.id = 0
        return item
      })
      if (!tableData.length) {
        this.$msg.error('请添加源站配置')
        return false
      }
      return JSON.stringify(tableData)
    }
  }
}
</script>
