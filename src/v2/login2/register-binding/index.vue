<template>
  <div class="reg-bind-box bg-white rounded-2xl px-16 py-xl">
    <ul class="text-center">
      <li class="text-3xl font-semibold">
        关联或注册账号
      </li>
      <li class="mt-lg mb-sm">
        <el-avatar
          :size="60"
          :src="require('@/assets/img/avatar.png')"
        ></el-avatar>
      </li>
      <li class="font-semibold">
        {{ wxPostData.nickname }}
      </li>
    </ul>

    <el-divider content-position="center">该微信还未注册 {{ $root.webName }}，请选择以下方式</el-divider>

    <el-form
      label-width="0px"
      :model="bindingForm"
      ref="ruleForm"
      method="post"
      class="space-y-12 pt-sm"
    >
      <el-form-item>
        <el-radio-group v-model="bindingForm.raido">
          <el-radio
            label="new"
            border
          >
            <div class="mb-xs">
              <strong>注册新的账号</strong>
            </div>
            <div class="">
              使用该微信注册一个全新的 {{ $root.webName }} 账号
            </div>
          </el-radio>
          <el-radio
            label="binding"
            border
          >
            <div class="mb-xs">
              <strong>关联已有账号</strong>
            </div>
            <div class="">将该微信关联到您已有的 {{ $root.webName }} 账号</div>
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item style="margin:0;">
        <el-checkbox v-model="bindingForm.isAgree">
          <span class="text-sm">
            我已阅读并同意
          </span>
        </el-checkbox>
        <span
          class="cursor-color text-primary text-sm"
          @click="showAgreementDialog"
        >《{{ $root.webName }}服务协议》</span>
      </el-form-item>
      <el-form-item style="margin:0;">
        <ants-button
          type="primary"
          :disabled="!bindingForm.isAgree"
          @click="nextGo"
          class="text-2xl w-full"
          text="下一步"
        />
      </el-form-item>
    </el-form>
    <router-link
      to="/login"
      class="mt-lg"
    >← 返回重新登录</router-link>

    <!-- 绑定已有账号对话框弹窗 -->
    <BindingSelfDialog ref="BindingSelfDialogRef" />

    <!-- 微信注册的填写登录密码对话框 -->
    <SetPasswordDialog ref="SetPasswordDialogRef" />

    <!-- 同意协议对话框 -->
    <AgreementDialog ref="AgreementDialogRef" />
  </div>
</template>

<script>
import dnsAgreementDialog from '@/v2/dns_users/components/AgreementDialog'
import cdnAgreementDialog from '@/v2/cdn_users/components/AgreementDialog'

import dnsBindingSelfDialog from '@/v2/dns_users/views/login/registerBinding/components/BindingSelfDialog'
import cdnBindingSelfDialog from '@/v2/cdn_users/views/login/registerBinding/components/BindingSelfDialog'

import dnsSetPasswordDialog from '@/v2/dns_users/views/login/registerBinding/components/SetPasswordDialog'
import cdnSetPasswordDialog from '@/v2/cdn_users/views/login/registerBinding/components/SetPasswordDialog'

const PROCESS_NAME = process.env.VUE_APP_NAME

export default {
    components: {
      AgreementDialog: PROCESS_NAME === 'dns_users' ? dnsAgreementDialog : cdnAgreementDialog,
      SetPasswordDialog: PROCESS_NAME === 'dns_users' ? dnsSetPasswordDialog : cdnSetPasswordDialog,
      BindingSelfDialog: PROCESS_NAME === 'dns_users' ? dnsBindingSelfDialog : cdnBindingSelfDialog
    },
  data() {
    return {
      bindingForm: {
        raido: 'new',
        isAgree: false
      },
      btnLoading: false,
      // 若选择新注册账号，要保存的数据
      wxPostData: {
        // 微信昵称
        nickname: 'ants',
        openid: ''
      } 
    }
  },
  created() {
    // 获取本地保存的数据
    this.wxPostData = JSON.parse(window.sessionStorage.getItem('wxPostData')) || {}
    // if (!this.wxPostData || !this.wxPostData.openid) {
    //   window.sessionStorage.clear()
    //   this.$router.replace('/login')
    // }
  },
  beforeDestroy() {
    window.sessionStorage.removeItem('wxPostData')
  },
  methods: {
    // 下一步
    async nextGo() {
      if (!this.bindingForm.isAgree) {
        return this.$msg.error(
          `请您阅读并同意《${this.$root.webName}服务协议》`
        )
      }

      // 注册新账号
      if (this.bindingForm.raido === 'new') {
        this.$refs.SetPasswordDialogRef.showDialog(this.wxPostData)
      }

      // 绑定已有账号
      if (this.bindingForm.raido === 'binding') {
        this.$refs.BindingSelfDialogRef.showDialog(this.wxPostData)
      }
    },

    // 查看同意协议
    showAgreementDialog() {
      this.$refs.AgreementDialogRef.showDialog()
    }
  }
}
</script>

<style lang="scss">
.reg-bind-box {
  .el-radio {
    white-space: normal;
  }
  .el-radio__inner {
    display: none;
  }
  .el-radio.is-bordered + .el-radio.is-bordered {
    margin: 0;
    margin-top: 20px;
  }
  .el-radio-group {
    width: 100%;
  }
  .el-radio.is-bordered {
    width: 100%;
    position: relative;
    height: 80px;
    background-color: #f1f5f9;
  }
  .el-radio__label {
    text-align: left;
    padding: 0;
    position: absolute;
    left: 20px;
    top: 18px;
  }

  .el-divider__text {
    color: #666;
  }
}
</style>
