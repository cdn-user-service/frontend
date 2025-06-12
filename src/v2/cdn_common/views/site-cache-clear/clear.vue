<template>
  <el-card class="content-box animated fadeIn">
    <ants-radio-group v-model="form.type" size="small" @change="changeType">
      <ants-radio-button
        v-for="(value, key) in typeObj"
        :key="key"
        :label="key"
        :text="value.title"
      />
    </ants-radio-group>

    <ul class="ants-tips_box my-lg space-y-4">
      <li v-for="(item, idx) in typeObj[form.type].tips" :key="idx">
        {{ antsT(item) }}
      </li>
    </ul>

    <ants-form
      label-position="top"
      :model="form"
      :rules="rules"
      ref="formRef"
      class="my-lg"
    >
      <ants-form-item prop="content">
        <ants-input
          v-model="form.content"
          :placeholder="`${antsT('请输入')} ${antsT(
            typeObj[form.type].placeholder
          )}，${antsT('以http(s)://开头，一行一个')}`"
          type="textarea"
          :autosize="{ minRows: 12, maxRows: 20 }"
        />
      </ants-form-item>
    </ants-form>

    <ants-button
      :disabled="$root.disabledCrud"
      text="刷新缓存"
      type="primary"
      size="small"
      icon="el-icon-brush"
      :loading="btnLoading"
      @click="doClear"
    />
  </el-card>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doClearCache } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

const typeObj = {
  host: {
    title: '整站刷新',
    placeholder: '指定站点',
    tips: [
      '1、请输入需要刷新的域名，以 http(s):// 开头，/* 结尾，如：http://www.demo.com/*，一行一个域名；',
      '2、非本账号下的域名将被忽略；',
      '3、不支持泛域名清理缓存，需输入具体域名进行清理；',
      '4、单次最多支持1000条，且重复的域名将被忽略。'
    ]
  },
  url: {
    title: '指定URL刷新',
    placeholder: '指定URL',
    tips: [
      '1、请输入需要刷新的URL，以 http(s):// 开头，如：http://www.demo.com/img.png，一行一个URL；',
      '2、支持输入正则匹配，如：http://www.demo.com/lib/*/img.png',
      '3、非本账号下的域名URL将被忽略；',
      '4、单次最多支持1000条，且重复的URL将被忽略。'
    ]
  },
  catalog: {
    title: '指定目录刷新',
    placeholder: '指定目录',
    tips: [
      '1、请输入需要刷新的目录，以 http(s):// 开头，/* 结尾，如：http://www.demo.com/css/*，一行一个目录；',
      '2、支持输入正则匹配，如：http://www.demo.com/*/js/*',
      '3、非本账号下的域名目录将被忽略；',
      '4、单次最多支持1000条，且重复的目录将被忽略。'
    ]
  },
  suffix: {
    title: '指定文件类型',
    placeholder: '指定站点',
    tips: [
      '1、请输入指定文件类型，以 http(s):// 开头，如：http://www.demo.com/js/index.js，一行一个；',
      '2、支持输入正则匹配，如：http://www.demo.com/img/*.(js|css|jpg)',
      '3、非本账号下的站点下指定文件将被忽略。'
    ]
  }
}

export default {
  components: {},
  data() {
    return {
      btnLoading: false,
      typeObj,
      form: {
        type: 'host',
        content: ''
      },
      rules: {
        content: [
          {
            required: true,
            message: '请输入需要清理缓存的内容',
            trigger: ['change', 'blur']
          },
          {
            validator: (rule, value, callback) => {
              const content = value.trim()
              const contentArr = content.split(/[\r\n]+/)
              // 具体的校验后端做，这里只用判断不能包含空格，且必须以 http(s):// 开头
              let text = ''
              // 临时对象，用于判读域名是否重复
              const nowArr = []
              const isOk = contentArr.every((item) => {
                const itemTrim = item.trim()
                // 以 http(s):// 开头
                if (itemTrim.search(/^https?:\/\//) === -1) {
                  text = `请以 http(s):// 开头【${itemTrim}】`
                  return false
                }

                if (itemTrim.search(/\s+/g) != -1) {
                  text = `不能包含空格【${itemTrim}】`
                  return false
                }

                if (nowArr.includes(itemTrim)) {
                  text = `不能重复【${itemTrim}】`
                  return false
                }
                nowArr.push(itemTrim)
                return true
              })

              if (isOk) return callback()
              callback(new Error(text))
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {},
  created() {},
  methods: {
    changeType(val) {
      this.form.content = ''
    },

    // 清理缓存提交
    doClear() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.btnLoading = true
        const content = this.form.content.trim()
        const contentArr = content.split(/[\r\n]+/)
        // 需要去掉每一行空格
        const arr = contentArr.map((item) => item.trim())
        try {
          // 推送 urls 进行刷新缓存
          const { data: res } = await doClearCache({
            // 传递一\n分割的字符串
            urls: arr.join('\n')
          })
          if (res.code !== 1) return
          this.$msg.success(this.antsT('刷新缓存成功'))
          this.form.content = ''
        } finally {
          this.btnLoading = false
        }
      })
    }
  }
}
</script>
