<template>
  <ants-form
    :model="form"
    :rules="rules"
    ref="formRef"
    :label-width="labelWidth"
    space-class="space-y-6"
  >
    <!-- <ants-form-item prop="type" label="业务分类：">
      <ants-radio-group size="small" v-model="form.type">
        <ants-radio-button
          v-for="(item, key) in {
            1: 'CDN 图片小文件',
            2: 'CDN 大文件下载',
            3: 'CDN 流媒体点播',
            4: 'CDN 通用默认类型'
          }"
          :key="key"
          :label="key"
          :text="item"
        />
      </ants-radio-group>

      <div class="text-ants-text-4 text-sm">
        适用于小型静态资源的加速，如：电商、网站、在线论坛等业务场景。
      </div>
    </ants-form-item> -->

    <ants-form-item
      :prop="`domains.${idx}`"
      :rules="rules.domains"
      :label="idx == 0 ? '加速域名：' : ''"
      :style="idx > 0 ? 'margin-top: 10px;' : ''"
      v-for="(row, idx) in form.domains"
      :key="idx"
    >
      <div class="flex items-center">
        <ants-input
          style="max-width: 360px"
          class="mr-sm"
          v-model="form.domains[idx]"
          placeholder="请输入需加速的域名，如：www.domain.com"
        />

        <span
          :class="
            idx > 0
              ? 'text-error cursor-pointer'
              : 'text-ants-text-4 cursor-not-allowed'
          "
          class="el-icon-delete-solid text-2xl"
          @click="deleteRowDomain(idx)"
        />
      </div>
    </ants-form-item>
    <ants-form-item style="margin-top: 0; line-height: 1">
      <div>
        <span class="cursor-color text-primary" @click="addRowDomain()">
          <i class="el-icon-plus" />
          添加域名
        </span>
      </div>
      <div class="text-ants-text-4 text-sm">
        所有加速域名的源站需相同， 加速域名不能和回源域名相同
      </div>
    </ants-form-item>

    <ants-form-item prop="sProtocol" label="取源协议：">
      <ants-radio-group size="small" v-model="form.sProtocol">
        <ants-radio-button
          v-for="(item, key) in {
            http: 'HTTP',
            https: 'HTTPS',
            $scheme: '协议跟随'
          }"
          :key="key"
          :label="key"
          :text="item"
        />
      </ants-radio-group>
    </ants-form-item>

    <ants-form-item prop="resourceType" label="源站类型：">
      <ants-radio-group
        size="small"
        @change="changeResourceType"
        v-model="form.resourceType"
      >
        <ants-radio-button
          v-for="(item, key) in {
            ip: 'IP地址',
            domain: '源站域名'
          }"
          :key="key"
          :label="key"
          :text="item"
        />
      </ants-radio-group>
    </ants-form-item>

    <template v-if="form.resourceType === 'ip'">
      <ants-form-item required label="主源站地址：">
        <SingleIpTable
          ref="SingleIpTableRef"
          main
          :sProtocol="form.sProtocol"
        />
      </ants-form-item>

      <ants-form-item label="备源站地址：">
        <SingleIpTable ref="SingleIpTableRef2" :sProtocol="form.sProtocol" />
        <div class="text-ants-text-4 text-sm">
          选填，当主源站不可用时，CDN会访问备源站，直至主源站恢复。
        </div>
      </ants-form-item>
    </template>

    <template v-else>
      <ants-form-item required label="主源站地址：">
        <SingleDomainTable
          ref="SingleDomainTableRef"
          main
          :sProtocol="form.sProtocol"
          :domains="form.domains"
        />
      </ants-form-item>

      <ants-form-item label="备源站地址：">
        <SingleDomainTable
          ref="SingleDomainTableRef2"
          :sProtocol="form.sProtocol"
          :domains="form.domains"
        />
        <div class="text-ants-text-4 text-sm">
          选填，当主源站不可用时，CDN会访问备源站，直至主源站恢复。
        </div>
      </ants-form-item>
    </template>

    <!-- <ants-form-item prop="sourceCheck" label="源站检查：">
      <ants-switch
        v-model="form.sourceCheck"
        :active-value="1"
        :inactive-value="0"
        active-text="ON"
        inactive-text="OFF"
      />
      <div class="text-ants-text-4 text-sm">
        开启后，将启用7层IP探测，回源服务器访问异常时，自动屏蔽掉无法访问的源站
      </div>
    </ants-form-item>

    <ants-form-item prop="sourceHostType" label="回源HOST：">
      <ants-radio-group size="small" v-model="form.sourceHostType">
        <ants-radio
          v-for="(item, key) in {
            jiasu: '加速域名',
            auto: '自定义域名'
          }"
          :key="key"
          :label="key"
          :text="item"
        />
      </ants-radio-group>
    </ants-form-item>

    <ants-form-item v-if="form.sourceHostType === 'auto'" prop="sourceHost">
      <ants-input
        style="max-width: 360px"
        v-model="form.sourceHost"
        placeholder="请输入自定义域名"
      />
    </ants-form-item> -->
  </ants-form>
</template>

<script>
import { isDomain } from '@/utils/validate'
import SingleIpTable from './SingleIpTable'
import SingleDomainTable from './SingleDomainTable'

const PROCESS_NAME = process.env.VUE_APP_NAME
// API
const { checkCreateSite } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

const defaultForm = {
  // 业务类型
  type: 1,
  // 加速域名，多个
  domains: [''],
  // 取源协议
  sProtocol: 'http',
  // 源站类型 ip | domain
  resourceType: 'ip'

  // 源站检查
  //   sourceCheck: 0,
  //   // 域名级回源HOST
  //   sourceHostType: 'jiasu',
  //   sourceHost: ''
}

export default {
  components: {
    SingleIpTable,
    SingleDomainTable
  },
  props: {
    labelWidth: {
      type: String
    }
  },
  data() {
    return {
      loading: false,
      form: {
        ...defaultForm
      },
      // 已输入的源站域名，用于判断是否重复
      sourceDomains: []
    }
  },
  computed: {
    rules() {
      return {
        domains: [
          {
            required: true,
            message: '请输入加速域名',
            trigger: ['change', 'blur']
          },
          {
            validator: (rule, value, callback) => {
              if (value === undefined || value === '') return callback()
              if (!isDomain(value.trim())) {
                return callback(new Error('域名格式错误'))
              }
              callback()
            },
            trigger: 'blur'
          },
          {
            // 判断加速域名是否重复
            validator: (rule, value, callback) => {
              if (value === undefined || value === '') return callback()
              const trimValue = value.trim()
              const arr = this.form.domains.filter(
                (it) => it.trim() === trimValue
              )
              if (arr.length > 1) {
                return callback(new Error('域名重复'))
              }
              callback()
            },
            trigger: 'blur'
          },
          {
            // 检查加速域名跟源站域名不能重复
            validator: (rule, value, callback) => {
              if (value === undefined || value === '') return callback()
              if (this.form.resourceType != 'domain') return callback()

              if (this.$refs.SingleDomainTableRef) {
                if (this.$refs.SingleDomainTableRef.isRepeatDomains) {
                  return callback(new Error('加速域名和源站域名不能相同'))
                }
              }

              if (this.$refs.SingleDomainTableRef2) {
                if (this.$refs.SingleDomainTableRef2.isRepeatDomains) {
                  return callback(new Error('加速域名和源站域名不能相同'))
                }
              }

              callback()
            },
            trigger: 'blur'
          },
          {
            // 请求接口判断域名是否已存在
            validator: (rule, value, callback) => {
              checkCreateSite({
                name: value.trim()
              })
                .then((res) => {
                  const { data = {} } = res
                  if (data.code !== 1) {
                    return callback(new Error(data.msg || '请求异常'))
                  }
                  if (!data.data) {
                    return callback(new Error('域名已存在'))
                  }
                  callback()
                })
                .catch((err) => {
                  console.log(err)
                  return callback(new Error('请求失败，请重试'))
                })
            },
            trigger: 'blur'
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
            message: '请选择源站类型',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  create() {},
  beforeDestroy() {
    console.log('beforeDestroy')
    this.form.domains = ['']
  },
  methods: {
    deleteRowDomain(idx) {
      if (idx === 0) return
      this.form.domains.splice(idx, 1)
    },

    addRowDomain() {
      const len = 10
      if (this.form.domains.length >= len) {
        this.$msg.info(`最多添加${len}域名`)
        return
      }
      this.form.domains.push('')
    },

    // 重置校验规则
    changeResourceType() {
      //   this.$refs.SingleIpTableRef.clearValidate()
      //   this.$refs.SingleIpTableRef2.clearValidate()
    },

    // 保存提交
    doSave() {
      return new Promise((resolve, reject) => {
        try {
          this.$refs.formRef.validate(async (valid) => {
            if (!valid) {
              return reject(new Error('验证失败'))
            }

            const { domains, sProtocol, resourceType } = this.form

            let mainServer = []
            let backuoServer = []

            if (resourceType === 'ip') {
              // 验证子组件
              mainServer = await this.$refs.SingleIpTableRef.doSave()
              backuoServer = await this.$refs.SingleIpTableRef2.doSave()
            }

            if (resourceType === 'domain') {
              // 验证子组件
              mainServer = await this.$refs.SingleDomainTableRef.doSave()
              backuoServer = await this.$refs.SingleDomainTableRef2.doSave()
            }

            resolve({
              domains,
              sProtocol,
              resourceType,
              serverSource: mainServer,
              serverSourceBackup: backuoServer
            })
          })
        } catch (err) {
          reject(new Error('验证失败'))
          throw err
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
