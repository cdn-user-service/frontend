<template>
  <div>
    <el-card>
      <div slot="header" class="flex justify-between items-center">
        <strong>{{ antsT('登录方式') }}</strong>
        <span class="el-icon-more"></span>
      </div>

      <ul class="-mt-lg">
        <template v-for="(item, idx) in activeList">
          <li
            v-if="item.isShow"
            :key="item.name"
            class="flex items-center py-xl"
            :class="{ 'border-t border-ants-border-3': idx != 0 }"
          >
            <div
              class="bg-ants-bg-5 w-24 h-24 flex justify-center items-center text-6xl rounded-xl"
            >
              <span
                :class="item.icon"
                :style="{ color: item.color }"
                style="font-size: 22px;"
              ></span>
            </div>
            <div class="flex-1 px-lg">
              <strong>{{ antsT(item.title) }}</strong>
              <div class="mt-sm text-ants-text-4 text-sm">
                {{ antsT(item.info) }}
              </div>
            </div>

            <div>
              <el-button
                type="primary"
                size="small"
                @click="showDialog(item)"
                :icon="item.btnIcon"
                v-if="!item.tagText"
                >{{ antsT(item.btnText) }}</el-button
              >
              <el-tag type="success" v-else>{{ item.tagText }}</el-tag>
            </div>
          </li>
        </template>
      </ul>
    </el-card>

    <!-- 绑定微信对话框 -->
    <SetWechatDialog ref="SetWechatDialogRef" v-on="$listeners" />

    <!-- 绑定手机号对话框 -->
    <SetMobileDialog ref="SetMobileDialogRef" v-on="$listeners" />

    <!-- 绑定邮箱对话框弹窗 -->
    <SetEmailDialog ref="SetEmailDialogRef" v-on="$listeners" />

    <!-- 重置密码对话框 -->
    <ResetLoginPwdDialog
      ref="ResetLoginPwdDialogRef"
      :username="userinfo.username"
      v-on="$listeners"
    />

    <!-- 设置支付密码对话框 -->
    <SetPayPwdDialog ref="SetPayPwdDialogRef" v-on="$listeners" />

    <!-- 重置支付密码对话框 -->
    <ResetPayPwdDialog ref="ResetPayPwdDialogRef" v-on="$listeners" />
  </div>
</template>

<script>
import SetWechatDialog from './SetWechatDialog'
import SetMobileDialog from './SetMobileDialog'
import SetEmailDialog from './SetEmailDialog'
import ResetLoginPwdDialog from './ResetLoginPwdDialog'
import ResetPayPwdDialog from './ResetPayPwdDialog'
import SetPayPwdDialog from './SetPayPwdDialog'

export default {
  components: {
    SetWechatDialog,
    SetMobileDialog,
    SetEmailDialog,
    ResetLoginPwdDialog,
    SetPayPwdDialog,
    ResetPayPwdDialog
  },
  props: {
    userinfo: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    activeList({ $root }) {
      // 后台开启了哪些登录方式
      const {
        WXLOGIN_CONFIG_KEY: wechat,
        SMS_CONFIG_KEY: mobile,
        MAIL_CONFIG_KEY: mail
      } = $root.powerObj

      return [
        {
          isShow: wechat,
          name: 'wechat',
          icon: 'aicon icon-weixin1',
          color: '#1EAE1D',
          title: '微信登录',
          info: '微信扫一扫，登录更方便',
          btnText: '绑定',
          btnIcon: 'el-icon-plus',
          ref: 'SetWechatDialogRef',
          tagText:
            this.userinfo.wechatOpenid && this.userinfo.wechatOpenid.substr(-11)
        },
        {
          isShow: mobile,
          name: 'mobile',
          icon: 'aicon icon-3shouji',
          color: '#187EFF',
          title: '手机号登录',
          info: '作为安全验证方式，以及登录手机号',
          btnText: '绑定',
          btnIcon: 'el-icon-plus',
          ref: 'SetMobileDialogRef',
          tagText: this.userinfo.mobile
        },
        {
          isShow: mail,
          name: 'mail',
          icon: 'aicon icon-youxiang3',
          color: '#FA5744',
          title: '邮箱登录',
          info: '作为安全验证方式，以及登录邮箱',
          btnText: '绑定',
          btnIcon: 'el-icon-plus',
          ref: 'SetEmailDialogRef',
          tagText: this.userinfo.mail
        },
        {
          isShow: true,
          name: 'loginPwd',
          icon: 'aicon icon-mima1',
          color: '#1EAE1D',
          title: '登录密码',
          info: '作为登录验证，以及安全验证',
          btnText: '重置',
          btnIcon: 'el-icon-edit',
          ref: 'ResetLoginPwdDialogRef',
          tagText: ''
        }
        // {
        //   isShow: true,
        //   name: 'paymentPwd',
        //   icon: 'aicon icon-shouquan1',
        //   color: '#1EAE1D',
        //   title: '支付密码',
        //   info: '作为支付凭证，确保账户安全',
        //   btnText: this.userinfo.propertyPayPassword ? '重置' : '设置',
        //   btnIcon: this.userinfo.propertyPayPassword
        //     ? 'el-icon-edit'
        //     : 'el-icon-plus',
        //   ref: this.userinfo.propertyPayPassword
        //     ? 'ResetPayPwdDialogRef'
        //     : 'SetPayPwdDialogRef',
        //   tagText: ''
        // }
      ]
    }
  },
  data() {
    return {
      loginTypeObj: {
        mobile: '手机号登录',
        mail: '邮箱登录',
        wechat: '微信登录'
      }
    }
  },
  methods: {
    /**
     * @description: 对话框显示
     * @param {*} item
     */

    showDialog({ ref }) {
      // 绑定微信
      if (ref === 'SetWechatDialogRef') {
        this.$refs[ref].showDialog()
        return
      }
      this.$refs[ref].dialogVisible = true
    }
  }
}
</script>

<style lang="scss">
.ants-dialog {
  .code_box {
    .el-form-item__content {
      display: flex;
      justify-content: space-between;
      .el-button {
        margin-left: 20px;
      }
    }
  }
}
</style>
