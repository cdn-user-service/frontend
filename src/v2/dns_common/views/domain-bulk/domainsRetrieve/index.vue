<template>
  <el-card class="content-box animated fadeIn batch_card">
    <div slot="header">
      <TitleBorder title="取回域名" />
    </div>

    <ants-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      label-width="0"
      label-position="top"
      status-icon
    >
      <ants-form-item prop="domains">
        <strong>{{ antsT('输入域名') }}</strong>
        <ul
          class="text-ants-text-4 mb-lg"
          style="font-size: 13px; line-height: 17px"
        >
          <li class="my-xs">
            {{
              antsT(
                '如果您的域名已被其他账号添加，可在此验证取回，支持多个域名批量操作'
              )
            }}
          </li>
          <li class="my-xs">
            {{
              antsT(
                '域名取回后，将进行 DNS 重置，并影响域名当前解析服务，请谨慎操作（如不希望影响解析，请使用账号间转移功能）'
              )
            }}
          </li>
        </ul>
        <ants-input
          type="textarea"
          rows="10"
          style="width: 450px"
          placeholder="输入一级域名，每行一个，最多可输入500个域名。例如：
  domain1.com
  domain2.com"
          v-model="form.domains"
        />
      </ants-form-item>

      <ants-form-item>
        <strong>{{ antsT('设置记录') }}</strong>
        <el-tooltip
          class="item"
          effect="dark"
          :content="antsT('可选择以下方式中任意一种，请根据您的实际情况选择。')"
          placement="right"
        >
          <span class="el-icon-info ants-icon_info"></span>
        </el-tooltip>
        <div class="flex space-x-10">
          <div>
            <ul
              class="text-ants-text-4 space-y-4"
              style="font-size: 13px; line-height: 17px"
            >
              <li style="font-weight: bold">
                {{ antsT('方式一') }}
              </li>
              <li>
                {{
                  antsT(
                    '请为以上所有域名添加如下 TXT 记录值, 便于系统验证域名权限；'
                  )
                }}
              </li>
              <li>
                {{ antsT('注意这需要在域名当前其他解析商处进行设置；') }}
              </li>
              <li>
                {{
                  antsT('如果域名未在其他账号下, 则无需取回, 将直接添加成功。')
                }}
              </li>
            </ul>

            <ul
              class="px-lg py-sm bg-ants-bg-4 rounded-xl mt-lg"
              style="max-width: 450px"
              v-loading="$root.loading"
            >
              <li class="flex">
                <div style="width: 90px" class="text-ants-text-4">
                  {{ antsT('主机记录') }}
                </div>
                <div class="flex-1">{{ recordData.txtTop }}</div>
              </li>
              <li class="flex">
                <div style="width: 90px" class="text-ants-text-4">
                  {{ antsT('记录值') }}
                </div>
                <div class="flex-1" style="word-break: break-all">
                  {{ recordData.txtValue }}
                </div>
              </li>
            </ul>
          </div>
          <div>
            <ul
              class="text-ants-text-4 space-y-4"
              style="font-size: 13px; line-height: 17px"
            >
              <li style="font-weight: bold">
                {{ antsT('方式二') }}
              </li>
              <li>
                {{ antsT('为预找回域名设置http返回内容') }}
              </li>
              <li>
                {{ antsT('注意这可能需要在当前域名所在web服务器设置') }}
              </li>
              <li>
                {{
                  antsT('如果域名未在其他账号下, 则无需取回, 将直接添加成功')
                }}
              </li>
            </ul>

            <ul
              class="px-lg py-sm bg-ants-bg-4 rounded-xl mt-lg"
              style="max-width: 500px"
              v-loading="$root.loading"
            >
              <li class="flex">
                <div style="width: 90px" class="text-ants-text-4">
                  {{ antsT('HTTP URL') }}
                </div>
                <div class="flex-1">http://域名{{ recordData.httpPath }}</div>
              </li>
              <li class="flex">
                <div style="width: 90px" class="text-ants-text-4">
                  {{ antsT('HTTP 内容') }}
                </div>
                <div class="flex-1" style="word-break: break-all">
                  {{ recordData.httpValue }}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </ants-form-item>

      <ants-form-item>
        <ants-button
          type="primary"
          size="small"
          :loading="btnLoading"
          @click="submitRetrieveDomains"
          icon="el-icon-check"
          text="批量取回"
        />
      </ants-form-item>
    </ants-form>
  </el-card>
</template>

<script>
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  batchRetrieveDomains,
  getRetrieveKeyValue
} = require(`@/v2/${PROCESS_NAME}/api/dns/bulk`)

export default {
  data() {
    // 批量添加域名
    const checkDomains = (rule, value, callback) => {
      // 将数据拆分成一行一个
      const newValue = value.trim().split(/[(\r\n)\r\n]+/)
      const checkDomain =
        /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(?<!www)(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
      let isOk = false
      const nowArr = [] // 临时数组
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

    return {
      btnLoading: false,
      recordData: {
        // recordTop: '',
        // recordValue: ''
        txtTop: '',
        txtValue: '',
        httpPath: '',
        httpValue: ''
      },

      form: {
        domains: ''
      },
      formRules: {
        domains: [
          {
            required: true,
            message: '请输入一级域名，每行一个',
            trigger: 'blur'
          },
          {
            validator: checkDomains,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {},
  created() {
    this.getKeyValueList()
  },
  methods: {
    /**
     * @description: 获取记录参数
     */

    async getKeyValueList() {
      this.$root.loading = true
      const { data: res } = await getRetrieveKeyValue()
      this.$root.loading = false
      if (res.code !== 1) return
      console.log('res===>', res)
      this.recordData.txtTop = res.data.txtTop || '--'
      this.recordData.txtValue = res.data.txtValue || '--'
      this.recordData.httpPath = res.data.httpPath || '--'
      this.recordData.httpValue = res.data.httpValue || '--'
    },

    /**
     * @description: 批量取回域名提交
     */

    submitRetrieveDomains() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.btnLoading = true
        const domainsStr = this.form.domains.trim().replace(/[\r\n]+/g, ',')

        const { data: res } = await batchRetrieveDomains({
          domains: domainsStr
        })
        this.btnLoading = false

        if (res.code !== 1) return
        this.$alert(
          '已成功取回 ' +
            domainsStr.split(',').length +
            ' 个域名，数据同步可能需要一些时间，请耐心等候！',
          '批量取回域名成功',
          {
            center: true,
            type: 'success',
            callback: (action) => {
              this.resetForm()
            }
          }
        ).catch((err) => err)
      })
    },

    /**
     * @description: 重置
     */
    resetForm() {
      this.btnLoading = false
      this.form.domains = ''
    }
  }
}
</script>
