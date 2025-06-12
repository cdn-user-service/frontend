<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    title="添加域名"
    width="550px"
    @close="resetForm"
    @submit="submitForm"
  >
    <div class="text-center mb-xl">
      <strong>{{ antsT('支持模糊搜索用户名、手机号、邮箱地址') }}</strong>
    </div>
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
      label-position="top"
    >
      <ants-form-item prop="userId">
        <QueryUserSelect is-bgc v-model="form.userId" />
      </ants-form-item>
      <ants-form-item prop="serialNumber">
        <QueryPlanSelect
          is-bgc
          :user-id="form.userId"
          v-model="form.serialNumber"
        />
      </ants-form-item>

      <ants-form-item prop="mainServerName">
        <ants-input
          is-bgc
          v-model="form.mainServerName"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 15 }"
          prefix-icon="aicon icon-wangluo"
          placeholder="请输入域名，一行一个"
        />
        <!-- @keydown.enter.native="submitForm()" -->
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
import { doCreateSite, doBatchCreateSite } from '@/v2/cdn_admin/api/cdn/site'
import { getSuitListByUserId } from '@/v2/cdn_admin/api/cdn/product'

import QueryUserSelect from '@/v2/cdn_admin/components/QueryUserSelect'
import QueryPlanSelect from '@/v2/cdn_admin/components/QueryPlanSelect'

// 验证规则
import { isDomain } from '@/utils/validate'

export default {
  components: {
    QueryUserSelect,
    QueryPlanSelect
  },
  data() {
    // 验证规则
    const { isDomain: isDomainValid } = this.$validator

    // 验证一行一个域名格式，不能重复
    const checkDomains = (rule, value, callback) => {
      // 将数据拆分成一行一个
      const newArr = value.trim().split(/[\r\n]+/)
      // 是否正确的格式
      let isOk = false
      // 临时数组，用于判读域名是否重复
      const nowArr = []

      // 遍历域名数组
      newArr.every((item, idx) => {
        const itemTrim = item.trim()
        isOk = isDomain(itemTrim)
        if (!isOk) {
          callback(new Error('域名格式不正确：' + itemTrim))
          return isOk
        }

        // 判断域名是否重复，如果当前域名在数组中第一次出现的位置不是 i，则认为该域名重复
        nowArr[idx] = itemTrim // 将数据存入临时数组
        if (nowArr.indexOf(itemTrim) != idx) {
          isOk = false
          callback(new Error('域名不能重复：' + itemTrim))
        }
        return isOk
      })

      if (isOk) callback()
    }

    return {
      dialogVisible: false,
      form: {
        // 用户ID
        userId: '',
        // 套餐ID
        serialNumber: '',
        // 域名
        mainServerName: ''
      },

      formRules: {
        // 添加用户对话框的规则
        userId: [
          {
            required: true,
            message: '请选择用户',
            trigger: ['change']
          }
        ],
        serialNumber: [
          {
            required: true,
            message: '请选择套餐',
            trigger: ['change']
          }
        ],
        mainServerName: [
          {
            required: true,
            message: '请输入域名',
            trigger: ['change', 'blur']
          },
          {
            validator: checkDomains,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 表单提交
     */

    async submitForm() {
      // 避免 keydown 时重复提交
      if (this.$refs.dialogRef.btnLoading) return

      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        // 单个创建站点
        // const { data } = await doCreateSite(this.form)

        // 批量创建站点
        const { data: res } = await doBatchCreateSite({
          userId: this.form.userId,
          serialNumber: this.form.serialNumber,
          mainServerNames: this.form.mainServerName
            .trim()
            .replace(/[\r\n\s]+/g, ',')
        })

        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return

        // const { total, success } = res
        const total = res.total || 0
        const success = res.success || 0
        // 全部成功
        if (total === success) {
          this.$msg.success(total ? `${total}个域名添加成功` : '域名添加成功')
          this.dialogVisible = false
          this.$parent.getTableData()
          return
        }

        // 部分失败
        if (success > 0 && total > success) {
          this.$alert(
            `<div>添加成功：<span class="text-success">${success}</span> 个</div><div>添加失败：<span class="text-error">${total -
              success}</span> 个</div>`,
            '域名添加情况',
            {
              dangerouslyUseHTMLString: true,
              // center: true,
              type: 'info',
              callback: action => {}
            }
          )
          this.dialogVisible = false
          this.$parent.getTableData()
          return
        }

         // 全部失败
         if (success == 0) {
          this.$alert(
            '<div>1、请检查域名是否已存在；</div><div>2、请检查域名数是否超过套餐套餐限制；</div><div>3、或者其他原因，请联系我们！</div>',
            '域名添加失败',
            {
              dangerouslyUseHTMLString: true,
              // center: true,
              type: 'error'
            }
          )
        }
      })
    },

    // 添加用户表单重置
    resetForm() {
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
