<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="(form.id ? '修改' : '添加') + '分组'"
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
      <ants-form-item label="分组名称" prop="name">
        <ants-input v-model="form.name" placeholder="请输入分组名称" />
      </ants-form-item>
      <!-- <ants-form-item label="分组编号" prop="fzbh">
        <el-radio-group v-model="form.fzbh" size="mini">
          <el-radio-button v-for="item in 6" :key="item" :label="item - 1">{{
            item - 1
          }}</el-radio-button>
        </el-radio-group>
      </ants-form-item> -->
      <ants-form-item label="备注信息" prop="remark">
        <ants-input
          v-model="form.remark"
          placeholder="请输入备注信息"
          :autosize="{ minRows: 4, maxRows: 8 }"
          type="textarea"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
import {
  doCreateUpdateNodeGroup
} from '@/v2/cdn_admin/api/cdn/node'

const defaultForm = {
  id: null,
  // 分组编号
//   fzbh: 0,
  // 节点数量
//   num: 0,
  // 分组名称
  name: '',
  // 备注信息
  remark: ''
  // 排序
//   sort: 999
}

export default {
  data() {
    return {
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      formRules: {
        name: [
          {
            required: true,
            message: '请输入分组名称',
            trigger: ['change', 'blur']
          }
        ],
        fzbh: [
          {
            required: true,
            message: '请选择分组编号',
            trigger: 'change'
          }
        ],
        remark: [
          {
            required: true,
            message: '请输入备注信息',
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

    show(row = {}) {
      this.dialogVisible = true
      this.form = {
        ...defaultForm,
        ...row
      }
    },

    /**
     * @description: 表单提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return

        this.$refs.dialogRef.btnLoading = true

        doCreateUpdateNodeGroup(this.form)
          .then(res => {
            if (res.data.code !== 1) return

            this.$parent.getTableData()
            this.dialogVisible = false
            this.$msg.success('保存成功')
          })
          .catch(err => err)
          .finally(() => {
            this.$refs.dialogRef.btnLoading = false
          })
      })
    },

    // 添加表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
