<template>
  <ants-form
    :model="form"
    :rules="rules"
    ref="formRef"
    space-class="space-y-1"
    label-width="80px"
    label-position="top"
    :disabled="$root.disabledCrud"
  >
    <ants-form-item
      style="display:flex;align-items: center;"
      label="来源验证"
      required
      prop="refererUrl"
    >
      <ants-switch
        style="padding-left: 15px;margin-top: -4px;"
        v-model="form.refererUrl"
        active-text="ON"
        inactive-text="OFF"
        :active-value="1"
        :inactive-value="0"
        @change="handleChange"
        :loading="loading"
      />
    </ants-form-item>

    <ants-form-item
      label="开启来源验证请设置来源地址（Referer）"
      prop="referer_verify_url"
    >
      <ants-input
        v-model="form.referer_verify_url"
        type="textarea"
        :autosize="{
          minRows: 5,
          maxRows: 5
        }"
        placeholder="请输入来源地址，一行一个"
        style="max-width:350px;"
      />
    </ants-form-item>

    <div class="pt-df">
      <ants-button
        size="small"
        type="primary"
        icon="el-icon-edit"
        :loading="$attrs.btnLoading"
        text="保存配置"
        @click="submitForm()"
      />
    </div>
  </ants-form>
</template>

<script>
import { isUrl } from '@/utils/validate'

export default {
  props: {
    refererUrl: {
      type: Number,
      default: 0
    }
  },
  watch: {
    refererUrl: {
      handler(val) {
        this.form.refererUrl = val || 0
      },
      immediate: true
    }
  },
  data() {
    // 不能包含 * " ' () [] {}
    const checkStr = (val = '') => {
      const reg = /[*"'()[\]{}]/
      return !reg.test(val)
    }

    const checkRefererUri = (rule, value, callback) => {
      if (value === undefined || value === '') return callback()
      // 将数据拆分成一行一个
      const newArr = (value || '').trim().split(/[\r\n]+/)

      // 是否正确的格式
      let isOk = false
      // 临时数组，用于判读是否重复
      const nowArr = []

      // 遍历数组
      newArr.every((item, idx) => {
        const itemTrim = item.trim()
        isOk = checkStr(itemTrim)

        if (!isOk) {
          callback(new Error('不能包含字符 * " \' [ ] {} () ：' + itemTrim))
          return isOk
        }

        // 判断是否重复，如果当前在数组中第一次出现的位置不是 i，则认为重复
        nowArr[idx] = itemTrim // 将数据存入临时数组
        if (nowArr.indexOf(itemTrim) != idx) {
          isOk = false
          callback(new Error('不能重复：' + itemTrim))
        }
        return isOk
      })

      if (isOk) callback()
    }

    return {
      loading: false,
      form: {
        refererUrl: 0,
        referer_verify_url: ''
      },
      rules: {
        referer_verify_url: [
          {
            required: true,
            message: '请输入来源地址，一行一个',
            trigger: ['change', 'blur']
          },
          {
            validator: checkRefererUri,
            trigger: ['blur']
          }
        ]
      },
      btnLoading: false
    }
  },
  created() {
    this.getData()
  },
  methods: {
    // 获取来源地址数据
    async getData() {
      const { data: res } = await this.$listeners.getSiteDetail(
        '',
        'referer_verify_url'
      )
      if (!res.attr.length) return
      res.attr.forEach(item => {
        const { pkey, pvalue } = item
        if (pkey === 'referer_verify_url') {
          this.form[pkey] = (pvalue || '').replace(/\|/g, '\n')
        }
      })
    },

    // 提交来源地址
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        try {
          const value = this.form.referer_verify_url.trim()
          const res = await this.$listeners.saveSiteAttr({
            referer_verify_url: value.replace(/[\r\n]/g, '|')
          })
        } finally {
          this.btnLoading = false
        }
      })
    },

    async handleChange(val) {
      this.loading = true
      try {
        await this.$listeners.switchRefererUrl({
          refererUrl: val
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
