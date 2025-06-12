<template>
  <div
    class="login-tab absolute inset-x-0 top-0 flex text-center text-black animated fadeIn"
    v-if="powerObj.wechat && (powerObj.mobile || powerObj.mail)"
  >
    <div
      v-for="item in componentHeaderArr"
      :key="item.value"
      class="text-2xl font-semibold flex-1 py-lg cursor-color"
      :class="{ 'bg-white text-primary': item.value === loginType }"
      @click="changeTab(item.value)"
    >
      {{ antsT(item.title + name) }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginTab',
  props: {
    powerObj: Object,
    name: {
        type: String,
        default: '登录'
    },
    loginType: {
      type: String,
      default: 'WxLoginCode'
    }
  },
  data() {
    return {
      componentHeaderArr: [
        {
          title: '微信扫码',
          value: 'WxLoginCode'
        },
        {
          title: '账号',
          value: 'MailMobileForm'
        }
      ]
    }
  },
  methods: {
    changeTab(val) {
      this.$emit('update:loginType', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.login-tab {
  border-bottom: 1px solid #f5f5f5;
  background-color: #f2f6fa;
}
</style>
