<template>
  <ants-dialog
    v-model="dialogVisible"
    width="700px"
    ref="dialogRef"
    @closed="closed"
    title="监控设置"
    @submit="doSave"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="110px"
      :status-icon="false"
    >
      <ants-form-item label="任务类型" prop="monitorType">
        <el-radio-group v-model="form.monitorType" size="small">
          <el-radio-button
            v-for="(item, key) in typeList"
            :key="key"
            :label="+key"
            >{{ item }}</el-radio-button
          >
        </el-radio-group>
      </ants-form-item>

      <!-- <ants-form-item label="任务名称" prop="name">
            <ants-input
              v-model="form.name"
              placeholder="请输入任务名称"
              maxlength="30"
              show-word-limit
            />
          </ants-form-item> -->

      <ants-form-item
        label="监控地址"
        prop="httpServerName"
        v-if="form.monitorType == 1 || form.monitorType == 2"
      >
        <!-- prop="path" -->
        <ants-input
          v-model="form.httpPath"
          placeholder="路径"
          class="input-with-select"
        >
          <div slot="prepend" class="flex items-center">
            <el-select
              v-model="form.httpMethod"
              placeholder="请求方法"
              class="border-r border-ants-border-2"
              style="width: 100px; margin-right: 0px"
            >
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
              <el-option label="HEAD" value="HEAD" />
            </el-select>
            <el-input
              v-model="form.httpServerName"
              placeholder="Server Name"
              class="sever-name-input"
              style="width: 160px"
              size="small"
            />
          </div>
        </ants-input>
      </ants-form-item>

      <ants-form-item
        label="监控端口"
        prop="tcpUdpPorts"
        v-if="[3, 4].includes(form.monitorType)"
      >
        <ants-input
          v-model="form.tcpUdpPorts"
          placeholder="多个端口用“|”分隔。例：80|81|82|83"
        />
      </ants-form-item>
      <ants-form-item
        label="监控端口"
        prop="httpPort"
        v-else-if="[1, 2].includes(form.monitorType)"
      >
        <ants-input v-model="form.httpPort" placeholder="请输入监控端口" />
      </ants-form-item>

      <ants-form-item label="监控频率" prop="frequency">
        <el-radio-group v-model="form.frequency">
          <el-radio v-for="(item, key) in rateObj" :key="key" :label="+key">{{
            item
          }}</el-radio>
        </el-radio-group>
      </ants-form-item>

      <ants-form-item label="响应超时" prop="timeoutThreshold">
        <ants-input-number
          v-model="form.timeoutThreshold"
          size="small"
          :precision="0"
          :min="1"
          :max="86400"
          placeholder="响应超时"
          class="mr-2"
        />
        <span class="">ms</span>
        <span class="text-ants-text-4 text-sm"
          >（超过 {{ form.timeoutThreshold }}ms 视为节点下线）</span
        >
      </ants-form-item>

      <div class="bg-ants-bg-5 p-df rounded-2xl space-y-df">
        <!-- <TitleBorder title="切换规则" /> -->

        <ants-form-item
          label="切换规则"
          label-width="95px"
          prop="ruleEntity.taskMode"
        >
          <div class="font-semibold mb-sm">当域名记录无法访问时：</div>
          <ants-radio-group
            v-model="form.ruleEntity.taskMode"
            size="small"
            class="space-y-df"
          >
            <ants-radio
              class="block"
              v-for="(item, key) in {
                'no-change': '不对该域名记录做任何修改（不切换）',
                'smart-stop': '停止解析该域名记录（智能暂停）',
                'smart-change': '切换到其他可用IP（智能切换）'
              }"
              :key="key"
              :label="key"
              :text="item"
            />

            <el-radio label="self-define">
              切换到您设置的备用IP（自定义切换）
              <span class="inline-block">
                <ants-button
                  size="mini"
                  type="primary"
                  plain
                  text="管理备用IP"
                  @click="toIpSetting()"
                />
                <IpSettingDialog
                  ref="IpSettingDialogRefs"
                  @updateSelfDefine="updateSelfDefine"
                />
              </span>
            </el-radio>
          </ants-radio-group>
        </ants-form-item>
      </div>
    </ants-form>
  </ants-dialog>
</template>

<script>
import IpSettingDialog from './IpSettingDialog'
// API
const PROCESS_NAME = process.env.VUE_APP_NAME

const {
  getTaskMonitor,
  saveTaskMonitor
} = require(`@/v2/${PROCESS_NAME}/api/dns/a-monitor`)

const defaultForm = {
  // 任务ID
  taskId: null,
  id: 0,
  userId: null,
  // 状态
  status: 0,
  // 任务名称
  name: '',

  // 任务类型 http, https, ping, dns
  monitorType: 1,
  // 协议 TCP = 1, UDP = 2, TCP + UDP = 3
  httpProtocol: 1,
  // 监控端口
  httpPort: 80,
  // 请求方法
  httpMethod: 'TCP',
  // 监控地址
  httpServerName: '',
  // 路径
  httpPath: '',
  // 任务类型为 TCP 或者 UDP时 需要
  tcpUdpPorts: '',
  // 监控频率
  frequency: 30,
  // 通知设置： 1 = mail，2 = mobile，mail + mobile = 3
  noticeStatus: 0,
  // 通知邮箱
  mail: '',
  // 通知手机号
  mobile: '',

  ruleEntity: {
    domain: '',
    domainId: 0,
    id: 0,
    recordCount: 0,
    recordType: '',
    status: 0,
    taskMode: 'no-change',
    top: '',
    userId: 0,
    username: '',
    backupLine: '',
    defaultList: [],
    otherList: []
  }
}

const typeList = {
  1: 'HTTP',
  2: 'HTTPS',
  3: 'TCP',
  4: 'UDP',
  5: 'PING'
}

const rateObj = {
  10: '10秒',
  15: '15秒',
  30: '30秒',
  60: '1分钟',
  300: '5分钟',
  900: '15分钟'
}

export default {
  components: {
    IpSettingDialog
  },
  props: {},
  data() {
    const { isPort, isTel, isEmail } = this.$validator

    const formRules = {
      taskMode: [
        {
          required: true,
          message: '请选择切换规则',
          trigger: 'change'
        }
      ],
      backupLine: [
        {
          required: true,
          message: '请输入备用线路',
          trigger: ['change', 'blur']
        }
      ],
      monitorType: [
        {
          required: true,
          message: '请选择任务类型',
          trigger: 'change'
        }
      ],
      name: [
        {
          required: true,
          message: '请输入任务名称',
          trigger: ['change', 'blur']
        }
      ],
      httpServerName: [
        {
          required: true,
          message: '请输入监控地址',
          trigger: ['change', 'blur']
        },
        {
          validator: (rule, value, callback) => {
            if (!this.form.httpMethod) {
              return callback(new Error('请选择请求方法'))
            }
            if (!this.form.httpServerName) {
              return callback(new Error('请输入Sever Name'))
            }

            if (!this.form.httpPath) {
              return callback(new Error('请输入监控路径'))
            }
            return callback()
          },
          trigger: ['change', 'blur']
        }
      ],
      httpPort: [
        {
          required: true,
          message: '请输入监控端口',
          trigger: ['change', 'blur']
        },
        {
          validator: isPort(),
          trigger: 'blur'
        }
      ],
      tcpUdpPorts: [
        {
          required: true,
          message: '请输入监控端口',
          trigger: ['change', 'blur']
        }
      ],
      frequency: [
        {
          required: true,
          message: '请选择监控频率',
          trigger: 'change'
        }
      ],
      timeoutThreshold: [
        {
          required: true,
          message: '请输入响应超时值',
          trigger: ['change', 'blur']
        }
      ],
      offlineThreshold: [
        {
          required: true,
          message: '请输入IP离线数量',
          trigger: ['change', 'blur']
        }
      ],
      groupsDeadline: [
        {
          required: true,
          message: '请输入IP组故障数',
          trigger: ['change', 'blur']
        }
      ]
    }

    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      dialogVisible: false,
      btnLoading: false,

      typeList,
      rateObj,

      form: {
        ...defaultForm
      },
      formRules,
      // 邮件通知
      mailNotice: false,
      // 短信通知
      mobileNotice: false
    }
  },
  methods: {
    // 对话框显示
    show(row = {}) {
      this.dialogVisible = true
      console.log('row', row)

      this.form.taskId = row.id

      this.form.ruleEntity = {
        ...row
      }

      this.getMonitorPage(row.id)
    },

    // 获取监控任务详情
    async getMonitorPage(taskId) {
      this.$refs.dialogRef.bodyLoading = true
      try {
        const { data: res } = await getTaskMonitor({
          taskId
        })
        if (res.code !== 1) return
        const obj = res.data || {}
        this.form = {
          ...this.form,
          ...obj,
          ruleEntity: {
            ...this.form.ruleEntity,
            ...obj.ruleEntity
          }
        }
        console.log(this.form)
      } finally {
        this.$refs.dialogRef.bodyLoading = false
      }
    },

    // 保存
    doSave() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { data: res } = await saveTaskMonitor({
            ...this.form,
            ruleEntity: {
              ...this.form.ruleEntity,
              defaultList: undefined,
              otherList: undefined,
              defineConf: undefined
            }
          })
          if (res.code !== 1) return
          this.$msg.success('保存成功')
          this.$emit('refresh')
          this.dialogVisible = false
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 表单重置
    closed() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    },

    // 管理备用IP
    toIpSetting() {
      const { ruleEntity = {}, taskId } = this.form
      this.$refs.IpSettingDialogRefs.show({
        taskId,
        domain: ruleEntity.domain,
        userId: ruleEntity.userId,
        defaultList: ruleEntity.defaultList,
        otherList: ruleEntity.otherList,
        defineConf: ruleEntity.defineConf
      })
    },

    // 更新自定义切换设置
    updateSelfDefine({ defaultList = [], otherList = [], defineConf = '' }) {
      this.form.ruleEntity.defineConf = defineConf
    }
  }
}
</script>

<style lang="scss">
.input-with-select {
  .el-input-group__prepend {
    background-color: #fff;
  }
  .sever-name-input {
    .el-input__inner {
      border: none;
      padding: 0 5px;
    }
  }
}
</style>
