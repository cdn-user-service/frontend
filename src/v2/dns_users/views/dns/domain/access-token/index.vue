<template>
  <el-card class="mb-lg content-box">
    <div class="font-semibold mb-lg" style="font-size:16px;">
      CDN服务账户关联
    </div>

    <el-skeleton :rows="8" :loading="!$root.userinfo.userId" animated>
      <ul class="p-df my-lg rounded-2xl bg-ants-bg-3 text-sm">
        <li class="mb-sm">
          <span style="font-size:16px;">
            <i
              class="el-icon-success text-success"
              v-if="otherSite.siteUrl"
            ></i>
            <i class="el-icon-error text-error" v-else></i>
          </span>
          1、需要设置CDN客户端地址，未设置请联系管理员设置；
        </li>

        <li>
          <span style="font-size:16px;">
            <i class="el-icon-success text-success" v-if="accessInfo.other"></i>
            <i class="el-icon-error text-error" v-else></i>
          </span>
          2、需要关联CDN账户， 您可以前往注册<a
            v-if="otherSite.siteUrl"
            class="text-primary cursor-color font-bold underline"
            :href="otherSite.siteUrl"
            target="blank"
          >
            CDN账户
          </a>
          <span v-else>CDN账户</span>。
        </li>
      </ul>

      <div class="py-df" v-if="accessInfo.other">
        <ants-button
          type="primary"
          text="前往CDN系统"
          :loading="btnLoading"
          @click="goOtherSite()"
        >
          <i class="el-icon-right"></i>
        </ants-button>
      </div>

      <ants-form
        v-else
        :model="form"
        :rules="rules"
        label-position="top"
        label-width="90px"
        ref="formRef"
        size="medium"
        space-class="space-y-6"
        style="max-width:400px;"
      >
        <ants-form-item prop="account" label="CDN登录账号">
          <ants-input
            v-model="form.account"
            placeholder="请输入CDN登录账号"
            prefix-icon="el-icon-user"
          />
        </ants-form-item>

        <ants-form-item prop="password" label="CDN登录密码">
          <ants-input
            v-model="form.password"
            type="password"
            placeholder="请输入CDN登录密码"
            prefix-icon="el-icon-lock"
          />
        </ants-form-item>

        <ants-form-item>
          <div class="py-df">
            <ants-button
              type="primary"
              icon="el-icon-check"
              text="立即登录"
              :loading="btnLoading"
              @click="login()"
            />
          </div>
        </ants-form-item>
      </ants-form>
    </el-skeleton>
  </el-card>
</template>

<script>
import { openUrl } from '@/utils/env'
import { cdnAccessToken, dnsAccessToken } from '@/v2/dns_users/api/dns/account'

export default {
  data() {
    return {
      btnLoading: false,
      form: {
        account: '',
        password: ''
      },
      rules: {
        account: [
          {
            required: true,
            message: '请输入CDN登录账号',
            trigger: ['change', 'blur']
          }
        ],
        password: [
          {
            required: true,
            message: '请输入CDN登录密码',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  computed: {
    // CDN客户端配置
    otherSite({ $root }) {
      return $root.otherSite || {}
    },
    // access信息
    accessInfo({ $root }) {
      const { ucdnAccessToken, udnsAccessToken } = $root.userinfo || {}
      return { my: udnsAccessToken, other: ucdnAccessToken }
    }
  },
  watch: {
    accessInfo: {
      handler({ other }) {
        if (other) {
          this.goOtherSite()
        }
      },
      immediate: true
    }
  },
  created() {},
  methods: {
    // 前往其他站点
    goOtherSite() {
      const { other } = this.accessInfo
      let { siteUrl } = this.otherSite

      if (!siteUrl) {
        return this.doAlert({
          title: '友情提示',
          msg: '未设置CDN客户端地址，请联系管理员设置！'
        })
      }

      // 判断 siteUrl 是否以 / 结尾，若以 / 结尾，则去除
      if (siteUrl.endsWith('/')) {
        siteUrl = siteUrl.substr(0, siteUrl.length - 1)
      }

      openUrl(`${siteUrl}/#/console?access_token=${other}`)
      this.goBack()
    },

    // 登录账户
    async login() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        try {
          const { account, password } = this.form
          const { data: res } = await cdnAccessToken({
            account,
            password
          })
          if (res.code !== 1) return
          this.$msg.success('登录成功')
          this.$root.getUserinfo()
        } finally {
          this.btnLoading = false
        }
      })
    },

    doAlert({ title = '', msg = '', okText = '确定', callback }) {
      this.$alert(msg, title, {
        center: true,
        type: 'info',
        showClose: false,
        customClass: 'ants-alert',
        confirmButtonText: okText,
        dangerouslyUseHTMLString: true,
        callback
      })
    },

    // 返回上一页
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>
