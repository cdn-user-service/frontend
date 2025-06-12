<template>
  <div class="rounded-t-2xl bg-ants-bg-3 p-lg">
    <div class="flex justify-between items-center">
      <div>
        <TitleBorder title="自定义HTTP响应头"> </TitleBorder>
        <div class="text-sm text-ants-text-4 pt-xs">
          {{ antsT('支持您自定义 HTTP 响应头中的 header 信息') }}
        </div>
      </div>

      <ants-button
        size="mini"
        type="primary"
        icon="el-icon-plus"
        :loading="loading"
        @click="showCreateUpdateDialog()"
        text="添加"
      />
    </div>

    <el-table
      :data="tableData"
      border
      size="small"
      max-height="300"
      v-loading="loading"
    >
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
        <template #default="{ row }">
          <ants-button
            size="mini"
            type="primary"
            @click="showCreateUpdateDialog(row)"
            text="编辑"
          />
          <ants-button
            size="mini"
            type="danger"
            @click="deleteSingle(row)"
            text="删除"
          />
        </template>
      </ants-table-column>
    </el-table>

    <!-- 添加修改缓存对话框 -->
    <CreateUpdateDialog
      ref="CreateUpdateDialogRef"
      @save="saveGlobalAttr"
      @refresh="getTableData"
    />
  </div>
</template>

<script>
import CreateUpdateDialog from './createUpdate'
import mixins from '../../../mixins'

export default {
  mixins: [mixins],
  components: {
    CreateUpdateDialog
  },
  data() {
    return {
      loading: false,
      form: {
        add_header_swtich: 1,
        // 自定义HTTP响应头, [mm_text]
        add_header: ''
      },
      tableData: []
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 获取表格数据
    async getTableData() {
      this.loading = true
      try {
        const res = await this.getGlobalKeyDetail('add_header')
        if (!res) return
        console.log('res', res)
        this.tableData = (res.data || []).map(item => {
          const obj = JSON.parse(item.pvalue || '{}')
          return {
            id: item.id,
            ...obj
          }
        })
      } finally {
        this.loading = false
      }
    },

    // 对话框显示
    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    // 单个删除
    async deleteSingle({ id }) {
      const res = await this.deleteGlobalAttr(id, '自定义HTTP响应头')
      if (res) this.getTableData()
    }
  }
}
</script>
