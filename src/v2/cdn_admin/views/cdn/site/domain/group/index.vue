<template>
  <div>
    <el-card class="animated fadeIn">
      <table-query-form :queryInfo="queryInfo" @changeInput="getTableData">
        <template slot="buttons">
          <ants-button
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="showCreateUpdateDialog"
            text="添加分组"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :disabled="$root.loading"
            @click="batchDelete"
            text="批量删除"
          />
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column width="60" prop="id" label="ID"> </ants-table-column>
        <ants-table-column
          prop="name"
          label="分组名称"
          min-width="140"
          ref="aaa"
        >
        </ants-table-column>
        <ants-table-column prop="domainNum" label="站点数" min-width="100">
          <template #default="{ row }">
            <el-tag size="mini" type="primary">
              {{ row.domainNum }}
            </el-tag>
          </template>
        </ants-table-column>
        <ants-table-column prop="info" label="备注信息" min-width="140">
        </ants-table-column>
        <ants-table-column
          prop="updateDate"
          sortable
          label="更新时间"
          min-width="140"
        >
          <template #default="{ row }">
            {{ row.updateDate | dateFormat }}
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="160">
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              @click="showCreateUpdateDialog(row)"
              text="修改"
            />
            <ants-button
              type="danger"
              size="mini"
              @click="deleteSingle(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <CreateUpdate ref="CreateUpdateRef" />
  </div>
</template>

<script>
import CreateUpdate from './components/CreateUpdate.vue'
export default {
  components: {
    CreateUpdate
  },
  data() {
    return {
      btnLoading: false,
      total: 0,
      queryInfo: {
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      selectArr: [],
      tableData: [
        {
          id: 1,
          name: '测试分组',
          info: '这是备注信息',
          updateDate: 1649303020000,
          domainNum: 220
        },
        {
          id: 2,
          name: '测试分组',
          info: '这是备注信息',
          updateDate: 1649303020000,
          domainNum: 22
        },
        {
          id: 3,
          name: '测试分组',
          info: '这是备注信息',
          updateDate: 1649303020000,
          domainNum: 10
        }
      ]
    }
  },
  created() {},
  mounted() {
    setTimeout(() => {
      console.log(this.$refs.aaa)
    }, 3000)
  },
  methods: {
    /**
     * @description: 获取分组数据
     */

    async getTableData() {},

    // 添加修改对话框显示
    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateRef.showDialog(row)
    },

    /**
     * @description: 删除日志单个
     * @param {*} row
     */

    async deleteSingle(row) {
      const result = await this.$doDelete({
        tag: '分组'
      })
      if (!result) return

      //   const { data } = await doDelete({
      //     ids: row.id
      //   })
      //   if (data.code !== 1) return
      //   this.getTableData()
      this.$msg.success(this.antsT('删除分组成功'))
    },

    /**
     * @description: 批量清除日志
     */

    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '日志'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map((item, index) => {
        return item.id
      })
      //   const { data: res } = await doDelete({
      //     ids: idsArr + ''
      //   })

      //   this.btnLoading = false

      //   if (res.code !== 1) return
      //   this.getTableData()
      //   this.$msg.success(selectLength + this.antsT('个日志已成功删除 '))
      //   this.selectArr = [] // 释放
    }
  }
}
</script>

<style lang="scss" scoped></style>
