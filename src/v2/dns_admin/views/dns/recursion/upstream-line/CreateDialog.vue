<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '转发线路'"
    width="600px"
    @closed="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="100px"
    >
      <!-- 修改 -->
      <template v-if="form.id">
        <ants-form-item label="起始IP" prop="sourceIpS">
          <ants-input
            v-model="form.sourceIpS"
            placeholder="请输入起始IP"
          ></ants-input>
        </ants-form-item>
        <ants-form-item label="截止IP" prop="sourceIpE">
          <ants-input
            v-model="form.sourceIpE"
            placeholder="请输入截止IP"
          ></ants-input>
        </ants-form-item>
      </template>

      <!-- 多个添加 -->
      <ants-form-item label="IP段" prop="sourceIpSES" v-else>
        <ants-input
          v-model="form.sourceIpSES"
          placeholder="请输入IP段，一行一个，不能有空格。
例如：1.1.1.1-2.2.2.2"
          type="textarea"
          :autosize="{ minRows: 6, maxRows: 12 }"
        ></ants-input>
      </ants-form-item>

      <ants-form-item label="DNS服务器" prop="targetValue">
        <ants-input
          v-model="form.targetValue"
          placeholder="请输入上层DNS服务器IP，多个之间用“ , ”隔开。不能超过3个"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="线路名称" prop="lineName">
        <ants-input
          v-model="form.lineName"
          placeholder="请输入线路名称"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="备注信息" prop="remark">
        <ants-input
          v-model="form.remark"
          placeholder="请输入备注信息"
        ></ants-input>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
import { saveDnsRecursive } from '@/v2/dns_admin/api/dns/recursion'

const defaultForm = {
  // 添加对话框的表单数据
  id: null,
  sourceIpSES: '',
  sourceIpS: '',
  sourceIpE: '',
  lineName: '',
  remark: '',
  targetValue: ''
}
export default {
  props: {},
  data() {
    // 验证规则
    const { isName } = this.$validator

    return {
      title: '添加',
      dialogVisible: false,
      form: {
        ...defaultForm
      },

      formRules: {
        lineName: [
          {
            required: true,
            message: '请输入线路',
            trigger: ['change', 'blur']
          }
          //   {
          //     validator: isName(),
          //     trigger: 'blur'
          //   }
        ],
        targetValue: [
          {
            required: true,
            message: '请输入上层DNS服务器IP',
            trigger: ['change', 'blur']
          }
        ],
        sourceIpSES: [
          {
            required: true,
            message: '请输入IP段，一行一个',
            trigger: ['change', 'blur']
          }
        ],
        sourceIpS: [
          {
            required: true,
            message: '请输入起始IP',
            trigger: ['change', 'blur']
          }
        ],
        sourceIpE: [
          {
            required: true,
            message: '请输入截止IP',
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
     * @description: 修改展示对话框
     * @param {*} row
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      this.title = '添加'
      if (row.id) {
        this.title = '修改'
        this.form = {
          ...defaultForm,
          ...row
        }
      }
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { id, sourceIpSES, sourceIpS, sourceIpE } = this.form

        let ipNumArr = []
        let sourceIpSNum = null
        let sourceIpENum = null
        // 修改
        if (id) {
          sourceIpSNum = this.ipGetInt(sourceIpS)
          sourceIpENum = this.ipGetInt(sourceIpE)
          ipNumArr = [`${sourceIpSNum}-${sourceIpENum}`]
        } else {
          const ipsetStr = sourceIpSES.trim().replace(/[\r\n]+/g, ',')
          const ipsetArr = ipsetStr.split(',')

          ipNumArr = ipsetArr.map(item => {
            const ipArr = item.split('-')
            return `${this.ipGetInt(ipArr[0])}-${this.ipGetInt(ipArr[1])}`
          })
        }

        const { data: res } = await saveDnsRecursive({
          mode: 3,
          ...this.form,
          sourceIpSES: ipNumArr + '',
          sourceIpS: sourceIpSNum,
          sourceIpE: sourceIpENum
        })

        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.dialogVisible = false
        this.$parent.getTableData()
        this.$msg.success(this.title + '成功')
      })
    },

    // 比较 IP段 大小
    compareIp(ip) {
      const ipArr = ip.split('-')
      if (this.ipGetInt(ipArr[0]) > this.ipGetInt(ipArr[1])) {
        return true
      } else {
        return false
      }
    },

    // ip 转整数
    ipGetInt(ip) {
      let num = 0
      if (!ip) {
        return num
      }
      ip = ip.trim().split('.')
      num =
        Number(ip[0]) * 256 * 256 * 256 +
        Number(ip[1]) * 256 * 256 +
        Number(ip[2]) * 256 +
        Number(ip[3])
      num = num >>> 0 // 这个很关键，不然可能会出现负数的情况
      return num
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
