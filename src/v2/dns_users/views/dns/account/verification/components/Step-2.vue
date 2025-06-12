<template>
  <div class="qr_code_box">
    <span class="qr_icon_span aicon icon-renlianshibie"></span>

    <!-- 1、输入姓名和身份证号 -->
    <el-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="0"
      label-position="top"
      status-icon
      class="flex-1 pt-lg space-y-10"
      v-if="!authUrl"
    >
      <TitleBorder title="验证您的身份信息" class="text-xxl text-primary" />

      <ants-form-item label="真实姓名" prop="cert_name">
        <ants-input
          v-model="form.cert_name"
          placeholder="请输入真实姓名"
          style="width:380px;"
        />
      </ants-form-item>
      <ants-form-item label="身份证号" prop="cert_no">
        <ants-input
          v-model="form.cert_no"
          placeholder="请输入身份证号"
          style="width:380px;"
        />
      </ants-form-item>

      <ants-form-item style="margin-top:30px;">
        <ants-button
          type="primary"
          :loading="btnLoading"
          @click="checkCertInfo"
          text="立即验证"
        />
      </ants-form-item>
    </el-form>

    <!-- 2、扫码认证 -->
    <ul class="flex-1 pt-lg space-y-12" v-else>
      <li class="qr_main_title" :style="{ color: authWayObj[authWay].color }">
        {{ antsT(`${authWayObj[authWay].name}人脸核身认证`) }}
      </li>
      <li>
        <strong>{{
          antsT(`请打开手机${authWayObj[authWay].name}，扫一扫进行人脸核身认证`)
        }}</strong>
      </li>
      <li class="qr_img_box" style="height:200px;">
        <div class="vue_qr_box" style="margin: 0;">
          <vue-qr
            ref="qrAuthRef"
            :text="authUrl"
            :margin="0"
            colorDark="#262F3E"
            colorLight="#fff"
            :logoSrc="downloadDataW[authWay]"
            :logoScale="0.15"
            :size="160"
          ></vue-qr>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
// API
import { authStatus } from '@/v2/dns_users/api/dns/account'

import vueQr from 'vue-qr'

export default {
  components: {
    vueQr
  },

  data() {
    // 验证规则
    const { isIdCard } = this.$validator

    return {
      // 生成实名认证二维码url
      authUrl: '',
      // 实名认证方式 WECHAT = 微信， ALIPAY = 支付宝
      authWay: 'WECHAT',
      authWayObj: {
        WECHAT: {
          name: '微信',
          color: '#09BB07'
        },
        ALIPAY: {
          name: '支付宝',
          color: '#177DFF'
        }
      },

      downloadDataW: {
        WECHAT: require('@/assets/img/wechat-icon.png'),
        ALIPAY: require('@/assets/img/alipay-icon.png')
      },

      form: {
        // 姓名
        cert_name: '',
        // 身份证号
        cert_no: ''
      },
      formRules: {
        cert_name: [
          {
            required: true,
            message: '请输入真实姓名',
            trigger: ['change', 'blur']
          }
        ],
        cert_no: [
          {
            required: true,
            message: '请输入身份证号',
            trigger: ['change', 'blur']
          },
          {
            validator: isIdCard(),
            trigger: 'blur'
          }
        ]
      },

      btnLoading: false
    }
  },
  created() {},
  methods: {
    /**
     * @description: 1、提交姓名、身份证表单，获取订单号
     */

    checkCertInfo() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        const { data: res } = await authStatus(this.form)
        this.btnLoading = false

        if (res.code !== 1) return
        const obj = res.data || {}

        // 判断支付方式，来显示对应的名称和图标
        if (obj.mode === 2) {
          // 记录生成的实名url
          this.authUrl = obj.Url
          // 微信实名
          this.authWay = 'WECHAT'
        }

        if (obj.mode === 1) {
          // 记录生成的实名url
          this.authUrl = obj.certify_url

          // 支付宝实名
          this.authWay = 'ALIPAY'
        }

        // 定时检测实名是否成功
        this.$emit('checkResult')
      })
    }
  }
}
</script>
