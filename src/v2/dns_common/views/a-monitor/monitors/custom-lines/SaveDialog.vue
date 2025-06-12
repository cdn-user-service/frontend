<template>
  <ants-dialog
    :title="`添加${groupName}`"
    v-model="dialogVisible"
    width="500px"
    ref="dialogRef"
    @closed="closed"
    @submit="submit"
  >
    <ants-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="80px"
      label-position="top"
    >
      <ants-form-item
        :label="`输入${groupName}，一行一个，不能重复`"
        prop="ips"
      >
        <ants-input
          v-model="form.ips"
          placeholder="一行一个，不能重复。例如：
  10.12.14.16
  28.30.32.34"
          type="textarea"
          :autosize="{ minRows: 6, maxRows: 12 }"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// 验证规则
import { isIp, isDomain } from '@/utils/validate'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
// const { doSaveIps } = require(`@/v2/${PROCESS_NAME}/api/dns/gtm`)

const defaultForm = {
  // 分组ID，追加的时候需要
  pollId: 0,
  // 任务ID，必须
  taskId: 0,
  // 类型，必须
  taskType: 0,
  id: 0,
  ips: ''
}

export default {
  props: {
    groupName: {
      type: String,
      default: 'IP'
    }
  },
  components: {},
  data() {
    return {
      dialogVisible: false,
      loading: false,
      btnLoading: false,

      form: {
        ...defaultForm
      }
    }
  },
  computed: {
    rules() {
      const validMethod = this.groupName == 'IP' ? isIp : isDomain
      return {
        ips: [
          {
            required: true,
            message: `请输入${this.groupName}，一行一个`,
            trigger: ['change', 'blur']
          },
          {
            validator: (rule, value, callback) => {
              if (value === undefined || value === '') return callback()
              // 将数据拆分成一行一个
              const newArr = (value || '').trim().split(/[\r\n]+/)
              // 是否正确的格式
              let isOk = false
              // 临时数组，用于判读是否重复
              const nowArr = []

              // 遍历数组
              newArr.every((e, i) => {
                isOk = validMethod(e.trim())
                if (!isOk) {
                  callback(new Error(`${this.groupName}格式错误：${e}`))
                  return false
                }

                // 判断是否重复
                nowArr[i] = e.trim() // 将数据存入临时数组
                if (nowArr.indexOf(e.trim()) != i) {
                  isOk = false
                  callback(new Error(`${this.groupName}不能重复：${e}`))
                }
                return isOk
              })

              if (isOk) callback()
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 对话框显示
    show(row = {}) {
      this.dialogVisible = true
      this.form = {
        ...defaultForm,
        ...row,
        children: null,
        ips: ''
      }
    },

    // 保存
    submit() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        if (this.btnLoading) return
        this.$refs.dialogRef.btnLoading = true
        try {
          // const { data: res } = await doSaveIps({
          //   // ...this.form,
          //   id: 0,
          //   pollId: this.form.pollId,
          //   taskId: this.form.taskId,
          //   taskType: this.form.taskType,
          //   ips: [this.form.ips.trim().replace(/[\r\n]+/g, ',')]
          // })
          // if (res.code !== 1) return
          this.$msg.success('添加成功')
          this.$emit('refresh')
          this.dialogVisible = false
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 表单重置
    closed() {
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
