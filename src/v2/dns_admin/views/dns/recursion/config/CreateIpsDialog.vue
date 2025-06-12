<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + 'IP段'"
    width="600px"
    @closed="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="80px"
    >
      <ants-form-item prop="type">
        <el-radio-group v-model="form.type" size="mini" @change="changeType">
          <ants-radio-button :label="1" text="指定IP段" />
          <ants-radio-button :label="2" text="全部IP段" />
        </el-radio-group>
      </ants-form-item>
      <ants-form-item label="起始IP" prop="sourceIpS">
        <ants-input
          v-model="form.sourceIpS"
          placeholder="请输入起始IP"
          :disabled="form.type == 2"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="截止IP" prop="sourceIpE">
        <ants-input
          v-model="form.sourceIpE"
          placeholder="请输入截止IP"
          :disabled="form.type == 2"
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
  type: 1,
  mode: 2,
  recursive_ipset_add: '',
  remark: '',
  sourceIpS: '',
  sourceIpE: ''
}
export default {
  props: {
    serverId: [Number, String]
  },
  data() {
    // 验证规则
    const { isName } = this.$validator

    // 验证规则多个 IP段，一行一个IP段
    const checkIpsArr = (rule, value, callback) => {
      const checkIps = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)[-]((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/
      const ipsArr = value.trim().split(/[\r\n]+/) // 以空格或换行分割输入框的值
      let isOk = false

      let ipStart = 4294967295 // 总的起止IP,初始值为最大
      let ipEnd = 0 // 总的截止IP，初始值为最小

      // 1、验证IP格式
      // 2、比较起始IP大小
      // 3、比较重复
      ipsArr.every((item, idx) => {
        // 1、验证IP格式
        isOk = checkIps.test(item.trim())
        if (!isOk) {
          callback(new Error('IP段格式错误：' + item))
          return false // 终止循环
        }

        // 2、比较起始IP大小
        if (item && this.compareIp(item)) {
          isOk = false
          callback(new Error('起始IP不能大于截止IP：' + item))
          return false // 终止循环
        }

        /* 3、比较重复
         * 3.1 首先判断是否重复
         *      A: 如果起始ip或截止ip 在已有区间内，则表示重复。
         *      B: 起始ip和截止ip都不在已有区间内，但包含已有区间，也表示重复
         * 3.2 如果没有重复则追加到已有区间，方便下一次计算
         */
        // 计算已有区间
        const itemIpStart = this.ipGetInt(item.trim().split('-')[0])
        const itemIpEnd = this.ipGetInt(item.trim().split('-')[1])

        // 判断是否重复
        if (!(itemIpStart > ipEnd || itemIpEnd < ipStart)) {
          // 如果重复
          isOk = false
          callback(new Error('IP区间重复：' + item))
          return false // 终止循环
        }

        // 如果没有重复，追加到已有区间
        if (itemIpStart < ipStart) {
          ipStart = itemIpStart
        }
        if (itemIpEnd > ipEnd) {
          ipEnd = itemIpEnd
        }

        // 最后返回 isOK, 为false时终止循环
        return isOk
      })

      if (isOk) {
        callback()
      }
    }

    return {
      title: '添加',
      dialogVisible: false,
      form: {
        ...defaultForm
      },

      formRules: {
        // 添加用户对话框的规则
        recursive_ipset_add: [
          {
            required: true,
            message: '请输入IP段，一行一个IP段',
            trigger: ['change', 'blur']
          },
          {
            validator: checkIpsArr,
            trigger: 'blur'
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
        type: [
          {
            required: true,
            message: '请选择',
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

    changeType(val) {
      if (val == 2) {
        this.form.sourceIpS = '0.0.0.0'
        this.form.sourceIpE = '255.255.255.255'
        this.form.remark = '所有IP段'
        this.form.recursive_ipset_add = '0.0.0.0-255.255.255.255'
      }
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

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const ipsetStr = this.form.recursive_ipset_add
          .trim()
          .replace(/[\r\n]+/g, ',')
        const ipsetArr = ipsetStr.split(',')

        const ipNumArr = ipsetArr.map(item => {
          const ipArr = item.split('-')
          return `${this.ipGetInt(ipArr[0])},${this.ipGetInt(ipArr[1])},0`
        })

        const { sourceIpS, sourceIpE, remark, id } = this.form
        const { data: res } = await saveDnsRecursive({
          mode: 2,
          sourceIpS: this.ipGetInt(sourceIpS),
          sourceIpE: this.ipGetInt(sourceIpE),
          remark,
          id
        })

        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
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
