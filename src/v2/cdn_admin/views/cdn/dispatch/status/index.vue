<template>
  <div class="content-box animated fadeIn">
    <ants-tab-card
      value-key="id"
      label-key="name"
      :tab-arr="groupList"
      :active="queryInfo.groupId"
      @change="changeCode"
    >
      <table-query-form :queryInfo="queryInfo" @changeInput="getTableData">
        <template slot="buttons">
          <ants-button
            type="success"
            size="small"
            icon="el-icon-refresh"
            :loading="$root.loading"
            @click="getTableData"
            text="刷新"
          />
        </template>
      </table-query-form>

      <el-table
        :data="tableData"
        row-key="id"
        :tree-props="{ children: 'child', hasChildren: 'hasChildren' }"
        v-loading="$root.loading"
      >
        <ants-table-column prop="ip" label="业务 IP" min-width="140">
          <template #default="{ row }">
            {{ row.clientEntity.clientIp }}
          </template>
        </ants-table-column>

        <ants-table-column prop="stableScore" label="健康指数" min-width="100">
          <template #default="{ row }">
            <el-tag size="small">
              {{ row.clientEntity.stableScore }}
            </el-tag>
          </template>
        </ants-table-column>

        <ants-table-column label="健康状态" min-width="100">
          <template #default="{ row }">
            <el-tag
              v-if="row.clientEntity.stableScore >= 10"
              size="mini"
              type="success"
              >正常</el-tag
            >
            <el-tag
              v-else-if="
                row.clientEntity.stableScore > 0 &&
                  row.clientEntity.stableScore < 10
              "
              size="mini"
              type="warning"
              >在线</el-tag
            >
            <el-tag v-else size="mini" type="danger">故障</el-tag>
          </template>
        </ants-table-column>

        <ants-table-column
          prop="updatetime"
          label="最后监测时间"
          min-width="140"
        >
          <template #default="{ row }">
            <span v-if="row.time_warning" class="text-error el-icon-remove">
              监测异常
            </span>

            <span v-else>
              {{ row.clientEntity.updatetime }}
            </span>
          </template>
        </ants-table-column>
      </el-table>
    </ants-tab-card>
  </div>
</template>

<script>
// API
import { getDispatchStatusList } from '@/v2/cdn_admin/api/cdn/dispatch'
import { getGroupList } from '@/v2/cdn_admin/api/cdn/node'

export default {
  data() {
    return {
      total: 0,
      queryInfo: {
        key: '', // 搜索框内容
        groupId: +this.$route.query.group || 0, // 分组ID
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],

      timer: null,
      // 分组列表
      groupList: []
    }
  },
  created() {
    this.getGroupListData()
  },
  mounted() {},
  destroyed() {
    this.clearTimer()
  },
  methods: {
    /**
     * @description: 切换分组
     */

    changeCode(val) {
      this.queryInfo.groupId = +val
      this.$router.replace({ query: { group: val } })
      this.getTableData()
    },

    /**
     * @description: 获取分组列表
     */

    async getGroupListData() {
      this.$root.loading = true
      const { data: res } = await getGroupList({
        page: 1,
        limit: 50
      })

      if (res.code !== 1) {
        this.$root.loading = false
        return
      }
      // 分组列表
      this.groupList = (res.data && res.data.list) || []
      let firstGroupId = 0
      if (this.groupList.length) {
        firstGroupId = this.groupList[0].id
      }
      this.queryInfo.groupId = +this.$route.query.group || firstGroupId

      // 获取表格数据
      this.getTableData()
    },

    /**
     * @description: 获取表格数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getDispatchStatusList(this.queryInfo)
      this.$root.loading = false

      if (res.code !== 1) return
      console.log(res)
      const obj = res.data || {}
      let arr = []
      if (obj.list.length) {
        arr = obj.list[0].clientInfos
      }
      this.tableData = arr
      this.total = obj.totalCount || 0
    },

    // 设置定时器，
    setTimer() {
      // 清除定时器
      this.clearTimer()
      this.loading = true
      this.getGoodsList()

      this.timer = setTimeout(this.setTimer, 2000)
    },

    clearTimer() {
      clearTimeout(this.timer)
    }
  }
}
</script>
