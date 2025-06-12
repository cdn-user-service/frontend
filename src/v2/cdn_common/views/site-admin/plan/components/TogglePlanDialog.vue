<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    title="变更套餐"
    width="800px"
    @close="close"
    @submit="submit"
    top="10vh"
  >
    <div class="ants-tips_box mb-lg -mt-xs">
      <span class="el-icon-info"></span>
      {{ antsT('注意：变更套餐后，相关配置也会随之改变，谨慎变更！') }}
    </div>

    <div
      style="min-height: 300px;"
      class="border border-ants-border-3 rounded-xl overflow-hidden -mb-xs"
    >
      <el-table
        class="rounded-t-xl"
        style="margin:0;"
        size="mini"
        :data="planList"
        :border="false"
        highlight-current-row
        current-row-key="serial_number"
        row-key="serial_number"
        @row-click="rowClick"
        v-loading="loading"
        max-height="400"
        :row-class-name="rowClassName"
      >
        <ants-table-column
          label="套餐名称"
          prop="productName"
          min-width="180"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <el-radio
              style="margin: 0;"
              v-model="currentRow.serial_number"
              :label="row.serial_number"
            >
              <span
                class="text-xs"
                :class="{
                  'font-semibold':
                    row.serial_number === currentRow.serial_number
                }"
              >
                {{ row.productName }}
              </span>
            </el-radio>
          </template>
        </ants-table-column>

        <ants-table-column
          label="ID"
          prop="id"
          width="80"
          show-overflow-tooltip
        >
        </ants-table-column>

        <ants-table-column label="流量" prop="productName" width="220">
          <template #default="{ row }">
            <div style="margin-bottom:-4px;padding-top:2px;">
              <FlowProgress :used="row.usedFlow" :total="row.totalFlow" />
            </div>
          </template>
        </ants-table-column>

        <ants-table-column
          label="绑定站点"
          prop="bindSiteSum"
          width="100"
          show-overflow-tooltip
          align="right"
        >
        </ants-table-column>

        <ants-table-column
          label="到期时间"
          prop="endTime"
          width="150"
        >
          <template #default="{ row }">
            {{ row.endTime | dateFormat }}
          </template>
        </ants-table-column>
      </el-table>
    </div>
  </ants-dialog>
</template>

<script>
// API
import { getSuitListByUserId } from '@/v2/cdn_admin/api/cdn/product'
import { getMyPlanAll } from '@/v2/cdn_users/api/cdn/plan'
// 组件
import FlowProgress from '@/v2/cdn_common/components/Plan/FlowProgress'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { doTogglePlan } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

const getPlanListApi =
  PROCESS_NAME === 'cdn_admin' ? getSuitListByUserId : getMyPlanAll

export default {
  components: {
    FlowProgress
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      domainList: [],
      planList: [],
      currentRow: {}
    }
  },
  methods: {
    showDialog(userId = null, serialNumber = '') {
      this.dialogVisible = true
      this.currentRow.serial_number = serialNumber
      this.getPlanList(userId)
    },

    // 获取套餐列表
    async getPlanList(userId) {
      this.loading = true
      try {
        const { data: res } = await getPlanListApi({
          userId
        })
        if (res.code !== 1) return
        const { data = [] } = res
        const serialNumber = this.currentRow.serial_number
        // 重新排序，将当前套餐排在第一位
        data.sort((a, b) => {
          if (a.serial_number === serialNumber) return -1
          if (b.serial_number === serialNumber) return 1
          return 0
        })

        this.planList = data
      } finally {
        this.loading = false
      }
    },

    rowClassName({ row }) {
      if (row.serial_number === this.currentRow.serial_number) {
        return 'font-semibold text-primary cursor-pointer'
      }
      return 'cursor-pointer'
    },

    rowClick(row) {
      this.currentRow = row || {}
    },

    async submit() {
      if (!this.currentRow.serial_number) {
        return this.$msg.error('请选择需要变更的套餐')
      }

      this.$refs.dialogRef.btnLoading = true
      try {
        const { data: res } = await doTogglePlan({
          siteId: +this.$route.query.id,
          serialNumber: this.currentRow.serial_number
        })
        if (res.code !== 1) return
        this.dialogVisible = false
        this.$emit('refresh')
        this.$msg.success('变更套餐成功')
      } finally {
        this.$refs.dialogRef.btnLoading = false
      }
    },

    // 表单重置
    close() {
      this.currentRow = {}
    }
  }
}
</script>
