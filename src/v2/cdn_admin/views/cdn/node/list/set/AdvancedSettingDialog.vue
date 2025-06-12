<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="`节点高级设置【${clientData.clientIp}】`"
    top="5vh"
    width="700px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="top"
      space-class="space-y-5"
      class="-mt-lg"
      style="min-height: 400px"
    >
      <div v-for="(item, key) in baseObj" :key="key">
        <ants-form-item :label="key" :prop="key" :required="!item.required">
          <template slot="label">
            <span class="mr-sm">{{ key }}</span>
            <span class="text-sm text-ants-text-4 font-normal"
              >【{{ item.tips }}】</span
            >
          </template>

          <ants-input
            v-if="item.type === 'text'"
            v-model="form[key]"
            :placeholder="item.value"
            class="mr-sm"
          />

          <ants-input-number
            v-if="item.type === 'int'"
            v-model="form[key]"
            :placeholder="item.value + ''"
            :min="1"
            :precision="0"
            class="mr-sm"
          />

          <!-- 布尔型 -->
          <ants-switch
            v-if="item.type === 'bool'"
            v-model="form[key]"
            active-value="1"
            inactive-value="0"
            active-text="ON"
            inactive-text="OFF"
          />
        </ants-form-item>
      </div>
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
import { getNodeConfKeys, doSaveNodeConf } from '@/v2/cdn_admin/api/cdn/node'

export default {
  data() {
    return {
      dialogVisible: false,
      // 当前节点数据
      clientData: {
        id: null,
        clientIp: '',
        confInfo: ''
      },
      baseObj: {},
      form: {},
      formRules: {
        clientIp: [
          {
            required: true,
            message: '请输入节点IP',
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

    showDialog(row) {
      this.dialogVisible = true
      this.clientData = {
        ...row,
        confObj: (row.confInfo && JSON.parse(row.confInfo)) || {}
      }
      this.getNodeConfKeysData()
    },

    /**
     * @description: 查看哪些配置是可以修改的
     */

    async getNodeConfKeysData() {
      this.$refs.dialogRef.bodyLoading = true
      const { data: res } = await getNodeConfKeys()
      this.$refs.dialogRef.bodyLoading = false
      if (res.code !== 1) return

      const baseData = res.data || {}
      const obj = {}
      const defaultForm = {}
      Object.keys(baseData).forEach((key) => {
        const arr = baseData[key]
        obj[key] = {
          type: arr[1],
          tips: arr[3],
          value: arr[4] || ''
        }
        // 赋值
        if (key in this.clientData.confObj) {
          defaultForm[key] = this.clientData.confObj[key]
        } else {
          defaultForm[key] = arr[4] || ''
        }
      })

      this.baseObj = obj
      this.form = defaultForm
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { data } = await doSaveNodeConf({
          id: this.clientData.id,
          ...this.form
        })
        this.$refs.dialogRef.btnLoading = false

        if (data.code !== 1) return
        this.dialogVisible = false
        this.$parent.getTableData()
        this.$msg.success('设置成功')
      })
    },

    // 添加DNS表单重置
    resetForm() {
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
