<template>
  <div class="ants-table_form_error">
    <el-form :model="tableForm" :rules="rules" ref="tableFormRef" size="small">
      <el-table
        size="mini"
        :data="tableForm"
        border
        stripe
        style="line-height: 1; margin-top: 0; max-width: 600px"
      >
        <ants-table-column
          :label="`${main ? '主' : '备'}源站IP地址`"
          min-width="200"
          key="ip"
        >
          <template #default="{ row, $index }">
            <ants-form-item :prop="`${$index}.ip`" :rules="rules.ip">
              <ants-input
                v-model.trim="row.ip"
                :placeholder="`请输入${main ? '主' : '备'}源站IP地址`"
              />
            </ants-form-item>
          </template>
        </ants-table-column>

        <ants-table-column :label="portName" width="100" key="port">
          <template #default="{ row, $index }">
            <ants-form-item :prop="`${$index}.port`" :rules="rules.port">
              <ants-input v-model.trim="row.port" :placeholder="portName" />
            </ants-form-item>
          </template>
        </ants-table-column>

        <ants-table-column
          v-if="sProtocol === '$scheme'"
          label="HTTPS端口"
          width="100"
          key="portHttps"
        >
          <template #default="{ row, $index }">
            <ants-form-item :prop="`${$index}.portHttps`" :rules="rules.port">
              <ants-input
                v-model.trim="row.portHttps"
                placeholder="HTTPS端口"
              />
            </ants-form-item>
          </template>
        </ants-table-column>

        <ants-table-column label="权重" width="100" key="weight">
          <template #default="{ row, $index }">
            <ants-form-item :prop="`${$index}.weight`" :rules="rules.weight">
              <ants-input-number
                v-model="row.weight"
                :min="1"
                :max="999999"
                :precision="0"
                :controls="false"
                placeholder="请输入权重"
                style="width: 100%"
              />
            </ants-form-item>
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="70" align="center" key="handle">
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
import { isIp, isPort } from '@/utils/validate'

const defaultTableForm = {
  ip: '',
  port: '80',
  // 协议跟随需要两个端口
  portHttps: '443',
  weight: ''
}

export default {
  props: {
    // 主还是备
    main: {
      type: Boolean
    },
    // 跟随协议
    sProtocol: String
  },
  data() {
    return {
      tableForm: [
        {
          ...defaultTableForm,
          // 填写默认的端口号
          port: this.sProtocol === 'https' ? '443' : '80'
        }
      ]
    }
  },
  computed: {
    portName() {
      return this.sProtocol === 'https' ? 'HTTPS端口' : 'HTTP端口'
    },

    rules() {
      const rules = {
        ip: [
          {
            validator: (rule, value, callback) => {
              if (value === undefined || value === '') return callback()
              if (!isIp(value.trim())) {
                return callback(new Error('IP格式错误'))
              }
              callback()
            },
            trigger: 'blur'
          }
        ],
        port: [
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
        rules.ip.unshift({
          required: true,
          message: '请输入IP地址',
          trigger: ['change', 'blur']
        })

        rules.port.unshift({
          required: true,
          message: '请输入端口',
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
  watch: {
    sProtocol: function (newVal, oldVal) {
      const oldPort = newVal === 'https' ? '80' : '443'
      const newPort = newVal === 'https' ? '443' : '80'
      this.tableForm.forEach((item) => {
        if (item.port === oldPort) {
          item.port = newPort
        }
      })
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
        ...defaultTableForm,
        // 填写默认的端口号
        port: this.sProtocol === 'https' ? '443' : '80'
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
              const { ip, port, portHttps, weight } = item

              let portStr = port
              let isValid = ip && port && weight
              if (this.sProtocol === '$scheme') {
                portStr = `${port},${portHttps}`
                isValid = ip && port && portHttps && weight
              }

              if (isValid) {
                output.push(`${ip}|${portStr}|${weight}`)
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
