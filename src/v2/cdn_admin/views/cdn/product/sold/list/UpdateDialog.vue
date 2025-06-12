<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="`修改已售套餐【${(planObj.product || {}).name}】`"
    width="800px"
    top="5vh"
    @close="resetForm"
    @submit="submitForm"
  >
    <el-row :gutter="10">
      <el-col :span="8">
        <ul
          class="space-y-8"
          style="width:150px;"
          v-if="planObj.attr.charging_mode == 1"
        >
          <li class="font-bold">
            <TitleBorder title="套餐价格" />
          </li>
          <li>
            <div class="mb-sm flex justify-between items-center">
              <span>月费：</span>
              <ants-checkbox
                v-model="form.m.status"
                :true-label="1"
                :false-label="0"
                text="启用"
              />
            </div>
            <div>
              <ants-input-number
                v-model="form.m.value"
                style="width:150px;"
                :step="100"
                :min="0.01"
                size="mini"
                :precision="2"
                placeholder="月费"
              />
            </div>
          </li>
          <li>
            <div class="mb-sm flex justify-between items-center">
              <span>季费：</span>
              <ants-checkbox
                v-model="form.s.status"
                :true-label="1"
                :false-label="0"
                text="启用"
              />
            </div>
            <div>
              <ants-input-number
                v-model="form.s.value"
                style="width:150px;"
                :step="100"
                :min="0.01"
                :precision="2"
                size="mini"
                placeholder="季费"
              />
            </div>
          </li>
          <li>
            <div class="mb-sm flex justify-between items-center">
              <span>年费：</span>
              <ants-checkbox
                v-model="form.y.status"
                :true-label="1"
                :false-label="0"
                text="启用"
              />
            </div>
            <div>
              <ants-input-number
                v-model="form.y.value"
                style="width:150px;"
                :step="100"
                :min="0.01"
                :precision="2"
                size="mini"
                placeholder="年费"
              />
            </div>
          </li>
        </ul>

        <ul class="space-y-8" v-else style="width:150px;">
          <li class="font-bold">
            <TitleBorder title="套餐价格" />
          </li>
          <li>
            <div class="mb-sm flex justify-between items-center">
              <span>带宽单价：</span>
              <span class="text-sm">Mbps/月</span>
            </div>
            <div>
              <ants-input-number
                v-model="bandwidth"
                style="width:150px;"
                :step="100"
                :min="0.01"
                size="mini"
                :precision="2"
                placeholder="单价"
              />
            </div>
          </li>
        </ul>

        <TitleBorder title="到期时间" class="mt-xl" />
        <div class="mt-lg">
          <el-date-picker
            v-model="endTime"
            style="width:190px;"
            type="date"
            placeholder="请选择到期时间"
            size="small"
            value-format="yyyy-MM-dd"
          />
        </div>
      </el-col>
      <el-col :span="16">
        <el-table
          :data="attrArr"
          size="mini"
          border
          style="margin:0;"
          ref="tableRef"
        >
          <ants-table-column
            prop="name"
            label="参数名称"
            min-width="120"
            align="right"
          >
            <template #default="{ row }">
              <span class="mr-xs">{{ antsT(row.name) }}</span>
              <el-tag size="mini" type="success" v-if="row.isSet">{{
                antsT('有')
              }}</el-tag>
              <el-tag size="mini" type="danger" v-else>{{
                antsT('无')
              }}</el-tag>
            </template>
          </ants-table-column>
          <ants-table-column prop="value" label="参数值" min-width="200">
            <template #default="{ row }">
              <!-- 布尔值 -->
              <ants-radio-group
                size="mini"
                v-if="row.valueType === 'bool'"
                v-model="row.value"
              >
                <ants-radio label="1" text="支持" />
                <ants-radio label="0" text="不支持" />
              </ants-radio-group>

              <!-- 数值 -->
              <div
                v-else-if="
                  row.valueType == 'int' || row.valueType == 'price_int'
                "
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
                  v-if="row.key === 'flow'"
                  v-model="row.unit"
                  style="width:70px;"
                  size="mini"
                  placehilder="单位"
                >
                  <ants-option label="GB" :value="1" />
                  <ants-option label="TB" :value="1000" />
                  <ants-option label="PB" :value="1000000" />
                </ants-select>
                <span v-else class="">{{ row.unit }}</span>
              </div>

              <!-- text文本类型 -->
              <ants-input
                v-else-if="row.valueType == 'text'"
                size="mini"
                placeholder="请输入描述"
                v-model="row.value"
              />
            </template>
          </ants-table-column> </el-table
      ></el-col>
    </el-row>
  </ants-dialog>
</template>

<script>
// api
import { doUpdateSoldPlanAttr } from '@/v2/cdn_admin/api/cdn/product'

import { productAttrObj } from '@/global/enum'

export default {
  components: {},
  props: {},
  data() {
    return {
      dialogVisible: false,
      // 当前套餐数据
      planObj: {
        // 套餐名称
        suitName: '',
        serialNumber: '',
        // 当前套餐配置
        attr: {},
        // 原始套餐配置
        product: {
          name: ''
        }
      },
      // 套餐价格
      form: {
        m: {
          value: 1,
          status: 0
        },
        s: {
          value: 1,
          status: 0
        },
        y: {
          value: 1,
          status: 0
        }
      },
      // 后计费套餐单价
      bandwidth: 0,
      // 到期时间
      endTime: '',
      // 套餐属性列表
      attrArr: []
    }
  },
  methods: {
    /**
     * @description: 展示对话框
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      const { attr } = row
      this.planObj = {
        ...this.planObj,
        ...row
      }
      this.endTime = this.$dayjs(row.endTime).format('YYYY-MM-DD')
      console.log(row)

      // 设置当前套餐属性所绑定的值
      const arr = []
      Object.keys(productAttrObj).forEach(key => {
        const item = productAttrObj[key]
        const obj = {
          key,
          ...item
        }
        // 数值
        if (item.valueType === 'int' || item.valueType === 'price_int') {
          obj.value = attr[key] > 0 ? attr[key] : 0
          obj.isSet = attr[key] > 0
        }
        // 布尔值
        if (item.valueType === 'bool') {
          obj.value = attr[key] == '1' ? '1' : '0'
          obj.isSet = attr[key] == '1'
        }
        // 文本
        if (item.valueType === 'text') {
          obj.value = attr[key] || null
          obj.isSet = !!attr[key]
        }

        arr.push(obj)
      })

      console.log(arr)
      // 排序
      this.attrArr = arr.sort((x, y) => {
        if (y.isSet > x.isSet) return 1
        if (y.isSet < x.isSet) return -1

        if (y.isSet == x.isSet) {
          if (x.valueType < y.valueType) return -1
          if (x.valueType > y.valueType) return 1
          return 0
        }
      })

      // 修改流量
      if (attr.charging_mode == 1) {
        const productEntityAttrJson = (row.productEntity || {}).attrJson
        let productEntityAttr = []
        if (productEntityAttrJson) {
          productEntityAttr = JSON.parse(productEntityAttrJson)
        }
        let flowVal = 0
        if (productEntityAttr.length) {
          productEntityAttr.some(item => {
            if (item.attr === 'flow') {
              flowVal = item.value
              return true
            }
          })
        }

        let flowUnit = 1
        if (flowVal >= 1000 && flowVal < 1000 * 1000) {
          flowVal /= 1000
          flowUnit = 1000
        } else if (flowVal >= 1000 * 1000) {
          flowVal /= 1000000
          flowUnit = 1000000
        }
        this.attrArr.unshift({
          isSet: true,
          name: '流量',
          key: 'flow',
          value: flowVal,
          unit: flowUnit,
          valueType: 'int'
        })

        const productJson = (row.product || {}).productJson || {}
        Object.keys(productJson).forEach(key => {
          const priceObj = productJson[key] || {}
          this.form[key] = {
            status: priceObj.status,
            value: priceObj.value / 100
          }
        })
      } else {
        this.bandwidth = attr.bandwidth / 100
      }
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      if (!this.endTime) return this.$msg.error('请选择到期时间')
      this.$refs.dialogRef.btnLoading = true

      // 构造JSON 数据
      const obj = {}
      this.attrArr.forEach(item => {
        // 如果设置了值
        // if (item.value > 0) {
        // }

        // 如果为流量
        if (item.key === 'flow') {
          obj[item.key] = item.value * item.unit
          obj[item.key] = obj[item.key] > 2147483648 ? 2147483648 : obj[item.key]
        } else {
          const nullVal = item.valueType === 'bool' ? '0' : null
          obj[item.key] = item.value || nullVal
        }
      })

      // 套餐价格
      const productJson = {}
      if (this.planObj.attr.charging_mode == 1) {
        Object.keys(this.form).forEach(key => {
          productJson[key] = {
            status: this.form[key].status,
            value: this.form[key].value * 100
          }
        })
      } else {
        obj.bandwidth = this.bandwidth * 100
      }

      console.log(obj)
      const { data: res } = await doUpdateSoldPlanAttr({
        serialNumber: this.planObj.serialNumber,
        id: this.planObj.id,
        attrJson: JSON.stringify(obj),
        endTime: this.$dayjs(this.endTime).format('YYYY-MM-DD HH:mm:ss'),
        productJson:
          this.planObj.attr.charging_mode == 1
            ? JSON.stringify(productJson)
            : null
      })
      this.$refs.dialogRef.btnLoading = false
      if (res.code !== 1) return
      this.dialogVisible = false
      this.$emit('refresh')
      this.$msg.success('修改成功')
    },

    // 表单重置
    resetForm() {}
  }
}
</script>

<style lang="scss"></style>
