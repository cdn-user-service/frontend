<template>
  <span
    class="ants-logo-box flex justify-center items-center animated fadeInLeft"
    @click="goHome()"
  >
    <!-- <router-link to="/console"> -->
    <img :src="themeMode === 'dark' ? logoImgLight : logoImgDark" :alt="$root.webName" />
    <!-- </router-link> -->
  </span>
</template>

<script>
import { getToken } from '@/utils/auth'

const homeUrl = (window.config || {}).homeUrl

export default {
  name: 'Logo',
  props: {
    themeMode: {
      type: String,
      default: 'dark'
    }
  },
  computed: {
    logoImgDark() {
      return this.$root.webConfig.basic.logoImgDark
    },
    logoImgLight() {
      return this.$root.webConfig.basic.logoImgLight
    }
  },
  methods: {
    goHome() {
      // 自定义首页地址
      if (homeUrl) {
        const token = getToken()
        let url = homeUrl
        if (token) {
          // 外部地址, 判断是否携带了参数，追加 token到 url
          const query = homeUrl.split('?')[1]
          const contactStr = query ? '&' : '?'
          url = `${homeUrl}${contactStr}token=${getToken()}`
        }

        window.open(url)
      } else {
        this.$router.push('/console')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@use "../../../assets/css/variables.scss" as *;

.ants-logo-box {
  height: $headerHeight;
  width: $menuWidth;
  margin: 0 20px 0 -20px;
  img {
    height: $logoHeight;
  }
}
</style>
