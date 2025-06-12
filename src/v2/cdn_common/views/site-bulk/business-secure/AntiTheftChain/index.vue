<template>
  <div>
    <ants-switch
      v-model="form.anti_theft_chain"
      active-text="ON"
      inactive-text="OFF"
    />

    <ants-form
      :model="form"
      :rules="rules"
      space-class="space-y-6"
      class="mt-lg"
      ref="formRef"
      label-width="110px"
      :disabled="form.anti_theft_chain == 0"
    >
      <ants-form-item label="黑白名单" required prop="match_mode">
        <ants-radio-group v-model="form.match_mode">
          <ants-radio :label="0" text="黑名单" />
          <ants-radio :label="1" text="白名单" />
        </ants-radio-group>
      </ants-form-item>
      <ants-form-item label="返回状态码" required prop="return_code">
        <ants-radio-group v-model="form.return_code">
          <ants-radio label="400" text="400" />
          <ants-radio label="404" text="404" />
          <ants-radio label="444" text="444" />
        </ants-radio-group>
      </ants-form-item>

      <ants-form-item label="包含referers" prop="no_blocked_referers">
        <ants-checkbox
          v-model="form.no_blocked_referers"
          text="HTTP头包含referers"
        />
      </ants-form-item>
      <ants-form-item label="授权域名" prop="match_domains">
        <ants-input
          v-model="form.match_domains"
          size="small"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 12 }"
          placeholder="请输入匹配域名，一行一个"
          style="max-width: 500px"
        />

        <div class="text-sm text-ants-text-4">
          {{ antsT('一行一个域名。支持前端通配符 * ，如') }}
          *.test.com
        </div>
      </ants-form-item>

      <ants-form-item label="文件类型" required prop="match_uri_type">
        <ants-radio-group v-model="form.match_uri_type" @change="changeType">
          <ants-radio :label="0" text="所有" />
          <ants-radio :label="1" text="文件后缀" />
          <ants-radio :label="2" text="文件路径" />
        </ants-radio-group>
      </ants-form-item>
      <ants-form-item
        label="匹配内容"
        prop="match_uri"
        v-if="form.match_uri_type != 0"
      >
        <FileExtension
          ref="FileExtensionRef"
          v-if="form.match_uri_type === 1"
          v-model="form.match_uri"
        >
          <ants-input
            type="textarea"
            v-model.trim="form.match_uri"
            :autosize="{ minRows: 1, maxRows: 8 }"
            placeholder="jpg|png|gif|css"
            @input="inputContent"
            style="max-width: 500px"
          />
        </FileExtension>

        <div v-else>
          <ants-input
            v-model="form.match_uri"
            size="small"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            placeholder="请输入匹配的文件路径，一行一个"
            style="max-width: 500px"
          />
          <div class="text-sm text-ants-text-4">
            {{ antsT('模糊匹配的文件路径，可输入多个，一行一个') }}
          </div>
        </div>
      </ants-form-item>
    </ants-form>
  </div>
</template>

<script>
import FileExtension from '@/v2/cdn_common/components/FileExtension'

export default {
  components: {
    FileExtension
  },
  data() {
    const { isDomains } = this.$validator

    const rules = {
      match_domains: [
        {
          required: true,
          message: '请输入匹配域名，一行一个',
          trigger: ['change', 'blur']
        },
        {
          validator: isDomains(),
          trigger: 'blur'
        }
      ],
      match_uri: [
        {
          required: true,
          message: '请输入匹配内容',
          trigger: ['change', 'blur']
        }
      ]
    }

    return {
      rules,
      form: {
        anti_theft_chain: 1,
        // 黑白名单, 黑 = 0， 白= 1
        match_mode: 0,
        // HTTP头包含referers, [bool]
        no_blocked_referers: false,
        // 授权域名，传给后台以 空格 隔开
        match_domains: '',
        // 文件类型, 传给后台正则表达式， 路径 = (\\sss\\aaa|ddd|\\bbb|ccc\\) 后缀 = \.(png|gif|jpg)$
        match_uri_type: 0,
        match_uri: '.*',
        // 返回码 400 404 444
        return_code: '400'
      }
    }
  },
  methods: {
    submit() {
      let isValid = false
      this.$refs.formRef.validate((valid) => {
        isValid = !valid
      })

      if (isValid) {
        this.$msg.error('请配置防盗链')
        return false
      }

      let matchUri = '.*'
      if (this.form.match_uri_type === 1) {
        matchUri = this.form.match_uri
      }

      if (this.form.match_uri_type === 2) {
        matchUri = this.form.match_uri.trim().replace(/[\r\n\s]+/g, '|')
      }

      return {
        anti_theft_chain: JSON.stringify({
          match_mode: this.form.match_mode,
          no_blocked_referers: this.form.no_blocked_referers,
          return_code: this.form.return_code,
          // 多个域名以 空格 隔开
          match_domains: this.form.match_domains
            .trim()
            .replace(/[\r\n]+/g, ' '),
          match_uri_type: this.form.match_uri_type,
          // 文件类型, 传给后台正则表达式， 路径 = (\\sss\\aaa|ddd|\\bbb|ccc\\) 后缀 = \.(png|gif|jpg)$
          match_uri: matchUri
        })
      }
    },

    // 文件类型切换
    changeType() {
      this.form.match_uri = ''
    },

    /**
     * @description: 匹配内容输入框改变，对应勾选值改变
     * @param {*} val
     */

    inputContent(val) {
      let arr = []
      if (val != '') {
        arr = val.split('|')
      }
      this.$refs.FileExtensionRef.content = arr
    }
  }
}
</script>
