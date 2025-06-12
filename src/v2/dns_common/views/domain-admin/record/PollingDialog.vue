<template>
  <ants-dialog
    title="轮询管理"
    v-model="dialogVisible"
    width="1200px"
    ref="dialogRef"
    @closed="closed"
    top="5vh"
    class="polling-dialog"
  >
    <div
      slot="title"
      class="flex items-center pt-xs"
    >
      <span
        class="font-semibold pr-lg"
        style="font-size:15px;"
      >
        {{ antsT('轮询管理') }}
      </span>

      <span>切换模式：</span>
      <el-radio-group
        v-model="ipsStatus"
        class="mr-lg"
        @change="changeStatus"
        :disabled="loading"
      >
        <el-radio
          v-for="(item, key) in ruleList"
          :key="key"
          :label="+key"
        >{{ item }}</el-radio>
      </el-radio-group>
    </div>

    <div class="flex items-center justify-between -mt-sm">
      <div class="space-x-df">
        <ants-button
          type="primary"
          size="mini"
          :text="`添加轮询${recordTypeInfo.name}`"
          icon="el-icon-plus"
          :disabled="btnLoading || loading"
          @click="toAdd()"
        />
        <ants-button
          type="info"
          size="mini"
          text="批量删除"
          :loading="btnLoading"
          :disabled="loading"
          icon="el-icon-delete"
          @click="doBatchDel()"
        />

        <!-- <span>开启轮询</span>
        <el-switch
          v-model="form.ipsStatus"
          active-color="#13ce66"
          inactive-color="#DCDFE6"
          :active-value="1"
          :inactive-value="0"
          @change="changeStatus"
        /> -->

      </div>

      <el-input
        class="ants-search_input"
        clearable
        :placeholder="`检索${recordTypeInfo.name}`"
        size="small"
        @change="toQuery()"
        v-model="query.key"
      >
        <i
          slot="prefix"
          class="el-input__icon aicon icon-sousuo"
          @click="toQuery()"
        ></i>
      </el-input>
    </div>
    <el-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      class="table-form"
      style="min-height:400px;"
    >
      <el-table
        style="margin-top:10px;"
        :data="tableData"
        size="mini"
        row-key="id"
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
        <el-empty slot="empty" />

        <ants-table-column
          type="selection"
          align="center"
          width="45"
        ></ants-table-column>

        <ants-table-column
          min-width="150"
          :label="`轮询${recordTypeInfo.name}`"
          prop="ipTtlList"
        >
          <template #default="{ row }">
            <div v-if="form.id === row.id">
              <!-- 添加 -->
              <el-form-item
                v-if="form.id === 'add'"
                prop="ipTtlList"
                style="margin:0;"
              >
                <ants-input
                  v-model="form.ipTtlList"
                  type="textarea"
                  :autosize="{ minRows: 4, maxRows: 10 }"
                  :placeholder="recordTypeInfo.placeholder"
                />
              </el-form-item>

              <!-- 修改 -->
              <el-form-item
                v-else
                prop="ip"
                style="margin:0;"
              >
                <ants-input
                  size="small"
                  v-model="form.ip"
                  :placeholder="`请输入${recordTypeInfo.ruleName}`"
                />
              </el-form-item>
            </div>

            <span v-else>
              {{ row.ip }}
            </span>
          </template>
        </ants-table-column>

        <ants-table-column
          width="150"
          label="轮询时间（秒）"
          prop="ttl"
        >
          <template #default="{ row }">
            <el-form-item
              v-if="form.id === row.id"
              prop="ttl"
              style="margin:0;"
            >
              <ants-input-number
                size="small"
                v-model="form.ttl"
                :min="1"
                :max="9999"
              />
            </el-form-item>

            <span v-else>
              {{ row.ttl }} 秒
            </span>
          </template>
        </ants-table-column>

        <ants-table-column
          width="150"
          label="优先级"
          prop="weight"
        >
          <template #default="{ row }">
            <div v-if="form.id != 'add'">
              <el-form-item
                v-if="form.id === row.id"
                prop="weight"
                style="margin:0;"
              >
                <ants-input-number
                  size="small"
                  v-model="form.weight"
                  :min="0"
                  :max="9999"
                />
              </el-form-item>

              <span v-else>
                {{ row.weight }}
              </span>
            </div>

          </template>
        </ants-table-column>

        <ants-table-column
          width="150"
          label="备注"
          prop="remark"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <div v-if="form.id != 'add'">
              <el-form-item
                v-if="form.id === row.id"
                prop="remark"
                style="margin:0;"
              >
                <ants-input
                  size="small"
                  v-model="form.remark"
                  placeholder="请输入备注"
                />
              </el-form-item>

              <span v-else>
                {{ row.remark || '-' }}
              </span>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column
          width="100"
          label="响应时间"
          prop="time"
        >
          <template #default="{ row }">
            <div v-if="form.id != 'add'">
              {{ (slaveObj[row.ip] || {}).time || '-' }}
            </div>
          </template>
        </ants-table-column>

        <ants-table-column
          width="60"
          label="状态"
          prop="status"
        >
          <template #default="{ row }">
            <div v-if="form.id != 'add'">
              <span
                class="el-icon-success text-success"
                v-if="(slaveObj[row.ip] || {}).count > 0"
              > 正常</span>
              <span
                v-else
                class="el-icon-error text-error"
              > 离线</span>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column
          width="160"
          label="操作"
          align="right"
        >
          <template #default="{ row }">
            <span v-if="form.id === row.id">
              <ants-button
                type="primary"
                size="mini"
                text="保存"
                :loading="btnLoading"
                @click="doSave(row)"
              />
              <ants-button
                type="info"
                size="mini"
                text="取消"
                @click="doCancel(row)"
              />
            </span>
            <span v-else>
              <span
                class="text-primary cursor-pointer"
                @click="toEdit(row)"
              >
                修改
              </span>
              <el-divider direction="vertical"></el-divider>
              <span
                class="text-error cursor-pointer"
                @click="toDel(row)"
              >
                删除
              </span>
            </span>
          </template>
        </ants-table-column>
      </el-table>
      <el-pagination
        class="ants-pagination"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        small
        :page-sizes="[10, 20, 30, 40, 50, 100, 200]"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :page-size="query.limit"
        :current-page="query.page"
      />

    </el-form>

    <template slot="footer">
      <span></span>
    </template>
  </ants-dialog>
</template>

<script>
// 验证规则
import { isIpv4, isIpv6, isDomain } from '@/utils/validate'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getPollList,
  doCreatePoll,
  doUpdatePoll,
  doDelPoll,
  changePollStatus,
  doUpdateTask
} = require(`@/v2/${PROCESS_NAME}/api/dns/a-monitor`)

const defaultForm = {
  recordId: 0,
  id: 0,
  // 用户ID
  ttl: 60,
  // ip数组
  ipTtlList: '',
  // 单个IP
  ip: '',
  // 优先级
  weight: 0,
  // 备注
  remark: '',
  status: 1
}
const ruleList = {
  0: '关闭切换',
  1: '定时轮询',
  2: '优先级切换'
}

const recordTypeObj = {
  CNAME: {
    placeholder: `一行一个，格式：域名,间隔(秒)。例如：
domain1.com,30
domain2,60`,
    name: '记录',
    ruleName: '域名',
    rule: isDomain
  },
  A: {
    placeholder: `一行一个，格式：Ipv4,间隔(秒)。例如：
10.12.14.16,30
28.30.32.34,60`,
    name: 'IP',
    ruleName: 'Ipv4地址',
    rule: isIpv4
  },
  AAAA: {
    placeholder: `一行一个，格式：Ipv6,间隔(秒)。例如：
2001:DB8:0:23:8:800:200C:417A,30
0:0:0:0:0:0:0:1,60`,
    name: 'IP',
    ruleName: 'Ipv6地址',
    rule: isIpv6
  }
}

export default {
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',

      dialogVisible: false,
      ruleList,
      loading: false,
      btnLoading: false,
      ipsStatus: 0,
      tableData: [],
      selectArr: [],
      total: 0,
      query: {
        // 记录ID
        rdataId: '',
        key: '',
        limit: 20,
        page: 1
      },

      form: {
        ...defaultForm
      },

      // 当前的记录类型，用于判断IP的格式：A记录->IP格式为IPV4，AAAA记录->IP格式为IPV6
      recordTypeInfo: {},
      // 当前记录对应的 监控信息，用于修改轮询状态！！！
      recordTask: {},

      // 新增或者删除之后，关闭对话框需要刷新列表
      isRefresh: false,

      // IP对象，包含ip的状态和响应时间
      slaveObj: {}
    }
  },
  computed: {
    // 验证规则
    formRules() {
      return {
        ttl: [
          {
            required: true,
            message: '请输入轮询间隔',
            trigger: ['change', 'blur']
          }
        ],
        ip: [
          {
            required: true,
            message: `请输入${this.recordTypeInfo.ruleName}`,
            trigger: ['change', 'blur']
          },
          {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (this.recordTypeInfo.rule(value)) return callback()
              callback(new Error(`${this.recordTypeInfo.ruleName}格式错误`))
            }
          }
        ],
        ipTtlList: [
          {
            required: true,
            message: '请输入轮询IP，一行一个',
            trigger: ['change', 'blur']
          },
          {
            validator: (rule, value, callback) => {
              if (value === undefined || value === '') return callback()
              // 将数据拆分成一行一个
              const newArr = (value || '').trim().split(/[\r\n]+/)
              // 是否正确的格式
              let isOk = false
              // 临时数组，用于判读IP是否重复
              const nowArr = []

              // 遍历IP数组
              newArr.every((item, idx) => {
                const itemTrim = item.trim()
                const itemArr = itemTrim.split(',')
                isOk = this.recordTypeInfo.rule(itemArr[0])

                if (!isOk) {
                  callback(
                    new Error(
                      `${this.recordTypeInfo.ruleName}格式错误：${itemTrim}`
                    )
                  )
                  return isOk
                }

                // 判断IP是否重复，如果当前IP在数组中第一次出现的位置不是 i，则认为该IP重复
                nowArr[idx] = itemArr[0] // 将数据存入临时数组
                if (nowArr.indexOf(itemArr[0]) != idx) {
                  isOk = false
                  callback(new Error('IP不能重复：' + itemTrim))
                }
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
    // 对话框显示
    show(row = {}) {
      console.log(row)
      this.recordTypeInfo = recordTypeObj[row.record_type]
      if (!this.recordTypeInfo) {
        this.$msg.error('仅 A、AAAA、CNAME 记录支持轮询')
        return
      }
      this.dialogVisible = true
      this.query.rdataId = row.id
      this.getTableData()
      this.slaveObj = {}
    },

    // 获取表格数据
    async getTableData() {
      this.loading = true
      try {
        const { data: res } = await getPollList(this.query)
        this.loading = false
        if (res.code !== 1) return
        const obj = res.data || {}
        // 当前任务的数据
        const taskObj = res.task || {}
        const taskCallBackInfo = taskObj.callBackInfo || {}
        // IP的状态
        const SlaveArr = taskCallBackInfo.Slave || []
        // IP响应时间
        const SlaveQueryTimeArr = taskCallBackInfo.SlaveQueryTime || []
        const slaveObj = {}
        SlaveArr.forEach((item, idx) => {
          if (item.Slave) {
            slaveObj[item.Slave] = {
              count: item.Count || 0,
              time: SlaveQueryTimeArr[idx] || '-'
            }
          }
        })

        this.slaveObj = slaveObj
        console.log('slaveObj', slaveObj)

        this.tableData = obj.list || []
        this.total = obj.totalCount || 0

        // 监控任务，用于修改轮询状态
        this.recordTask = res.task || {}
        // 轮询状态
        // this.ipsStatus = res.status || 0
        this.ipsStatus = this.recordTask.rule || 0
      } catch (error) {
        this.loading = false
        throw error
      }
    },

    // 查询
    toQuery() {
      this.query.page = 1
      this.getTableData()
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 前往添加
    toAdd() {
      if (this.form.id === 'add') return
      this.form = {
        ...defaultForm,
        id: 'add'
      }
      this.tableData.unshift({
        ...defaultForm,
        id: 'add'
      })
    },

    // 前往修改
    toEdit(row = {}) {
      if (this.form.id === 'add') {
        this.tableData.shift()
      }
      this.form = {
        ...row,
        id: row.id
      }
    },

    // 批量添加提交
    async doAdd() {
      this.btnLoading = true
      try {
        const { ipTtlList, ttl } = this.form
        const { data: res } = await doCreatePoll({
          rdataId: this.query.rdataId,
          ipTtlList: ipTtlList
            .trim()
            .replace(/[\r\n]+/g, '|')
            .split('|'),
          ttl
        })
        this.btnLoading = false
        if (res.code !== 1) return
        this.$msg.success('添加成功')
        this.form.id = null
        this.tableData.shift()
        this.toQuery()
        this.isRefresh = true
      } catch (error) {
        this.btnLoading = false
        throw error
      }
    },

    // 修改提交
    async doEdit() {
      this.btnLoading = true
      try {
        const { ip, ttl, weight, remark, status, id } = this.form
        const { data: res } = await doUpdatePoll({
          id,
          rdataId: this.query.rdataId,
          ip,
          ttl,
          weight,
          remark,
          status
        })
        this.btnLoading = false

        if (res.code !== 1) return
        this.$msg.success('修改成功')
        this.form.id = null
        this.toQuery()
      } catch (error) {
        this.btnLoading = false
        throw error
      }
    },

    // 执行保存
    doSave() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        if (this.form.id === 'add') {
          this.doAdd()
        } else {
          this.doEdit()
        }
      })
    },

    // 取消
    doCancel() {
      if (this.form.id === 'add') {
        this.tableData.shift()
      }
      this.form.id = null
    },

    // 前往删除
    async toDel(row) {
      const result = await this.$doDelete({
        name: row.ip,
        tag: '轮询IP'
      })
      if (!result) return
      const { data: res } = await doDelPoll({
        ids: row.id
      })
      if (res.code !== 1) return
      this.$msg.success('删除成功')
      this.toQuery()
      this.isRefresh = true
    },

    // 批量删除
    async doBatchDel() {
      const selectLength = this.selectArr.length
      const result = await this.$batchDelete(selectLength, {
        tag: '轮询IP'
      })
      if (!result) return

      this.btnLoading = true

      try {
        const { data: res } = await doDelPoll({
          ids: this.selectArr.map((item) => item.id) + ''
        })
        this.btnLoading = false
        if (res.code !== 1) return
        this.$msg.success('删除成功')
        this.toQuery()
        this.selectArr = []
        this.isRefresh = true
      } catch (error) {
        this.btnLoading = false
        throw error
      }
    },

    // 关闭-开启轮询
    async _changeStatus(val) {
      this.loading = true
      try {
        const { data: res } = await changePollStatus({
          rdataId: this.query.rdataId,
          status: val
        })
        this.loading = false
        if (res.code !== 1) return
        this.$msg.success('操作成功')
      } catch (error) {
        this.loading = false
        console.warn(error)
      }
    },
    async changeStatus(val) {
      this.loading = true
      try {
        const { data: res } = await doUpdateTask({
          ...this.recordTask,
          rule: val
        })
        this.loading = false
        if (res.code !== 1) return
        this.$msg.success('操作成功')
        this.isRefresh = true
      } catch (error) {
        this.loading = false
        console.warn(error)
      }
    },

    // 监听pagesize 改变事件
    handleSizeChange(newSize) {
      this.query.limit = newSize
      this.getTableData()
    },

    // 监听 页码值 改变事件
    handleCurrentChange(newPage) {
      this.query.page = newPage
      this.getTableData()
    },

    // 表单重置
    closed() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
      this.tableData = []
      this.selectArr = []
      if (this.isRefresh) {
        this.$emit('refresh')
        this.isRefresh = false
      }
    }
  }
}
</script>

<style lang="scss">
.polling-dialog {
  .table-form {
    .cell {
      overflow: visible;
    }
    .el-form-item__content {
      line-height: 32px;
    }
    .el-form-item {
      margin: 0;
    }
    .el-form-item__error {
      white-space: nowrap;
      top: -44px;
      left: 50%;
      transform: translateX(-50%);
      -ms-transform: translateX(-50%);
      -moz-transform: translateX(-50%);
      -webkit-transform: translateX(-50%);
      -o-transform: translateX(-50%);
      padding: 12px;
      border-radius: 4px;
      background-color: theme('colors.ants-bg-5');
      text-align: center;
      font-size: 14px;
      z-index: 9;
    }
    .el-form-item__error::before {
      content: '';
      position: absolute;
      top: 38px;
      left: 50%;
      margin-left: -8px;
      border: 8px solid rgba(0, 0, 0, 0);
      border-top-color: theme('colors.ants-bg-5');
    }
  }
  .el-table__body-wrapper {
    padding-top: 50px;
    margin-top: -50px;
  }
}
</style>
