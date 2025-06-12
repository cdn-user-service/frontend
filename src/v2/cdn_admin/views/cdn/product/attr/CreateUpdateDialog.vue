<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '参数'"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
    >
      <ants-form-item label="参数名" prop="attr">
        <ants-select
          v-model="form.attr"
          placeholder="请选择参数名"
          @change="changeSelectName"
          :disabled="form.id != 0"
        >
          <ants-option
            v-for="(item, key) in productAttrObj"
            :key="key"
            :label="item.name"
            :value="key"
          />
        </ants-select>
      </ants-form-item>

      <ants-form-item label="默认值" prop="value">
        <div v-if="form.valueType == 'bool'">
          <ants-radio-group v-model="form.value">
            <ants-radio label="1" text="支持" />
            <ants-radio label="0" text="不支持" />
          </ants-radio-group>
        </div>

        <div
          v-else-if="form.valueType == 'int' || form.valueType == 'price_int'"
        >
          <ants-input-number
            v-model="form.value"
            :step="1"
            :min="1"
            :precision="0"
            placeholder="默认值"
          />
          <span class="ml-xs">{{ form.unit }}</span>
        </div>

        <div v-else-if="form.valueType == 'text'">
          <ants-input v-model="form.value" placeholder="参数值描述" />
        </div>

        <div v-else-if="form.valueType == 'select'">
          <ants-radio-group v-model="form.value">
            <ants-radio-button
              v-for="(item, key) in selectObj"
              :key="key"
              :label="key"
              :text="item"
            />
          </ants-radio-group>
        </div>
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

      <!-- <ants-form-item label="启用状态">
        <ants-switch
          v-model="form.status"
          active-color="#13ce66"
          active-text="启用"
          inactive-text="禁用"
        />
      </ants-form-item> -->
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
import { doCreateUpdateProductAttr } from '@/v2/cdn_admin/api/cdn/product'

const defaultForm = {
  // 添加时 id为 0
  id: 0,
  // 参数 key
  attr: 'flow',
  // 参数名名称
  name: '流量',
  // 参数值类型 int = 数值。 bool = 布尔值, text = 文本
  valueType: 'int',
  // 默认值
  value: 10,
  // 单位，仅 int 值时有
  unit: 'G',
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
        attr: [
          {
            required: true,
            message: '请选择参数名',
            trigger: 'change'
          }
        ],
        value: [
          {
            required: true,
            message: '请输入默认值',
            trigger: ['change', 'blur']
          }
        ],
        unit: [
          {
            required: true,
            message: '请输入单位',
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

      // select 对象列表
      selectObj: {
        1: '流量月结',
        2: '平均日峰带宽',
        3: '月95带宽'
      }
    }
  },
  methods: {
    /**
     * @description: 展示对话框
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      // 修改
      if (row.id) {
        this.title = '修改'
        this.form = {
          ...this.form,
          ...row
        }

        if (this.form.valueType === 'select') {
        }
      } else {
        this.title = '添加'
        this.form = {
          ...defaultForm
        }
      }
    },

    /**
     * @description: 选择参数名，改变对应参数值单位
     */

    changeSelectName(key) {
      const { type, unit, value, remark } = this.productAttrObj[key]
      this.form.valueType = type
      this.form.unit = unit
      this.form.value = value

      if (type === 'select') {
        this.selectObj = JSON.parse(remark)
      }

      console.log(this.form)
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { data } = await doCreateUpdateProductAttr({
          ...this.form,
          name: this.form.attr
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
