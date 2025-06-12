<template>
  <el-popover
    placement="left-start"
    width="800"
    trigger="click"
    v-bind="$attrs"
  >
    <div class="p-sm">
      <div class="flex justify-between items-center">
        <div class="font-semibold">
          您需要前往域名所在DNS服务商，添加以下的
          <strong class="text-primary"> {{ text }} </strong>记录：
        </div>

        <ants-button
          type="primary"
          icon="el-icon-refresh"
          :text="`已添加？`"
          size="mini"
          :loading="loading"
          @click="doVerify()"
        />
      </div>

      <el-table
        size="mini"
        border
        :data="textRecords"
        max-height="400"
        style="margin-top:10px;"
      >
        <ants-table-column prop="mainDomain" label="主域名" min-width="150">
          <template #default="{ row }">
            <ants-copy :text="row.mainDomain" />
          </template>
        </ants-table-column>

        <ants-table-column prop="top" label="主机记录" min-width="150">
          <template #default="{ row }">
            <ants-copy v-if="row.top" :text="row.top" />
          </template>
        </ants-table-column>

        <ants-table-column prop="type" label="记录类型" min-width="60">
          {{ text }}
        </ants-table-column>

        <ants-table-column prop="value" label="记录值" min-width="200">
          <template #default="{ row }">
            <div style="line-height:1.5">
              <ants-copy :text="row.value" />
            </div>
          </template>
        </ants-table-column>
      </el-table>
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
