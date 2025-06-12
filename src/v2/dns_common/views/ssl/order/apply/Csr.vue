<template>
  <div class="bg-ants-bg-4 rounded-2xl p-df">
    <div class="rounded-2xl p-df bg-ants-bg-4">
      <TitleBorder title="CSR验证" />
      <div
        class="border mt-lg border-ants-border-1 bg-ants-bg-1 rounded-2xl p-df leading-8 relative"
        style="height:300px;"
      >
        <el-tooltip effect="light" content="复制" placement="top-end">
          <ants-copy
            icon
            :text="csr"
            class="custom-copy-icon absolute cursor-color rounded-xl bg-ants-bg-5"
            style="top:10px;right:10px;line-height:1; margin:0;font-size:16px;"
          />
        </el-tooltip>
        <div class="w-full whitespace-pre-line break-words">
          {{ csr }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    csr: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss">
.custom-copy-icon {
  .copy-icon {
    display: inline-block;
    padding: 10px;
  }
}
</style>
