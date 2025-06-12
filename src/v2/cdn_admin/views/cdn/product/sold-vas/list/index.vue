<template>
  <el-card class="animated fadeIn">
    <table-query-form
      :search-arr="[
        {
          name: '检索用户',
          key: 'user',
          value: queryInfo.user
        }
      ]"
      :queryInfo="queryInfo"
      @changeInput="getTableData"
    >
      <template slot="buttons">
        <ants-button
          type="success"
          size="small"
          icon="el-icon-refresh"
          :loading="$root.loading"
          :disabled="btnLoading"
          @click="getTableData"
          text="刷新"
        />
      </template>
    </table-query-form>

    <!-- 表格 -->
    <ants-table
      :data="tableData"
      :total="total"
      :queryInfo="queryInfo"
      @getTableData="getTableData"
    >
      <ants-table-column label="ID" prop="id" width="80"> </ants-table-column>

      <ants-table-column label="名称" min-width="150" prop="name">
      </ants-table-column>

      <ants-table-column label="规格" min-width="200">
        <template #default="{ row }">
          <ul class="vas-attr-box space-y-3">
            <li v-for="(item, key) in itemAttrObj(row.attr)" :key="key">
              <PlanAttrItem :attr-item="item" />
            </li>
          </ul>
        </template>
      </ants-table-column>

      <ants-table-column label="有效期" min-width="200">
        <template #default="{ row }">
          {{ row.startTime }} ~ {{ row.endTime }}
        </template>
      </ants-table-column>

      <ants-table-column label="绑定套餐" prop="mainPlanName" min-width="140">
      </ants-table-column>

      <ants-table-column label="状态" min-width="60">
        <template>
          <el-tag size="mini" :type="modeObj['mode_' + queryInfo.mode].type">
            {{ antsT(modeObj['mode_' + queryInfo.mode].name) }}</el-tag
          >
        </template>
      </ants-table-column>

      <ants-table-column label="用户" min-width="140">
        <template #default="{ row }">
          <div>ID：{{ row.userId }}</div>
          <ants-copy :text="row.username" />
        </template>
      </ants-table-column>

      <!-- <ants-table-column label="操作" width="100">
        <template #default="{ row }">
          <div v-if="queryInfo.mode == 4">
            <ants-button
              type="danger"
              size="mini"
              @click="singleDelete(row)"
              :disabled="btnLoading"
              text="删除"
            />
          </div>
        </template>
      </ants-table-column> -->
    </ants-table>
  </el-card>
</template>

<script>
// API
import { getSuitList } from '@/v2/cdn_admin/api/cdn/product'

import { priceName, productAttr } from '@/global/enum'

import PlanAttrItem from '@/v2/cdn_common/components/Plan/Attr/item.vue'

export default {
  components: {
    PlanAttrItem
  },
  data() {
    return {
      // 价格类型名称
      priceName,
      btnLoading: false,
      total: 0,
      queryInfo: {
        // 10，11 = 套餐、套餐续费， 12 = 增值业务
        productTypes: '12',
        user: '', // 搜索框内容
        // 套餐类型 0 = 所有, 1 = 正在使用, 2 = 未使用, 3 = 已过期, 4 = 已失效
        mode: this.$route.query.mode || '1',
        page: 1,
        limit: this.$store.state.tabelConfig.pagesize
      },
      tableData: [],

      modeObj: {
        mode_1: {
          name: '使用中',
          type: 'primary',
          class: 'text-primary'
        },
        mode_2: {
          name: '未使用',
          type: 'success',
          class: 'text-success'
        },
        mode_3: {
          name: '已过期',
          type: 'warning',
          class: 'text-warning'
        }
      }
    }
  },
  computed: {
    /**
     * @description: 过滤后要显示属性对象
     */
    itemAttrObj() {
      return (attr = {}) => {
        const obj = {}
        Object.keys(attr).forEach(key => {
          if (attr[key] && key in productAttr) {
            obj[key] = {
              attr: key,
              ...productAttr[key],
              value: attr[key]
            }
          }
        })
        return obj
      }
    }
  },
  created() {
    this.getTableData()
  },
  watch: {
    // 监听路由地址参数的改变
    '$route.query.mode': function(newVal, oldVal) {
      // 如果为充值记录
      this.queryInfo.mode = newVal || '1'
      this.queryInfo.page = 1
      this.tableData = []
      this.total = 0
      this.getTableData()
    }
  },
  methods: {
    /**
     * @description: 获取我的套餐数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getSuitList(this.queryInfo)
      this.$root.loading = false
      if (res.code !== 1) return
      const obj = res.data || {}
      const arr = (obj.list || []).map(item => {
        // 过滤掉空 属性attr
        // const attrObj = {}
        // Object.keys(item.attr).forEach(key => {
        //   if (item.attr[key]) {
        //     attrObj[key] = item.attr[key]
        //   }
        // })
        return {
          ...item,
          mainPlanName:
            item.mainSuitObj &&
            item.mainSuitObj.productEntity &&
            item.mainSuitObj.productEntity.name,
          // attr: attrObj,
          name: item.productEntity && item.productEntity.name
        }
      })
      console.log(arr)
      this.tableData = arr
      this.total = obj.totalCount || 0
    },

    /** -------------------------------------------------------------------------------------
     * @description: 删除
     * @param {*} row
     */
    async singleDelete({ name, id }) {
      const result = await this.$doDelete({
        name: name.productName,
        tag: '已失效增值业务'
      })
      // if (!result) return

      // // 发起请求
      // const { data: res } = await doDeleteUserMeal({
      //   id: id
      // })

      // if (res.code !== 1) return
      // this.getTableData()
      // this.$msg.success('已成功删除已失效套餐：' + name.productName)
    }
  }
}
</script>

<style lang="scss">
.vas-attr-box {
  .attr-name {
    // width: auto;
    // min-width: auto;
    // padding: 0px 6px;
    // color: theme('colors.primary');
    // background-color: theme('colors.primary-light');
    // border-radius: 4px;
  }
}
</style>
