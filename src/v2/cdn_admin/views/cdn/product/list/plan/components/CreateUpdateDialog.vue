<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '套餐'"
    width="1000px"
    top="5vh"
    destroy-on-close
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
      <ants-form-item label="套餐名称" prop="name">
        <ants-input
          v-model.trim="form.name"
          placeholder="请输入套餐名称"
          maxlength="100"
        />
      </ants-form-item>

      <ants-form-item label="选择分组" prop="serverGroupIds">
        <ants-select
          v-model="form.serverGroupIds"
          placeholder="请选择业务分组"
          :loading="groupLoading"
        >
          <ants-option
            v-for="item in groupList"
            :key="item.id"
            :label="item.name"
            :value="item.id + ''"
          />
        </ants-select>
      </ants-form-item>

      <ants-form-item label="套餐状态" prop="status">
        <!-- <ants-switch
            v-model="form.status"
            active-color="#13ce66"
            active-text="启用"
            inactive-text="禁用"
          /> -->
        <ants-select
          v-model="form.status"
          placeholder="状态"
          style="width: 100%"
        >
          <ants-option
            v-for="item in statusArr"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ants-select>
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
        <TitleBorder title="设置计费方式" />
      </div>
      <ants-form-item label="计费方式" prop="charging_mode">
        <ants-radio-group size="small" v-model="form.charging_mode">
          <ants-radio-button
            v-for="(item, key) in billName"
            :key="key"
            :label="key"
            :text="item"
          />
        </ants-radio-group>
      </ants-form-item>
      <div class="space-y-10" v-show="form.charging_mode == 1">
        <ants-form-item label="流量月包" prop="flow">
          <ants-input-number
            v-model="form.flow"
            :step="1"
            :min="1"
            :max="2147483648"
            placeholder="流量月包"
            class="mr-sm"
          />
          <ants-select
            v-model="form.flow_unit"
            style="width: 80px"
            placehilder="单位"
          >
            <ants-option label="GB" :value="1" />
            <ants-option label="TB" :value="1000" />
            <ants-option label="PB" :value="1000000" />
          </ants-select>
        </ants-form-item>
        <template v-if="form.status != 4">
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
        </template>
        <template v-if="form.status == 4">
          <ants-form-item label="有效期(月)" prop="vPrice">
            <ants-input-number
              v-model="form.vPrice"
              :step="1"
              :min="1"
              :precision="0"
              placeholder="有效期"
              class="mr-df"
            />
            <ants-checkbox
              v-model="form.vStatus"
              :true-label="1"
              :false-label="0"
              text="启用"
            />
          </ants-form-item>
        </template>
      </div>

      <ants-form-item
        label="带宽单价"
        prop="bandwidth"
        v-show="form.charging_mode == 2 || form.charging_mode == 3"
      >
        <ants-input-number
          v-model="form.bandwidth"
          :step="10"
          :min="0.01"
          :max="2147483648"
          :precision="2"
          placeholder="带宽单价"
        />
        <span class="ml-sm text-sm mr-lg">Mbps/月</span>
      </ants-form-item>

      <div class="rounded-xl py-sm px-df bg-ants-bg-3">
        <TitleBorder title="设置参数" />
      </div>
      <el-table :data="attrList" size="small" border ref="tableRef">
        <div slot="empty" class="text-center">
          还没有任何套餐参数！
          <router-link to="/cdn/product/attr"> 前往添加参数</router-link>
        </div>
        <ants-table-column prop="name" label="参数名称" width="140">
        </ants-table-column>
        <ants-table-column prop="value" label="参数值" min-width="150">
          <template #default="{ row }">
            <!-- 布尔值 -->
            <ants-radio-group
              v-if="row.valueType === 'bool'"
              v-model="row.value"
            >
              <ants-radio label="1" text="支持" />
              <ants-radio label="0" text="不支持" />
            </ants-radio-group>

            <!-- 数值 -->
            <div
              v-else-if="row.valueType == 'int' || row.valueType == 'price_int'"
            >
              <ants-input-number
                style="width: 130px; margin-right: 10px"
                size="mini"
                :step="1"
                :min="0"
                :max="999999"
                :precision="0"
                v-model="row.value"
              />
              <span class="">{{ row.unit }}</span>
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

// 套餐参数对象
import { productAttrObj, billName } from '@/global/enum'

const defaultForm = {
  // 添加时 id为 0
  id: 0,
  // 套餐名名称
  name: '',
  // 业务分组IDs，可选多个业务分组,，单选
  serverGroupIds: null,

  // 套餐类型，CDN套餐默认为 10
  product_type: 10,

  // 价格 JSON 对象
  productJson: '',
  mPrice: 1,
  mStatus: 1,
  sPrice: 1,
  sStatus: 1,
  yPrice: 1,
  yStatus: 1,

  // 注册赠送有效期，是有注册赠送才有
  vPrice: 1,
  vStatus: 1,

  // 计费方式 1 = 流量月结， 2 = 平均日峰带宽， 3 = 月95带宽
  charging_mode: 1,
  // 流量。现在单位固定为 G 的
  flow: 10,
  // 流量单位 1 = GB, 1000 = TB, 1000000 = PB
  flow_unit: 1,
  // 带宽 price_int(以分为单位), ￥/Mbps/月
  bandwidth: 20,

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
    // 业务分组列表
    groupList: Array
  },
  data() {
    return {
      title: '添加',
      dialogVisible: false,
      groupLoading: false,
      form: {
        ...defaultForm
      },
      formRules: {
        name: [
          {
            required: true,
            message: '请输入套餐名称',
            trigger: ['change', 'blur']
          }
        ],
        status: [
          {
            required: true,
            message: '请选择套餐状态',
            trigger: 'change'
          }
        ],
        serverGroupIds: [
          {
            required: true,
            message: '请选择业务分组',
            trigger: 'change'
          }
        ],
        vPrice: [
          {
            required: true,
            message: '请输入有效期',
            trigger: ['change', 'blur']
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
        charging_mode: [
          {
            required: true,
            message: '请选择计费方式',
            trigger: 'change'
          }
        ],
        flow: [
          {
            required: true,
            message: '请输入流量',
            trigger: ['change', 'blur']
          }
        ],
        bandwidth: [
          {
            required: true,
            message: '请输入带宽单价',
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
      statusArr: [
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
          label: '下架（不可购买不可续费）',
          value: 0,
          class: 'text-error'
        },
        {
          label: '注册赠送（账号注册赠送套餐,不可购不可续费）',
          value: 4,
          class: 'text-success'
        }
      ],

      // 套餐参数配置列表
      attrList: [],
      // 计费方式
      billName
    }
  },
  methods: {
    /**
     * @description: 修改展示对话框
     * @param {*} row
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      this.form.attrJson = ''
      this.title = '添加'

      // 修改
      // let serverGroupIds = []
      if (row.id) {
        this.title = '修改'
        // 业务分组字符串转数组
        // serverGroupIds = row.serverGroupIds.split(',')
        this.form = {
          ...row,
          serverGroupIds: row.serverGroupIds
        }

        // 解析价格对象 productJson
        const productObj = JSON.parse(row.productJson || '{}')
        Object.keys(productObj).forEach((key) => {
          this.$set(
            this.form,
            key + 'Price',
            key === 'v' ? productObj[key].value : productObj[key].value / 100
          )
          this.$set(this.form, key + 'Status', productObj[key].status)
        })

        // 计费方式、流量、带宽
        this.$set(this.form, 'flow', this.form.attr.flow || 10)
        this.$set(
          this.form,
          'bandwidth',
          (this.form.attr.bandwidth || 2000) / 100
        )
        // 设置流量单位
        let unit = 1
        if (this.form.flow >= 1000 && this.form.flow < 1000 * 1000) {
          unit = 1000
          this.form.flow = this.form.flow / 1000
        } else if (this.form.flow >= 1000 * 1000) {
          unit = 1000 * 1000
          this.form.flow = this.form.flow / 1000 / 1000
        }
        this.$set(
          this.form,
          'charging_mode',
          +this.form.attr.charging_mode || 1
        )
        this.$set(this.form, 'flow_unit', unit)
      }
      console.log(this.form)

      this.$nextTick(() => {
        this.getProductAttrData()
      })
    },

    /**
     * @description: 获取套餐参数列表
     */

    async getProductAttrData() {
      this.$refs.dialogRef.bodyLoading = true
      const { data: res } = await getProductAttrAll()
      this.$refs.dialogRef.bodyLoading = false
      if (res.code !== 1) return

      const arr = []
      // 过滤掉 计费方式、流量、带宽
      res.data.forEach((item) => {
        const key = item.attr
        if (key in productAttrObj) {
          console.log(
            this.form.attr[key],
            productAttrObj[key].value,
            this.form.attr[key] || productAttrObj[key].value
          )
          arr.push({
            attr: key,
            id: item.id,
            ...productAttrObj[key],
            value: this.form.attr[key] || productAttrObj[key].value
          })
        }
      })
      this.attrList = arr
    },

    /**
     * @description: 提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        if (!this.attrList.length) return this.$msg.error('请配置套餐参数')
        // 套餐流量不能小于 10GB
        if (
          this.form.charging_mode == 1 &&
          this.form.flow * this.form.flow_unit < 10
        ) {
          return this.$msg.error('套餐流量不能小于 10GB')
        }

        // 合并计费方式、流量带宽到套餐参数
        const arr = [
          // 计费方式
          {
            attr: 'charging_mode',
            name: 'charging_mode',
            value: this.form.charging_mode,
            valueType: 'select'
          },
          // 流量
          {
            attr: 'flow',
            name: 'flow',
            valueType: 'int',
            unit: 'G',
            value:
              this.form.flow * this.form.flow_unit > 2147483648
                ? 2147483648
                : this.form.flow * this.form.flow_unit
          },
          // 带宽
          {
            attr: 'bandwidth',
            name: 'bandwidth',
            valueType: 'price_int',
            unit: 'Mbps/月',
            // 以分为单位，
            value: this.form.bandwidth * 100
          }
        ]

        this.$refs.dialogRef.btnLoading = true

        const {
          mPrice,
          mStatus,
          sPrice,
          sStatus,
          yPrice,
          yStatus,
          vPrice,
          vStatus,
          serverGroupIds
        } = this.form

        const { data } = await doCreateUpdateProduct({
          ...this.form,
          // 将参数数组转为 JSON数组
          attrJson: JSON.stringify([...arr, ...this.attrList]),
          // 将价格转为 JSON
          productJson: JSON.stringify({
            m: {
              // 为带宽计费时，价格设为 0
              value: this.form.charging_mode == 1 ? mPrice * 100 || 0 : 0,
              status: mStatus
            },
            s: {
              value: sPrice * 100 || 0,
              status: sStatus
            },
            y: {
              value: yPrice * 100 || 0,
              status: yStatus
            },
            v: {
              value: vPrice,
              status: vStatus
            }
          }),
          // 业务分组数组转字符串
          serverGroupIds: serverGroupIds + ''
        })
        this.$refs.dialogRef.btnLoading = false

        if (data.code !== 1) return
        this.dialogVisible = false
        this.$parent.getTableData()
        this.$msg.success(this.title + '套餐成功')
      })
    },

    // 表单重置
    resetForm() {
      this.form = defaultForm
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
