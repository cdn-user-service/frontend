<template>
  <div>
    <div class="content-box ants-tips_box">
      <span class="el-icon-info"></span>
      注意：由于 PTR 反向解析需要向运行商服务器进行同步，记录添加或变更后需要 1
      ~ 2 个工作日才可完全生效，请您耐心等待。
    </div>
    <el-card class="animated fadeIn content-box">
      <ants-button
        size="small"
        type="primary"
        icon="el-icon-plus"
        :disabled="$root.loading"
        @click="showCreateDialog()"
        text="添加反向解析"
      />

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column width="80" label="ID" prop="id" />
        <ants-table-column min-width="140" label="网段" prop="name">
          <template #default="{ row }">
            <div
              class="cursor-pointer text-primary"
              @click="goPtrRecordPage(row)"
            >
              {{ row.name }}
            </div>
          </template>
        </ants-table-column>
        <ants-table-column min-width="80" label="状态" prop="status">
          <template #default="row">
            <span class="text-success el-icon-success" v-if="row.status === 1">
              正常</span
            >
            <span v-else class="text-error el-icon-error"> 异常</span>
          </template>
        </ants-table-column>
        <ants-table-column min-width="80" label="记录数" prop="records">
          <template #default="{ row }"> {{ row.records || 0 }} 条 </template>
        </ants-table-column>
        <ants-table-column
          min-width="140"
          label="套餐"
          prop="plan"
        ></ants-table-column>
        <ants-table-column
          min-width="140"
          label="套餐到期时间"
          prop="planTime"
        ></ants-table-column>
        <ants-table-column
          min-width="140"
          label="用户"
          prop="username"
        ></ants-table-column>

        <ants-table-column label="操作" width="180">
          <template #default="{ row }">
            <ants-button
              size="mini"
              type="primary"
              :disabled="btnLoading"
              @click="goPtrRecordPage(row)"
              text="PTR记录"
            />
            <ants-button
              size="mini"
              type="danger"
              :disabled="btnLoading"
              @click="singleDelete(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <CreateDialog ref="CreateDialogRef" />
  </div>
</template>

<script>
import CreateDialog from './CreateDialog.vue'
export default {
  components: {
    CreateDialog
  },
  data() {
    return {
      total: 0,
      queryInfo: {
        domain: '', // 搜索框内容
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      btnLoading: false
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取表格数据
     */

    async getTableData() {
      const arr = []
      for (let i = 1; i < 5; i++) {
        arr.push({
          id: i,
          name: '192.168.' + i,
          status: 1,
          plan: '反向解析套餐',
          planTime: '2030-12-12 10:00:00',
          records: 11,
          username: 'demo@dns.com'
        })
      }
      arr.unshift({
        id: 100,
        name: '240e:36b:2622:ae00',
        status: 1,
          plan: '反向解析套餐',
          planTime: '2030-12-12 10:00:00',
          records: 11,
          username: 'demo@dns.com'
      })
      this.tableData = arr
    },

    handleSelectionChange(val) {},

    // 添加修改
    showCreateDialog(row = {}) {
      this.$refs.CreateDialogRef.showDialog()
    },

    // 前往PTR记录页面
    goPtrRecordPage({ id }) {
      this.$router.push({ name: 'PtrRecord', query: { id } })
    },

    // 删除
    async singleDelete(row) {
      const result = await this.$doDelete({
        name: row.name,
        tag: '反向解析'
      })
      if (!result) return

      // const { data: res } = await doCreate({
      //   domain: '',
      //   id: row.id
      // })

      // if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除成功')
    }
  }
}
</script>
