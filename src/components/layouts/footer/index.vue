<template>
  <div
    class="footer-container shadow flex justify-between items-center text-ants-text-4 bg-ants-bg-1 px-lg py-sm mt-lg"
  >
    <div>
      Copyright<span style="margin: 0 5px">©</span
      >{{ new Date().getFullYear() }}
      {{ ($root.webConfig.contact || {}).company }}
    </div>
    <div>
      <span class="cursor" @click="$router.push('/console')">{{
        antsT('首页')
      }}</span>
      <el-divider direction="vertical"></el-divider>
      <span class="cursor">{{ antsT('服务协议') }}</span>

      <span v-for="(item, key) in contact" :key="key">
        <el-divider direction="vertical"></el-divider>
        <span>{{ antsT(contactObj[key]) }}：{{ item }}</span>
      </span>
    </div>
  </div>
</template>

<script>
const contactObj = {
  mobile: '电话',
  email: '邮箱',
  qq: 'QQ',
  telegram: 'Telegram',
  skype: 'Skype'
}

export default {
  name: 'AntsFooter',
  data() {
    return {
      contactObj
    }
  },
  computed: {
    contact({ $root }) {
      const contact = $root.webConfig.contact || {}
      const obj = {}
      Object.keys(contactObj).forEach((key) => {
        if (contact[key]) {
          obj[key] = contact[key]
        }
      })
      return obj
    }
  },
  created() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.footer-container {
  line-height: 30px;
  border-radius: 4px;
  border-top: 1px dashed theme('colors.ants-border-1');
  @media screen and (max-width: 767px) {
    flex-direction: column;
  }
}
</style>
