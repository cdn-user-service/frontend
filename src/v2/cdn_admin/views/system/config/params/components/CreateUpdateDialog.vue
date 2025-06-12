<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '配置'"
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
      <ants-form-item label="选择参数" prop="paramKey">
        <ants-select
          v-model="form.paramKey"
          placeholder="请选择选择参数"
          :disabled="form.id != 0"
        >
          <ants-option
            v-for="item in paramsKeyList"
            :key="item"
            :label="item"
            :value="item"
          />
        </ants-select>
      </ants-form-item>
      <ants-form-item label="配置名称" prop="remark">
        <ants-input
          v-model="form.remark"
          placeholder="请输入配置名称"
          maxlength="50"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="参数值" prop="paramValue" v-if="!form.id">
        <ants-input
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 10 }"
          v-model="form.paramValue"
          placeholder="请输入参数值"
        ></ants-input>
      </ants-form-item>

      <ants-form-item label="排序" prop="weight">
        <ants-input-number
          size="small"
          v-model="form.weight"
          :precision="0"
          :step="1"
          :min="1"
          placeholder="排序"
        >
        </ants-input-number>
        <span class="ml-sm text-ants-text-4">（越大越靠前）</span>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
import {
  doCreateConfig,
  doUpdateConfig
} from '@/v2/cdn_admin/api/system/config'

const defaultForm = {
  // 为 0 表示添加
  id: 0,
  paramKey: '',
  paramValue: '',
  remark: '',
  // 权重，越大越靠前
  weight: 1
}

export default {
  props: {
    // 参数列表
    paramsKeyList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      title: '添加',
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      formRules: {
        paramKey: [
          {
            required: true,
            message: '请选择参数',
            trigger: 'change'
          }
        ],
        remark: [
          {
            required: true,
            message: '请输入配置名称',
            trigger: ['change', 'blur']
          }
        ],
        paramValue: [
          {
            required: true,
            message: '请输入参数值',
            trigger: ['change', 'blur']
          }
        ],
        weight: [
          {
            required: true,
            message: '请输入排序',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 展示对话框
     * @param {*} row
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      this.title = '添加'
      if (row.id) {
        this.title = '修改'
        this.form = {
          ...this.form,
          ...row,
          paramValue: JSON.parse(row.paramValue)
        }
      }
    },

    /**
     * @description: 提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        const { data: res } = await (this.form.id
          ? doUpdateConfig({
              ...this.form,
              paramValue: JSON.stringify(this.form.paramValue)
            })
          : doCreateConfig({
              ...this.form
              // paramValue
            }))

        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.$parent.getTableData()
        this.dialogVisible = false
        this.$msg.success(this.title + '配置成功')
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
