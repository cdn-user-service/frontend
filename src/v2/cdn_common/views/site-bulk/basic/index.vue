<template>
  <CheckCards ref="CheckCardsRef" :cards="cards">
    <template #content="{ card }">
      <!-- 日志记录模式 -->
      <template v-if="card === 'access_log_mode'">
        <ants-radio-group v-model="form.access_log_mode">
          <ants-radio
            v-for="(item, key) in {
              0: '关闭日志',
              1: '无限制',
              // 2: '限制 1条/秒',
              // 3: '限制 10条/秒',
              4: '限制 100条/秒',
              5: '限制 1000条/秒',
              6: '限制 1万条/秒',
              7: '限制 10万条/秒'
            }"
            :key="key"
            :label="+key"
            :text="item"
            class="inline-block my-sm"
          />
        </ants-radio-group>
      </template>

      <!-- 证书管理 -->
      <template v-if="card === 'ssl'">
        <ul class="space-y-12">
          <li v-for="(value, key) in switchObj" :key="key">
            <TitleBorder class="mb-lg">
              <strong>{{ antsT(value.title) }}</strong>
              <span class="ml-xs mr-xl text-sm text-ants-text-4">
                {{ antsT(value.info) }}
              </span>
            </TitleBorder>
            <ants-radio-group
              v-model="form.ssl[key]"
              v-if="key == 'forced_ssl'"
            >
              <template v-if="$mode[179]">
                <ants-radio label="0" text="关闭" />
                <ants-radio label="1" text="强制HTTPS" />
                <ants-radio label="2" text="加速跳转" />
                <ants-radio label="3" text="加密跳转" />
              </template>

              <template v-else>
                <ants-radio label="0" text="关闭" />
                <ants-radio label="1" text="301跳转" />
                <ants-radio label="3" text="加密跳转" />
              </template>
            </ants-radio-group>

            <ants-switch
              v-else
              v-model="form.ssl[key]"
              active-text="ON"
              inactive-text="OFF"
              active-value="1"
              inactive-value="0"
            />
          </li>

          <li>
            <TitleBorder class="mb-lg">
              <strong>{{ antsT('TLS版本控制') }}</strong>
              <span class="ml-xs mr-xl text-sm text-ants-text-4">
                {{
                  antsT(
                    '提供安全保密和数据完整性保障。TLS协议版本开启或关闭后，您的加速域名也将开启或关闭TLS握手。'
                  )
                }}
              </span>
            </TitleBorder>
            <div class="mt-xl flex items-center">
              <el-radio-group v-model="form.ssl.ssl_protocols">
                <el-radio label="TLSv1 TLSv1.1 TLSv1.2" />
                <el-radio label="TLSv1.1 TLSv1.2 TLSv1.3" />
              </el-radio-group>
            </div>
          </li>
        </ul>
      </template>
    </template>
  </CheckCards>
</template>

<script>
import CheckCards from '../CheckCards'

const cards = {
  access_log_mode: {
    title: '日志记录模式',
    info: '浏览器需要使用 OCSP 自定义站点的日志模式选项。若无特殊需求，推荐跟随默认设置：默认限制1000条/秒'
  },
  ssl: {
    title: '证书管理',
    info: 'HTTPS提供对网络服务器的身份认证，保护交换数据的隐私和完整性。'
  }
}

const switchObj = {
  forced_ssl: {
    title: '强制HTTPS',
    info: '强制 HTTP 跳转 HTTPS，启用之前请先配置 HTTPS 证书。'
  },
  forced_hsts: {
    title: 'HSTS',
    info: 'HSTS 为强制客户端（如浏览器）使用 HTTPS 与服务器创建连接，启用 HSTS 前请先启用 HTTPS 协议。'
  },
  ssl_http2: {
    title: '开启HTTP2',
    info: '开启之前请先配置 HTTPS 证书。'
  }
}

const defaultForm = {
  // [int] 日志模式选项
  access_log_mode: 5,

  // 证书管理
  ssl: {
    // [bool] 强制HTTPS开关
    forced_ssl: '0',
    // [bool] HSTS开关
    forced_hsts: '0',
    // [bool] HTTP2开关
    ssl_http2: '0',
    // [text] TLS
    ssl_protocols: 'TLSv1 TLSv1.1 TLSv1.2'
  }
}

export default {
  components: { CheckCards },
  data() {
    return {
      cards,
      switchObj,
      form: {
        ...defaultForm
      }
    }
  },
  created() {},
  methods: {
    getForm() {
      const { submit = () => {} } = this.$refs.CheckCardsRef
      const checkFormKeys = submit()
      if (!checkFormKeys) return false

      const form = {}
      checkFormKeys.forEach((key) => {
        // 日志记录模式
        if (key === 'access_log_mode') {
          form[key] = this.form[key]
        }

        // 证书管理
        if (key === 'ssl') {
          this.createForm(key, form)
        }
      })

      return form
    },

    // 生成form-item
    createForm(prop, form) {
      const value = this.form[prop]

      // 如果为对象
      if (this.$valid.isObject(value)) {
        Object.keys(value).forEach((key) => {
          form[key] = value[key]
        })
        return
      }

      // 如果为单个值
      form[prop] = value
    },

    resetForm() {
      this.form = {
        ...defaultForm
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
