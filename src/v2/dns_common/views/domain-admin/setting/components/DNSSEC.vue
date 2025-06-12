<template>
  <div>
    <el-card class="mb-lg" style="min-height: 300px;">
      <div slot="header">
        <TitleBorder :title="title" />
        <div class="text-ants-text-4"></div>
      </div>
      <div class="ants-tips_box mb-df">
        DNSSEC 将对域名系统（DNS）提供给 DNS 客户端（ Local DNS ）的 DNS
        数据来源进⾏认证，可有效保护权威 DNS 和 Local DNS
        之间数据不被攻击篡改，确保解析结果的真实与可靠性。
      </div>

      <div class="py-lg">
        <ants-button
          type="primary"
          text="立即启用"
          v-if="!status"
          :disabled="loading"
          :loading="btnLoading"
          @click="changeSecStatus(1)"
        />

        <ants-button
          v-else
          type="danger"
          text="关闭DNSSEC"
          :disabled="loading"
          :loading="btnLoading"
          @click="changeSecStatus(0)"
        />
      </div>

      <el-skeleton
        v-if="status"
        :rows="8"
        animated
        :loading="$root.loading || loading"
      >
        <template>
          <div style="max-width:500px;">
            <ants-form
              :model="form"
              :rules="rules"
              label-position="top"
              label-width="100px"
              ref="formRef"
              spaceClass="space-y-2"
            >
              <ants-form-item
                prop="remarks"
                v-for="(item, key) in nameObj"
                :key="key"
                :label="item"
              >
                <div
                  style="line-height:1.2;"
                  class="py-sm px-df flex justify-between rounded-lg border border-ants-border-2"
                >
                  <div class="flex-1 break-all">
                    {{ form[key] }}
                  </div>
                  <ants-copy icon :text="form[key]" />
                </div>
              </ants-form-item>
            </ants-form>
          </div>
        </template>
      </el-skeleton>
    </el-card>
  </div>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getDomainSec } = require(`@/v2/${PROCESS_NAME}/api/dns/dnssec`)
const { doUpdateDomainAttr } = require(`@/v2/${PROCESS_NAME}/api/dns/domain`)

const nameObj = {
  DS: 'DS记录 DS Record',
  KeyTag: '密钥标签 Key Tag',
  Algorithm: '加密算法 Algorithm',
  DigestType: '摘要类型 Digest Type',
  Digest: '摘要 Digest',
  PublicKey: '公钥 Public Key',
  Flags: '公钥类型 Flags'
}

export default {
  name: 'DNSSEC',
  props: {
    title: {
      type: String,
      default: 'DNSSEC'
    },
    domainInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      nameObj,
      loading: false,
      btnLoading: false,
      // 是否已开启SEC
      status: 0,
      form: {
        DS: '',
        KeyTag: '',
        Algorithm: '',
        DigestType: '',
        Digest: '',
        PublicKey: '',
        Flags: ''
      },
      rules: {},
      domainId: null,
      domain: null
    }
  },
  created() {},
  methods: {
    // 数据化获取数据
    initData({ id, domain, confSecStatus }) {
      console.log(id, domain, confSecStatus)
      this.domainId = id
      this.domain = domain
      this.status = confSecStatus
      this.getData()
    },

    // 获取DNSSEC数据
    async getData() {
      this.loading = true
      try {
        const { data: res } = await getDomainSec({
          domain: this.domain
        })
        if (res.code !== 1) return
        this.status = res.status || 0
        if (res.status) {
          this.form = {
            ...this.form,
            ...res.data
          }
        }
      } finally {
        this.loading = false
      }
    },

    // 启用SEC
    async changeSecStatus(status = 0) {
      if (!status) {
        const result = await this.$doDelete({
          title: '关闭DNSSEC',
          content: '关闭DNSSEC后，您的域名将无法使用DNSSEC功能，是否继续？'
        })
        if (!result) return
      }

      this.btnLoading = true
      try {
        const { data: res } = await doUpdateDomainAttr({
          id: this.domainId,
          confSecStatus: status
        })
        if (res.code !== 1) return
        this.$msg.success(status ? '启用成功' : '关闭成功')
        this.$emit('refresh')
        this.getData()
      } finally {
        this.btnLoading = false
      }
    }
  }
}
</script>
