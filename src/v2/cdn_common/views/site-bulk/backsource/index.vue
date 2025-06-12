<template>
  <CheckCards ref="CheckCardsRef" :cards="cards">
    <template #content="{ card }">
      <!-- 源站设置 -->
      <template v-if="card === 'source_base_info'">
        <SourceSiteSetting ref="SourceSiteSettingRef" />
      </template>

      <!-- 回源 HOST -->
      <template v-if="card === 'source_host'">
        <ants-radio-group v-model="form.source_host_radio">
          <ants-radio :label="0" text="默认（域名本身）" />
          <ants-radio :label="1" text="自定义" />
        </ants-radio-group>
        <div
          class="flex items-center mt-df"
          v-if="form.source_host_radio === 1"
        >
          <ants-input
            v-model="form.source_host"
            class="mr-3 max-w-md"
            size="small"
            placeholder="www.demo.com"
            style="width: 300px"
          />
        </div>
      </template>

      <!-- 回源 SNI -->
      <template v-if="card === 'source_sni'">
        <ants-radio-group v-model="form.source_sni_radio">
          <ants-radio :label="0" text="默认开启" />
          <ants-radio :label="1" text="自定义" />
        </ants-radio-group>
        <div class="flex items-center mt-df" v-if="form.source_sni_radio === 1">
          <ants-input
            v-model="form.source_sni"
            class="mr-3 max-w-md"
            size="small"
            placeholder="自定义 SNI"
            style="width: 300px"
          />
        </div>
      </template>

      <!-- Range 回源 -->
      <template v-if="card === 'slice'">
        <ants-switch
          v-model="form.slice"
          active-value="1"
          inactive-value="0"
          active-text="ON"
          inactive-text="OFF"
        />
      </template>

      <!-- 回源保持长连接 -->
      <template v-if="card === 'keepalive'">
        <ul class="space-y-10">
          <li>
            <span class="inline-block text-ants-text-4" style="width:120px;">{{
              antsT('缓存链接数量')
            }}</span>
            <ants-input-number
              v-model="form.keepalive.keepalive"
              :precision="0"
              :step="1"
              :min="1"
              :max="100"
              size="small"
            />
            <span class="mx-xs"> {{ antsT('个') }}</span>
            <span class="text-sm text-ants-text-4 mr-lg">（1 ~ 100）</span>
          </li>
          <li>
            <span class="inline-block text-ants-text-4" style="width:120px;">{{
              antsT('连接超时时间')
            }}</span>
            <ants-input-number
              v-model="form.keepalive.keepalive_timeout"
              :precision="0"
              :step="1"
              :min="5"
              :max="720"
              size="small"
            />
            <span class="mx-xs"> {{ antsT('秒') }}</span>
            <span class="text-sm text-ants-text-4 mr-lg">（5 ~ 720）</span>
          </li>
        </ul>
      </template>

      <!-- 回源超时配置 -->
      <template v-if="card === 'proxy_timeout'">
        <ul class="space-y-10">
          <li>
            <span class="inline-block text-ants-text-4" style="width:120px;">{{
              antsT('TCP连接超时时间')
            }}</span>
            <ants-input-number
              v-model="form.proxy_timeout.proxy_connect_timeout"
              :precision="0"
              :step="1"
              :min="5"
              :max="75"
              size="small"
            />
            <span class="mx-xs"> {{ antsT('秒') }}</span>
            <span class="text-sm text-ants-text-4 mr-lg">（5 ~ 75）</span>
          </li>
          <li>
            <span class="inline-block text-ants-text-4" style="width:120px;">{{
              antsT('回源加载超时时间')
            }}</span>
            <ants-input-number
              v-model="form.proxy_timeout.proxy_read_timeout"
              :precision="0"
              :step="1"
              :min="5"
              :max="300"
              size="small"
            />
            <span class="mx-xs"> {{ antsT('秒') }}</span>
            <span class="text-sm text-ants-text-4 mr-lg">（5 ~ 300）</span>
          </li>
          <li>
            <span class="inline-block text-ants-text-4" style="width:120px;">{{
              antsT('回源请求超时时间')
            }}</span>
            <ants-input-number
              v-model="form.proxy_timeout.proxy_send_timeout"
              :precision="0"
              :step="1"
              :min="5"
              :max="300"
              size="small"
            />
            <span class="mx-xs"> {{ antsT('秒') }}</span>
            <span class="text-sm text-ants-text-4 mr-lg">（5 ~ 300）</span>
          </li>
        </ul>
      </template>

      <!-- 客户端请求超时配置 -->
      <template v-if="card === 'client_timeout'">
        <ul class="space-y-10">
          <li>
            <span class="inline-block text-ants-text-4" style="width:120px;">{{
              antsT('请求头超时时间')
            }}</span>
            <ants-input-number
              v-model="form.client_timeout.client_header_timeout"
              :precision="0"
              :step="1"
              :min="5"
              :max="75"
              size="small"
            />
            <span class="mx-xs"> {{ antsT('秒') }}</span>
            <span class="text-sm text-ants-text-4 mr-lg">（5 ~ 300）</span>
          </li>
          <li>
            <span class="inline-block text-ants-text-4" style="width:120px;">{{
              antsT('请求体超时时间')
            }}</span>
            <ants-input-number
              v-model="form.client_timeout.client_body_timeout"
              :precision="0"
              :step="1"
              :min="5"
              :max="300"
              size="small"
            />
            <span class="mx-xs"> {{ antsT('秒') }}</span>
            <span class="text-sm text-ants-text-4 mr-lg">（5 ~ 300）</span>
          </li>
        </ul>
      </template>

      <!-- 服务端等待客户端两次请求的间隔时间 -->
      <template v-if="card === 'send_timeout'">
        <ul class="space-y-10">
          <li>
            <span class="inline-block text-ants-text-4" style="width:120px;">{{
              antsT('请求间隔超时时间')
            }}</span>
            <ants-input-number
              v-model="form.send_timeout"
              :precision="0"
              :step="1"
              :min="5"
              :max="75"
              size="small"
            />
            <span class="mx-xs"> {{ antsT('秒') }}</span>
            <span class="text-sm text-ants-text-4 mr-lg">（5 ~ 300）</span>
          </li>
        </ul>
      </template>
    </template>
  </CheckCards>
</template>

<script>
import CheckCards from '../CheckCards'
import SourceSiteSetting from './SourceSiteSetting'

const cards = {
  // source_base_info: {
  //   title: '源站设置',
  //   info: '指定回源地址和监听端口，支持回源到IP及域名。',
  //   tips: {
  //     list: [
  //       '1.http 协议默认开 80、8080 端口，https 协议默认开 443、8443 端口，不可更改使用，开通TCP安全加速可支持其他端口；',
  //       '2.回源到 IP 请填写服务器 IP 地址，回源到域名请填写对应域名；',
  //       '3.使用HTTPS协议请上传 SSL&TLS 并开启 HTTPS，否则将影响站点正常访问；',
  //       '4.不支持端口：21, 22, 23, 25, 68, 135, 139, 445, 593, 873, 1068, 1111, 1434, 1871, 2121, 3208, 4331, 4334, 4444, 4510, 4557, 5152, 5153, 5154, 5554, 5800, 5900, 9995, 9996, 45050, 45060, 65432, 65050, 64150, 64151, 61081, 10050, 32767, 10022。'
  //     ]
  //   }
  // },
  source_host: {
    title: '回源 HOST',
    info: '自定义性能优化节点取源站数据时所需访问的 WEB 服务器域名。'
  },
  source_sni: {
    title: '回源 SNI',
    info:
      '当业务源站IP绑定多个域名且CDN节点以HTTPS协议访问源站时，必须指定访问的具体域名。'
  },
  slice: {
    title: 'Range 回源',
    info:
      '需要源站支持Range请求，开启后可以按块缓存，按需回源，提高缓存命中率和响应速度。',
    tips: {
      title: '只对下面这些文件后缀名生效：',
      list: [
        '视频：AVI、MP4、RMVB、FLV、WMV、MOV、3GP、ASF、MPG、F4V、MKV、VOB、M3U8、TS、DAT、RM；',
        '音频：MP3、OGG、M4A、WMA、AIF、AU；',
        '安装包：APK、ZIP、EXE、RAR、IPA、PXL、DEB、SIS、JAR、XAP；',
        '其他：SO、CUE、CCD、MDS、IMG、7Z、CAB、DHP、GZ、ISO、MPQ、PBCV、PXL、QNP、P00、XY、XY2。'
      ]
    }
  },
  keepalive: {
    title: '回源保持长连接',
    info:
      '回源使用连接保活可以复用现有的连接（需源服务器支持keepalive），避免每次请求都重新建立TCP请求，可大幅提升回源性能，减小延迟。'
  },
  proxy_timeout: {
    title: '回源超时配置',
    info:
      '安全节点的回源请求TCP建连超时等待时间默认为30秒，您可以根据实际需求设置回源请求的最长等待时间，最长不超过300'
  },
  client_timeout: {
    title: '客户端请求超时配置',
    info:
      '服务器端读取客户端请求头数据的超时时间，如果超过这个时间客户端还没有发送完整的数据，服务器端将返回408错误。'
  },
  send_timeout: {
    title: '服务端等待客户端两次请求的间隔时间',
    info: ''
  }
}

const defaultForm = {
  // 源站设置
  source_base_info: [],

  // 由于 bool 值传递过来时，会自动变成 '0'、'1'，所以这里用 '0' 、'1' 代替
  // [text] 回源域名， 为空时为自身，有值时为自定义
  source_host: '',
  source_host_radio: 0,

  // [text] 回源 SNI(为空表示 关闭),
  source_sni: '',
  source_sni_radio: 0,

  // [bool] range 分片回源 开关,
  slice: '0',

  // 回源保持长连接,
  keepalive: {
    // [int] 与源保存缓存链接数量
    keepalive: 1,
    // [int] 客户端连接在服务器端保持多久后退出
    keepalive_timeout: 360
  },

  // 回源超时
  proxy_timeout: {
    // [int] TCP连接时间超时设置（0为不限制 ），与upstream server的连接超时时间（没有单位，最大不可以超过75s）
    proxy_connect_timeout: 15,
    // [text] 回源加载时间超时设置（0为不限制 ），nginx会等待多长时间来获得请求的响应15s
    proxy_read_timeout: 15,
    // [text] 发送请求给upstream服务器的超时时间15s
    proxy_send_timeout: 15
  },

  // 客户端请求超时
  client_timeout: {
    // [int] 设置读取客户端请求主体的超时间，
    client_body_timeout: 15,
    // [int] 设置读取客户端请求头数据的超时时间，如果超过这个时间客户端还没有发送完整的数据，服务器端将返回408错误，放置客户端利用http协议进行***， [int]
    client_header_timeout: 15
  },

  // [int] 服务端等待客户端两次请求的间隔时间
  send_timeout: 30
}

export default {
  components: {
    CheckCards,
    SourceSiteSetting
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
      if (!checkFormKeys) return false

      const form = {}
      const valid = checkFormKeys.every(key => {
        switch (key) {
          // 源站设置
          case 'source_base_info':
            var sourceBaseData = this.$refs.SourceSiteSettingRef.submit()
            if (!sourceBaseData) return false
            form.source_base_info = sourceBaseData
            break

          // 回源HOST
          case 'source_host':
            if (this.form.source_host_radio) {
              if (!this.form.source_host) {
                this.$msg.error('请输入自定义回源HOST')
                return false
              }
              form.source_host = this.form.source_host
            } else {
              form.source_host = ''
            }
            break

          // 回源SNI
          case 'source_sni':
            if (this.form.source_sni_radio) {
              if (!this.form.source_sni) {
                this.$msg.error('请输入自定义回源HOST')
                return false
              }
              form.source_sni = this.form.source_sni
            } else {
              form.source_sni = ''
            }
            break

          // // 回源保持长连接
          // case 'keepalive':
          //   this.createForm(key, form)
          //   break

          // // 回源超时配置
          // case 'proxy_timeout':
          //   this.createForm(key, form)
          //   break

          // // 客户端请求超时配置
          // case 'client_timeout':
          //   this.createForm(key, form)
          //   break

          // // 服务端等待客户端两次请求的间隔时间
          // case 'send_timeout':
          //   break

          default:
            this.createForm(key, form)
            break
        }
        return true
      })

      console.log('valid', valid, form)

      if (!valid) return false

      return form
    },

    // 生成form-item
    createForm(prop, form) {
      const value = this.form[prop]

      // 如果为对象
      if (this.$valid.isObject(value)) {
        Object.keys(value).forEach(key => {
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
