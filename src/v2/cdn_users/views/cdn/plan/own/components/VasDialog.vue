<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title"
    width="1000px"
    top="5vh"
    @close="resetForm"
    @submit="submitForm"
  >
    <el-table
      :data="tableData"
      style="margin:0;"
      border
      :loading="loading"
    >
      <ants-table-column
        label="ID"
        prop="id"
        width="80"
      > </ants-table-column>

      <ants-table-column
        label="名称"
        min-width="140"
        prop="suitName"
      >
      </ants-table-column>

      <ants-table-column
        label="规格"
        min-width="200"
      >
        <template #default="{ row }">
          <ul class="vas-attr-box space-y-3">
            <li
              v-for="(item, key) in itemAttrObj(row.attr)"
              :key="key"
            >
              <PlanAttrItem :attr-item="item" />
            </li>
          </ul>
        </template>
      </ants-table-column>

      <ants-table-column
        label="有效期"
        width="280"
      >
        <template #default="{ row }">
          {{ row.startTime }} ~ {{ row.endTime }}
        </template>
      </ants-table-column>

      <!-- <ants-table-column label="状态" min-width="60">
          <template>
            <el-tag size="mini" :type="modeObj['mode_' + queryInfo.mode].type">
              {{ antsT(modeObj['mode_' + queryInfo.mode].name) }}</el-tag
            >
          </template>
        </ants-table-column> -->
    </el-table>
    <template slot="footer">
      <ants-button
        type="info"
        size="small"
        text="关 闭"
        @click="dialogVisible = false"
      />
    </template>
  </ants-dialog>
</template>

<script>
// API
import { getPlanSuitDetail } from '@/v2/cdn_users/api/cdn/plan'

import { priceName, productAttr } from '@/global/enum'
import PlanAttrItem from '@/v2/cdn_common/components/Plan/Attr/item.vue'

export default {
  components: {
    PlanAttrItem
  },
  props: {},
  data() {
    return {
      loading: false,
      title: '增值业务',
      dialogVisible: false,
      planObj: {
        addedServices: []
      },
      tableData: [],
      priceName
    }
  },
  computed: {
    /**
     * @description: 过滤后要显示属性对象
     */
    itemAttrObj() {
      return (attr = {}) => {
        const obj = {}
        Object.keys(attr).forEach((key) => {
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
  methods: {
    /**
     * @description: 展示对话框
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      this.planObj = row
      this.title = `增值业务【${row.product.name}】`
      this.getSuitDetail(row.serialNumber)
    },

    // 获取套餐详情
    async getSuitDetail(serialNumber) {
      this.loading = true
      // 如果为展开，且没有展开过
      const { data: res } = await getPlanSuitDetail({
        serialNumber
      })
      this.loading = false
      if (res.code !== 1) return
      if (!(res.data || {}).addedServices) return 
      const arr = res.data.addedServices.map((item) => {
        return {
          ...item,
          attr: item.attrJson && JSON.parse(item.attrJson)
        }
      })
      this.tableData = arr
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {},

    // 表单重置
    resetForm() {}
  }
}
</script>

<style lang="scss">
// .vas-attr-box {
//     .plan-attr-item {
//         display: flex;
//         justify-content: space-between;
//     }
// }
</style>
