<template>
  <ants-form-card key="11">
    <template slot="title">{{ antsT('回源301/302跟随') }}</template>

    <template slot="content">
      <ul class="space-y-lg">
        <li>
          <ants-switch
            v-model="status"
            active-text="ON"
            inactive-text="OFF"
            :active-value="1"
            :inactive-value="0"
            v-loading="$attrs.btnLoading"
            @change="changeStatus"
          />
        </li>
        <li>
          <span class="inline-block text-ants-text-4" style="width: 120px">{{
            antsT('重试次数上限')
          }}</span>
          <ants-input-number
            v-model="form.proxy_next_upstream_tries"
            :precision="0"
            :step="1"
            :min="1"
            :max="10"
            size="small"
            :disabled="!status"
          />
          <span class="mx-xs"> {{ antsT('次') }}</span>
          <span class="text-sm text-ants-text-4 mr-lg">（1 ~ 10）</span>
        </li>

        <li>
          <span class="inline-block text-ants-text-4" style="width: 120px">{{
            antsT('跟随保留参数')
          }}</span>
          <ants-switch
            v-model="form.follow_args"
            active-text="ON"
            inactive-text="OFF"
            :disabled="!status"
          />
        </li>

        <li>
          <span class="inline-block text-ants-text-4" style="width: 120px">{{
            antsT('跟随保留请求头')
          }}</span>
          <ants-switch
            v-model="form.follow_headers"
            active-text="ON"
            inactive-text="OFF"
            :disabled="!status"
          />
        </li>

        <li>
          <span class="inline-block text-ants-text-4" style="width: 120px">{{
            antsT('缓存源数据')
          }}</span>

          <ants-switch
            v-model="form.cache_flag"
            active-text="ON"
            inactive-text="OFF"
            :disabled="!status"
          />
        </li>
        <li>
          <ants-button
            class="mt-sm"
            size="small"
            type="primary"
            icon="el-icon-edit"
            :disabled="!status"
            :loading="$attrs.btnLoading"
            @click="submitForm"
            text="提 交"
          />
        </li>
      </ul>
    </template>
  </ants-form-card>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      status: 0,
      // 回源301/302跟随 [l_text]
      form: {
        // 重试次数上限 1 ~10
        proxy_next_upstream_tries: 3,
        // 跟随保留参数
        follow_args: 0,
        // 跟随保留请求头
        follow_headers: 1,
        // 缓存源数据
        cache_flag: 1
      },
      rules: {
        proxy_next_upstream_tries: [
          {
            required: true,
            message: '请输入重试次数上限',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  created() {
    this.getData()
  },
  methods: {
    async changeStatus(val) {
      const res = await this.$listeners.changeSiteAttrStatus({
        pkey: 'follow_30x',
        status: val
      })
      // 复位
      if (!res) {
        val = val ? 0 : 1
      }
    },

    // 获取数据
    async getData() {
      this.loading = true
      try {
        const { data: res } = await this.$listeners.getSiteDetail(
          '',
          'follow_30x'
        )
        const { attr = [] } = res
        attr.forEach((item) => {
          const { pkey, pvalue, status } = item
          if (pkey === 'follow_30x') {
            this.status = status
            const pvalueObj = JSON.parse(pvalue)
            this.form = { ...this.form, ...pvalueObj }
          }
        })

        console.log(this.form)
      } finally {
        this.loading = false
      }
    },

    /**
     * @description: 点击提交
     */
    submitForm() {
      // this.$refs.formRef.validate((valid) => {
      //   if (!valid) return

      this.saveSiteAttr({
        follow_30x: JSON.stringify({
          ...this.form
        })
      })
      // })
    },

    /**
     * @description: 保存配置数据
     */

    async saveSiteAttr(dataObj) {
      const res = await this.$listeners.saveSiteAttr(dataObj)
    }
  }
}
</script>
