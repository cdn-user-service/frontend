<template>
  <ants-dialog
    v-model="dialogVisible"
    width="700px"
    ref="dialogRef"
    @closed="closed"
    top="5vh"
  >
    <div
      slot="title"
      class="flex items-center pt-xs"
    >
      <span
        class="font-semibold pr-lg"
        style="font-size:15px;"
      >
        {{ antsT(`${isUpdate ? '设置' : '创建'}监控任务`) }}
      </span>

      <template v-if="!loading">
        <!-- <div v-if="isUpdate">
          <span>监控状态：</span>
          <el-switch
            v-model="form.status"
            active-color="#02B340"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="停止"
            :disabled="loading"
            @change="changeStatus"
            v-loading="btnLoading"
            element-loading-spinner="el-icon-loading"
          />
        </div> -->
        <span
          v-if="!isUpdate"
          class="text-warning"
        >
          <i class="el-icon-info"></i>
          该记录还没有创建监控任务！
        </span>
      </template>

    </div>

    <Step3
      class="-mt-df"
      ref="Step3Ref"
      :pForm="form"
      v-loading="loading"
    />

    <template slot="footer">
      <!-- <ants-button
        size="small"
        type="success"
        icon="el-icon-back"
        @click="toAMonitorPage()"
        text="所有监控"
        v-if="isRecordPage"
      /> -->
      <ants-button
        size="small"
        type="info"
        @click="dialogVisible = false"
        icon="el-icon-close"
        text="取 消"
      />

      <ants-button
        size="small"
        type="primary"
        icon="el-icon-check"
        :loading="btnLoading"
        @click="doSave()"
        text="保 存"
      />
    </template>

  </ants-dialog>
</template>

<script>
// 组件
import Step3 from '../FormDialog/Step-3.vue'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  doCreateTask,
  doUpdateTask,
  doToggleTaskStatus,
  getTaskInfo,

  getPollList,
  doCreatePoll
} = require(`@/v2/${PROCESS_NAME}/api/dns/a-monitor`)

const defaultForm = {
  // 记录ID
  rdataId: null,
  id: 0,
  // 状态
  status: 0,

  // 任务类型 http, https, ping, dns
  type: 'http',
  // 协议 TCP = 1, UDP = 2, TCP + UDP = 3
  protocol: 1,
  // 任务名称
  name: '',
  // 监控端口
  port: 80,
  // 监控频率
  rate: 15,
  // 监控规则
  rule: 1,
  ttl: 1,
  // 通知设置： 1 = mail，2 = mobile，mail + mobile = 3
  noticeStatus: 0,
  // 通知邮箱
  mail: '',
  // 通知手机号
  mobile: '',

  // 监控地址
  server_name: '',
  // 路径
  path: '',
  // 请求方法
  method: 'GET',
  // 任务类型为 TCP 或者 UDP时 需要
  ports: ''
}

export default {
  components: {
    Step3
  },
  props: {
    // 是否为记录页面
    isRecordPage: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      dialogVisible: false,
      btnLoading: false,
      loading: false,
      form: {
        ...defaultForm
      },

      // 是否为设置任务
      isUpdate: false,

      // 当前记录有多少个轮询任务
      pollIpCount: 0,
      // 当前记录的记录值
      rdata: ''
    }
  },
  methods: {
    // 对话框显示
    show(row = {}) {
      this.form = {
        ...defaultForm,
        rdataId: row.rdataId,
        server_name: row.server_name
      }
      this.rdata = row.rdata
      this.isUpdate = false
      this.dialogVisible = true
      this.getTaskInfoData(row.rdataId)
    },

    // 可根据任务ID 或者 记录id rdataId 获取任务详情
    async getTaskInfoData(rdataId = 0) {
      if (!rdataId) return
      this.loading = true
      try {
        const { data: res } = await getTaskInfo({
          // 记录的ID
          rdataId
        })
        this.loading = false
        if (res.code !== 1) return
        const obj = res.data || {}
        // 1、如果还没有创建监控任务
        if (!obj.id) {
          this.isUpdate = false
          this.$nextTick(() => {
            this.$refs.Step3Ref.init(this.form)
          })
          return
        }
        this.isUpdate = true

        // 2、如果已经创建监控任务
        const httpParamVo = obj.httpParamVo || {}
        const portScanParamVo = obj.portScanParamVo || {}
        this.form = {
          ...defaultForm,
          ...obj,

          server_name: httpParamVo.server_name,
          path: httpParamVo.path,
          method: httpParamVo.method || 'GET',
          ports: portScanParamVo.ports || ''
        }

        this.$nextTick(() => {
          this.$refs.Step3Ref.init(this.form)
        })
      } catch (error) {
        this.loading = false
        throw error
      }
    },

    // 保存
    doSave() {
      this.$refs.Step3Ref.submit(async (data) => {
        console.log(data)
        if (!data) return
        this.form = {
          ...this.form,
          ...data
        }

        // 发起请求
        this.btnLoading = true
        try {
          // 如果为创建任务
          const requestMethod = this.isUpdate ? doUpdateTask : doCreateTask
          const { data: res } = await requestMethod({
            ...this.form,
            portScanParamVo: {
              ports: this.form.ports
            },
            httpParamVo: {
              server_name: this.form.server_name,
              path: this.form.path,
              method: this.form.method
            }
          })

          this.btnLoading = false
          if (res.code !== 1) return
          // 检查是否需要创建一条轮询任务
          if (!this.isUpdate) {
            this.checkHasPollingList()
            return
          }
          this.afterSave()
        } catch (error) {
          this.btnLoading = false
          throw error
        }
      })
    },

    // 创建监控任务时，检查是否有轮询列表，若没有则默认创建一条
    async checkHasPollingList() {
      this.btnLoading = true
      try {
        const { data: res } = await getPollList({
          rdataId: this.form.rdataId,
          limit: 1,
          page: 1
        })
        if (res.code !== 1) {
          this.btnLoading = false
          return
        }
        const obj = res.data || {}
        // 如果没有轮询列表，则创建一条
        if (!obj.totalCount) {
          try {
            const { data: res2 } = await doCreatePoll({
              rdataId: this.form.rdataId,
              ipTtlList: [this.rdata],
              ttl: 60,
              remark: '默认'
            })
            this.btnLoading = false
            if (res2.code !== 1) return
            this.afterSave()
          } catch (error) {
            this.btnLoading = false
            throw error
          }
        } else {
          this.afterSave()
        }
      } catch (error) {
        this.btnLoading = false
        throw error
      }
    },

    // 保存成功后
    afterSave() {
      this.$msg.success(`${this.isUpdate ? '设置' : '创建'}成功`)
      this.dialogVisible = false
      this.btnLoading = false
      this.$emit('refresh')
    },

    // 表单重置
    closed() {
      this.form = {
        ...defaultForm
      }
      this.loading = false
      this.btnLoading = false
      this.$refs.Step3Ref && this.$refs.Step3Ref.resetForm()
    },

    // 监控状态切换
    async changeStatus(val) {
      if (val === 0) {
        const confirmResult = await this.$confirm(
          '此操作将停止该监控任务，是否继续？',
          '停止监控任务',
          {
            dangerouslyUseHTMLString: true,
            center: true,
            type: 'error'
          }
        ).catch((err) => err)
        if (confirmResult !== 'confirm') {
          this.status = 1
          this.$msg.info('已取消操作')
          return
        }
      }
      this.btnLoading = true
      const { data: res } = await doToggleTaskStatus({
        id: this.form.id,
        status: val
      })
      this.btnLoading = false
      if (res.code !== 1) {
        this.status = val === 1 ? 0 : 1
        return
      }
      this.$msg.success('操作成功')
      this.$emit('refresh')
    },

    toAMonitorPage() {
      this.$router.push('/dns/a-monitor/task')
    }
  }
}
</script>
