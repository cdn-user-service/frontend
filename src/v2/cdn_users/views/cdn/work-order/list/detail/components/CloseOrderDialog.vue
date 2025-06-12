<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    title="确认结单"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
  >
    <div class="ants-tips_box mb-lg">
      {{antsT('确认结单后，您将无法对该工单进行问题补充或留言反馈')}}
    </div>
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="110px"
      status-icon
      hide-required-asterisk
      space-class="space-y-6"
    >
      <ants-form-item label="整体评价" prop="score">
        <el-rate v-model="form.score" show-text class="mt-sm"> </el-rate>
      </ants-form-item>
      <ants-form-item label="问题是否解决" prop="solved" inline-message>
        <ants-radio-group v-model="form.solved">
          <ants-radio :label="1" text="已解决"/>
          <ants-radio :label="0" text="未解决"/>
        </ants-radio-group>
      </ants-form-item>
      <ants-form-item label="我要反馈" prop="feedback">
        <ants-input
          v-model="form.feedback"
          :autosize="{ minRows: 5, maxRows: 10 }"
          type="textarea"
          placeholder="您的评价会让我们做得更好"
          maxlength="2000"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
import { changeWorkerOrderStatus } from '@/v2/cdn_users/api/cdn/work-order'

export default {
  data() {
    // 是否评分
    const isRate = (rule, value, callback) => {
      if (value !== 0) {
        return callback()
      }
      callback(new Error('请给我们评个分哇！'))
    }

    return {
      dialogVisible: false,
      form: {
        score: null,
        solved: 1,
        feedback: ''
      },
      formRules: {
        solved: [
          { required: true, message: '请选择问题结果', trigger: 'change' }
        ],
        score: [
          {
            validator: isRate,
            trigger: 'change'
          }
        ]
      }
    }
  },
  created() {},
  methods: {
    /**
     * @description: 结单提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { data: res } = await changeWorkerOrderStatus({
          id: this.$route.query.id,
          // 3 = 结单
          status: 3,
          // 评分
          score: this.form.score,
          // 是否已解决
          solved: this.form.solved,
          // 反馈
          feedback: this.form.feedback
        })
        
        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.$parent.getGoodsList()
        this.$msg.success(this.antsT('结单成功'))
        this.dialogVisible = false
      })
    },

    // 结单提交重置
    resetForm() {
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
