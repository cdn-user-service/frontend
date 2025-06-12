<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '定时任务'"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="100px"
      :status-icon="false"
    >
      <ants-form-item label="选择任务" prop="beanName">
        <ants-select v-model="form.beanName" placeholder="请选择任务">
          <ants-option
            v-for="(item, key) in jobBeanObj"
            :key="key"
            :label="item"
            :value="key"
          />
        </ants-select>
      </ants-form-item>
      <ants-form-item label="任务参数" prop="params">
        <ants-input v-model="form.params" placeholder="请输入任务参数" />
      </ants-form-item>
      <ants-form-item label="cron表达式" prop="cronExpression">
        <ants-input
          v-model="form.cronExpression"
          placeholder="请输入cron表达式"
        >
          <el-select
            v-model="cronSelect"
            slot="prepend"
            placeholder="请选择"
            @change="changeCron"
            style="width:120px;"
          >
            <el-option label="每天一次" value="0 0 0 * * ?"></el-option>
            <el-option label="每小时一次" value="0 0 * * * ?"></el-option>
            <el-option label="每分钟一次" value="0 * * * * ?"></el-option>
            <el-option label="自定义" value="other"></el-option>
          </el-select>
        </ants-input>
      </ants-form-item>
      <ants-form-item label="备注信息" prop="remark">
        <ants-input v-model="form.remark" placeholder="请输入备注信息" />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
import { doCreateUpdateSchedule } from '@/v2/cdn_admin/api/system/schedule'

const defaultForm = {
  // 为 0 表示添加
  jobId: 0,
  beanName: '',
  params: '',
  cronExpression: '0 0 0 * * ?',
  remark: '',
  status: 1
}

export default {
  props: {
    jobBeanObj: Object
  },
  data() {
    return {
      title: '添加',
      dialogVisible: false,
      cronSelect: '0 0 0 * * ?',
      form: {
        ...defaultForm
      },
      formRules: {
        beanName: [
          {
            required: true,
            message: '请选择任务',
            trigger: 'change'
          }
        ],
        params: [
          {
            required: true,
            message: '请输入任务参数',
            trigger: ['change', 'blur']
          }
        ],
        cronExpression: [
          {
            required: true,
            message: '请输入cron表达式',
            trigger: ['change', 'blur']
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

    showDialog(row = {}) {
      this.dialogVisible = true

      this.title = '添加'
      if (row.jobId) {
        this.title = '修改'
        this.form = {
          ...this.form,
          ...row
        }

        if (
          ['0 0 0 * * ?', '0 0 * * * ?', '0 * * * * ?'].includes(
            row.cronExpression
          )
        ) {
          this.cronSelect = row.cronExpression
        } else {
          this.cronSelect = 'other'
        }
      }
    },

    changeCron(val) {
      if (val === 'other') {
        this.form.cronExpression = ''
      } else {
        this.form.cronExpression = val
      }
    },

    /**
     * @description: 表单提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        const { data: res } = await doCreateUpdateSchedule(
          {
            ...this.form,
            methodName: this.form.beanName
          },
          this.form.jobId ? 'update' : 'create'
        )

        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.$parent.getTableData()
        this.dialogVisible = false
        this.$msg.success(this.antsT(this.title + '成功'))
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
