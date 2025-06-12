<template>
  <el-card class="animated fadeIn content-box" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('SEO站内优化配置') }}</strong>
      <div class="text-ants-text-4 mt-xs text-sm">
        提高网站的关键字排名以及公司产品的曝光度。
      </div>
    </div>

    <el-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="100px"
      status-icon
      label-position="top"
    >
      <el-form-item prop="title">
        <div slot="label">
          <strong>首页标题</strong>
          <el-tooltip
            class="item"
            effect="dark"
            content="最先出现的词语权重最高，建议设置（28 ~ 35）个字符。"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </div>
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 6 }"
          v-model="form.title"
          placeholder="首页标题（title）"
          maxlength="200"
        ></el-input>
      </el-form-item>

      <el-form-item prop="keywords">
        <div slot="label">
          <strong>关 键 字</strong>
          <el-tooltip
            class="item"
            effect="dark"
            content="搜索关键字，应限制在（6 ~ 8）个关键字左右。"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </div>

        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 6 }"
          v-model="form.keywords"
          placeholder="关键字（keywords）"
          maxlength="500"
        ></el-input>
      </el-form-item>

      <el-form-item prop="description">
        <div slot="label">
          <strong>网站说明</strong>
          <el-tooltip
            class="item"
            effect="dark"
            content="作为网站的总体业务和主题概括，补充在title和keyWords中未能表述的说明。"
            placement="right"
            maxlength="1000"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </div>
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 6 }"
          v-model="form.description"
          placeholder="网站说明（description）"
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button
          size="small"
          type="primary"
          :loading="btnLoading"
          @click="submitForm"
          icon="el-icon-check"
          >保存配置</el-button
        >
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      btnLoading: false,
      form: {
        title: '',
        keywords: '',
        description: ''
      },
      formRules: {}
    }
  },
  created() {
    this.getData()
  },
  methods: {
    /**
     * @description: 获取数据
     */

    async getData() {
      const { seo } = await this.$listeners.getBasicConfig()
      this.form = seo || {}
    },

    /**
     * @description: 提交数据
     */

    async submitForm() {
      this.btnLoading = true

      const res = await this.$listeners.updateBasicConfig({
        seo: this.form
      })

      this.btnLoading = false

      if (res.code !== 1) return
      this.$msg.success('保存配置成功')
    }
  }
}
</script>
