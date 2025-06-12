<template>
  <div class="animated fadeIn">
    <div class="ants-tips_box">
      <span class="el-icon-info"></span>
      支持按日或按月查询CDN的用量数据。查询结果将显示按流量计费、按月95带宽计费、按增值服务计费的用量数据。
    </div>

    <el-card class="mt-lg">
      <div class="space-x-4">
        <ants-select v-model="type" size="small" style="width:100px;">
          <ants-option label="按日查询" value="d" />
          <ants-option label="按月查询" value="m" />
        </ants-select>

        <el-date-picker
          v-if="type === 'd'"
          v-model="day"
          size="small"
          type="date"
          value-format="timestamp"
          placeholder="请选择日期"
        >
        </el-date-picker>

        <el-date-picker
          v-if="type === 'm'"
          v-model="month"
          size="small"
          type="month"
          placeholder="请选择月"
        >
        </el-date-picker>

        <ants-button
          size="small"
          type="primary"
          icon="el-icon-search"
          text="查询"
          :loading="btnLoading"
          @click="doSearch"
        />
      </div>

      <el-alert
        class="mt-lg"
        title="当前查询计费周期还未出账"
        type="warning"
        :closable="false"
        show-icon
      ></el-alert>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column prop="time" label="日期" min-width="140">
        </ants-table-column>
        <ants-table-column prop="type" label="类型" min-width="100">
        </ants-table-column>
        <ants-table-column prop="info" label="用量" min-width="140">
        </ants-table-column>
        <ants-table-column prop="info" label="费用" min-width="120">
        </ants-table-column>
      </ants-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      type: 'd',
      day: new Date(),
      month: '2022-07',
      btnLoading: false,

      total: 0,
      queryInfo: {
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: []
    }
  },
  methods: {
    /**
     * @description: 获取表格数据
     */

    async getTableData() {},

    doSearch() {}
  }
}
</script>
