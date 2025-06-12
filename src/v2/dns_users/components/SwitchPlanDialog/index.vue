<template>
  <ants-dialog
    title="变更套餐"
    v-model="dialogVisible"
    width="650px"
    ref="dialogRef"
    @closed="resetForm"
    @submit="submitForm"
    top="10vh"
  >
    <div class="ants-tips_box mb-lg -mt-xs">
      <span class="el-icon-info"></span>
      {{ antsT('注意：变更套餐后，相关配置也会随之改变，谨慎变更！') }}
    </div>

    <!-- <TitleBorder title="当前套餐" class="mb-df -mt-sm" />
    <el-table :data="[currentPlan]" style="margin: 0" border size="mini">
      <ants-table-column prop="domain" label="绑定域名" align="center">
        <template #default="{ row }">
          {{ row.domain || antsT('未绑定') }}
        </template>
      </ants-table-column>
      <ants-table-column prop="goods" label="套餐" align="center">
        <template #default="{ row }">
          {{ row.productName }}
        </template>
      </ants-table-column>
      <ants-table-column prop="effectEndTime" label="到期时间" align="center">
      </ants-table-column>
    </el-table> -->
    <!-- <TitleBorder title="选择变更套餐" class="mb-df mt-lg"> </TitleBorder> -->
    <div
      style="min-height: 300px"
      class="border border-ants-border-3 rounded-xl overflow-hidden -mb-xs"
    >
      <el-table
        size="mini"
        :data="tableData"
        row-key="id"
        highlight-current-row
        current-row-key="id"
        @row-click="rowClick"
        :row-class-name="rowClassName"
        v-loading="loading"
        style="margin: 0"
      >
        <ants-table-column
          prop="name"
          label="套餐名称"
          min-width="180"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <el-radio v-model="currentRow.id" :label="row.id">
              <span style="font-size: 12px;">
                {{ (row.name || {}).productName }}
              </span>
            </el-radio>
          </template>
        </ants-table-column>

        <ants-table-column
          prop="id"
          label="ID"
          width="80"
          align="right"
          show-overflow-tooltip
        />

        <ants-table-column
          label="绑定域名"
          prop="bindSiteSum"
          width="100"
          show-overflow-tooltip
          align="right"
        >
          <template #default="{ row }">
            {{ row.usedDomainSum || 0 }}/{{ row.maxDomainSum || 0 }}
          </template>
        </ants-table-column>

        <ants-table-column label="到期时间" align="right" prop="effectEndTime" width="150">
          <template #default="{ row }">
            {{ row.effectEndTime }}
          </template>
        </ants-table-column>
      </el-table>
    </div>
    <el-pagination
      background
      style="margin-top: 10px"
      layout="total, prev, pager, next"
      :total="total"
      small
      :page-sizes="[10, 20, 50, 100, 200]"
      :page-size="queryInfo.pagesize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
    />
  </ants-dialog>
</template>

<script>
// api
// import { getList } from '@/v2/dns_users/api/dns/plan'
// import { doCreate } from '@/v2/dns_users/api/dns/domain'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { doCreate } = require(`@/v2/${PROCESS_NAME}/api/dns/domain`)
const { getSoldList, getList } = require(`@/v2/${PROCESS_NAME}/api/dns/plan`)

const getPlanApi = PROCESS_NAME === 'dns_admin' ? getSoldList : getList

export default {
  props: {},
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      dialogVisible: false,
      loading: false,
      // 当前套餐数据
      currentPlan: {},
      // 当前用户拥有的套餐列表
      tableData: [],
      // 当前选中套餐
      currentRow: {},
      total: 0,
      queryInfo: {
        pagenum: 1,
        pagesize: 10
      }
    }
  },
  created() {},
  methods: {
    /**
     * @description: 点击升级，展示对话框，获取套餐列表数据
     */
    async show(row) {
      this.currentPlan = {
        ...row
      }
      this.currentRow.id = row.id
      // 判断是否为免费套餐的域名
      this.dialogVisible = true

      // 获取套餐列表
      this.getTableData()
    },

    // 获取套餐列表，并过滤掉当前的套餐
    async getTableData() {
      this.loading = true
      try {
        const { data: res } = await getPlanApi({
          ...this.queryInfo,
          user: this.currentPlan.username,
          key: 1
        })
        this.loading = false
        if (res.code !== 1) return
        const obj = res.data || {}
        const { paid = {}, free = {} } = obj
        this.total = paid.totalCount + free.totalCount || 0
        const planArr = [...free.list, ...paid.list]
        this.tableData = planArr
        // this.tableData = planArr.filter(
        //   (item) => item.id !== this.currentPlan.id
        // )
      } finally {
        this.loading = false
      }
    },

    // 点击
    rowClick(row) {
      this.currentRow = row || {}
    },

    rowClassName({ row }) {
      if (row.id === this.currentRow.id) {
        return 'font-semibold text-primary cursor-pointer'
      }
      return 'cursor-pointer'
    },

    // 监听pagesize 改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getTableData()
    },
    // 监听 页码值 改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getTableData()
    },

    /**
     * @description: 变更套餐提交
     */
    async submitForm() {
      if (!this.currentRow.id) {
        return this.$msg.error(this.antsT('请选择要变更的套餐'))
      }

      this.$refs.dialogRef.btnLoading = true

      try {
        const { data: res } = await doCreate({
          operation_type: 'update',
          // 域名ID
          id: this.currentPlan.domainId,
          // 套餐ID
          consumeId: this.currentRow.id + '',
          // 用户ID，后台需要
          userid: this.currentPlan.userId
        })
        this.$refs.dialogRef.btnLoading = false
        if (res.code !== 1) return
        this.$msg.success(this.antsT('变更成功'))
        this.$emit('refresh')
        this.dialogVisible = false
      } catch (error) {
        this.$refs.dialogRef.btnLoading = false
        throw error
      }
    },

    // 重置
    resetForm() {
      this.tableData = []
      this.currentRow = {}
    }
  }
}
</script>
