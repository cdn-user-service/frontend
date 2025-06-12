<template>
  <ants-form
    :model="form"
    :rules="rules"
    ref="formRef"
    :label-width="labelWidth"
    space-class="space-y-6"
  >
    <ants-form-item prop="sProtocol" label="取源协议：">
      <ants-radio-group v-model="form.sProtocol" size="small">
        <ants-radio-button label="http" text="HTTP" />
        <ants-radio-button label="https" text="HTTPS" />
        <ants-radio-button label="$scheme" text="协议跟随" />
      </ants-radio-group>
    </ants-form-item>

    <ants-form-item prop="resourceType" label="源站类型：">
      <ants-radio-group
        v-model="form.resourceType"
        @change="changeResourceType"
        size="small"
      >
        <ants-radio-button label="ip" text="IP回源" />
        <ants-radio-button label="domain" text="域名回源" />
      </ants-radio-group>
    </ants-form-item>

    <ants-form-item ref="serverSourceRef">
      <ants-input
        style="max-width: 700px"
        v-model="form.serverSource"
        type="textarea"
        :autosize="{ minRows: 8, maxRows: 15 }"
        prefix-icon="aicon icon-wangluo"
        :placeholder="
          form.resourceType === 'ip'
            ? `请输入站点，一行一个
www.test.com,test.com|2.2.2.2|88`
            : `请输入站点，一行一个
www.test.com|www.domain.com|88`
        "
      />
    </ants-form-item>

    <ants-form-item style="margin: 0">
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
            form.resourceType === 'ip' ? '2.2.2.2' : 'www.domain.com'
          }}|88
        </div>
        <div>
          2、省略端口：<span class="font-semibold">
            主站|{{ form.resourceType === 'ip' ? '源站IP' : '源站域名' }}
          </span>
        </div>
        <div>
          www.test.com|{{
            form.resourceType === 'ip' ? '3.3.3.3' : 'www.domain.com'
          }}
        </div>
      </div>
    </ants-form-item>
  </ants-form>
</template>

<script>
// 验证规则
import { isDomain, isIp, isPort } from '@/utils/validate'

// 检测源站域名
const isRdomain = (val) => {
  const reg =
    /^(http(s)?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
  return reg.test(val)
}

export default {
  props: {
    labelWidth: {
      type: String
    }
  },
  data() {
    return {
      form: {
        // 站点
        serverSource: '',
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
        serverSource: [
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
    doSave() {
      return new Promise((resolve, reject) => {
        try {
          // 验证第一次表单
          this.$refs.formRef.validate((valid) => {
            if (!valid) {
              return reject(new Error('验证失败'))
            }

            const { serverSource, sProtocol, resourceType } = this.form
            const arr = serverSource
              .trim()
              .split(/[\r\n]+/)
              .map((item) => item.trim())
            console.log('arr==>', arr)

            // 验证成功
            resolve({
              sProtocol,
              resourceType,
              // 主站,别名|源站IP|端口
              serverSource: serverSource
                .trim()
                .split(/[\r\n]+/)
                .map((item) => item.trim())
            })
          })
        } catch (err) {
          reject(new Error('验证失败'))
          throw err
        }
      })
    },

    changeResourceType() {
      // 重置校验规则
      this.$refs.serverSourceRef.clearValidate()
    },

    // 添加用户表单重置
    resetForm() {
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
