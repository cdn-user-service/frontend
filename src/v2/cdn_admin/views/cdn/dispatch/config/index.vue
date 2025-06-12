<template>
  <el-card class="content-box animated fadeIn">
    <el-skeleton :rows="8" :loading="$root.loading" animated>
      <template>
        <ants-form
          :model="form"
          :rules="formRules"
          ref="formRef"
          label-width="120px"
        >
          <div class="rounded-xl p-sm px-df bg-ants-bg-3">
            <TitleBorder title="监测API配置" />
          </div>
          <div
            class="space-y-8"
            v-loading="apiLoading"
            element-loading-spinner="el-icon-loading"
          >
            <ants-form-item label="API_TOKEN">
              <el-tag type="primary" class="mr-sm">
                {{ apiData.token }}
              </el-tag>
              <ants-copy :text="apiData.token" name="API_TOKEN" icon />
            </ants-form-item>
            <ants-form-item label="API_URL">
              <el-tag type="primary" class="mr-sm">
                {{ apiData.importUrl }}
              </el-tag>
              <ants-copy :text="apiData.importUrl" name="API_URL" icon />
            </ants-form-item>

            <ants-form-item label="调度方式" prop="DnsDispatchMode">
              <ants-radio-group v-model="form.DnsDispatchMode">
                <ants-radio label="online" text="离线切换" />
                <ants-radio label="timing" text="定时切换" />
                <ants-radio label="random" text="随机" />
              </ants-radio-group>
            </ants-form-item>
            <ants-form-item
              v-if="form.DnsDispatchMode === 'timing'"
              label="定时周期"
              prop="ModeTimingFrequency"
            >
              <ants-input-number
                placeholder="定时周期"
                size="medium"
                v-model="form.ModeTimingFrequency"
                :step="60"
                :min="60"
                :max="3600"
                :precision="0"
              />
              <span class="text-ants-text-4 text-sm ml-sm">(60~3600 秒)</span>
            </ants-form-item>
          </div>

          <div class="rounded-xl p-sm px-df bg-ants-bg-3">
            <TitleBorder title="监测端口配置" />
          </div>
          <ants-form-item prop="checkNodePortList">
            <span slot="label"
              >监测端口
              <el-tooltip
                class="item"
                effect="dark"
                content="多个端口以 “ | ” 分隔，例如：80|443|8181"
                placement="top-start"
              >
                <span class="el-icon-info text-primary cursor-pointer"></span>
              </el-tooltip>
            </span>
            <ants-input
              placeholder="80|443|8181"
              v-model="form.checkNodePortList"
            />
          </ants-form-item>

          <ants-form-item label="监测频率" prop="checkNodeFrequency">
            <ants-input-number
              placeholder="监测频率"
              size="medium"
              v-model="form.checkNodeFrequency"
              :step="10"
              :min="10"
              :max="300"
              :precision="0"
            />
            秒
            <span class="text-ants-text-4 text-sm ml-sm"
              >(10~300 秒，注意： 若监测频率时间过短，会导致CC被误封)</span
            >
          </ants-form-item>

          <ants-form-item label="监控点失败率" prop="failPercent">
            <ants-input-number
              placeholder="监控点失败率"
              size="medium"
              v-model="form.failPercent"
              :step="1"
              :min="1"
              :max="100"
              :precision="0"
            />
            %
            <span class="text-ants-text-4 text-sm ml-sm"
              >(1~100%，当监控失败超过此设置时，表示节点不可用)</span
            >
          </ants-form-item>

          <div class="rounded-xl p-sm px-df bg-ants-bg-3">
            <TitleBorder title="通知接收配置" />
          </div>
          <ants-form-item label="邮件通知" required class="phone-one-line">
            <ants-switch
              v-model="form.mailNoticeStatus"
              active-text="ON"
              inactive-text="OFF"
            />
          </ants-form-item>
          <ants-form-item
            label="接收邮件"
            prop="mailNotice"
            class="animated fadeIn"
            v-if="form.mailNoticeStatus === 1"
          >
            <ants-input
              placeholder="请输入接收通知邮件"
              v-model="form.mailNotice"
            />
          </ants-form-item>

          <ants-form-item label="短信通知" required class="phone-one-line">
            <ants-switch
              v-model="form.smsNoticeStatus"
              active-text="ON"
              inactive-text="OFF"
            />
          </ants-form-item>
          <ants-form-item
            label="接收手机"
            prop="smsNotice"
            class="animated fadeIn"
            v-if="form.smsNoticeStatus === 1"
          >
            <ants-input
              placeholder="输入接收通知手机"
              v-model="form.smsNotice"
            />
          </ants-form-item>

          <ants-button
            @click="submitForm"
            :loading="btnLoading"
            icon="el-icon-edit"
            type="primary"
            size="small"
            text="保存配置"
          />
        </ants-form>
      </template>
    </el-skeleton>
  </el-card>
</template>

<script>
// API
import { checkTokenUrl } from '@/v2/cdn_admin/api/cdn/dispatch'

export default {
  data() {
    // 验证规则
    const { isEmail, isTel, isDomain, isIp } = this.$validator
    return {
      // 这里的监测配置，调用的系统设置里面的接口
      params: {
        id: 37,
        key: 'CDN_NODECHECK_KEY',
        remark: 'CDN节点监测配置'
      },

      btnLoading: false,
      apiLoading: false,

      apiData: {
        importUrl: '',
        token: ''
      },
      form: {
        // 调度方式： online = 离线切换， timing = 定时切换
        DnsDispatchMode: 'online',
        // 定时周期，调度方式 = 定时切换时显示
        ModeTimingFrequency: 60,

        // 监测端口，多个端口以 | 分隔
        checkNodePortList: '',
        // 监测频率，10 s
        checkNodeFrequency: 10,
        // 监控点失败率
        failPercent: 80,

        // 通知邮件，为空时表示关闭
        mailNotice: '',
        mailNoticeStatus: 0,
        // 通知短信，为空时表示关闭
        smsNotice: '',
        smsNoticeStatus: 0
      },

      formRules: {
        checkNodePortList: [
          {
            required: true,
            message: '请输入监测端口，多个端口以 “ | ” 分隔',
            trigger: ['change', 'blur']
          }
          //   {
          //     validator: checkPort,
          //     trigger: 'blur'
          //   }
        ],
        checkNodeFrequency: [
          {
            required: true,
            message: '请输入监测频率（10 ~ 300）',
            trigger: ['change', 'blur']
          }
        ],
        DnsDispatchMode: [
          {
            required: true,
            message: '请选择调度方式',
            trigger: 'change'
          }
        ],
        ModeTimingFrequency: [
          {
            required: true,
            message: '请输入定时周期',
            trigger: ['change', 'blur']
          }
        ],
        failPercent: [
          {
            required: true,
            message: '请输入监控点失败率',
            trigger: ['change', 'blur']
          }
        ],
        mailNotice: [
          {
            required: true,
            message: '请输入接收通知邮件',
            trigger: ['change', 'blur']
          },
          {
            validator: isEmail(),
            trigger: 'blur'
          }
        ],
        smsNotice: [
          {
            required: true,
            message: '请输入接收通知手机号',
            trigger: ['change', 'blur']
          },
          {
            validator: isTel(),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getApiData()
    this.getConfig()
  },
  methods: {
    /**
     * @description: 获取配置信息
     */

    async getConfig() {
      this.$root.loading = true
      try {
        const { data } = await this.$root.getSystemConfigById(this.params.id)

        const obj = {
          ...this.form,
          ...data
        }
        // 通知邮件、短信，为空时表示关闭
        obj.mailNoticeStatus = obj.mailNotice ? 1 : 0
        obj.smsNoticeStatus = obj.smsNotice ? 1 : 0
        this.form = obj
      } finally {
        this.$root.loading = false
      }
    },

    /**
     * @description: 监测接入TOKEN 与 URL
     */

    async getApiData() {
      this.apiLoading = true
      const { data: res } = await checkTokenUrl()
      this.apiLoading = false
      if (res.code !== 1) return
      this.apiData.token = res.token
      this.apiData.importUrl = res.importUrl
    },

    /**
     * @description: 提交配置
     */

    submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.btnLoading = true

        try {
          const { data: res } = await this.$root.updateSystemConfig({
            id: this.params.id,
            paramKey: this.params.key,
            remark: this.params.remark,
            paramValue: JSON.stringify(this.form)
          })

          if (res.code !== 1) return
          this.$msg.success('保存配置成功')
        } finally {
          this.btnLoading = false
        }
      })
    }
  }
}
</script>
