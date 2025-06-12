<template>
  <div class="plan-list-box">
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '输入产品名称搜索',
            key: 'key',
            value: queryInfo.key
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getGoodsList"
      >
        <template slot="buttons">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="goAddGoods('add')"
            >{{ antsT('添加产品') }}</el-button
          >
          <el-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :loading="btnLoading"
            @click="batchDelete"
            >{{ antsT('批量删除') }}</el-button
          >
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getGoodsList"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column
          type="selection"
          width="45"
          align="center"
          key="0"
        ></ants-table-column>
        <ants-table-column prop="id" label="ID" width="50"> </ants-table-column>

        <ants-table-column prop="productName" label="产品名称" min-width="130">
        </ants-table-column>

        <ants-table-column
          prop="productDescribe"
          show-overflow-tooltip
          label="产品描述"
          min-width="200"
        >
        </ants-table-column>

        <ants-table-column prop="productType" label="产品类型" min-width="120">
          <template #default="{ row }">
            <el-tag size="mini" type="primary" v-if="row.productType == 10"
              >DNS套餐</el-tag
            >
            <el-tag size="mini" type="primary" v-if="row.productType == 1"
              >充值</el-tag
            >
            <el-tag size="mini" type="primary" v-if="row.productType == 2"
              >实名</el-tag
            >
          </template>
        </ants-table-column>
        <ants-table-column
          prop="productUnitPrice"
          label="产品价格"
          min-width="120"
        >
          <template #default="{ row }">
            <span class="text-price">{{
              row.productUnitPrice | priceFormat
            }}</span>
          </template>
        </ants-table-column>

        <ants-table-column prop="productJson" label="产品参数" min-width="120">
          <template #default="{ row }">
            <span
              class="el-icon-folder-opened text-primary cursor-pointer"
              @click="openDrawer(row)"
            >
              查看详情
            </span>
          </template>
        </ants-table-column>

        <ants-table-column prop="ownSum" label="购买次数限制" min-width="100">
          <template #default="{ row }">
            {{ row.ownSum }} 次
          </template>
        </ants-table-column>

        <ants-table-column prop="weight" label="排序" min-width="60">
        </ants-table-column>

        <ants-table-column prop="status" label="发布状态" min-width="80">
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              inactive-color="#F52443"
              :ref="`tableSwitchRef${$index}`"
              @change="toggleStatus(row, `tableSwitchRef${$index}`)"
            />
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="mini" type="primary" @click="goAddGoods(row.id)"
              >编辑</el-button
            >
            <el-button size="mini" type="danger" @click="deleteGoods(row)"
              >删除</el-button
            >
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 产品具体参数抽屉 -->
    <el-drawer
      :title="attrData.productName"
      :visible.sync="productJsonDrawer"
      direction="rtl"
      custom-class="json_drawer"
      :size="400"
    >
      <ul class="json_drawer_main">
        <li v-for="item in JSON.parse(attrData.productJson)" :key="item.id">
          <span>{{ item.attrKeyName }}</span>
          <span
            v-if="item.attrType == 'bool'"
            class="el-icon-success text-success"
          >
            支持</span
          >
          <span v-else>{{ item.attrValue }} {{ item.attrUnit }}</span>
        </li>
      </ul>
    </el-drawer>
  </div>
</template>

<script>
// API
import { getProductList, doUpdate, doDelete } from '@/v2/dns_admin/api/dns/plan'

export default {
  data() {
    return {
      total: 0,
      queryInfo: {
        group_id: 0, // 分组绑定数据
        key: '', // 搜索框内容
        sidx: 'id', // 排序字段
        order: 'desc', // 排序方式，如：asc、desc
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      btnLoading: false,
      tableData: [],
      selectArr: [],

      productJsonDrawer: false,
      attrData: {
        productName: '',
        productJson: null
      }
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    /**
     * @description: 获取产品列表数据
     */

    async getGoodsList() {
      this.$root.loading = true
      const { data: res } = await getProductList(this.queryInfo)

      this.$root.loading = false
      if (res.code !== 1) return
      this.total = res.page.totalCount || 0
      this.tableData = res.page.list || []
    },

    // 前往添加-编辑产品
    goAddGoods(id) {
      this.$router.push({ name: 'ProductEdit', params: { id: id } })
    },

    // 点击查看套餐参数详情
    openDrawer(row) {
      this.attrData = row
      this.productJsonDrawer = true
    },

    /**
     * @description: 上架-下架产品
     * @param {*} row
     */

    async toggleStatus(row, switchRef) {
      let txt = '上架'
      if (!row.status) {
        const confirmResult = await this.$confirm(
          '此操作将会下架产品：' + row.productName + '，是否继续？',
          '下架产品',
          {
            type: 'warning',
            center: true
          }
        ).catch(err => err)
        if (confirmResult !== 'confirm') {
          row.status = 1
          return this.$msg.info('已取消下架该产品')
        }
        txt = '下架'
      }

      this.$refs[switchRef].loading = true
      const { data: res } = await doUpdate(row, 'update')
      this.$refs[switchRef].loading = false

      if (res.code !== 1) {
        row.status = row.status ? 0 : 1
        return
      }
      this.getGoodsList()
      this.$msg.success(txt + '产品成功')
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '产品'
      })
      if (!result) return

      const idsArr = this.selectArr.map(e => {
        return e.id
      })

      const { data: res } = await doDelete(idsArr)

      if (res.code !== 1) return
      this.getGoodsList()
      this.$msg.success('已成功删除 ' + selectLength + ' 个产品')
      this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除产品
     * @param {*} row
     */

    async deleteGoods(row) {
      const result = await this.$doDelete({
        name: row.productName,
        tag: '产品'
      })
      if (!result) return

      const { data: res } = await doDelete([row.id])

      if (res.code !== 1) return
      this.getGoodsList()
      this.$msg.success('删除产品成功')
    }
  }
}
</script>

<style lang="scss">
.plan-list-box {
  .el-progress {
    width: 250px;
  }
  .dialog_box {
    .el-form-item__label {
      padding-right: 25px;
    }
  }
  .el-input-number--small {
    width: 160px;
  }
  .el-dialog__body {
    padding: 20px 100px;
  }
  .el-dialog__footer {
    padding-bottom: 30px;
  }
}

.json_drawer {
  .el-drawer__header {
    font-weight: 700;
    color: theme('colors.ants-text-1');
  }
  .json_drawer_main {
    padding: 0 20px;
    font-size: 13px;
    > li {
      padding: 15px 0;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed rgba(0, 0, 0, 0.05);
    }
  }
}
</style>
<style lang="scss" scoped>
.progress_info {
  margin: 0;
  font-size: 12px;
}
</style>
