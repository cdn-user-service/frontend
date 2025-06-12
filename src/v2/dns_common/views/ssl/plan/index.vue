<template>
  <div>
    <div class="mt-lg">
      <ants-button
        class="mr-lg"
        size="small"
        type="primary"
        icon="el-icon-download"
        :text="btnLoading ? '正在同步SSL套餐信息...' : '同步SSL套餐信息'"
        :loading="btnLoading"
        :disabled="$root.loading"
        @click="doSyncSslPlan()"
      />
      <span class="text-ants-text-4 text-sm">
        <i class="el-icon-info text-primary"></i>
        官方的SSL证书产品信息可能会有更新，建议定期同步SSL套餐信息。
      </span>
    </div>

    <el-card class="content-box">
      <CertType @change="changeType" />
    </el-card>

    <el-card class="content-box">
      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
        class="table-align-top -mt-lg"
      >
        <ants-table-column type="selection" align="center" width="45" />
        <ants-table-column width="60" label="ID" prop="id"> </ants-table-column>
        <ants-table-column min-width="200" label="产品名称" prop="productName">
        </ants-table-column>
        <ants-table-column
          min-width="70"
          label="证书类型"
          prop="validationType"
        >
          <template #default="{ row }">
            <el-tag size="small">
              {{ row.validationType }}
            </el-tag>
          </template>
        </ants-table-column>

        <ants-table-column width="140" label="basePrice/年" prop="basePrice">
          <template #default="{ row }">
            <span v-if="row.basePriceObj.price012">
              {{ $root.priceUnit }}{{ row.basePriceObj.price012 }}
            </span>
            <span v-else>-</span>
          </template>
        </ants-table-column>

        <ants-table-column
          width="140"
          label="normalPrice/年"
          prop="normalPrice"
        >
          <template #default="{ row }">
            <span v-if="row.normalPriceObj.price012">
              {{ $root.priceUnit }}{{ row.normalPriceObj.price012 }}
            </span>
            <span v-else>-</span>
          </template>
        </ants-table-column>

        <ants-table-column width="140" label="wildPrice/年" prop="wildPrice">
          <template #default="{ row }">
            <span v-if="row.wildPriceObj.price012">
              {{ $root.priceUnit }}{{ row.wildPriceObj.price012 }}
            </span>
            <span v-else>-</span>
          </template>
        </ants-table-column>

        <ants-table-column
          min-width="70"
          label="保护域名数"
          prop="defaultProtectDomain"
        >
        </ants-table-column>

        <ants-table-column min-width="70" label="通配符" prop="supportWildcard">
          <template #default="{ row }">
            <i
              v-if="row.supportWildcard == 'Y'"
              class="el-icon-success text-success"
              style="font-size:15px;"
            />
            <i
              v-else
              class="el-icon-error text-error"
              style="font-size:15px;"
            />
          </template>
        </ants-table-column>
        <ants-table-column min-width="70" label="多域名" prop="supportSan">
          <template #default="{ row }">
            <i
              v-if="row.supportSan == 'Y'"
              class="el-icon-success text-success"
              style="font-size:15px;"
            />
            <i
              v-else
              class="el-icon-error text-error"
              style="font-size:15px;"
            />
          </template>
        </ants-table-column>
        <ants-table-column label="启用" min-width="60">
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              inactive-color="#DCDFE6"
              active-color="#13ce66"
              :ref="`tableSwitchRef${$index}`"
              @change="updateStatus(row, `tableSwitchRef${$index}`)"
            />
          </template>
        </ants-table-column>

        <ants-table-column width="120" label="操作">
          <template #default="{ row }">
            <ants-button
              size="mini"
              type="primary"
              text="修改"
              @click="toEdit(row)"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <PriceDialog
      ref="PriceDialogRef"
      :priceYearName="priceYearName"
      @refresh="getTableData"
    />
  </div>
</template>

<script>
// import UpdateDialog from './UpdateDialog.vue'
import PriceDialog from './PriceDialog.vue'
import CertType from '../CertType'
import {
  syncSslPlan,
  getSslPlanPage,
  doSaveSslPlan
} from '@/v2/dns_admin/api/dns/ssl'

const priceYearName = {}
// 构造10年的基础数据
for (let i = 1; i <= 15; i++) {
  const yearStr = `${i * 12 + ''}`.padStart(3, '0')
  priceYearName[`price${yearStr}`] = `${i}年`
}

export default {
  components: {
    // UpdateDialog
    PriceDialog,
    CertType
  },
  data() {
    return {
      priceYearName,
      tableData: [],
      selection: [],
      total: 0,
      queryInfo: {
        page: 1,
        limit: 20,
        // 加密标准
        enType: '',
        // 证书品牌
        productName: '',
        // 证书类型
        validationType: '',
        // 域名类型
        supportType: ''
      },
      btnLoading: false
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 获取表格数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getSslPlanPage(this.queryInfo)
        if (res.code !== 1) return
        const obj = res.data || {}
        const arr = obj.list || []
        this.tableData = arr.map(item => {
          return {
            ...item,
            basePriceObj: JSON.parse(item.basePrice || '{}'),
            normalPriceObj: JSON.parse(item.normalPrice || '{}'),
            wildPriceObj: JSON.parse(item.wildPrice || '{}')
          }
        })
        console.log(this.tableData)
        this.total = obj.totalCount || 0
      } finally {
        this.$root.loading = false
      }
    },

    changeType(query = {}) {
      this.queryInfo = {
        ...this.queryInfo,
        ...query,
        page: 1
      }
      this.getTableData()
    },

    // 同步远程RS SSL产品
    async doSyncSslPlan() {
      this.btnLoading = true
      try {
        const { data: res } = await syncSslPlan()
        if (res.code !== 1) return
        this.$msg.success('同步成功')
        this.getTableData()
      } finally {
        this.btnLoading = false
      }
    },

    // 切换状态
    async updateStatus(row) {
      if (row.status === 0) {
        const confirmResult = await this.$confirm(
          '此操作将停用证书套餐“ <strong style="color: #F78989;"> ' +
            row.productName +
            ' </strong> ”，是否继续？',
          '停用证书套餐',
          {
            dangerouslyUseHTMLString: true,
            center: true,
            type: 'error'
          }
        ).catch(err => err)

        if (confirmResult !== 'confirm') {
          row.status = 1
          this.$msg.info('已取消操作')
          return
        }
      }

      const { data: res } = await doSaveSslPlan({
        ...row
      })
      if (res.code !== 1) {
        row.status = row.status === 1 ? 0 : 1
        return
      }
      // this.getTableData()
      this.$msg.success('操作成功')
    },

    // 前往修改
    toEdit(row = {}) {
      this.$refs.PriceDialogRef.show({ ...row })
    },

    handleSelectionChange(val) {
      this.selection = val
    }
  }
}
</script>

<style lang="scss" scoped></style>
