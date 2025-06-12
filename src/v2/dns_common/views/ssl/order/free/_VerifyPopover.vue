<template>
  <el-popover placement="left-start" width="480" trigger="click" v-bind="$attrs">
    <div class="p-sm">
      <div class="font-semibold">
        您需要前往域名所在DNS服务商，添加下面的{{ text }}记录：
      </div>
      <div
        class="bg-ants-bg-3 px-df py-1 space-y-df mb-lg mt-sm rounded-2xl overflow-y-auto"
        style="max-height: 500px;min-height:50px"
      >
        <div
          class="text-sm py-sm border-ants-border-2"
          :class="{ 'border-t': idx }"
          v-for="(item, idx) in textRecords"
          :key="item.domain"
        >
          <div class="flex mb-sm">
            <span
              class="text-ants-text-4 inline-block text-right"
              style="min-width:70px;"
              >域名：</span
            >
            <div class="flex-1">
              <ants-copy :text="item.domain" />
            </div>
          </div>
          <div class="flex mb-sm">
            <span
              class="text-ants-text-4 inline-block text-right"
              style="min-width:70px;"
              >主机记录：</span
            >
            <div class="flex-1">
              <ants-copy :text="item.top" />
            </div>
          </div>
          <div class="flex">
            <span
              class="text-ants-text-4 inline-block text-right"
              style="min-width:70px;"
              >记录值：</span
            >
            <div class="flex-1">
              <ants-copy :text="item.value" />
            </div>
          </div>
        </div>
      </div>

      <div class="">
        <ants-button
          type="primary"
          icon="el-icon-refresh"
          :text="`我已添加${text}记录？`"
          size="mini"
          :loading="loading"
          @click="doVerify()"
        />
      </div>
    </div>

    <span slot="reference" style="cursor: pointer;">
      {{ antsT(`需添加${text}记录`) }}
      <i class="el-icon-info text-primary"></i>
    </span>
  </el-popover>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { verifyFreeSsl } = require(`@/v2/${PROCESS_NAME}/api/dns/ssl`)
export default {
  props: {
    orderId: {
      required: true,
      type: [String, Number]
    },
    textRecords: {
      type: Array,
      default: () => []
    },
    text: {
      type: String,
      default: 'TXT'
    }
  },
  data() {
    return {
      visibile: true,
      loading: false
    }
  },
  methods: {
    async doVerify() {
      this.loading = true
      try {
        const { data: res } = await verifyFreeSsl({
          orderId: this.orderId
        })
        if (res.code !== 1) return
        this.$msg.success('操作成功')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
