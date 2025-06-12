<template>
  <el-card class="animated fadeIn" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('SEO站内优化配置') }}</strong>
      <div class="text-ants-text-4 text-sm mt-xs">
        {{antsT('提高网站的关键字排名以及公司产品的曝光度')}}
      </div>
    </div>

    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="top"
      space-class="space-y-5"
    >
      <ants-form-item prop="title">
        <div slot="label">
          <strong>{{antsT('首页标题')}}</strong>
          <el-tooltip
            class="item"
            effect="dark"
            :content="antsT('最先出现的词语权重最高，建议设置（28 ~ 35）个字符。')"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </div>
        <ants-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 6 }"
          v-model="form.title"
          :placeholder="`${antsT('首页标题')}（title）`"
          maxlength="200"
        ></ants-input>
      </ants-form-item>

      <ants-form-item prop="keywords">
        <div slot="label">
          <strong>{{antsT('关键字')}}</strong>
          <el-tooltip
            class="item"
            effect="dark"
            :content="antsT('搜索关键字，应限制在（6 ~ 8）个关键字左右。')"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </div>

        <ants-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 6 }"
          v-model="form.keywords"
          :placeholder="`${antsT('关键字')}（keywords）`"
          maxlength="500"
        ></ants-input>
      </ants-form-item>

      <ants-form-item prop="description">
        <div slot="label">
          <strong>{{antsT('网站说明')}}</strong>
          <el-tooltip
            class="item"
            effect="dark"
            :content="antsT('作为网站的总体业务和主题概括，补充在title和keyWords中未能表述的说明。')"
            placement="right"
            maxlength="1000"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </div>
        <ants-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 6 }"
          v-model="form.description"
          :placeholder="`${antsT('网站说明')}（description）`"
        ></ants-input>
      </ants-form-item>

      <ants-form-item>
        <ants-button
          class="mt-sm"
          type="primary"
          :loading="btnLoading"
          @click="submitForm"
          text="保存配置"
        />
      </ants-form-item>
    </ants-form>
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
      this.$msg.success(this.antsT('保存配置成功'))
    }
  }
}
</script>
