<template>
  <el-footer
    class="p-df space-y-3 text-center text-sm text-ants-text-4"
    style="border-top:1px solid rgba(255,255,254,0.1)"
    height="auto"
  >
    <div>
      Copyright © {{ new Date().getFullYear() }} {{$root.webName}} All Rights Reserved
    </div>
    <div class="text-center space-x-8">
      <a
        v-if="webBasicConfig.icp"
        class="text-ants-text-4 hover:text-primary"
        target="_blank"
        rel="noopener norefferrer"
        aria-label="ICP备案"
        href="http://beian.miit.gov.cn"
        ><img src="@/assets/img/icp.png" class="mr-2" alt="国徽" />{{
          webBasicConfig.icp
        }}</a
      >
      <a
        v-if="webBasicConfig.isp"
        class="text-ants-text-4 hover:text-primary"
        target="_blank"
        rel="noopener norefferrer"
        aria-label="ISP备案"
        :href="
          'http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=' +
            webBasicConfig.isp_num
        "
      >
        <img src="@/assets/img/isp.png" class="mr-2" alt="公安备" /><span>{{
          webBasicConfig.isp
        }}</span></a
      >
    </div>
  </el-footer>
</template>

<script>
export default {
  data() {
    return {}
  },
  computed: {
    webBasicConfig({ $root }) {
      return $root.webConfig.basic
    }
  }
}
</script>
