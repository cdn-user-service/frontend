<template>
  <ants-form
    :model="form"
    :rules="rules"
    ref="formRef"
    :label-width="labelWidth"
    space-class="space-y-6"
    class="create-bulk-domain"
  >
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
        v-model="form.resourceType"
        @change="changeResourceType"
      >
        <ants-radio-button
          v-for="(item, key) in {
            ip: 'IP回源',
            domain: '域名回源'
          }"
          :key="key"
          :label="key"
          :text="item"
        />
      </ants-radio-group>
    </ants-form-item>

    <ants-form-item>
      <div class="ants-table_form_error">
        <el-form :model="tableForm" :rules="rules" ref="tableFormRef">
          <el-table
            size="mini"
            :data="tableForm"
            border
            stripe
            style="line-height: 1; margin-top: 0; max-width: 700px"
          >
            <ants-table-column
              label="加速域名(一行一个)"
              key="domains"
              min-width="200"
            >
              <template #default="{ row, $index }">
                <ants-form-item
                  :prop="`${$index}.domains`"
                  :rules="rules.domains"
                >
                  <ants-input
                    v-model="row.domains"
                    placeholder="主站
别名1
别名2"
                    type="textarea"
                    :autosize="{ minRows: 3, maxRows: 6 }"
                  />
                </ants-form-item>
              </template>
            </ants-table-column>

            <ants-table-column
              :label="resourceName"
              key="resource"
              min-width="200"
            >
              <template #default="{ row, $index }">
                <ants-form-item
                  :prop="`${$index}.resource`"
                  :rules="rules.resource"
                >
                  <ants-input
                    v-model.trim="row.resource"
                    size="small"
                    :placeholder="
                      form.resourceType === 'ip'
                        ? '23.23.23.23'
                        : 'www.domain.com'
                    "
                  />
                </ants-form-item>
              </template>
            </ants-table-column>

            <ants-table-column :label="portName" key="port" min-width="100">
              <template #default="{ row, $index }">
                <ants-form-item
                  size="small"
                  :prop="`${$index}.port`"
                  :rules="rules.port"
                >
                  <ants-input v-model.trim="row.port" :placeholder="portName" />
                </ants-form-item>
              </template>
            </ants-table-column>

            <ants-table-column
              v-if="form.sProtocol === '$scheme'"
              label="HTTPS端口"
              width="100"
              key="portHttps"
            >
              <template #default="{ row, $index }">
                <ants-form-item
                  size="small"
                  :prop="`${$index}.portHttps`"
                  :rules="rules.port"
                >
                  <ants-input
                    v-model.trim="row.portHttps"
                    placeholder="HTTPS端口"
                  />
                </ants-form-item>
              </template>
            </ants-table-column>

            <ants-table-column label="操作" width="70" align="center">
              <template #default="{ row, $index }">
                <span
                  :class="
                    $index > 0
                      ? 'text-error cursor-pointer'
                      : 'text-ants-text-4 cursor-not-allowed'
                  "
                  class="el-icon-delete-solid text-2xl p-xs"
                  @click="deleteRow(row, $index)"
                />
              </template>
            </ants-table-column>
          </el-table>
          <div class="text-left">
            <span
              class="text-primary el-icon-plus cursor-pointer font-semibold"
              @click="addRow()"
            >
              {{ antsT('添加一行') }}</span
            >
          </div>
        </el-form>
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
  // const reg = /^http(s)?:\/\/(?=^.{3,255}$)(\*|[a-zA-Z0-9][-a-zA-Z0-9]{0,62})(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
  return reg.test(val)
}

const defaultForm = {
  // 取源协议
  sProtocol: 'http',
  // 回源方式 ip | domain
  resourceType: 'ip',
  // 站点
  serverSource: ''
}

const defaultTableForm = {
  // 加速域名
  domains: '',
  // 回源地址，IP | domain
  resource: '',
  // 端口
  port: '80',
  // 协议跟随需要两个端口
  portHttps: '443'
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
        ...defaultForm
      },
      tableForm: [
        {
          ...defaultTableForm
        }
      ]
    }
  },
  computed: {
    resourceName() {
      return this.form.resourceType === 'ip' ? '源站IP' : '源站域名'
    },
    portName() {
      return this.form.sProtocol === 'https' ? 'HTTPS端口' : 'HTTP端口'
    },

    rules() {
      return {
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
        ],

        domains: [
          {
            required: true,
            message: '请输入加速域名(一行一个)',
            trigger: ['change', 'blur']
          },
          {
            // 验证一行一个站点格式，不能重复
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
                isOk = isDomain(e.trim())
                if (!isOk) {
                  callback(new Error(`域名格式错误：${e}`))
                  return false
                }

                // 判断是否重复
                nowArr[i] = e.trim() // 将数据存入临时数组
                if (nowArr.indexOf(e.trim()) != i) {
                  isOk = false
                  callback(new Error(`域名不能重复：${e}`))
                }
                return isOk
              })

              if (isOk) callback()
            },
            trigger: 'blur'
          }
        ],
        resource: [
          {
            required: true,
            message: '请输入' + this.resourceName,
            trigger: ['change', 'blur']
          },
          {
            validator: (rule, value, callback) => {
              if (value === undefined || value === '') return callback()
              const { resourceType } = this.form
              const resourceCheck = resourceType === 'ip' ? isIp : isRdomain
              const text = resourceType === 'ip' ? '源站IP' : '源站域名'

              if (!resourceCheck(value.trim())) {
                return callback(new Error(text + '格式错误'))
              }
              callback()
            },
            trigger: 'blur'
          }
        ],
        port: [
          {
            required: true,
            message: '请输入端口',
            trigger: ['change', 'blur']
          },
          {
            validator: (rule, value, callback) => {
              if (value === undefined || value === '') return callback()
              if (!isPort(value.trim())) {
                return callback(new Error('端口格式错误'))
              }
              callback()
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  watch: {
    'form.sProtocol': function (newVal, oldVal) {
      const oldPort = newVal === 'https' ? '80' : '443'
      const newPort = newVal === 'https' ? '443' : '80'
      this.tableForm.forEach((item) => {
        if (item.port === oldPort) {
          item.port = newPort
        }
      })
    }
  },
  create: {},
  methods: {
    // 保存提交
    doSave() {
      return new Promise((resolve, reject) => {
        try {
          // 验证第一次表单
          this.$refs.formRef.validate((valid) => {
            if (!valid) {
              return reject(new Error('验证失败'))
            }

            // 验证第二次表单
            this.$refs.tableFormRef.validate((valid2) => {
              if (!valid2) {
                return reject(new Error('验证失败'))
              }

              const { sProtocol, resourceType } = this.form

              const serverSource = this.tableForm.map((item) => {
                const { domains, resource, port, portHttps } = item
                const domainsStr = domains.trim().split(/[\r\n]+/) + ''

                let postStr = `${domainsStr}|${resource}|${port}`
                if (sProtocol === '$scheme') {
                  postStr += `,${portHttps}`
                }
                return postStr
              })

              // 验证成功
              resolve({
                sProtocol,
                resourceType,
                // 主站,别名|源站IP|端口
                serverSource
              })
            })
          })
        } catch (err) {
          reject(new Error('验证失败'))
          throw err
        }
      })
    },

    addRow() {
      const len = 50
      if (this.tableForm.length >= len) {
        this.$msg.info(`一次最多批量添加 ${len} 个站点`)
        return
      }
      const { sProtocol } = this.form
      this.tableForm.push({
        ...defaultTableForm,
        // 填写默认的端口号
        port: sProtocol === 'https' ? '443' : '80'
      })
    },

    deleteRow(row, idx) {
      if (idx === 0) return
      this.tableForm.splice(idx, 1)
    },

    changeResourceType() {
      // 重置校验规则
      this.$refs.tableFormRef.clearValidate()
    }
  }
}
</script>

<style lang="scss">
.create-bulk-domain {
  .el-table .el-table__cell {
    vertical-align: top;
  }
}
</style>
