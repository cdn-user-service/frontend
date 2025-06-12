<template>
  <div>
    <el-card class="content-box animated fadeIn">
      <div slot="header">
        <TitleBorder title="证书配置"></TitleBorder>
      </div>

      <ants-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="140px"
        style="max-width: 650px"
      >
        <ants-form-item prop="cert_apply_mode" label="证书申请模式">
          <ants-select
            v-model="form.cert_apply_mode"
            placeholder="选择证书申请模式"
            clearable
            style="max-width: 490px"
            :disabled="true"
          >
            <!-- <ants-option label="本地" value="1" /> -->
            <ants-option label="证书服务器" value="2" />
          </ants-select>
        </ants-form-item>
        <ants-form-item prop="cert_apply_proxy_pass" label="证书申请回源地址">
          <div class="input-box">
            <ants-input
              v-model.trim="form.cert_apply_proxy_pass"
              :placeholder="formData.cert_apply_proxy_pass"
            />
            <el-tooltip class="item" effect="dark" placement="right">
              <div slot="content">
                <span> {{ formData.cert_apply_proxy_pass }}</span>
                <ants-copy
                  :text="formData.cert_apply_proxy_pass"
                  icon
                  class="ml-2"
                />
              </div>
              <span class="el-icon-info ants-icon_info"></span>
            </el-tooltip>
          </div>
        </ants-form-item>
        <ants-form-item prop="cert_apply_callback_url" label="证书申请回调地址">
          <div class="input-box">
            <ants-input
              v-model.trim="form.cert_apply_callback_url"
              :placeholder="formData.cert_apply_callback_url"
            />
            <el-tooltip class="item" effect="dark" placement="right">
              <div slot="content">
                <span>
                  {{ formData.cert_apply_callback_url }}
                </span>
                <ants-copy
                  :text="formData.cert_apply_callback_url"
                  icon
                  class="ml-2"
                />
              </div>
              <span class="el-icon-info ants-icon_info"></span>
            </el-tooltip>
          </div>
        </ants-form-item>
        <ants-form-item>
          <!-- <el-alert
            title="注意：每次保存配置后，都将会清空和重置流量采集数据！"
            type="error"
            :closable="false"
            :show-icon="false"
            style="line-height: 1.5; margin-bottom: 20px"
          /> -->
          <ants-button
            type="primary"
            icon="el-icon-check"
            :loading="btnLoading || esLoading"
            @click="submitForm"
            text="保存配置"
          />
        </ants-form-item>
      </ants-form>
    </el-card>
  </div>
</template>

<script>
import mixins from '../../mixins'
import { getElastic } from '@/v2/cdn_admin/api/cdn/monitor'
const origin = window.location.origin
console.log(origin) // 输出例如 "localhost" 或 "example.com"

const defaultForm = {
  cert_apply_mode: '2',
  cert_apply_proxy_pass: 'http://148.135.100.118:8181',
  cert_apply_callback_url: `${origin}/antsxdp/sys/common/save/cert/callback`
}

export default {
  mixins: [mixins],
  data() {
    return {
      // 标识， [text]
      keyStr: 'cert_conf',

      btnLoading: false,
      esLoading: false,
      form: {
        ...defaultForm
      },
      formData: {
        ...defaultForm
      },
      rules: {
        cert_apply_mode: [
          {
            required: true,
            message: '请选择证书申请模式',
            trigger: ['change']
          }
        ],
        cert_apply_proxy_pass: [
          {
            required: true,
            message: '请输入证书申请回源地址',
            trigger: ['change']
          }
        ],
        cert_apply_callback_url: [
          {
            required: true,
            message: '请输入回调地址'
            // trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  created() {
    this.getDetailByKey()
  },
  methods: {
    /**
     * 获取证书详情
     */
    async getDetailByKey() {
      try {
        // 获取全局配置
        const res = await this.getGlobalAttr(this.keyStr)

        // 检查响应状态码
        if (res.code !== 1) return

        // 验证响应数据
        if (!res.data || typeof res.data !== 'object') {
          console.error('Invalid response data:', res.data)
          return
        }

        // 解析响应数据

        this.form = {
          cert_apply_callback_url:
            res.data.cert_apply_callback_url.pvalue ||
            defaultForm.cert_apply_callback_url,
          cert_apply_mode:
            res.data.cert_apply_mode.pvalue || defaultForm.cert_apply_mode,
          cert_apply_proxy_pass:
            res.data.cert_apply_proxy_pass.pvalue ||
            defaultForm.cert_apply_proxy_pass
        }
      } catch (error) {
        // 处理请求异常
        console.error(
          'Error fetching certificate details:',
          error.message,
          error.stack
        )
      }
    },

    // 表单提交
    submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        const res = await this.saveGlobalAttr(this.form)
        if (res.code != 1) {
          this.$msg.error('保存失败')
        } else {
          this.$msg.success('保存成功')
        }
      })
    },

    reset() {
      this.putForm.patterns = this.putParams[this.putForm.uri] || ''
    }
  }
}
</script>

<style>
.input-box {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
