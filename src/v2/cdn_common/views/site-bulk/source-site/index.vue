<template>
  <div class="-mt-df">
    <div class="mt-10">
      <span class="mr-5"><strong>操作类型</strong></span>
      <span>
        <ants-radio-group v-model="form.type">
          <ants-radio label="edit" text="批量修改" />
          <ants-radio label="add" text="批量添加" /> </ants-radio-group
      ></span>
    </div>
    <div v-if="form.type === 'edit'">
      <CheckCards ref="CheckCardsRef" hide-check :cards="cards">
        <template #content="{ card }">
          <template v-if="card === 'source_base_info'">
            <div class="text-ants-text-4">
              <strong>格式：源站地址 : 端口(选填)</strong>
              <div class="my-sm">格式一：只替换源站地址【2.2.2.2】</div>
              <div>格式二：同时替换源站地址和端口【2.2.2.2:80】</div>
            </div>
            <ants-form
              size="medium"
              :model="form"
              :rules="rules"
              ref="formRef"
              label-width="90px"
              label-position="top"
              :status-icon="true"
              class="ants-table_form_error"
              style="max-width: 550px"
            >
              <el-table :data="form.tableData" size="small" border>
                <ants-table-column
                  label="被替换源站"
                  min-width="250"
                  align="center"
                >
                  <template #header>
                    被替换源站 【
                    <span class="text-primary">
                      {{ findSum || 0 }}
                    </span>
                    】
                  </template>

                  <template #default="{ row, $index }">
                    <div class="flex items-center pt-2">
                      <ants-form-item
                        :prop="`tableData.${$index}.ipOld`"
                        :rules="rules.ipOld"
                        class="flex-1"
                      >
                        <ants-input
                          placeholder="源站地址 : 端口(选填)"
                          v-model.trim="row.ipOld"
                          @blur="handleBlur(row)"
                        >
                          <i
                            v-show="loading"
                            slot="suffix"
                            class="el-icon-loading"
                          />
                        </ants-input>
                      </ants-form-item>
                    </div>
                  </template>
                </ants-table-column>
                <ants-table-column
                  label="替换后的源站"
                  min-width="250"
                  align="center"
                >
                  <template #default="{ row, $index }">
                    <div class="flex items-center pt-2">
                      <ants-form-item
                        :prop="`tableData.${$index}.ipNew`"
                        :rules="rules.ipNew"
                        class="flex-1"
                      >
                        <ants-input
                          placeholder="源站地址 : 端口(选填)"
                          v-model.trim="row.ipNew"
                        />
                      </ants-form-item>
                    </div>
                  </template>
                </ants-table-column>
              </el-table>

              <div class="">
                <ants-button
                  :disabled="$root.disabledCrud"
                  type="primary"
                  size="medium"
                  text="批量修改"
                  :loading="btnLoading"
                  @click="doSave()"
                />
              </div>
            </ants-form>
          </template>
        </template>
      </CheckCards>
    </div>
    <div v-else>
      <CheckCards ref="CheckCardsRef" hide-check :cards="addCards">
        <template #content="{ card }">
          <template v-if="card === 'source_base_info'">
            <ants-form
              :model="form"
              :rules="formRules"
              space-class="space-y-6"
              ref="formRef"
              label-width="130px"
            >
              <ants-form-item label="选择域名" prop="siteIds">
                <SelectDomain
                  v-model="form.siteIds"
                  value-key="id"
                  multiple
                  width="320px"
                  size="medium"
                />
              </ants-form-item>
              <ants-form-item
                label="协议类型"
                required
                prop="protocol"
                style="margin: 0"
              >
                <ants-radio-group
                  v-model="form.protocol"
                  @change="changeProtocol"
                >
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
                </ants-radio-group>
              </ants-form-item>

              <ants-form-item label="回源设置" required prop="source_set">
                <ants-radio-group
                  v-model="form.source_set"
                  @change="changeSourceSet"
                >
                  <ants-radio label="ip" text="回源到IP" />
                  <ants-radio label="domain" text="回源到域名" />
                </ants-radio-group>
              </ants-form-item>

              <ants-form-item
                label="线路设置"
                required
                class="ants-table_form_error"
              >
                <ants-form
                  :model="tableForm"
                  :rules="formRules"
                  ref="tableFormRef"
                  style="width: 700px"
                >
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
                <div class="text-center pt-df" style="width: 700px">
                  <span
                    class="text-primary el-icon-plus cursor-pointer"
                    @click="addNewRow"
                  >
                    {{ antsT('新增一行') }}</span
                  >
                </div>
              </ants-form-item>
              <div class="">
                <ants-button
                  :disabled="$root.disabledCrud"
                  type="primary"
                  size="medium"
                  text="批量添加"
                  :loading="btnLoading"
                  @click="submitForm()"
                />
              </div>
            </ants-form>
          </template>
        </template>
      </CheckCards>
    </div>
  </div>
</template>

<script>
import CheckCards from '../CheckCards'
import { isIp, isDomain, isPort } from '@/utils/validate'
import SelectDomain from '../SelectDomain.vue'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doBulkSearchSiteAttr } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)
const { doBulkAddSiteAttr } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

const cards = {
  source_base_info: {
    title: '源站设置',
    info: '指定回源地址和监听端口，支持回源到IP及域名。',
    tips: {
      list: [
        '1.http 协议默认开 80、8080 端口，https 协议默认开 443、8443 端口，不可更改使用，开通TCP安全加速可支持其他端口；',
        '2.回源到 IP 请填写服务器 IP 地址，回源到域名请填写对应域名；',
        '3.使用HTTPS协议请上传 SSL&TLS 并开启 HTTPS，否则将影响站点正常访问；',
        '4.不支持端口：21, 22, 23, 25, 68, 135, 139, 445, 593, 873, 1068, 1111, 1434, 1871, 2121, 3208, 4331, 4334, 4444, 4510, 4557, 5152, 5153, 5154, 5554, 5800, 5900, 9995, 9996, 45050, 45060, 65432, 65050, 64150, 64151, 61081, 10050, 32767, 10022。'
      ]
    }
  }
}

const addCards = {
  source_base_info: {
    title: '添加源站',
    info: '指定回源地址和监听端口，支持回源到IP及域名。',
    tips: {
      list: [
        '1. 节点取源时所用协议和客户端访问协议保持一致，源站需要同时支持 80 和 443 端口，否则有可能造成节点取源失败；',
        '2. 批量新增源站时，多个监听端口请用英文输入法下逗号分开，这时回源端口将与监听端口保持一致；',
        '3. 取源协议为协议跟随时，回源端口将与监听端口保持一致；',
        '4. 线路配置优先级：主线路 > 备线路，同一线路类型下，优先级等级越高，则权重越大。'
      ]
    }
  }
}

// 线路表格初始化数据
const baseTableData = {
  ip: '',
  domain: '',
  port: '',
  line: 1,
  weight: 1
}

const defaultForm = {
  ipOld: '',
  ipNew: '',
  type: 'edit',
  id: 0,
  protocol: 'http',
  port: 80,
  s_protocol: 'http',
  upstream: 'polling',
  source_set: 'ip',
  siteIds: null
}

export default {
  components: {
    CheckCards,
    SelectDomain
  },
  props: {
    siteIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      cards,
      addCards,
      btnLoading: false,
      loading: false,
      findSum: 0,
      form: {
        ...defaultForm,
        tableData: [
          {
            ...defaultForm
          }
        ]
      },
      // 线路设置数据
      tableForm: {
        lineTableData: [
          {
            ...baseTableData
          }
        ]
      },

      formRules: {
        port: [
          {
            required: true,
            message: '请输入监听端口',
            trigger: ['change', 'blur']
          }
          // {
          //   validator: isPort(),
          //   trigger: ['change', 'blur']
          // }
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
        ],
        siteIds: [
          {
            required: true,
            message: '请选择域名',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  watch: {},
  computed: {
    rules() {
      const checkIp = (rule, value, callback, isQuery = false) => {
        if (value === '' || value === undefined) return callback()
        // 拆分 IP:PORT
        const arr = value.trim().split(':')
        const [ip, port] = arr
        const len = arr.length

        if (len > 2) {
          return callback(new Error('格式错误，请输入源站地址：端口（选填）'))
        }
        if (ip == '') {
          return callback(new Error('请输入源站地址'))
        }

        // 只有源站地址
        if (!isIp(ip) && !isDomain(ip)) {
          return callback(new Error('源站地址格式错误'))
        }

        let key = 'b_source_ip'
        // 源站地址和端口都有
        if (len === 2) {
          if (!isPort(port)) {
            return callback(new Error('端口号格式错误'))
          }
          key = 'b_source_ip_port'
        }

        // 检索有多少个站点
        if (isQuery) {
          this.querySum(value.trim(), key)
        }
        return callback()
      }
      return {
        ipOld: [
          {
            required: true,
            message: '请输入源站地址',
            trigger: ['blur', 'change']
          },
          {
            validator: (rule, value, callback) => {
              return checkIp(rule, value, callback, true)
            },
            trigger: 'blur'
          }
        ],
        ipNew: [
          {
            required: true,
            message: '请输入新的源站地址',
            trigger: ['blur', 'change']
          },
          {
            validator: (rule, value, callback) => {
              return checkIp(rule, value, callback, false)
            },
            trigger: 'blur'
          },
          {
            validator: (rule, value, callback) => {
              const { tableData } = this.form
              // 如果跟旧的格式不一致
              const oldIdx = tableData[0].ipOld.indexOf(':')
              const newIdx = value.indexOf(':')

              // 旧的不包含端口
              if (oldIdx === -1) {
                if (newIdx !== -1) {
                  return callback(new Error('新的源站地址不需要端口号'))
                }
              }

              // 旧的包含端口
              if (oldIdx !== -1) {
                if (newIdx === -1) {
                  return callback(new Error('新的源站地址需要端口号'))
                }
              }
              return callback()
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {},
  methods: {
    // 查询有多少条数据
    async querySum(sValue = '', key = 'b_source_ip') {
      if (!sValue) return
      this.loading = true
      try {
        const { data: res } = await doBulkSearchSiteAttr({
          // 值为1是不修改，只返回搜索到的结果数
          test: 1,
          siteIds: 'all',
          key,
          // 搜索值
          s_value: sValue,
          // 修改值
          t_value: ''
        })
        if (res.code !== 1) return
        this.findSum = res.findSum || 0
      } finally {
        this.loading = false
      }
    },

    async doSave() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        console.log(this.form)
        const { ipOld, ipNew } = this.form.tableData[0]

        this.btnLoading = true
        try {
          const { data: res } = await doBulkSearchSiteAttr({
            // 值为1是不修改，只返回搜索到的结果数
            test: 0,
            siteIds: 'all',
            key: ipNew.indexOf(':') === -1 ? 'b_source_ip' : 'b_source_ip_port',
            // 搜索值
            s_value: ipOld,
            // 修改值
            t_value: ipNew
          })
          if (res.code !== 1) return
          this.$alert(
            `已成功修改源站配置【${res.findSum || 0}】个`,
            '操作成功',
            {
              center: true,
              type: 'success',
              callback: (action) => {
                this.doReset()
              }
            }
          ).catch((err) => err)
        } finally {
          this.btnLoading = false
        }
      })
    },

    handleBlur(row) {
      if (!row.ipOld) {
        this.findSum = 0
      }
    },

    doReset() {
      this.form.tableData = [
        {
          ...defaultForm
        }
      ]
      this.findSum = 0
      this.loading = false
      this.$refs.formRef.resetFields()
    },

    // 批量添加

    // 表单提交
    async submitForm() {
      this.btnLoading = true

      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.tableFormRef.validate(async (valid2) => {
          if (!valid2) return

          const obj = {
            ...this.form,
            line: this.tableForm.lineTableData
          }
          this.submitByData(obj)

          // this.bulk ? this.submitByData(obj) : this.submitByApi(obj)
        })
      })
    },
    // 提交方式二，输出数据，用于批量操作
    async submitByData(postObj = {}) {
      try {
        // 检查 postObj 是否包含必要的属性
        if (
          !postObj ||
          !Array.isArray(postObj.siteIds) ||
          postObj.siteIds.length === 0
        ) {
          this.$msg.error('请提供有效的站点ID')
          this.btnLoading = false
          return
        }

        console.log('postObj', postObj) // 生产环境中应移除此行

        const { data: res } = await doBulkAddSiteAttr({
          siteIds: postObj.siteIds.join(','),
          key: 'source_base_info',
          value: [postObj]
        })

        if (res.code !== 1) {
          this.$msg.error(res.msg)
          this.btnLoading = false
          return
        }

        this.$msg.success('批量添加成功')
        this.btnLoading = false
      } catch (error) {
        // console.error('提交失败:', error)
        this.$msg.error('提交失败，请稍后再试')
        this.btnLoading = false
      }
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
        ...defaultForm,
        type: this.form.type
      }
      this.tableForm.lineTableData = [
        {
          ...baseTableData
        }
      ]
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
