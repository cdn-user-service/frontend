<template>
  <ants-dialog
    :title="`证书套餐价格设置【${planDetail.productName}】`"
    width="1200px"
    v-model="dialogVisible"
    ref="dialogRef"
    @closed="closed"
    top="0"
    fullscreen
  >
    <div style="min-height:500px;">
      <el-table
        size="mini"
        border
        :data="[priceObj]"
        class="mb-lg"
        style="margin-top:0;"
      >
        <ants-table-column label="对象" align="right" width="80" fixed="left">
          <strong>
            基础价格
          </strong>
        </ants-table-column>
        <ants-table-column
          label="价格类型"
          align="right"
          width="110"
          fixed="left"
        >
          <template>
            <div
              v-for="item in priceTypes"
              :key="item"
              class="font-semibold"
              style="height:35px;line-height:35px;"
            >
              {{ item }}:
            </div>
          </template>
        </ants-table-column>
        <ants-table-column
          v-for="year in priceYears"
          :key="year"
          :label="priceYearName[year]"
          :prop="year"
          width="170"
          align="center"
        >
          <template #default="{ row }">
            <div class="space-y-2">
              <div
                v-for="item in priceTypes"
                :key="item + 'base'"
                class="border border-ants-border-2"
                style="height:32px;line-height:30px;border-radius:4px;"
              >
                {{ row[item][year] }}
              </div>
            </div>
          </template>
        </ants-table-column>
      </el-table>

      <ants-button
        icon="el-icon-plus"
        size="small"
        type="primary"
        text="添加代理"
        @click="toAdd()"
      />

      <el-form :model="form" :rules="rules" class="table-form" ref="formRef">
        <el-table
          size="mini"
          border
          :data="form.tableData"
          v-loading="loading"
          row-key="rowKey"
        >
          <ants-table-column label="对象" align="right" width="80" fixed="left">
            <template #default="{ row, $index }">
              <div class="font-semibold">
                {{
                  row.userType == 2
                    ? '普通用户'
                    : agentName[$index] || '代理用户'
                }}
              </div>
            </template>
          </ants-table-column>
          <ants-table-column
            label="价格类型"
            align="right"
            width="110"
            fixed="left"
          >
            <template>
              <div
                v-for="item in priceTypes"
                :key="item"
                class="font-semibold"
                style="height:38px;line-height:38px;"
              >
                {{ item }}:
              </div>
            </template>
          </ants-table-column>

          <ants-table-column
            v-for="year in priceYears"
            :key="year"
            :label="priceYearName[year]"
            :prop="year"
            width="170"
            align="center"
          >
            <template #default="{ row, $index }">
              <el-form-item
                v-for="item in priceTypes"
                :key="item + $index"
                :prop="`${item}${year}`"
                style="margin:0;"
              >
                <ants-input-number
                  v-model="row[item][year]"
                  placeholder="价格"
                  :precision="2"
                  :min="priceObj[item][year] || 0"
                  :max="9999999999"
                  size="small"
                  style="width: 100%;"
                />
              </el-form-item>
            </template>
          </ants-table-column>
          <ants-table-column label="操作" min-width="180" fixed="right">
            <template #default="{ row, $index }">
              <ants-button
                size="mini"
                :disabled="delLoading"
                :loading="btnLoading"
                @click="doSave(row, $index)"
                :type="row.id ? 'primary' : 'success'"
                :text="row.id ? '修改' : '添加'"
              />
              <ants-button
                v-if="row.userType == 2"
                type="info"
                size="mini"
                disabled
                text="删除"
              />

              <ants-button
                v-else
                type="danger"
                size="mini"
                :loading="delLoading"
                :disabled="btnLoading"
                @click="toDel(row, $index)"
                text="删除"
              />
            </template>
          </ants-table-column>
        </el-table>
      </el-form>
    </div>

    <template #footer>
      <span></span>
    </template>
  </ants-dialog>
</template>

<script>
import {
  getSslPlanDetail,
  doSavePlanPrice,
  doDelPlanPrice
} from '@/v2/dns_admin/api/dns/ssl'

const defaultPrice = ['basePrice', 'normalPrice', 'wildPrice']

const agentName = {
  // 0: '普通用户',
  1: '一级代理',
  2: '二级代理',
  3: '三级代理',
  4: '四级代理',
  5: '五级代理',
  6: '六级代理',
  7: '七级代理',
  8: '八级代理',
  9: '九级代理'
}

const rules = {}

export default {
  props: {
    priceYearName: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      btnLoading: false,
      delLoading: false,
      dialogVisible: false,
      form: {
        tableData: []
      },
      baseTableData: [],
      rules,
      // 用户类型: userType: 2 = 普通用户 | 3、4、5... = 代理
      agentName,
      // 表格价格列
      priceYears: [],
      // 需要修改的价格类型列表： basePrice | normalPrice | wildPrice
      priceTypes: [],
      // 基础价格
      priceObj: {
        basePrice: {},
        normalPrice: {},
        wildPrice: {}
      },
      // 套餐详情
      planDetail: {
        id: null,
        priceList: []
      }
    }
  },
  methods: {
    // 对话框显示
    show(row = {}) {
      this.priceTypes = []
      this.priceYears = []
      this.planDetail = {
        ...row
      }
      this.dialogVisible = true
      defaultPrice.forEach(item => {
        this.priceObj[item] = {}
        if (row[item]) {
          this.priceObj[item] = JSON.parse(row[item])
          if (Object.keys(this.priceObj[item]).length) {
            this.priceTypes.push(item)
          }
        }
      })

      // 表格价格列
      const priceYearsObj = JSON.parse(
        row.basePrice || row.normalPrice || row.wildPrice || '{}'
      )
      this.priceYears = Object.keys(priceYearsObj).map(key => key)

      const { priceList = [] } = row
      this.buildTableData(priceList)
      this.getDetail()
    },

    // 构造表格数据
    buildTableData(data = []) {
      const userRows = []
      const agentRows = []
      data.forEach(item => {
        const obj = {
          ...item
        }
        defaultPrice.forEach(item2 => {
          obj[item2] = JSON.parse(obj[item2] || '{}')
        })
        // 普通用户
        if (obj.userType === 2) {
          userRows.push({
            ...obj,
            rowKey: obj.id
          })
        } else {
          // 代理
          agentRows.push({
            ...obj,
            rowKey: obj.id
          })
        }
      })
      this.form.tableData = [...userRows, ...agentRows]
      console.log(this.form.tableData)

      if (!this.form.tableData.length) {
        this.doAdd(2)
      }
    },

    // 获取套餐详情数据
    async getDetail() {
      this.loading = true
      try {
        const { data: res } = await getSslPlanDetail({
          id: this.planDetail.id
        })
        if (res.code !== 1) return
        const obj = res.data || {}
        this.planDetail = {
          ...this.planDetail,
          ...obj
        }
        this.buildTableData(this.planDetail.priceList)
      } finally {
        this.loading = false
      }
    },

    // 修改保存
    async doSave(row, idx) {
      console.log(row)
      this.btnLoading = true
      try {
        const postData = {
          ...row
        }

        let maxUserType = 2
        this.form.tableData.forEach(item => {
          if (!item.id) return
          if (item.userType > maxUserType) {
            maxUserType = item.userType
          }
        })

        // 如果为添加
        if (!row.id && !row.userType) {
          postData.userType = maxUserType + 1
        }

        defaultPrice.forEach(item => {
          postData[item] = this.priceTypes.includes(item)
            ? JSON.stringify(postData[item])
            : null
        })
        const { data: res } = await doSavePlanPrice(postData)
        if (res.code !== 1) return
        this.$msg.success('保存成功')
        this.getDetail()
      } finally {
        this.btnLoading = false
      }
    },

    // 删除
    async toDel(row, idx) {
      console.log(row, idx)
      // 临时添加的行
      if (!row.id) {
        this.form.tableData.splice(idx, 1)
        return
      }

      // 执行删除
      this.delLoading = true
      try {
        const result = await this.$doDelete({
          tag: '代理'
        })
        if (!result) return
        const { data: res } = await doDelPlanPrice({
          ids: row.id
        })
        if (res.code !== 1) return
        this.form.tableData.splice(idx, 1)
        this.$msg.success('删除成功')
      } finally {
        this.delLoading = false
      }
    },

    toAdd() {
      const defaultRows = this.form.tableData.filter(it => it.userType == 2)
      this.doAdd(!defaultRows.length ? 2 : null)
    },

    // 新增一行
    doAdd(userType = null) {
      const len = this.form.tableData.length
      if (len >= 10) {
        return this.$msg.error('最多添加10行')
      }

      const { wildPrice, normalPrice, basePrice } = this.priceObj
      const defaultForm = {
        id: 0,
        sslRcProductId: this.planDetail.id,
        userType,
        wildPrice: {
          ...wildPrice
        },
        normalPrice: {
          ...normalPrice
        },
        basePrice: {
          ...basePrice
        },
        rowKey: new Date().getTime() + '_' + len
      }
      this.form.tableData.push({
        ...defaultForm
      })
    },

    // 对话框关闭
    closed() {
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
