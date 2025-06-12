<template>
  <div>
    <el-card class="animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索名称',
            key: 'key',
            value: queryInfo.key
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            :disabled="$root.loading || btnLoading"
            @click="showCreateUpdateDialog()"
            text="添加增值业务"
          />
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column prop="id" label="ID" width="60"> </ants-table-column>

        <ants-table-column prop="name" label="名称" min-width="140">
        </ants-table-column>

        <ants-table-column label="规格" min-width="200">
          <template #default="{ row }">
            <div v-if="row.attr.flow" class="mb-1">
              <span
                class="text-ants-text-3 mr-sm inline-block"
                style="min-width: 100px"
                >流量</span
              >
              <strong>
                {{ flowUnit(row.attr.flow) }}
              </strong>
            </div>
            <PlanAttr class="space-y-1" hiddenAttr :attr-obj="row.attr" />
          </template>
        </ants-table-column>

        <ants-table-column label="价格" min-width="200">
          <template #default="{ row }">
            <ul class="space-y-1">
              <li v-for="(item, key) in row.priceObj" :key="key">
                <template v-if="priceName[key]">
                  <el-tag
                    size="mini"
                    class="mr-sm"
                    :type="item.status ? 'success' : 'danger'"
                  >
                    {{ item.status ? '启用' : '禁用' }}</el-tag
                  >
                  <span>{{ `${priceName[key]}费：` }}</span>
                  <strong>{{ item.value | priceFormat }}</strong>
                </template>
              </li>
            </ul>
          </template>
        </ants-table-column>

        <ants-table-column prop="status" label="发布状态" min-width="140">
          <template #default="{ row }">
            <span :class="statusObj[row.status].class">
              {{ statusObj[row.status].label }}</span
            >
          </template>
        </ants-table-column>

        <ants-table-column prop="weight" label="排序" min-width="60">
        </ants-table-column>

        <ants-table-column label="操作" width="150">
          <template #default="{ row }">
            <ants-button
              size="mini"
              type="primary"
              @click="showCreateUpdateDialog(row)"
              text="修改"
            />
            <ants-button
              size="mini"
              type="danger"
              @click="singleDelete(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加修改产品对话框 -->
    <CreateUpdateDialog ref="CreateUpdateDialogRef" />
  </div>
</template>

<script>
// API
import {
  getProductList,
  doCreateUpdateProduct,
  doDeleteProduct,
  getProductAttrAll
} from '@/v2/cdn_admin/api/cdn/product'

// 产品参数数据
import { priceName } from '@/global/enum'
import CreateUpdateDialog from './components/CreateUpdateDialog'
import PlanAttr from '@/v2/cdn_common/components/Plan/Attr'
import { flowUnit } from '@/utils/unit'

export default {
  components: {
    PlanAttr,
    CreateUpdateDialog
  },
  data() {
    return {
      flowUnit,
      total: 0,
      queryInfo: {
        // 12 = 增值业务
        productTypes: '12',
        // 检索 产品名称 name
        key: '',
        page: 1,
        limit: this.$store.state.tabelConfig.pagesize
      },
      btnLoading: false,
      tableData: [],
      selectArr: [],
      statusObj: {
        0: {
          label: '下架',
          class: 'text-error el-icon-error'
        },
        1: {
          label: '上架',
          class: 'text-success el-icon-success'
        }
      },

      // 套餐属性列表
      attrList: [],
      // 价格类型名称
      priceName
    }
  },
  computed: {},
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取产品列表数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getProductList(this.queryInfo)
      this.$root.loading = false
      if (res.code !== 1) return
      const obj = res.data || {}
      const arr = (obj.list || []).map((item) => {
        return {
          ...item,
          priceObj: item.productJson && JSON.parse(item.productJson)
        }
      })
      this.total = res.data.totalCount || 0
      this.tableData = arr
    },

    /**
     * @description: 显示添加修改参数对话框
     * @param {*} row
     */
    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 上架-下架产品
     * @param {*} row
     */

    async changeStatus(row, switchRef) {
      // if (row.status === 0) {
      //   const result = await this.$doDelete({
      //     title: '下架产品',
      //     content: `此操作将下架产品“ <strong style="color: #F78989;">${row.name}</strong> ”，是否继续？`
      //   })
      //   if (!result) {
      //     row.status = 1
      //     return
      //   }
      // }
      this.$refs[switchRef].loading = true
      const { data: res } = await doCreateUpdateProduct(row)
      this.$refs[switchRef].loading = false

      if (res.code !== 1) {
        // row.status = row.status ? 0 : 1
        return
      }

      // this.getTableData()
      this.$msg.success('操作成功')
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async singleDelete({ name, id }) {
      const result = await this.$doDelete({
        name,
        tag: '增值业务'
      })
      if (!result) return
      const { data: res } = await doDeleteProduct({
        id
      })
      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除成功')
    }
  }
}
</script>
