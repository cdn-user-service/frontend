<template>
  <el-card class="animated fadeIn content-box">
    <table-query-form
      :search-arr="
        isAdmin
          ? [
              {
                name: '检索监控项目',
                key: 'domain',
                value: queryInfo.domain
              },
              {
                name: '检索用户',
                key: 'user',
                value: queryInfo.user
              }
            ]
          : [
              {
                name: '检索监控项目',
                key: 'domain',
                value: queryInfo.domain
              }
            ]
      "
      :queryInfo="queryInfo"
      @changeInput="getTableData"
    >
      <template slot="buttons">
        <ants-button
          type="success"
          size="small"
          text="刷新"
          :loading="btnLoading"
          :disabled="$root.loading"
          icon="el-icon-refresh"
          @click="doBatchDel()"
        />
        <ants-button
          type="info"
          size="small"
          text="清空报警"
          :loading="btnLoading"
          :disabled="$root.loading"
          icon="el-icon-delete"
          @click="doBatchDel()"
        />
      </template>

      <template slot="inputs">
        <span class="mr-sm">
          <ants-checkbox v-model="queryInfo.type" text="只显示未恢复告警" />
        </span>
      </template>
    </table-query-form>

    <ants-table
      :data="tableData"
      @getTableData="getTableData"
      @selection-change="handleSelectionChange"
      :total="total"
      :queryInfo="queryInfo"
    >
      <ants-table-column label="监控项目" prop="domain" min-width="200">
      </ants-table-column>

      <ants-table-column label="故障IP" prop="ip" min-width="150">
      </ants-table-column>

      <ants-table-column label="开始时间" prop="startTime" min-width="150">
      </ants-table-column>

      <ants-table-column label="恢复时间" prop="endTime" min-width="150">
      </ants-table-column>

      <ants-table-column label="持续时间" prop="errorTime" min-width="100">
        59min
      </ants-table-column>

      <ants-table-column width="200" label="用户" prop="userId" v-if="isAdmin">
        <template #default="{ row }">
          <div>
            {{ row.userName }}
          </div>
        </template>
      </ants-table-column>
    </ants-table>
  </el-card>
</template>

<script>
const PROCESS_NAME = process.env.VUE_APP_NAME

export default {
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      btnLoading: false,
      total: 0,
      queryInfo: {
        user: '',
        domain: '',
        type: false,
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize
      },
      tableData: [],
      selectArr: []
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 勾选
    handleSelectionChange(val) {
      this.selectArr = val
    },

    async getTableData() {
      for (let i = 0; i < 10; i++) {
        this.tableData.push({
          id: i + '888',
          domain: '监控项目--' + i,
          ip: '23.45.12.4' + i,
          startTime: '2024-03-07 10:00:00',
          endTime: '2024-03-07 11:00:00',
          userName: 'demo@antsxdp.com',
          userId: 666
        })
      }
    },

    toPause() {},
    doBatchDel() {},
    toRules() {},
    toDel() {},

    switchStatus() {}
  }
}
</script>

<style lang="scss" scoped></style>
