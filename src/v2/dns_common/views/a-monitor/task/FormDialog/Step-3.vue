
<template>
  <div>
    <ants-form
      style="max-width:600px;margin:0 auto;"
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
      space-class="space-y-2"
      :status-icon="false"
    >
      <TitleBorder title="基本设置" />
      <div class="p-df rounded-2xl bg-ants-bg-3 space-y-6">
        <ants-form-item
          label="开启监控"
          prop="status"
          required
        >
          <el-switch
            v-model="form.status"
            active-color="#02B340"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="停止"
          />
        </ants-form-item>

        <ants-form-item
          label="任务类型"
          prop="type"
        >
          <el-radio-group
            v-model="form.type"
            size="small"
          >
            <el-radio-button
              v-for="(item, key) in typeList"
              :key="key"
              :label="key"
            >{{ item }}</el-radio-button>
          </el-radio-group>
        </ants-form-item>

        <ants-form-item
          label="任务名称"
          prop="name"
        >
          <ants-input
            v-model="form.name"
            placeholder="请输入任务名称"
            maxlength="30"
            show-word-limit
          />
        </ants-form-item>
        <ants-form-item
          label="监控地址"
          v-if="form.type === 'http' || form.type === 'https'"
          required
        >
          <!-- prop="path" -->
          <ants-input
            v-model="form.path"
            placeholder="路径"
            class="input-with-select"
          >
            <div
              slot="prepend"
              class="flex items-center"
            >
              <el-select
                v-model="form.method"
                placeholder="请求方法"
                class="border-r border-ants-border-2"
                style="width:90px;margin-right:0px;"
              >
                <el-option
                  label="GET"
                  value="GET"
                />
                <el-option
                  label="POST"
                  value="POST"
                />
                <el-option
                  label="HEAD"
                  value="HEAD"
                />
              </el-select>
              <el-input
                v-model="form.server_name"
                placeholder="Server Name"
                class="sever-name-input"
                style="width:160px;"
                size="small"
              />
            </div>

          </ants-input>

        </ants-form-item>

        <ants-form-item
          label="监控端口"
          prop="ports"
          v-if="['tcp', 'udp'].includes(form.type)"
        >
          <ants-input
            v-model="form.ports"
            placeholder="多个端口用“|”分隔。例：80|81|82|83"
          />
        </ants-form-item>
        <ants-form-item
          label="监控端口"
          prop="port"
          v-else-if="['http', 'https'].includes(form.type)"
        >
          <ants-input
            v-model="form.port"
            placeholder="请输入监控端口"
          />
        </ants-form-item>

        <ants-form-item
          label="监控频率"
          prop="rate"
        >
          <el-radio-group v-model="form.rate">
            <el-radio
              v-for="(item, key) in rateObj"
              :key="key"
              :label="+key"
            >{{ item }}</el-radio>
          </el-radio-group>
        </ants-form-item>

      </div>

      <TitleBorder
        title="切换规则"
        class="pt-sm"
      />
      <div class="p-df rounded-2xl bg-ants-bg-3 space-y-6">
        <ants-form-item>
          <div class="font-semibold">当域名记录无法访问时：</div>
          <el-radio-group v-model="form.rule">
            <!-- class="block my-df" -->
            <el-radio
              v-for="(item, key) in ruleList"
              :key="key"
              :label="+key"
            >{{ item }}</el-radio>
          </el-radio-group>
        </ants-form-item>
      </div>

      <TitleBorder
        title="通知设置"
        class="pt-sm"
      />
      <div class="p-df rounded-2xl bg-ants-bg-3 space-y-6">
        <ants-form-item>
          <el-checkbox v-model="mailNotice">邮件通知</el-checkbox>
          <el-checkbox v-model="mobileNotice">短信通知</el-checkbox>
        </ants-form-item>

        <ants-form-item
          label="通知邮箱"
          prop="mail"
          v-if="mailNotice"
        >
          <ants-input
            v-model="form.mail"
            placeholder="请输入通知邮箱"
          />
        </ants-form-item>

        <ants-form-item
          label="通知手机"
          prop="mobile"
          v-if="mobileNotice"
        >
          <ants-input
            v-model="form.mobile"
            placeholder="请输入通知手机号"
          />
        </ants-form-item>
      </div>

      <!-- <ants-form-item>
        <el-checkbox-group v-model="form.noticeStatus">
          <el-checkbox :label="1">邮件通知</el-checkbox>
          <el-checkbox :label="2">短信通知</el-checkbox>
        </el-checkbox-group>
      </ants-form-item> -->
    </ants-form>
  </div>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  doCreateTask,
  doUpdateTask
} = require(`@/v2/${PROCESS_NAME}/api/dns/a-monitor`)

const typeList = {
  http: 'HTTP',
  https: 'HTTPS',
  tcp: 'TCP',
  udp: 'UDP',
  ping: 'PING'
  // dns: 'DNS'
}

const protocolList = {
  1: 'TCP',
  2: 'UDP',
  3: 'TCP + UDP'
}

const rateObj = {
  15: '15秒',
  30: '30秒',
  60: '1分钟',
  300: '5分钟',
  900: '15分钟'
}

const ruleList = {
  0: '关闭切换',
  1: '定时轮询',
  2: '优先级切换'
}

const defaultForm = {
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
  ports: '',
  status: 0
}

export default {
  props: {
    // 表单
    pForm: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const { isPort, isTel, isEmail } = this.$validator
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      loading: false,
      typeList,
      protocolList,
      rateObj,
      ruleList,
      form: {
        ...defaultForm
      },
      formRules: {
        type: [
          {
            required: true,
            message: '请选择任务类型',
            trigger: 'change'
          }
        ],
        protocol: [
          {
            required: true,
            message: '请选择协议',
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
        path: [
          {
            required: true,
            message: '请输入监控地址',
            trigger: ['change', 'blur']
          }
        ],
        port: [
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
        ports: [
          {
            required: true,
            message: '请输入监控端口',
            trigger: ['change', 'blur']
          }
        ],
        rate: [
          {
            required: true,
            message: '请选择监控频率',
            trigger: 'change'
          }
        ],
        rule: [
          {
            required: true,
            message: '请选择切换规则',
            trigger: 'change'
          }
        ],
        mail: [
          {
            required: true,
            message: '请输入通知邮箱',
            trigger: ['change', 'blur']
          },
          {
            validator: isEmail(),
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入通知手机号',
            trigger: ['change', 'blur']
          },
          {
            validator: isTel(),
            trigger: 'blur'
          }
        ]
      },

      // 邮件通知
      mailNotice: false,
      // 短信通知
      mobileNotice: false
    }
  },
  methods: {
    // 表单数据初始化
    init(row = {}) {
      this.form = {
        ...defaultForm,
        ...row
      }
      console.log('step3', row)
      const { noticeStatus } = this.form

      this.mailNotice = noticeStatus === 1 || noticeStatus === 3
      this.mobileNotice = noticeStatus === 2 || noticeStatus === 3
    },

    // 表单提交
    submit(callback) {
      this.$refs.formRef.validate((valid) => {
        if (!valid) {
          callback()
          return
        }

        let noticeStatus = 0
        if (this.mailNotice) {
          noticeStatus = 1
        }
        if (this.mobileNotice) {
          noticeStatus = 2
        }
        if (this.mailNotice && this.mobileNotice) {
          noticeStatus = 3
        }
        const result = {
          ...this.form,
          noticeStatus
        }
        callback(result)
      })
    },

    // 重置表单
    resetForm() {
      this.$refs.formRef.resetFields()
      this.form = {
        ...defaultForm
      }
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
