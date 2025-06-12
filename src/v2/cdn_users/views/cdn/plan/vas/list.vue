<template>
  <el-card class="animated fadeIn">
    <table-query-form
      :search-arr="[]"
      :queryInfo="queryInfo"
      @changeInput="getTableData"
    >
      <template slot="buttons">
        <ants-button
          type="warning"
          class="price-button"
          size="small"
          icon="el-icon-plus"
          @click="goBuyVas()"
          text="购买增值业务"
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
      <ants-table-column label="操作" width="100">
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
      </ants-table-column>
    </ants-table>
  </el-card>
</template>

<script>
// API
import { getPlanSuitList } from '@/v2/cdn_users/api/cdn/plan'

import { priceName, productAttr } from '@/global/enum'

import PlanAttrItem from '@/v2/cdn_common/components/Plan/Attr/item.vue'

// 验证提示实名认证、绑定手机号
import { showTipsAlert } from '@/v2/cdn_users/extra/computed'

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
        // 检索套餐名称
        key: '',
        // 套餐类型 0 = 所有, 1 = 正在使用, 2 = 未使用, 3 = 已过期, 4 = 已失效
        mode: this.$route.query.mode || 1,
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
        // mode_4: {
        //   name: '已失效',
        //   type: 'danger',
        //   class: 'text-error'
        // }
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
      this.queryInfo.mode = newVal
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
      const { data: res } = await getPlanSuitList(this.queryInfo)
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
      this.total = (res.data && res.data.totalCount) || 0
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
    },

    /**
     * @description: 前往购买增值业务
     */

    goBuyVas() {
      // 坚持是否提示实名认证和绑定手机号
      const { isUnverified, isUnboundMobile } = this.$attrs
      if (
        showTipsAlert({
          isUnverified,
          isUnboundMobile,
          tag: '购买增值业务'
        })
      ) return

      this.$router.push('/payment/purchase/vas')
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
