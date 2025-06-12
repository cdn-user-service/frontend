<template>
  <div>
    <el-card class="animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索套餐名称',
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
            text="添加套餐"
          />
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column type="expand" label="#" width="40">
          <template #default="{ row }">
            <div class="p-lg bg-ants-bg-2">
              <div class="mb-lg font-bold">套餐参数配置</div>
              <PlanAttr class="space-y-5" :attr-obj="row.attr" />
            </div>
          </template>
        </ants-table-column>

        <ants-table-column prop="id" label="ID" width="60"> </ants-table-column>

        <ants-table-column prop="name" label="套餐名称" min-width="140">
        </ants-table-column>
        <ants-table-column label="业务分组" min-width="120">
          <template #default="{ row }">
            <div
              v-for="item in row.client_group_list"
              :key="item.id"
              class="space-x-1"
            >
              <el-tag size="small" type="primary">{{ item.name }}</el-tag>
            </div>
          </template>
        </ants-table-column>
        <ants-table-column label="计费方式" min-width="140">
          <template #default="{ row }">
            <div>
              <el-tag size="mini" type="primary">
                {{
                  row.attr.charging_mode && getBillName(row.attr.charging_mode)
                }}
              </el-tag>
            </div>
            <div v-if="row.attr.charging_mode == 1">
              流量月包：
              <strong>
                {{ flowUnit(row.attr.flow) }}
              </strong>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column
          prop="productUnitPrice"
          label="套餐价格"
          min-width="200"
        >
          <template #default="{ row }">
            <template v-if="row.status == 4">
              <el-tag
                size="mini"
                class="mr-sm"
                :type="(row.priceObj.v || {}).status ? 'success' : 'danger'"
              >
                {{ (row.priceObj.v || {}).status ? '启用' : '禁用' }}</el-tag
              >
              <template v-if="(row.priceObj.v || {}).status">
                有效期：
                <strong>{{ (row.priceObj.v || {}).value }} 个月</strong>
              </template>
            </template>
            <template v-else>
              <ul class="space-y-1" v-if="row.attr.charging_mode == 1">
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
              <strong
                v-else-if="
                  row.attr.charging_mode == 2 || row.attr.charging_mode == 3
                "
                >{{ row.attr.bandwidth | priceFormat }}/Mbps/月</strong
              >
            </template>
          </template>
        </ants-table-column>

        <ants-table-column prop="status" label="发布状态" min-width="140">
          <template #default="{ row }">
            <span :class="(statusArr[row.status] || {}).class">{{
              (statusArr[row.status] || {}).label
            }}</span>
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

    <!-- 添加修改套餐对话框 -->
    <CreateUpdateDialog ref="CreateUpdateDialogRef" :group-list="groupList" />
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
import { getGroupList } from '@/v2/cdn_admin/api/cdn/node'

// 套餐参数数据
import { getBillName, priceName } from '@/global/enum'

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
        // 10 表示CDN套餐
        productTypes: '10',
        // 检索 套餐名称 name
        key: '',
        page: 1,
        limit: this.$store.state.tabelConfig.pagesize
      },
      btnLoading: false,
      tableData: [],
      selectArr: [],
      statusArr: [
        {
          label: '下架（不可购买不可续费）',
          value: 0,
          class: 'text-error'
        },
        {
          label: '上架（可购买可续费）',
          value: 1,
          class: 'text-success'
        },
        {
          label: '体验版（可新购不可续费）',
          value: 2,
          class: 'text-warning'
        },
        {
          label: '典藏版（不可新购可续费）',
          value: 3,
          class: 'text-success'
        },
        {
          label: '注册赠送',
          value: 4,
          class: 'text-success'
        }
      ],

      // 套餐属性列表
      attrList: [],
      // 业务分组列表
      groupList: [],
      // 计费方式
      getBillName,
      // 价格类型名称
      priceName
    }
  },
  computed: {},
  created() {
    this.getGroupListAll()
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取套餐列表数据
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
          priceObj: JSON.parse(item.productJson || '{}')
          // attrArr: item.attrJson && JSON.parse(item.attrJson)
        }
      })
      this.total = res.data.totalCount || 0
      this.tableData = arr
    },

    /**
     * @description: 获取业务分组列表
     */

    async getGroupListAll(serverGroupIds = []) {
      this.btnLoading = true
      const { data: res } = await getGroupList({
        page: 1,
        limit: 200
      })
      this.btnLoading = false
      if (res.code !== 1) return
      this.groupList = res.data.list || []
    },

    /**
     * @description: 显示添加修改参数对话框
     * @param {*} row
     */
    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 上架-下架套餐
     * @param {*} row
     */

    async changeStatus(row, switchRef) {
      // if (row.status === 0) {
      //   const result = await this.$doDelete({
      //     title: '下架套餐',
      //     content: `此操作将下架套餐“ <strong style="color: #F78989;">${row.name}</strong> ”，是否继续？`
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
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '套餐'
      })
      if (!result) return

      const idsArr = this.selectArr.map((e) => {
        return e.id
      })

      //   const { data: res } = await doDelete(idsArr)

      //   if (res.code !== 1) return
      //   this.getTableData()
      //   this.$msg.success('已成功删除 ' + selectLength + ' 个套餐')
      //   this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除套餐
     * @param {*} row
     */

    async singleDelete({ name, id }) {
      const result = await this.$doDelete({
        name,
        tag: '套餐'
      })
      if (!result) return
      const { data: res } = await doDeleteProduct({
        id
      })
      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除套餐成功')
    }
  }
}
</script>
