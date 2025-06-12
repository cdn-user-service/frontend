<template>
  <div>
    <el-card class="content-box">
      <CertType @change="changeType"/>
    </el-card>

    <el-card class="content-box">
      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
        class="-mt-lg"
      >
        <ants-table-column type="selection" align="center" width="45" />
        <ants-table-column min-width="150" label="产品名称" prop="productName">
        </ants-table-column>
        <ants-table-column min-width="150" label="产品编码" prop="code">
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

        <ants-table-column min-width="100" label="市场价（年）" prop="retailPrice">
          <template #default="{ row }">
            {{ (row.retailPrice.price012 * 100) | priceFormat }}
          </template>
        </ants-table-column>

        <ants-table-column min-width="120" label="当前渠道价（年）" prop="price">
          <template #default="{ row }">
            {{ (row.price.price012 * 100) | priceFormat }}
            <!-- <div
              v-for="(item, key) in row.basePrice"
              :key="key"
            >
              <span>{{ priceYearName[key] }}：</span>
            </div> -->
          </template>
        </ants-table-column>

        <ants-table-column min-width="75" label="保护域名数" prop="defaultProtectDomain">
        </ants-table-column>

        <!-- <ants-table-column
          min-width="140"
          label="颁发时间"
          prop="time"
        >
        </ants-table-column> -->
        <ants-table-column min-width="70" label="通配符" prop="supportWildcard">
          <template #default="{ row }">
            <span
              v-if="row.supportWildcard == 'Y'"
              class="el-icon-success text-success"
              style="font-size:15px;"
            ></span>
            <span
              v-else
              class="el-icon-error text-error"
              style="font-size:15px;"
            ></span>
          </template>
        </ants-table-column>
        <ants-table-column min-width="70" label="多域名" prop="supportSan">
          <template #default="{ row }">
            <span
              v-if="row.supportSan == 'Y'"
              class="el-icon-success text-success"
              style="font-size:15px;"
            ></span>
            <span
              v-else
              class="el-icon-error text-error"
              style="font-size:15px;"
            ></span>
          </template>
        </ants-table-column>
        <ants-table-column width="100" label="操作">
          <template #default="{ row }">
            <ants-button
              size="mini"
              type="primary"
              text="购买"
              class="price-button"
              @click="toBuy(row)"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <BuyDialog ref="BuyDialogRef" :priceYearName="priceYearName" />
  </div>
</template>

<script>
import BuyDialog from './BuyDialog.vue'
import CertType from '../CertType'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { getSslPlanList } = require(`@/v2/${PROCESS_NAME}/api/dns/ssl`)

const priceYearName = {}
// 构造10年的基础数据
for (let i = 1; i <= 15; i++) {
  const yearStr = `${i * 12 + ''}`.padStart(3, '0')
  priceYearName[`price${yearStr}`] = `${i}年`
}

export default {
  components: {
    BuyDialog,
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
      }
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
        const { data: res } = await getSslPlanList(this.queryInfo)
        if (res.code !== 1) return
        const obj = res.data || {}
        const arr = obj.list || []
        this.tableData = arr.map(item => {
          const basePrice = JSON.parse(item.basePrice || '{}')
          const normalPrice = JSON.parse(item.normalPrice || '{}')
          const wildPrice = JSON.parse(item.wildPrice || '{}')
          // 市场价
          const retailPrice = JSON.parse(item.retailPrice || '{}')

          return {
            ...item,
            basePrice,
            normalPrice,
            wildPrice,
            price: basePrice.price012
              ? basePrice
              : normalPrice.price012
              ? normalPrice
              : wildPrice.price012
              ? wildPrice
              : {},
              retailPrice
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

    // 切换状态
    async updateStatus(row) {
      if (row.status === 0) {
        const confirmResult = await this.$confirm(
          '此操作将停用产品“ <strong style="color: #F78989;"> ' +
            row.productName +
            ' </strong> ”，是否继续？',
          '停用产品',
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

      // const { data: res } = await doUpdateDomainStatus({
      //   domainId: row.id,
      //   status: row.status
      // })
      // if (res.code !== 1) {
      //   row.status = row.status === 1 ? 0 : 1
      //   return
      // }
      // this.getTableData()
      this.$msg.success('操作成功')
    },

    // 前往购买证书
    toBuy(row = {}) {
      this.$refs.BuyDialogRef.show(row)
      // this.$router.push({
      //   name: 'sslOrderApply',
      //   query: {
      //     certId: row.certId
      //   }
      // })
    },

    handleSelectionChange(val) {
      this.selection = val
    }
  }
}
</script>

<style lang="scss" scoped></style>
