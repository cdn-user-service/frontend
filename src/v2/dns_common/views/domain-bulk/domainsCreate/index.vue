<template>
  <el-card class="content-box animated fadeIn batch_card">
    <div slot="header">
      <TitleBorder title="添加域名" />
    </div>

    <ants-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      label-width="0"
      label-position="top"
      :status-icon="false"
      space-class="space-y-4"
    >
      <ants-form-item label="选择用户" prop="userId" v-if="isAdmin">
        <UsersPopover
          v-model="form.userId"
          ref="UsersPopoverRef"
          @change="changeUser"
          width="450px"
        />
        <!-- <QueryUserSelect ref="QueryUserSelectRef" style="width:450px;" /> -->
      </ants-form-item>

      <ants-form-item label="选择套餐" prop="consumeId">
        <QueryPlanSelect
          :username="form.username"
          v-model="form.consumeId"
          ref="QueryPlanSelectRef"
          style="max-width:450px;"
        />
      </ants-form-item>

      <ants-form-item label="一级域名" prop="domains">
        <ants-input
          type="textarea"
          rows="10"
          style="width:450px;"
          placeholder="输入一级域名，每行一个，最多可输入1000个域名。例如：
domain1.com
domain2.com"
          v-model="form.domains"
        />
      </ants-form-item>

      <ants-form-item>
        <el-checkbox v-model="form.checked">{{
          antsT('同时为新域名添加 @ 和 www 的 A 记录')
        }}</el-checkbox>
      </ants-form-item>
      <ants-form-item
        v-if="form.checked"
        label="记录值"
        prop="recordValue"
        style="margin:0;"
      >
        <ants-input
          style="width:450px;"
          placeholder="请输入记录值"
          v-model="form.recordValue"
        />
      </ants-form-item>

      <ants-form-item label="备注信息">
        <ants-input
          style="width:450px;"
          placeholder="请输入备注信息"
          v-model="form.remarks"
          maxlength="500"
        />
      </ants-form-item>

      <ants-form-item>
        <ants-button
          type="primary"
          size="small"
          :loading="btnLoading"
          @click="submitAddDomain"
          icon="el-icon-check"
          text="批量添加"
        />
        <ants-button
          type="info"
          size="small"
          @click="resetForm"
          icon="el-icon-refresh-left"
          text="重 置"
        />
      </ants-form-item>
    </ants-form>
  </el-card>
</template>

<script>
// import QueryUserSelect from '@/v2/dns_admin/components/QueryUserSelect'
import UsersPopover from '@/v2/dns_admin/components/UsersPopover'
import QueryPlanSelect from '@/v2/dns_users/components/QueryPlanSelect'
import QueryPlanSelectAdmin from '@/v2/dns_admin/components/QueryPlanSelect'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { batchCreateDomains } = require(`@/v2/${PROCESS_NAME}/api/dns/bulk`)

const defaultForm = {
  username: '',
  userId: '',
  consumeId: 0,
  domains: '',
  remarks: '',
  recordValue: '',
  checked: false
}

export default {
  components: {
    UsersPopover,
    QueryPlanSelect:
      PROCESS_NAME === 'dns_admin' ? QueryPlanSelectAdmin : QueryPlanSelect
  },
  data() {
    // 批量添加域名
    const checkDomains = (rule, value, callback) => {
      // 将数据拆分成一行一个
      const newValue = value.trim().split(/[(\r\n)\r\n]+/)
      const checkDomain = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(?<!www)(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
      const nowArr = [] // 临时数组
      let isOk = false
      newValue.every((e, i) => {
        isOk = checkDomain.test(e.trim())
        if (!isOk) {
          callback(new Error('域名格式不正确：' + e))
          return isOk
        }

        // 判断域名是否重复
        // 如果当前域名在数组中第一次出现的位置不是 i， 则认为该域名重复
        nowArr[i] = e.trim() // 将数据存入临时数组
        if (nowArr.indexOf(e.trim()) != i) {
          isOk = false
          callback(new Error('域名不能重复：' + e))
        }
        return isOk
      })

      if (isOk) {
        callback()
      }
    }

    const { isIpv4 } = this.$validator

    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      btnLoading: false,
      form: {
        ...defaultForm
      },
      formRules: {
        userId: [
          {
            required: true,
            message: '请选择用户',
            trigger: 'change'
          }
        ],
        consumeId: [
          {
            required: true,
            message: '请选择套餐',
            trigger: 'change'
          }
        ],
        domains: [
          {
            required: true,
            message: '请输入一级域名，每行一个',
            trigger: ['change', 'blur']
          },
          {
            validator: checkDomains,
            trigger: 'blur'
          }
        ],
        recordValue: [
          {
            required: true,
            message: '请输入记录值',
            trigger: ['change', 'blur']
          },
          {
            validator: isIpv4(),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    const date = new Date()
    const YY = date.getFullYear()
    const MM = date.getMonth()
    const DD = date.getDate()
    console.log(YY, MM, DD)
  },
  methods: {
    /**
     * @description: 批量添加域名提交
     */

    submitAddDomain() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        try {
          const domainsStr = this.form.domains.trim().replace(/[\r\n]+/g, ',')
          const { data: res } = await batchCreateDomains({
            ...this.form,
            consumeId: this.form.consumeId ? this.form.consumeId : undefined,
            domains: domainsStr
          })

          if (res.code !== 1) return
          this.$alert(
            '已成功添加 ' +
              domainsStr.split(',').length +
              ' 个域名，数据同步可能需要一些时间，请耐心等候！',
            '批量添加域名成功',
            {
              center: true,
              type: 'success',
              callback: action => {
                this.resetForm()
              }
            }
          ).catch(err => err)
        } finally {
          this.btnLoading = false
        }
      })
    },

    // 选择用户
    changeUser(obj = {}) {
      console.log(obj)
      this.form.username = obj.username
      // 清除校验
      this.$refs.formRef.clearValidate('userId')
    },

    /**
     * @description: 重置
     */
    // 表单重置
    resetForm() {
      this.btnLoading = false
      this.form = {
        ...defaultForm
      }
      if (this.$refs.UsersPopoverRef) {
        this.$refs.UsersPopoverRef.reset()
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
