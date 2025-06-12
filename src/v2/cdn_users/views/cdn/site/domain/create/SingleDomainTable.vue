<template>
  <div class="ants-table_form_error">
    <el-form :model="tableForm" :rules="rules" ref="tableFormRef" size="small">
      <el-table
        size="mini"
        :data="tableForm"
        border
        stripe
        style="line-height: 1; margin-top: 0; max-width: 700px"
      >
        <ants-table-column
          :label="`${main ? '主' : '备'}源站域名`"
          min-width="150"
        >
          <template #default="{ row, $index }">
            <ants-form-item :prop="`${$index}.domain`" :rules="rules.domain">
              <ants-input
                v-model.trim="row.domain"
                :placeholder="`请输入${main ? '主' : '备'}源站域名`"
              />
            </ants-form-item>
          </template>
        </ants-table-column>

        <ants-table-column label="HTTP端口" min-width="100">
          <template #default="{ row, $index }">
            <ants-form-item
              :prop="`${$index}.portHttp`"
              :rules="rules.portHttp"
            >
              <ants-input
                v-model.trim="row.portHttp"
                placeholder="HTTP端口"
              />
            </ants-form-item>
          </template>
        </ants-table-column>

        <ants-table-column label="HTTPS端口" min-width="100">
          <template #default="{ row, $index }">
            <ants-form-item
              :prop="`${$index}.portHttps`"
              :rules="rules.portHttps"
            >
              <ants-input
                v-model.trim="row.portHttps"
                placeholder="HTTPS端口"
              />
            </ants-form-item>
          </template>
        </ants-table-column>

        <ants-table-column label="权重" min-width="100">
          <template #default="{ row, $index }">
            <ants-form-item :prop="`${$index}.weight`" :rules="rules.weight">
              <ants-input-number
                v-model="row.weight"
                :min="1"
                :max="999999"
                :precision="0"
                :controls="false"
                placeholder="权重"
                style="width: 100%"
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
          class="text-primary el-icon-plus cursor-pointer"
          @click="addRow()"
        >
          {{ antsT('添加一行') }}</span
        >
      </div>
    </el-form>
  </div>
</template>

<script>
import { isPort } from '@/utils/validate'
// 检测源站域名
const isRdomain = (val) => {
  const reg =
    /^(http(s)?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
  // const reg = /^http(s)?:\/\/(?=^.{3,255}$)(\*|[a-zA-Z0-9][-a-zA-Z0-9]{0,62})(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
  return reg.test(val)
}

const defaultTableForm = {
  domain: '',
  portHttp: '',
  portHttps: '',
  weight: ''
}

export default {
  props: {
    // 主还是备
    main: {
      type: Boolean
    }
  },
  data() {
    return {
      tableForm: [
        {
          ...defaultTableForm
        }
      ]
    }
  },
  computed: {
    rules() {
      const rules = {
        domain: [
          {
            validator: (rule, value, callback) => {
              if (value === undefined || value === '') return callback()
              if (!isRdomain(value.trim())) {
                return callback(new Error('源站域名格式错误'))
              }
              callback()
            },
            trigger: 'blur'
          }
        ],
        portHttp: [
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
        ],
        portHttps: [
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
        ],
        weight: []
      }

      if (this.main) {
        rules.domain.unshift({
          required: true,
          message: '请输入源站域名',
          trigger: ['change', 'blur']
        })

        rules.portHttp.unshift({
          required: true,
          message: '请输入HTTP端口',
          trigger: ['change', 'blur']
        })

        rules.portHttps.unshift({
          required: true,
          message: '请输入HTTPS端口',
          trigger: ['change', 'blur']
        })

        rules.weight.unshift({
          required: true,
          message: '请输入权重',
          trigger: ['change', 'blur']
        })
      }
      return rules
    }
  },
  create() {},
  methods: {
    addRow() {
      const len = 10
      if (this.tableForm.length >= len) {
        this.$msg.info(`最多添加${len}条${this.main ? '主' : '备'}源站`)
        return
      }
      this.tableForm.push({
        ...defaultTableForm
      })
    },

    deleteRow(row, idx) {
      if (idx === 0) return
      this.tableForm.splice(idx, 1)
    },

    // 重置校验规则
    clearValidate() {
      this.$refs.tableFormRef.clearValidate()
    },

    // 表单提交
    doSave() {
      return new Promise((resolve, reject) => {
        try {
          // 验证第二次表单
          this.$refs.tableFormRef.validate((valid) => {
            if (!valid) {
              return reject(new Error('验证失败'))
            }

            const output = []
            this.tableForm.forEach((item) => {
              const { domain, portHttp, portHttps, weight } = item
              if (domain && portHttp && portHttps && weight) {
                output.push(`${domain}|${portHttp}|${portHttps}|${weight}`)
              }
            })

            // 验证成功
            resolve(output)
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
