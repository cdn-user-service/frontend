<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '增值业务'"
    width="1000px"
    top="5vh"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
      :status-icon="false"
    >
      <ants-form-item label="业务名称" prop="name">
        <ants-input
          v-model.trim="form.name"
          placeholder="请输入业务名称"
          maxlength="100"
        />
      </ants-form-item>

      <ants-form-item label="发布状态" prop="status">
        <ants-radio-group v-model="form.status">
          <ants-radio :label="1" text="上架" />
          <ants-radio :label="0" text="下架" />
        </ants-radio-group>
      </ants-form-item>
      <ants-form-item label="排 序" prop="weight">
        <ants-input-number
          v-model="form.weight"
          :step="1"
          :min="1"
          :precision="0"
          placeholder="请输入排序"
        />
        <span class="ml-sm text-sm text-ants-text-4">(越大越靠前)</span>
      </ants-form-item>

      <div class="rounded-xl py-sm px-df bg-ants-bg-3">
        <TitleBorder title="设置价格" />
      </div>
      <ants-form-item label="月费" prop="mPrice">
        <ants-input-number
          v-model="form.mPrice"
          :step="100"
          :min="0.01"
          :precision="2"
          placeholder="请输入月费"
          class="mr-df"
        />
        <ants-checkbox
          v-model="form.mStatus"
          :true-label="1"
          :false-label="0"
          text="启用"
        />
      </ants-form-item>

      <ants-form-item label="季费" prop="sPrice">
        <ants-input-number
          v-model="form.sPrice"
          :step="100"
          :min="0.01"
          :precision="2"
          placeholder="请输入季费"
          class="mr-df"
        />
        <ants-checkbox
          v-model="form.sStatus"
          :true-label="1"
          :false-label="0"
          text="启用"
        />
      </ants-form-item>
      <ants-form-item label="年费" prop="yPrice">
        <ants-input-number
          v-model="form.yPrice"
          :step="100"
          :min="0.01"
          :precision="2"
          placeholder="请输入年费"
          class="mr-df"
        />
        <ants-checkbox
          v-model="form.yStatus"
          :true-label="1"
          :false-label="0"
          text="启用"
        />
      </ants-form-item>

      <div class="rounded-xl py-sm px-df bg-ants-bg-3">
        <TitleBorder title="设置参数" />
      </div>
      <el-table
        :data="attrList"
        size="small"
        border
        ref="tableRef"
        @selection-change="handleSelectionChange"
      >
        <div slot="empty" class="text-center">
          还没有任何产品参数！
          <router-link to="/cdn/product/attr"> 前往添加参数</router-link>
        </div>
        <ants-table-column type="selection" width="50" align="center">
        </ants-table-column>
        <ants-table-column prop="name" label="参数名称" width="140">
        </ants-table-column>
        <ants-table-column prop="value" label="参数值" min-width="150">
          <template #default="{ row }">
            <!-- 布尔值 -->
            <span
              v-if="row.valueType === 'bool'"
              class="el-icon-success text-success"
            >
              支持</span
            >

            <!-- 数值 -->
            <div
              v-else-if="row.valueType == 'int' || row.valueType == 'price_int'"
            >
              <ants-input-number
                style="width:130px;margin-right:10px;"
                size="mini"
                :step="1"
                :min="0"
                :max="999999"
                :precision="0"
                v-model="row.value"
              />

              <!-- 流量单位 -->
              <ants-select
                v-if="row.attr == 'flow'"
                v-model="form.flow_unit"
                style="width:80px;"
                size="mini"
                placehilder="单位"
              >
                <ants-option label="GB" :value="1" />
                <ants-option label="TB" :value="1000" />
                <ants-option label="PB" :value="1000000" />
              </ants-select>
              <span v-else>{{ row.unit }}</span>
            </div>

            <!-- text文本类型 -->
            <ants-input
              v-else-if="row.valueType == 'text'"
              size="mini"
              placeholder="请输入描述"
              v-model="row.value"
            />
          </template>
        </ants-table-column>
      </el-table>
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
import {
  doCreateUpdateProduct,
  getProductAttrAll
} from '@/v2/cdn_admin/api/cdn/product'

// 产品参数对象
import { productAttrObj } from '@/global/enum'

const defaultForm = {
  // 添加时 id为 0
  id: 0,
  // 产品名称
  name: '',
  // 业务分组IDs，可选多个业务分组
  serverGroupIds: [],
  // 产品类型，12 = 增值业务
  product_type: 12,

  // 价格 JSON 对象
  productJson: '',
  mPrice: 1,
  mStatus: 1,
  sPrice: 1,
  sStatus: 1,
  yPrice: 1,
  yStatus: 1,

  // 流量单位 1 = GB, 1000 = TB, 1000000 = PB
  flow_unit: 1,

  // 参数值 JSON 对象
  attr: {},
  attrJson: '',
  // 状态， 1 = 启用， 0 = 禁用
  status: 1,
  // 权重，越大越靠前
  weight: 1
}

export default {
  props: {
    productAttrObj: Object
  },
  data() {
    return {
      title: '添加',
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      formRules: {
        name: [
          {
            required: true,
            message: '请输入业务名称',
            trigger: ['change', 'blur']
          }
        ],
        status: [
          {
            required: true,
            message: '请选择发布状态',
            trigger: 'change'
          }
        ],
        mPrice: [
          {
            required: true,
            message: '请输入月费',
            trigger: ['change', 'blur']
          }
        ],
        sPrice: [
          {
            required: true,
            message: '请输入季费',
            trigger: ['change', 'blur']
          }
        ],
        yPrice: [
          {
            required: true,
            message: '请输入年费',
            trigger: ['change', 'blur']
          }
        ],
        weight: [
          {
            required: true,
            message: '请输入权重',
            trigger: ['change', 'blur']
          }
        ]
      },

      selectArr: [], // 批量操作勾选数据
      attrList: []
    }
  },
  methods: {
    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val
    },

    /**
     * @description: 展示对话框
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      this.title = '添加'
      // 这里需要深拷贝，不然表格上的数据会跟着变
      const ROW = this.$_.cloneDeep(row)
      // 修改
      if (ROW.id) {
        this.title = '修改'
        this.form = {
          ...this.form,
          ...ROW
        }

        // 解析价格对象 productJson
        const productObj = ROW.productJson && JSON.parse(ROW.productJson)
        Object.keys(productObj).forEach(key => {
          this.$set(this.form, key + 'Price', productObj[key].value / 100)
          this.$set(this.form, key + 'Status', productObj[key].status)
        })

        // 设置流量单位
        let unit = 1
        const flowVal = ROW.attr.flow
        if (flowVal >= 1000 && flowVal < 1000 * 1000) {
          unit = 1000
          this.form.attr.flow = flowVal / 1000
        } else if (flowVal >= 1000 * 1000) {
          unit = 1000 * 1000
          this.form.attr.flow = flowVal / 1000 / 1000
        }
        
        this.$set(this.form, 'flow_unit', unit)
      }

      this.$nextTick(() => {
        this.getProductAttrData()
      })
    },

    /**
     * @description: 获取产品参数列表
     */

    async getProductAttrData() {
      this.$refs.dialogRef.bodyLoading = true
      const { data: res } = await getProductAttrAll()
      this.$refs.dialogRef.bodyLoading = false
      if (res.code !== 1) return
      const arr = []
      let flowId = null
      // 过滤掉 计费方式、带宽
      res.data.forEach(item => {
        const key = item.attr
        if (key in productAttrObj) {
          arr.push({
            attr: key,
            id: item.id,
            ...productAttrObj[key],
            value: this.form.attr[key] || productAttrObj[key].value
          })
        }

        // 加入流量包
        if (key === 'flow') {
          flowId = item.id
        }
      })

      // 加入流量
      if (flowId) {
        arr.unshift({
          attr: 'flow',
          id: flowId,
          name: '流量',
          valueType: 'int',
          unit: 'G',
          value: this.form.attr.flow || 10
        })
      }

      this.attrList = arr

      // 设置选中状态
      this.$nextTick(() => {
        this.attrList.forEach(item => {
          if (item.attr in this.form.attr) {
            this.$refs.tableRef.toggleRowSelection(item, true)
          }
        })
      })
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        if (!this.selectArr.length) return this.$msg.error('请选择参数')
        // 设置流量值
        const arr = this.selectArr.map(item => {
          let flowVal = item.value
          if (item.attr === 'flow') {
            flowVal *= this.form.flow_unit
            flowVal = flowVal > 2147483648
                ? 2147483648
                : flowVal
          }

          // bool值
          if (item.valueType === 'bool') {
            flowVal = 1
          }
          return {
            ...item,
            value: flowVal
          }
        })

        this.$refs.dialogRef.btnLoading = true

        const { mPrice, mStatus, sPrice, sStatus, yPrice, yStatus } = this.form

        const { data } = await doCreateUpdateProduct({
          ...this.form,
          // 将参数数组转为 JSON数组
          attrJson: JSON.stringify(arr),
          // 将价格转为 JSON
          productJson: JSON.stringify({
            m: {
              value: mPrice * 100,
              status: mStatus
            },
            s: {
              value: sPrice * 100 || 0,
              status: sStatus
            },
            y: {
              value: yPrice * 100 || 0,
              status: yStatus
            }
          }),
          // 业务分组数组转字符串
          serverGroupIds: ''
        })
        this.$refs.dialogRef.btnLoading = false

        if (data.code !== 1) return
        this.dialogVisible = false
        this.$parent.getTableData()
        this.$msg.success(this.title + '成功')
      })
    },

    // 表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
