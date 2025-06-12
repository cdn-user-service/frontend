<template>
  <div>
    <span
      class="flex items-center justify-center aicon icon-bangzhu1 help-docs-icon shadow cursor-color
      bg-ants-bg-1 text-ants-text-3"
      @click="showDocsIframe = true"
    ></span>

    <div
      class="ants-docs-iframe bg-ants-bg-1 shadow rounded-2xl"
      :class="{ 'extend-docs-iframe': isExtendIframe }"
      v-show="showDocsIframe"
    >
      <div class="ants-docs-header p-lg border-b border-ants-border-2">
        <div class="flex justify-between items-center">
          <strong>服务与支持</strong>
          <span>
            <span class="aicon icon-quanping2 mr-lg cursor-color"
            @click="extendDialog"></span>
            <span
              class="el-icon-close cursor-color"
              @click="closeDocs"
            ></span>
          </span>
        </div>
      </div>

      <div class="ants-docs-body">
        <iframe
          src="http://cdn20.cdn.com/docs/zh/guide/"
          class="w-full h-full"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showDocsIframe: false,
      isExtendIframe: false
    }
  },
  methods: {
    extendDialog() {
        this.isExtendIframe = !this.isExtendIframe
    },

    closeDocs() {
        this.showDocsIframe = this.isExtendIframe = false
    }
  }
}
</script>

<style lang="scss" scoped>
.help-docs-icon {
  position: fixed;
  z-index: 99;
  right: 20px;
  bottom: 90px;
  height: 60px;
  width: 60px;
  font-size: 22px;
  border-radius: 50%;
}
.ants-docs-iframe {
  position: fixed;
  z-index: 99;
  right: 20px;
  bottom: 20px;
  width: 350px;
  max-height: 1024px;
  min-height: 350px;
  max-width: 1024px;
  min-width: 368px;
  .ants-docs-body {
    // overflow-y: auto;
    height: 600px;
  }
}
.ants-docs-iframe.extend-docs-iframe {
   top: 10vh;
   left: 50%;
   bottom: auto;
   right: auto;
   transform: translateX(-50%);
   width: 1000px;
}
</style>
