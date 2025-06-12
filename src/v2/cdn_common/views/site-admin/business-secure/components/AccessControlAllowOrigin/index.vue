<template>
  <ants-form-card>
    <template slot="title">{{ antsT('允许跨域请求') }}</template>
    <template slot="info">
      <ul class="space-y-6">
        <li>
          {{
            antsT(
              '开启后将允许来自其他域的请求访问资源，将会存在潜在的安全风险，谨慎开启！'
            )
          }}
        </li>
      </ul>
    </template>
    <template slot="content">
      <ants-switch
        :disabled="$root.disabledCrud"
        v-model="status"
        active-text="ON"
        inactive-text="OFF"
        v-loading="$attrs.btnLoading"
        @change="changeStatus"
      />
    </template>
  </ants-form-card>
</template>

<script>
export default {
  data() {
    return {
      // 搜索引擎开关，[bool]
      status: 0
    }
  },
  mounted() {
    //
  },
  methods: {
    async changeStatus(val) {
      const res = await this.$listeners.saveSiteAttr({
        access_control_allow_origin: val
      })
      // 复位
      if (!res) {
        val = val ? 0 : 1
      }
    }
  }
}
</script>
