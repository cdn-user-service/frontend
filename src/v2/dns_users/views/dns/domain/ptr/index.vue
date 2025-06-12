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
        @click="showUpdateDialog()"
        text="添加 PTR 记录"
      />

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column width="80" label="ID" prop="id"></ants-table-column>
        <ants-table-column
          min-width="140"
          label="公网IP"
          prop="ip"
        ></ants-table-column>
        <ants-table-column
          min-width="140"
          label="域名"
          prop="domain"
        ></ants-table-column>
        <ants-table-column
          min-width="100"
          label="TTL"
          prop="ttl"
        ></ants-table-column>
        <ants-table-column min-width="100" label="状态" prop="status">
          <template #default="row">
            <span class="text-success el-icon-success" v-if="row.status === 1">
              正常</span
            >
            <span v-esle class="text-error el-icon-error"> 异常</span>
          </template>
        </ants-table-column>
        <ants-table-column label="操作" width="140">
          <template #default="{ row }">
            <ants-button
              size="mini"
              type="primary"
              :disabled="btnLoading"
              @click="showUpdateDialog(row)"
              text="修改"
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
  </div>
</template>

<script>
export default {
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
  methods: {
    /**
     * @description: 获取表格数据
     */

    async getTableData() {},

    handleSelectionChange(val) {

    },

    // 添加修改
    showUpdateDialog(row = {}) {},

    // 删除
    singleDelete(row) {}
  }
}
</script>
