<template>
  <div>
    <CheckCards ref="CheckCardsRef" :cards="cards" hideTips>
      <template #content="{ card }">
        <!-- OCSP Stapling -->
        <template v-if="card === 'ocsp'">
          <ants-switch
            v-model="form.ocsp"
            active-value="1"
            inactive-value="0"
            active-text="ON"
            inactive-text="OFF"
          />
        </template>

        <!-- WebSocket -->
        <template v-if="card === 'websocket'">
          <ants-switch
            v-model="form.websocket.websocket"
            active-value="1"
            inactive-value="0"
            active-text="ON"
            inactive-text="OFF"
          />

          <div v-if="form.websocket.websocket == 1" class="mt-lg">
            <span class="mr-lg text-ants-text-4">{{ antsT('超时时间') }}</span>
            <ants-input-number
              v-model="form.websocket.proxy_read_timeout"
              :precision="0"
              :step="1"
              :min="60"
              :max="86400"
              size="small"
            />
            <span class="ml-xs"> {{ antsT('秒') }}</span>
            <span class="text-sm text-ants-text-4 mr-lg">（60 ~ 86400）</span>
          </div>
        </template>

        <!-- 自定义HTTP响应头 -->
        <template v-if="card === 'add_header'">
          <ResponseHeaders ref="ResponseHeadersRef" />
        </template>

        <!-- 自定义HTTP回源请求头 -->
        <template v-if="card === 'proxy_set_header'">
          <RequestHeaders ref="RequestHeadersRef" />
        </template>
      </template>
    </CheckCards>

    <!-- 错误页面定制 -->
    <ErrorPage ref="ErrorPageRef" />
  </div>
</template>

<script>
import CheckCards from '../CheckCards'
import ResponseHeaders from './ResponseHeaders'
import RequestHeaders from './RequestHeaders'
import ErrorPage from './ErrorPage'

const cards = {
  ocsp: {
    title: 'OCSP Stapling',
    info: '浏览器需要使用 OCSP 服务检验网站证书的合法性，这里由优化节点获取网站证书的状态，主动推送给浏览器，避免因此造成的用户访问延迟'
  },
  websocket: {
    title: 'WebSocket',
    info: '开启后将允许服务端主动向客户端推送数据。'
  },
  add_header: {
    title: '自定义HTTP响应头',
    info: '支持您自定义 HTTP 响应头中的 header 信息'
  },
  proxy_set_header: {
    title: '自定义HTTP回源请求头',
    info: '支持您自定义节点至源站的 HTTP 请求头中的 header 信息'
  }
  // error_page: {
  //   title: '错误页面定制',
  //   info: ''
  // }
}

const defaultForm = {
  // [bool] OCSP Stapling，
  ocsp: 0,

  // WebSocket
  websocket: {
    // [bool] WebSocket,
    websocket: '0',
    // webSocket 超时时间
    proxy_read_timeout: 60
  }
}

export default {
  components: {
    CheckCards,
    ResponseHeaders,
    RequestHeaders,
    ErrorPage
  },
  data() {
    return {
      cards,
      form: {
        ...defaultForm
      }
    }
  },
  methods: {
    getForm() {
      const { submit = () => {} } = this.$refs.CheckCardsRef
      const checkFormKeys = submit()

      // 错误页面
      const errorPageData = this.$refs.ErrorPageRef.submit()

      if (!checkFormKeys && !errorPageData) {
        this.$msg.error('请勾选需要修改的配置')
        return false
      }

      const form = {}

      if (errorPageData) {
        Object.assign(form, errorPageData)
      }

      if (checkFormKeys) {
        const valid = checkFormKeys.every((key) => {
          switch (key) {
            // // OCSP Stapling
            // case 'ocsp':
            //   break

            // // WebSocket
            // case 'websocket':
            //   break

            // 自定义HTTP响应头
            case 'add_header':
              var resHeaderData = this.$refs.ResponseHeadersRef.submit()
              if (!resHeaderData) return false
              Object.assign(form, resHeaderData)
              break

            // 自定义HTTP回源请求头
            case 'proxy_set_header':
              var reqHeaderData = this.$refs.RequestHeadersRef.submit()
              if (!reqHeaderData) return false
              Object.assign(form, reqHeaderData)
              break

            default:
              this.createForm(key, form)
              break
          }

          return true
        })

        if (!valid) return false
      }

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
    }
  }
}
</script>

<style lang="scss" scoped></style>
