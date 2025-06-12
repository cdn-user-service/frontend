<template>
  <el-form
    :model="form"
    :rules="formRules"
    ref="formRef"
    class="space-y-10"
    label-width="0px"
  >
    <div
      class="flex items-center justify-center cursor-pointer text-ants-text-3"
    >
      <svg
        t="1719982177961"
        viewBox="0 0 3018 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="35064"
        width="85"
        height="26"
      >
        <path
          d="M417.684211 380.227368V478.315789h233.903157c-7.208421 54.905263-25.465263 95.124211-53.355789 123.351579-34.223158 34.223158-87.578947 71.612632-180.547368 71.612632-144.101053 0-256.673684-116.143158-256.673685-260.176842S273.583158 152.926316 417.684211 152.926316a248.454737 248.454737 0 0 1 176.168421 69.995789l68.850526-68.850526A338.054737 338.054737 0 0 0 417.684211 54.366316c-197.389474 0-363.317895 160.741053-363.317895 358.063158S220.294737 770.492632 417.684211 770.492632c106.644211 0 187.014737-35.031579 249.869473-100.244211 64.471579-64.471579 84.749474-155.553684 84.749474-229.052632a306.122105 306.122105 0 0 0-5.187369-61.237894z"
          fill="#4285F4"
          p-id="35065"
        ></path>
        <path
          d="M1044.682105 300.597895c-128 0-231.949474 97.077895-231.949473 231.208421 0 132.850526 104.218947 231.141053 231.949473 231.141052s231.949474-97.886316 231.949474-231.141052-104.421053-231.208421-231.949474-231.208421z m0 371.267368c-70.063158 0-130.56-57.734737-130.56-140.058947s60.631579-140.058947 130.56-140.058948 130.492632 56.858947 130.492632 140.058948-60.496842 140.058947-130.492632 140.058947z"
          fill="#EA4335"
          p-id="35066"
        ></path>
        <path
          d="M2181.726316 352.336842h-3.570527c-22.703158-26.947368-66.425263-51.738947-121.734736-51.738947-115.402105 0-216.050526 101.052632-216.050527 231.208421s100.648421 231.141053 216.050527 231.141052c55.309474 0 99.031579-24.656842 121.734736-52.547368h3.570527v32.269474c0 88.32-47.157895 135.68-123.351579 135.68-62.046316 0-100.648421-44.597895-116.547369-82.391579l-88.32 36.581052a220.227368 220.227368 0 0 0 204.867369 136.488421c118.972632 0 219.621053-69.995789 219.621052-240.707368V312.589474h-96.269473z m-116.547369 319.528421c-70.063158 0-123.351579-59.688421-123.351579-140.058947 0-81.583158 53.288421-140.058947 123.351579-140.058948s123.284211 59.688421 123.284211 140.867369-54.366316 139.250526-123.284211 139.250526z"
          fill="#4285F4"
          p-id="35067"
        ></path>
        <path
          d="M1561.869474 300.597895c-128 0-231.949474 97.077895-231.949474 231.208421 0 132.850526 104.218947 231.141053 231.949474 231.141052s231.949474-97.886316 231.949473-231.141052-104.353684-231.208421-231.949473-231.208421z m0 371.267368c-69.995789 0-130.492632-57.734737-130.492632-140.058947s60.631579-140.058947 130.492632-140.058948 130.492632 56.858947 130.492631 140.058948-60.496842 140.058947-130.492631 140.058947z"
          fill="#FBBC05"
          p-id="35068"
        ></path>
        <path
          d="M2357.894737 63.932632h99.907368v699.014736H2357.894737z"
          fill="#34A853"
          p-id="35069"
        ></path>
        <path
          d="M2765.810526 671.865263c-51.738947 0-88.32-23.511579-112.235789-70.063158l309.153684-128-10.374737-26.206316c-19.065263-51.738947-77.945263-147.267368-197.726316-147.267368s-218.004211 93.776842-218.00421 231.477895c0 129.684211 97.886316 231.141053 229.052631 231.141052a230.467368 230.467368 0 0 0 192.538948-102.265263l-78.753684-52.48c-26.273684 38.197895-62.113684 63.663158-113.785264 63.663158z m-7.208421-284.496842c41.027368 0 75.991579 21.086316 87.578948 50.930526l-208.842106 86.298948c-0.067368-97.077895 68.783158-137.229474 121.263158-137.229474z"
          fill="#EA4335"
          p-id="35070"
        ></path>
      </svg>

      <span class="font-semibold">Authenticator</span>
    </div>

    <ants-form-item prop="user">
      <ants-input
        is-bgc
        v-model="form.user"
        placeholder="请输入登录账号"
        prefix-icon="aicon icon-yonghu-"
        maxlength="32"
        @keydown.enter.native="submitForm()"
      />
    </ants-form-item>

    <ants-form-item prop="code">
      <ants-input
        is-bgc
        v-model="form.code"
        prefix-icon="aicon icon-yanzhengma2"
        placeholder="动态验证码"
        maxlength="32"
        @keydown.enter.native="submitForm()"
      />
    </ants-form-item>

    <ants-form-item>
      <ants-button
        type="primary"
        @click="submitForm"
        class="text-2xl w-full"
        :loading="btnLoading"
        text="登 录"
        size="large"
      />
    </ants-form-item>
  </el-form>
</template>

<script>
import { googleLogin } from '@/v2/cdn_users/api/login'
import { setToken } from '@/utils/auth'

export default {
  data() {
    const formRules = {
      user: [
        {
          required: true,
          message: '请输入登录账号',
          trigger: ['change', 'blur']
        }
      ],
      code: [
        {
          required: true,
          message: '请输入动态验证码',
          trigger: ['change', 'blur']
        }
      ]
    }

    return {
      btnLoading: false,
      form: {
        user: '',
        code: ''
      },
      formRules
    }
  },
  methods: {
    // 提交
    submitForm() {
      if (this.btnLoading) return

      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.btnLoading = true
        try {
          // 发起请求
          const { data: res } = await googleLogin(this.form)
          if (res.code !== 1) {
            this.btnLoading = false
            this.form.code = ''
            return
          }

          setTimeout(() => {
            this.btnLoading = false
          }, 3000)

          // 保存登录凭证并跳转到后台
          const username = this.form.user
          setToken(res.token, username)

          // 如果重定向路径为登录页
          const { query } = this.$route
          let redirect = query.redirect
          if (redirect) {
            // 其他携带的路由参数
            Object.keys(query).forEach((key) => {
              if (key == 'redirect') return
              redirect += `&${key}=${query[key]}`
            })
          }
          if (!redirect || redirect == '/login') {
            redirect = '/console'
          }
          this.$router.replace(redirect)

          setTimeout(() => {
            this.$notify({
              title: this.antsT('登录成功'),
              message: this.antsT('欢迎回来！') + username,
              type: 'success',
              offset: 60
            })
          }, 500)
        } catch (error) {
          this.btnLoading = false
          throw error
        }
      })
    }
  }
}
</script>
