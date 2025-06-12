<template>
  <ants-dialog
    :title="`${type === 'update' ? '修改' : '添加'}源站`"
    v-model="dialogVisible"
    width="1000px"
    top="5vh"
    @close="resetForm"
    @submit="submitForm"
    ref="dialogRef"
  >
    <ul
      class="p-df mb-df space-y-3 border border-primary text-primary bg-primary-light rounded-lg text-sm -mt-sm"
    >
      <li>
        {{
          antsT(
            '1. 节点取源时所用协议和客户端访问协议保持一致，源站需要同时支持 80 和 443 端口，否则有可能造成节点取源失败；'
          )
        }}
      </li>
      <li>
        {{
          antsT(
            '2. 批量新增源站时，多个监听端口请用英文输入法下逗号分开，这时回源端口将与监听端口保持一致；'
          )
        }}
      </li>
      <li>
        {{ antsT('3. 取源协议为协议跟随时，回源端口将与监听端口保持一致；') }}
      </li>
      <li>
        {{
          antsT(
            '4. 线路配置优先级：主线路 > 备线路，同一线路类型下，优先级等级越高，则权重越大。'
          )
        }}
      </li>
    </ul>
    <ants-form
      :model="form"
      :rules="formRules"
      space-class="space-y-6"
      ref="formRef"
      label-width="130px"
    >
      <ants-form-item
        label="协议类型"
        required
        prop="protocol"
        style="margin: 0"
      >
        <ants-radio-group v-model="form.protocol" @change="changeProtocol">
          <!-- <ants-radio label="httpAndHttps" text="HTTP/HTTPS" /> -->
          <ants-radio label="http" text="HTTP" />
          <ants-radio label="https" text="HTTPS" />
        </ants-radio-group>
      </ants-form-item>

      <ants-form-item label="监听端口" prop="port">
        <ants-input
          class="max-w-md"
          v-model.trim="form.port"
          size="small"
          placeholder="请输入监听端口"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="取源协议" required prop="s_protocol">
        <ants-radio-group v-model="form.s_protocol">
          <ants-radio label="http" text="HTTP" />
          <ants-radio label="https" text="HTTPS" />
          <ants-radio label="$scheme" text="协议跟随" />
        </ants-radio-group>
      </ants-form-item>

      <ants-form-item label="均衡方式" required prop="upstream">
        <ants-radio-group v-model="form.upstream">
          <ants-radio label="polling" text="轮询" />
          <ants-radio label="hash" text="IP哈希" />
          <ants-radio label="request_uri_hash" text="URL哈希" />
          <ants-radio label="cookie" text="COOKIE保持" />
          <ants-radio label="least_conn" text="最少连接" />
          <ants-radio label="random" text="随机" />

          <!-- <ants-radio label="check" text="HTTP监测"/> -->
        </ants-radio-group>
      </ants-form-item>

      <ants-form-item label="回源设置" required prop="source_set">
        <ants-radio-group v-model="form.source_set" @change="changeSourceSet">
          <ants-radio label="ip" text="回源到IP" />
          <ants-radio label="domain" text="回源到域名" />
        </ants-radio-group>
      </ants-form-item>

      <ants-form-item label="线路设置" required class="ants-table_form_error">
        <ants-form :model="tableForm" :rules="formRules" ref="tableFormRef">
          <el-table :data="tableForm.lineTableData" size="small">
            <ants-table-column
              :label="form.source_set == 'ip' ? 'IP' : '域名'"
              min-width="160"
            >
              <template #default="{ row, $index }">
                <ants-form-item
                  :prop="`lineTableData.${$index}.${form.source_set}`"
                  :rules="formRules[form.source_set]"
                >
                  <ants-input
                    style="width: 100%"
                    size="small"
                    v-model="row[form.source_set]"
                    :placeholder="
                      form.source_set == 'ip'
                        ? '支持 IPv4、IPv6 格式'
                        : 'www.demo.com'
                    "
                  ></ants-input>
                </ants-form-item>
              </template>
            </ants-table-column>

            <ants-table-column label="端口" min-width="120">
              <template #default="{ row, $index }">
                <ants-form-item
                  :prop="`lineTableData.${$index}.port`"
                  :rules="formRules.port"
                >
                  <ants-input
                    style="width: 100%"
                    size="small"
                    v-model="row.port"
                    placeholder="端口"
                  ></ants-input>
                </ants-form-item>
              </template>
            </ants-table-column>
            <ants-table-column label="线路" min-width="120">
              <template #default="{ row }">
                <ants-select
                  v-model="row.line"
                  placeholder="线路"
                  style="width: 100%"
                  size="small"
                >
                  <ants-option label="主线路" :value="1"> </ants-option>
                  <ants-option label="备线路" :value="2"> </ants-option>
                </ants-select>
              </template>
            </ants-table-column>
            <ants-table-column
              label="权重"
              min-width="120"
              v-if="form.source_set == 'ip'"
            >
              <template #default="{ row }">
                <ants-input-number
                  style="width: 100%"
                  v-model="row.weight"
                  controls-position="right"
                  size="small"
                  :min="1"
                  :max="999"
                ></ants-input-number>
              </template>
            </ants-table-column>
            <ants-table-column label="操作" width="60" align="right">
              <template #default="{ row, $index }">
                <span
                  class="el-icon-delete-solid text-2xl text-error cursor-pointer"
                  :class="{
                    'text-ants-text-4 cursor-not-allowed': $index === 0
                  }"
                  @click="deleteLineItem(row, $index)"
                ></span>
              </template>
            </ants-table-column>
          </el-table>
        </ants-form>

        <div class="text-center pt-df">
          <span
            class="text-primary el-icon-plus cursor-pointer"
            @click="addNewRow"
          >
            {{ antsT('新增一行') }}</span
          >
        </div>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// 线路表格初始化数据
const baseTableData = {
  ip: '',
  domain: '',
  port: '',
  line: 1,
  weight: 1
}

// 表单初始化数据
const defaultForm = {
  // 添加 id = 0
  id: 0,
  protocol: 'http',
  port: 80,
  s_protocol: 'http',
  upstream: 'polling',
  source_set: 'ip'
  // line: [
  //   {
  //     ip: '',
  //     port: '',
  //     line: 1,
  //     weight: 1
  //   }
  // ]
}

export default {
  props: {
    // 是否有 HTTP
    isHttp: Boolean,
    // 是否为批量操作，为批量操作是不需要提交请求
    bulk: Boolean
  },
  data() {
    // 验证规则
    const { isPort, isIp, isDomain } = this.$validator

    return {
      type: '',
      dialogVisible: false,
      // 线路设置数据
      tableForm: {
        lineTableData: [
          {
            ...baseTableData
          }
        ]
      },

      form: {
        ...defaultForm
      },

      formRules: {
        port: [
          {
            required: true,
            message: '请输入监听端口',
            trigger: ['change', 'blur']
          },
          {
            validator: isPort(),
            trigger: ['change', 'blur']
          }
        ],
        ip: [
          {
            required: true,
            message: '请输入IP地址',
            trigger: ['change', 'blur']
          },
          {
            validator: isIp(),
            trigger: ['change', 'blur']
          }
        ],
        domain: [
          {
            required: true,
            message: '请输入域名',
            trigger: ['change', 'blur']
          },
          {
            validator: isDomain(),
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  methods: {
    // 展示对话框
    showDialog(type, row) {
      this.dialogVisible = true
      this.type = type
      this.tableForm.lineTableData = [
        {
          ...baseTableData
        }
      ]

      if (type === 'update') {
        this.form = {
          ...defaultForm,
          ...row
        }
        // 线路数据赋值
        this.tableForm.lineTableData = [...row.line]
      }
    },

    // 表单提交
    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.tableFormRef.validate(async (valid2) => {
          if (!valid2) return

          const obj = {
            ...this.form,
            line: this.tableForm.lineTableData
          }

          this.bulk ? this.submitByData(obj) : this.submitByApi(obj)
        })
      })
    },

    // 提交方式一，发起请求
    async submitByApi(postObj = {}) {
      const postArr = [postObj]
      /** 判断是否需要同时添加HTTP
       *  如果添加的协议为 https，同时没有任何 http，
       *  则提示是否同时添加 http的，
       */
      if (!this.isHttp && this.form.protocol === 'https') {
        const confirmResult = await this.$confirm(
          '该站还未设置 http 80 端口监听，是否同时开启 http 80 端口监听？',
          '友情提示',
          {
            confirmButtonText: '立即设置',
            cancelButtonText: '暂不设置',
            type: 'info'
          }
        ).catch((err) => err)

        // 立即设置，追加 http 80
        if (confirmResult === 'confirm') {
          postArr.push({
            ...postObj,
            protocol: 'http',
            s_protocol: 'http',
            port: 80
          })
        }
      }

      this.$refs.dialogRef.btnLoading = true
      try {
        const res = await this.$listeners.saveSiteAttr({
          source_base_info: postArr
        })
        if (!res) return
        this.$listeners.refreshData()
        this.dialogVisible = false
      } finally {
        this.$refs.dialogRef.btnLoading = false
      }
    },

    // 提交方式二，输出数据，用于批量操作
    submitByData(postObj = {}) {
      this.$emit('save', {
        type: this.type,
        data: postObj
      })
      this.dialogVisible = false
      this.$msg.success('操作成功')
    },

    changeSourceSet() {
      this.$refs.tableFormRef.clearValidate()
    },

    // 协议修改，同时改变监听端口， http -> 80, https -> 443
    changeProtocol(val) {
      this.form.port = val === 'http' ? 80 : 443
    },

    // 点击删除线路
    deleteLineItem(row, idx) {
      if (idx === 0) return
      this.tableForm.lineTableData.splice(idx, 1)
    },

    /**
     * @description: 点击新增一行
     */

    addNewRow() {
      this.tableForm.lineTableData.push({
        ...baseTableData
      })
    },

    // 添加DNS表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
