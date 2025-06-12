<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    title="添加站点"
    width="550px"
    @close="resetForm"
    @submit="submitForm"
  >
    <!-- <div class="text-center mb-xl">
      <strong>{{ antsT('支持模糊搜索用户名、手机号、邮箱地址') }}</strong>
    </div> -->
    <ants-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="90px"
      label-position="top"
    >
      <ants-form-item prop="userId">
        <QueryUserSelect
          is-bgc
          v-model="form.userId"
          placeholder="检索用户名、手机号、邮箱地址"
        />
      </ants-form-item>
      <ants-form-item prop="serialNumber">
        <QueryPlanSelect
          is-bgc
          :user-id="form.userId"
          v-model="form.serialNumber"
        />
      </ants-form-item>
      <ants-form-item prop="sProtocol" style="margin: 10px 0 0">
        <strong class="mr-df text-ants-text-3">取源协议</strong>
        <ants-radio-group v-model="form.sProtocol">
          <ants-radio label="http" text="HTTP" />
          <ants-radio label="https" text="HTTPS" />
          <ants-radio label="$scheme" text="协议跟随" />
        </ants-radio-group>
      </ants-form-item>

      <ants-form-item prop="resourceType" style="margin: 0 0 10px">
        <strong class="mr-df text-ants-text-3">回源方式</strong>
        <ants-radio-group
          v-model="form.resourceType"
          @change="changeResourceType"
        >
          <ants-radio label="ip" text="IP回源" />
          <ants-radio label="domain" text="域名回源" />
        </ants-radio-group>
      </ants-form-item>

      <ants-form-item
        prop="mainServerName"
        ref="mainServerNameRef"
        style="margin: 0"
      >
        <ants-input
          is-bgc
          v-model="form.mainServerName"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 15 }"
          prefix-icon="aicon icon-wangluo"
          :placeholder="
            form.resourceType === 'ip'
              ? `请输入站点，一行一个
www.test.com,test.com|2.2.2.2|88`
              : `请输入站点，一行一个
www.test.com|https://www.domain.com|88`
          "
        />
      </ants-form-item>

      <div
        class="text-ants-text-4 text-df leading-none space-y-xs pt-df -mb-df"
        style="margin: 0"
      >
        <div class="font-semibold pb-xs">
          格式说明：一行一个，端口（不填则默认80/443）
        </div>
        <div>
          1、完整格式：<span class="font-semibold"
            >主站,别名1,别名2|{{
              form.resourceType === 'ip' ? '源站IP' : '源站域名'
            }}|端口</span
          >
        </div>
        <div class="pb-xs">
          www.test.com,test1.com|{{
            form.resourceType === 'ip' ? '2.2.2.2' : 'https://www.domain.com'
          }}|88
        </div>
        <div>
          2、省略端口：<span class="font-semibold">
            主站|{{ form.resourceType === 'ip' ? '源站IP' : '源站域名' }}
          </span>
        </div>
        <div>
          www.test.com|{{
            form.resourceType === 'ip' ? '3.3.3.3' : 'https://www.domain.com'
          }}
        </div>
      </div>
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
import { isDomain, isIp, isPort } from '@/utils/validate'

// 检测源站域名
const isRdomain = (val) => {
  const reg =
    /^http(s)?:\/\/([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
  // const reg = /^http(s)?:\/\/(?=^.{3,255}$)(\*|[a-zA-Z0-9][-a-zA-Z0-9]{0,62})(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
  return reg.test(val)
}

export default {
  components: {
    QueryUserSelect,
    QueryPlanSelect
  },
  data() {
    // 验证规则
    // const { isDomain: isDomainValid } = this.$validator

    return {
      dialogVisible: false,
      form: {
        // 用户ID
        userId: '',
        // 套餐ID
        serialNumber: '',
        // 站点
        mainServerName: '',
        // 取源协议
        sProtocol: 'http',
        // 回源方式 ip | domain
        resourceType: 'ip'
      }
    }
  },
  computed: {
    rules() {
      return {
        serialNumber: [
          {
            required: true,
            message: '请选择套餐',
            trigger: ['change']
          }
        ],
        sProtocol: [
          {
            required: true,
            message: '请选择取源协议',
            trigger: ['change']
          }
        ],
        resourceType: [
          {
            required: true,
            message: '请选择回源方式',
            trigger: ['change']
          }
        ],
        mainServerName: [
          {
            required: true,
            message: '请输入站点，一行一个',
            trigger: ['change', 'blur']
          },
          {
            // 验证一行一个站点格式，不能重复
            validator: (rule, value, callback) => {
              const { resourceType } = this.form
              const resourceCheck = resourceType === 'ip' ? isIp : isRdomain
              const text = resourceType === 'ip' ? '源站IP' : '源站域名'

              // 将数据拆分成一行一个
              const newArr = value.trim().split(/[\r\n]+/)
              // 是否正确的格式
              let isOk = false
              // 临时数组，用于判读站点是否重复
              const nowArr = []

              // 遍历站点数组
              newArr.every((item, idx) => {
                const itemTrim = item.trim()
                const itemTrimArr = itemTrim.split('|')
                // 站点别名
                const aliasArr = itemTrimArr[0].split(',')
                // 源站IP
                const ip = itemTrimArr[1]
                // 端口号
                let port = itemTrimArr[2]
                if (port === undefined) port = '80'

                // 判断站点格式是否正确
                const isOkDomain = aliasArr.every((item) => isDomain(item))
                // 判断IP格式是否正确
                console.log(ip)
                const isOkIp = resourceCheck(ip)
                // 判断端口号格式是否正确
                const isOkPort = isPort(port)

                isOk = isOkDomain && isOkIp && isOkPort

                if (!isOkDomain) {
                  callback(new Error('域名格式不正确：' + itemTrim))
                  return false
                }
                if (!isOkIp) {
                  callback(new Error(text + '格式不正确：' + itemTrim))
                  return false
                }
                if (!isOkPort) {
                  callback(new Error('端口格式不正确：' + itemTrim))
                  return false
                }
                // if (!isOkIp) {
                //   callback(new Error('IP格式不正确：' + itemTrim))
                //   return isOk
                // }

                // 判断站点是否重复，如果当前站点在数组中第一次出现的位置不是 i，则认为该站点重复
                // nowArr[idx] = itemTrim // 将数据存入临时数组
                // if (nowArr.indexOf(itemTrim) != idx) {
                //   isOk = false
                //   callback(new Error('站点不能重复：' + itemTrim))
                // }
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
    /**
     * @description: 表单提交
     */

    async submitForm() {
      // 避免 keydown 时重复提交
      if (this.$refs.dialogRef.btnLoading) return

      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        // 单个创建站点
        // const { data } = await doCreateSite(this.form)
        const { userId, serialNumber, mainServerName, sProtocol } = this.form
        // 批量创建站点
        const { data: res } = await doBatchCreateSite({
          userId,
          serialNumber,
          sProtocol,
          // 站点，传递数组
          serverSource: mainServerName.trim().split(/[\r\n]+/)
          // mainServerNames: mainServerName
          //   .trim()
          //   .replace(/[\r\n\s]+/g, ',')
        })

        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return

        // const { total, success } = res
        const total = res.total || 0
        const success = res.success || 0
        // 全部成功
        if (total === success) {
          this.$msg.success(total ? `${total}个站点添加成功` : '站点添加成功')
          this.dialogVisible = false
          this.$parent.getTableData()
          return
        }

        // 部分失败
        if (success > 0 && total > success) {
          this.$alert(
            `<div>添加成功：<span class="text-success">${success}</span> 个</div><div>添加失败：<span class="text-error">${
              total - success
            }</span> 个</div>`,
            '站点添加情况',
            {
              dangerouslyUseHTMLString: true,
              // center: true,
              type: 'info',
              callback: (action) => {}
            }
          )
          this.dialogVisible = false
          this.$parent.getTableData()
          return
        }

        // 全部失败
        if (success == 0) {
          this.$alert(
            '<div>1、请检查站点是否已存在；</div><div>2、请检查站点数是否超过套餐套餐限制；</div><div>3、或者其他原因，请联系我们！</div>',
            '站点添加失败',
            {
              dangerouslyUseHTMLString: true,
              // center: true,
              type: 'error'
            }
          )
        }
      })
    },

    changeResourceType() {
      // 重置校验规则
      this.$refs.mainServerNameRef.clearValidate()
    },

    // 添加用户表单重置
    resetForm() {
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
