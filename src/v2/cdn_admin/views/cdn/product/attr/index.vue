<template>
  <div>
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索参数名称',
            key: 'key',
            value: queryInfo.key
          }
        ]"
        :queryInfo="queryInfo"
        :pagenumKey="'page'"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            :disabled="$root.loading"
            @click="showCreateUpdateDialog()"
            text="添加参数"
          />
          <!-- <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :disabled="$root.loading"
            :loading="btnLoading"
            @click="batchDelete"
            text="批量删除"
          /> -->
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
      > 
        <ants-table-column prop="name" label="参数名称" min-width="140">
        </ants-table-column>
        <ants-table-column label="默认值" min-width="140">
          <template #default="{ row }">
            <span
              v-if="row.valueType == 'bool'"
              class="el-icon-success text-success"
            >
              支持</span
            >
            <span v-else-if="row.valueType == 'int' || row.valueType == 'price_int'">
              <span class="text-bold">{{ row.value }}</span>
              {{ row.unit }}</span
            >
            <span v-else-if="row.valueType == 'select'">
              {{selectObj[+row.value]}}
            </span>
            <span v-else>{{row.value}}</span>
          </template>
        </ants-table-column>

        <ants-table-column prop="weight" label="排序" min-width="60">
        </ants-table-column>

        <el-table-column prop="status" label="启用" width="100">
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              :ref="`tableSwitchRef${$index}`"
              @change="changeStatus(row, `tableSwitchRef${$index}`)"
            >
            </ants-table-switch>
          </template>
        </el-table-column>

        <ants-table-column label="操作" width="150" auto-fixed>
          <template #default="{ row }">
            <ants-button
              size="mini"
              type="primary"
              :disabled="btnLoading"
              @click="showCreateUpdateDialog(row)"
              text="修改"
            />
            <ants-button
              size="mini"
              type="danger"
              :disabled="btnLoading"
              @click="singleDelete(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <CreateUpdateDialog
      :product-attr-obj="productAttrObj"
      ref="CreateUpdateDialogRef"
    />
  </div>
</template>

<script>
// API
import {
  getProductAttrList,
  doCreateUpdateProductAttr,
  doDeleteProductAttr
} from '@/v2/cdn_admin/api/cdn/product'
// API
import { getCommonEnums } from '@/v2/cdn_admin/api/public'

import CreateUpdateDialog from './CreateUpdateDialog'

// 修改删除后，同步产品参数数据
import { doGetProductAttr } from '@/global/enum'

export default {
  components: {
    CreateUpdateDialog
  },
  data() {
    return {
      total: 0,
      queryInfo: {
        key: '', // 搜索框内容
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      btnLoading: false,
      tableData: [],
      selectArr: [],

      // 参数名对象，用于添加修改参数
      productAttrObj: {},

      selectObj: {
        1: '流量月结',
        2: '平均日峰带宽',
        3: '月95带宽'
      }
    }
  },
  created() {
    this.getTableData()
    this.getAttrNameList()
  },
  methods: {
    /**
     * @description: 获取产品参数列表数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getProductAttrList(this.queryInfo)
      this.$root.loading = false
      if (res.code !== 1) return
      this.total = res.data.totalCount || 0
      this.tableData = res.data.list || []

      doGetProductAttr()
    },

    /**
     * @description: 获取参数名列表
     */
    async getAttrNameList() {
      const { data: res } = await getCommonEnums()

      const baseAttrObj = (res.data && res.data.ProductAttr) || {}
      const obj = {}
      Object.keys(baseAttrObj).forEach(key => {
        const itemArr = baseAttrObj[key]
        obj[key] = {
          // 属性名称
          name: itemArr[0],
          // 单位，bool值没有单位
          unit: itemArr[1],
          // 类型：bool、int、select、price_int
          type: itemArr[2],
          // 说明信息
          remark: itemArr[3],
          // 默认值
          value: itemArr[4]
        }
      })

      console.log(obj)

      this.productAttrObj = obj
    },

    /**
     * @description: 显示添加修改参数对话框
     * @param {*} row
     */
    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 上架-下架产品参数
     * @param {*} row
     */

    async statusGoods(row) {
      let txt = '上架'
      if (!row.status) {
        const confirmResult = await this.$confirm(
          '此操作将会下架产品参数：' + row.productName + '，是否继续？',
          '下架产品参数',
          {
            type: 'warning',
            center: true
          }
        ).catch(err => err)
        if (confirmResult !== 'confirm') {
          row.status = 1
          return this.$msg.info('已取消下架该产品参数')
        }
        txt = '下架'
      }

      //   const { data } = await doUpdate(row, 'update')

      //   if (data.code !== 1) return
      //   this.getTableData()
      //   this.$msg.success(txt + '产品参数成功')
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    /**
     * @description: 启动禁用产品参数
     * @param {*} row
     */

    async changeStatus(row, switchRef) {
      if (row.status === 0) {
        const result = await this.$doDelete({
          title: '禁用产品参数',
          content: `此操作将禁用产品参数“ <strong style="color: #F78989;">${row.name}</strong> ”，是否继续？`
        })
        if (!result) {
          row.status = 1
          return
        }
      }
      this.$refs[switchRef].loading = true
      const { data: res } = await doCreateUpdateProductAttr(row)
      this.$refs[switchRef].loading = false

      if (res.code !== 1) {
        row.status = row.status ? 0 : 1
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
        tag: '产品参数'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map(e => {
        return e.id
      })

      //   const { data: res } = await doDelete(idsArr)
      this.btnLoading = false

      //   if (res.code !== 1) return
      //   this.getTableData()
      //   this.$msg.success('已成功删除 ' + selectLength + ' 个产品参数')
      //   this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除产品参数
     * @param {*} row
     */

    async singleDelete({ id, name }) {
      const result = await this.$doDelete({
        name: name,
        tag: '产品参数'
      })
      if (!result) return
      this.btnLoading = true
      const { data: res } = await doDeleteProductAttr({
        id
      })
      this.btnLoading = false
      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除产品参数成功')
    }
  }
}
</script>
