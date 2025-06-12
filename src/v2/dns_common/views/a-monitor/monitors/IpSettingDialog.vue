<template>
  <ants-dialog
    v-model="dialogVisible"
    width="900px"
    ref="dialogRef"
    @closed="closed"
    title="管理备用IP"
    @submit="toSave"
    top="5vh"
    submitBtnText="保 存"
    :footer="false"
  >
    <!-- <div class="flex items-center justify-between -mt-sm">
      <div>
        <ants-button
          size="small"
          type="info"
          text="批量删除"
          @click="doBulkDel()"
        />
      </div>
    </div> -->

    <div
      class="border border-ants-border-3 ants-table_form_error ip-setting-table"
    >
      <el-table
        style="margin-top: 0"
        :data="tableData"
        size="mini"
        ref="tableRef"
        @selection-change="handleSelectionChange"
        @select="handleSelect"
        @select-all="handleSelectAll"
        height="341px"
        row-key="rdata"
        v-loading="loading"
        :tree-props="{
          children: 'children',
          hasChildren: 'hasChildren'
        }"
      >
        <el-empty
          slot="empty"
          description="暂无数据"
          style="transform: scale(0.8)"
        />

        <!-- <el-table-column width="45" align="center" type="">
          <template #header>
            <el-checkbox
              v-model="checkAll"
              @change="handleCheckAll"
              :indeterminate="
                selections.length > 0 && selections.length < allIps.length
              "
            >
              <i />
            </el-checkbox>
          </template>

          <template #default="{ row }">
            <el-checkbox-group
              v-model="selections"
              @change="(val) => handleCheck(val, row)"
            >
              <el-checkbox :label="row.rdata">
                <i />
              </el-checkbox>
            </el-checkbox-group>
          </template>
        </el-table-column> -->

        <ants-table-column min-width="80" label="主机记录">
          <template #default="{ row }">
            <span v-if="row.id">
              {{ row.top }}
            </span>
          </template>
        </ants-table-column>

        <ants-table-column min-width="140" label="域名">
          <template #default="{ row }">
            <span v-if="row.id">
              {{ row.domain }}
            </span>
          </template>
        </ants-table-column>
        <ants-table-column min-width="70" label="记录类型">
          <template #default="{ row }">
            <span v-if="row.id">
              {{ row.recordType }}
            </span>
          </template>
        </ants-table-column>

        <ants-table-column min-width="70" label="线路">
          <template #default="{ row }">
            <span v-if="row.id">
              {{ row.recordLineName }}
            </span>
          </template>
        </ants-table-column>

        <ants-table-column width="90" label="TTL">
          <template #default="{ row }">
            <template v-if="row.id">
              <el-input-number
                v-if="row.rdata === updateRdata"
                v-model="tableForm.ttl"
                size="mini"
                :min="60"
                :max="99999999"
                :step="100"
                :controls="false"
                placeholder="TTL"
                style="width: 100%"
              />
              <span v-else>
                {{ row.ttl }}
              </span>
            </template>
          </template>
        </ants-table-column>

        <ants-table-column width="60" prop="pollId" label="主/备">
          <template #default="{ row }">
            <el-tag size="mini" :type="row.id ? 'default' : 'info'">
              {{ row.id ? '主' : '备' }}
            </el-tag>
          </template>
        </ants-table-column>

        <ants-table-column min-width="150" prop="rdata" label="记录值">
          <template #default="{ row }">
            <ants-form
              v-if="row.rdata === updateRdata"
              :model="tableForm"
              :rules="rules"
              ref="tableFormRef"
            >
              <ants-form-item prop="ip" style="padding: 0">
                <ants-input
                  v-model="tableForm.ip"
                  size="mini"
                  placeholder="请输入ip"
                />
              </ants-form-item>
            </ants-form>

            <div v-else>
              {{ row.rdata }}
            </div>
          </template>
        </ants-table-column>

        <ants-table-column width="160" label="操作" fixed align="right">
          <template #default="{ row }">
            <template v-if="row.rdata === updateRdata">
              <ants-button
                size="mini"
                type="primary"
                :loading="btnLoading"
                @click="submitEdit()"
                text="保存"
              />
              <ants-button
                size="mini"
                type="info"
                :disabled="btnLoading"
                @click="cancelUpdate(row)"
                text="取消"
              />
            </template>

            <template v-else>
              <template v-if="row.id">
                <span
                  class="text-success cursor-pointer"
                  @click="toAddIps(row)"
                >
                  {{ antsT('添加') }}</span
                >
                <el-divider direction="vertical" />
              </template>

              <span
                class="text-primary cursor-pointer"
                @click="showUpdateRow(row)"
              >
                {{ antsT('修改') }}</span
              >
              <el-divider direction="vertical" />

              <el-popconfirm
                :title="`确定删除IP：${row.rdata} ？`"
                cancel-button-type="info"
                icon-color="red"
                @confirm="singleDelete(row)"
                placement="bottom-end"
              >
                <span slot="reference" class="text-error cursor-pointer">
                  {{ antsT('删除') }}</span
                >
              </el-popconfirm>
            </template>
          </template>
        </ants-table-column>
      </el-table>
    </div>

    <ants-dialog
      title="添加备用IP"
      v-model="dialogVisibleAdd"
      width="450px"
      @closed="closedAdd"
      @submit="submitAdd"
      ref="dialogAddRef"
    >
      <ants-form
        class="-mt-lg"
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="80px"
        label-position="top"
      >
        <ants-form-item label="输入备用IP，一行一个，不能重复" prop="ips">
          <ants-input
            v-model="form.ips"
            placeholder="一行一个，不能重复。例如：
  10.12.14.16
  28.30.32.34"
            type="textarea"
            :autosize="{ minRows: 6, maxRows: 10 }"
          />
        </ants-form-item>
      </ants-form>
    </ants-dialog>
  </ants-dialog>
</template>

<script>
import { isIp, isDomain } from '@/utils/validate'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getDomainOrRecordList,
  getTaskMonitor,
  defineBackSave
} = require(`@/v2/${PROCESS_NAME}/api/dns/a-monitor`)
// 用于主记录的修改和删除
const { doCreate } = require(`@/v2/${PROCESS_NAME}/api/dns/record`)

export default {
  components: {},

  data() {
    const rules = {
      ips: [
        {
          required: true,
          message: '请输入IP，一行一个',
          trigger: ['change', 'blur']
        },
        {
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
              isOk = isIp(e.trim())
              if (!isOk) {
                callback(new Error(`IP格式错误：${e}`))
                return false
              }

              // 判断是否重复
              nowArr[i] = e.trim() // 将数据存入临时数组
              if (nowArr.indexOf(e.trim()) != i) {
                isOk = false
                callback(new Error(`IP不能重复：${e}`))
              }
              return isOk
            })

            if (isOk) callback()
          },
          trigger: 'blur'
        }
      ],
      ip: [
        {
          required: true,
          message: '请输入IP',
          trigger: ['change', 'blur']
        },
        {
          validator: (rule, value, callback) => {
            if (value === undefined || value === '') return callback()
            if (!isIp(value.trim())) {
              callback(new Error(`IP格式错误：${value}`))
              return
            }
            callback()
          },
          trigger: ['blur']
        }
      ]
    }

    return {
      // 是否为管理端
      isAdmin: PROCESS_NAME === 'dns_admin',
      dialogVisible: false,
      loading: false,

      // 选择的域名数据
      selectArr: [],

      domain: null,
      userId: null,
      allMainList: [],
      defineConf: {},

      // 自定义勾选
      checkAll: false,
      selections: [],
      // 所有的ID
      allRdatas: [],

      // 添加备用IP
      form: {
        id: null,
        ips: ''
      },
      rules,
      dialogVisibleAdd: false,

      // 修改IP
      updateRdata: '',
      tableForm: {
        // 只有主有id
        id: null,
        row: {},
        // 记录ID
        recordId: null,
        ttl: 600,
        // 当前需要修改的ip
        ip: '',
        // 当前记录下所有的备IP，提交的时候需要全部传递
        allBackupIps: []
      },
      btnLoading: false,
      taskId: null
    }
  },
  computed: {
    // 所有的IP，用于去重
    allIps() {
      const ips = []
      this.tableData.forEach((item) => {
        const { rdata, children } = item
        const childrenIps = children.map((i) => i.rdata)
        ips.push(rdata, ...childrenIps)
      })
      return ips
    },

    // 表格数据
    tableData() {
      const arr = []
      this.allMainList.forEach((item) => {
        const children = this.defineConf[item.id] || []
        arr.push({
          ...item,
          recordId: item.id,
          // 主的recordId，修改的时候需要
          recordId2: item.recordId,
          children: children.map((rdata) => {
            return {
              recordId: item.id,
              rdata
            }
          })
        })
      })
      console.log('arr', arr)
      return arr
    }
  },
  created() {},
  methods: {
    // 获取详情数据
    async getDetail() {
      this.loading = true
      try {
        const { data: res } = await getTaskMonitor({
          taskId: this.taskId
        })
        if (res.code !== 1) return
        const obj = res.data || {}
        const { ruleEntity = {} } = obj
        const defaultList = ruleEntity.defaultList || []
        const otherList = ruleEntity.otherList || []
        // 所有的主IP
        this.allMainList = [...defaultList, ...otherList]

        // 所有的备IP
        const defineConfObj = JSON.parse(ruleEntity.defineConf || '{}')
        this.defineConf = {}
        this.allMainList.forEach((item) => {
          const childrenIps = defineConfObj[item.id]

          this.$set(
            this.defineConf,
            item.id,
            childrenIps ? childrenIps.split(',') : []
          )
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * 对话框显示
     * @param {*} defaultList 默认记录
     * @param {*} otherList 备用记录
     * @param {*} domain 域名
     * @param {*} userId 备用记录
     */
    show({
      defaultList = [],
      otherList = [],
      defineConf = '',
      domain = '',
      userId = '',
      taskId = ''
    }) {
      this.dialogVisible = true
      this.taskId = taskId
      this.domain = domain
      this.userId = userId

      this.getDetail()
    },

    handleSelect(selection, row) {
      console.log(selection, row)
    },

    handleSelectAll(selection) {
      console.log('全选', selection)
      // 全部选中
    },

    // 选择
    handleCheck(val = [], row = {}) {
      // 点击父，则勾选所有子
      if (row.id) {
        const childRdatas = this.defineConf[row.id] || []
        // 勾选
        if (this.selections.includes(row.rdata)) {
          this.selections = [...new Set([...this.selections, ...childRdatas])]
        } else {
          childRdatas.forEach((it) => {
            this.selections.splice(this.selections.indexOf(it), 1)
          })
          console.log('this.selections', this.selections)
        }
      }
      this.checkAll = this.selections.length === this.allIps.length
    },

    // 全选
    handleCheckAll(val) {
      this.selections = val ? this.allIps : []
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 批量删除
    async doBulkDel() {
      if (!this.selections.length) {
        return this.$msg.info('请勾选需要删除的数据')
      }

      let sum = 0
      Object.keys(this.defineConf).forEach((key) => {
        const childRdatas = this.defineConf[key] || []

        if (!this.selections.length) return

        this.selections.forEach((it, index) => {
          const idx = childRdatas.indexOf(it)
          if (idx === -1) return
          sum++
          childRdatas.splice(idx, 1)
        })

        this.defineConf[key] = childRdatas
      })

      if (sum > 0) {
        this.$msg.success(`已成功删除 ${sum} 个IP`)
      }
      sum = 0
      this.selections = []
      this.checkAll = false
    },

    // 保存
    toSave() {
      // const defineConf = {}
      // Object.keys(this.defineConf).forEach((key) => {
      //   defineConf[key] = this.defineConf[key] + ''
      // })
      // this.$emit('updateSelfDefine', {
      //   defineConf: JSON.stringify(defineConf)
      // })
      // this.$msg.success('保存成功')
      // this.dialogVisible = false
    },

    // 表单重置
    closed() {
      this.updateRdata = null
    },

    // 添加备用IP
    toAddIps(row) {
      this.dialogVisibleAdd = true
      this.form.id = row.id
    },

    closedAdd() {
      this.form.ips = ''
      this.form.id = null
      this.$refs.formRef.resetFields()
    },

    // 添加备IP
    submitAdd() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        const ipsStr = this.form.ips.trim().replace(/[\r\n]+/g, ',')
        const ipsArr = ipsStr.split(',')

        // 判断是否已存在
        const isExited = ipsArr.some((ip) => {
          if (this.allIps.includes(ip)) {
            this.$msg.error(`已存在IP：${ip}`)
            return true
          }
        })
        if (isExited) return

        this.$refs.dialogAddRef.btnLoading = true
        try {
          const res = await this.doSave('add', this.form.id, ipsArr + '')
          if (!res) return
          this.getDetail()
          this.$msg.success('添加成功')
          this.dialogVisibleAdd = false
        } finally {
          this.$refs.dialogAddRef.btnLoading = false
        }

        // 添加到表格
        // if (!this.defineConf[this.form.id]) {
        //   this.defineConf[this.form.id] = []
        // }
        // this.defineConf[this.form.id].push(...ipsArr)
        // this.$msg.success('添加成功')
        // this.dialogVisibleAdd = false
      })
    },

    // 修改IP ====================
    cancelUpdate() {
      this.updateRdata = null
      this.btnLoading = false
    },

    showUpdateRow(row) {
      this.updateRdata = row.rdata
      this.tableForm.row = { ...row }
      this.tableForm.id = row.id
      this.tableForm.recordId = row.recordId
      this.tableForm.ip = row.rdata
      this.tableForm.ttl = row.ttl || 600
      this.tableForm.allBackupIps = this.defineConf[row.recordId] || []
      this.btnLoading = false
      console.log(this.tableForm)
    },

    // 修改IP提交
    async submitEdit() {
      this.$refs.tableFormRef.validate(async (valid) => {
        if (!valid) return
        const { id, recordId, ip, allBackupIps, row } = this.tableForm

        this.btnLoading = true
        try {
          // 修改主
          if (id) {
            const res = await this.doSaveMain('update', row)
            if (!res) return
          } else {
            // 找当当前修改的IP位置
            const idx = allBackupIps.indexOf(this.updateRdata)
            if (idx === -1) return
            // 修改备
            allBackupIps.splice(idx, 1, ip)

            const res = await this.doSave('save', recordId, allBackupIps + '')
            if (!res) return
          }

          this.updateRdata = null
          this.$msg.success('修改成功')
          this.getDetail()
        } finally {
          this.btnLoading = false
        }
      })
    },

    // 删除IP
    async singleDelete(row) {
      if (this.btnLoading) return
      this.btnLoading = true
      try {
        // 删除主
        if (row.id) {
          const res = await this.doSaveMain('delete', row)
          if (!res) return
        } else {
          // 删除备
          const res = await this.doSave('delete', row.recordId, row.rdata)
          if (!res) return
        }

        this.$msg.success('删除成功')
        this.getDetail()
      } finally {
        this.btnLoading = false
      }
    },

    /**
     * 备IP的增删改
     * @param {*} opName save 更新recordId下所有备IP | add 添加recordId 下的IP | delete 删除recordId 下的IP
     * @param {*} recordId
     * @param {*} ips
     */
    async doSave(opName, recordId, ips) {
      try {
        const { data: res } = await defineBackSave({
          taskId: this.taskId,
          recordId,
          opName,
          ips
        })
        if (res.code !== 1) return false
        return true
      } catch (error) {
        console.log(error)
        return false
      }
    },

    // 主记录的修改删除
    async doSaveMain(operationType, row = {}) {
      try {
        const infoObj =
          operationType === 'delete'
            ? {
                operation_type: 'delete',
                record_type: row.recordType,
                record_id: row.recordId2,
                top: row.top,
                record_line_id: row.recordLineId, // 线路ID
                linetype: row.linetype // 线路类型，1为已有线路，2为自定义线路
              }
            : {
                // 操作类型
                operation_type: 'update',
                // 记录值
                value: this.tableForm.ip,
                // 当前记录ID,添加时为空
                record_id: row.recordId2,
                // 主机记录
                top: row.top,
                // 记录类型
                record_type: row.recordType,
                // 权重
                weight: row.weight + '',
                // mx，记录类型 = MX 才有
                mx: row.mx + '',
                // ttl
                ttl: (this.tableForm.ttl || 600).toString(),
                // tcp, 0为关闭，1为开启
                tcp: row.tcp,

                // 线路code值
                record_line: row.recordLine,
                // 线路ID
                record_line_id: row.recordLineId,
                // 线路名称
                record_line_name: row.recordLineName,
                // 线路类型，1为已有线路，2为自定义线路
                linetype: row.linetype,
                // 线路绑定值，用于回显
                line: {
                  record_line: row.recordLine,
                  record_line_id: row.recordLineId,
                  record_line_name: row.recordLineName,
                  linetype: row.linetype
                }
              }

        const { data: res } = await doCreate({
          // 域名ID
          id: row.domainId,
          domain: row.domain,
          info: this.isAdmin ? infoObj : JSON.stringify(infoObj)
        })
        if (res.code !== 1) return false
        return true
      } catch (err) {
        console.log(err)
        return false
      }
    }
  }
}
</script>

<style lang="scss">
.ip-setting-table {
  .cell .el-input__inner {
    padding-left: 8px;
    padding-right: 8px;
  }
}
</style>
