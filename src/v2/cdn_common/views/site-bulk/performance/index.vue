<template>
  <CheckCards ref="CheckCardsRef" :cards="cards">
    <template #content="{ card }">
      <!-- 高级缓存 -->
      <template v-if="card === 'cache_config'">
        <AdvancedCache ref="AdvancedCacheRef" />
      </template>

      <!-- 缓存响应 -->
      <template v-if="card === 'proxy_next_upstream'">
        <ul class="space-y-12">
          <li class="flex items-center">
            <span class="mr-lg inline-block" style="width: 100px">{{
              antsT('故障状态码')
            }}</span>
            <ants-checkbox-group v-model="form.proxy_next_upstream">
              <ants-checkbox
                v-for="(item, key) in {
                  http_500: '500',
                  http_502: '502',
                  http_503: '503',
                  http_504: '504'
                }"
                :key="key"
                :label="key"
                :text="item"
              />
            </ants-checkbox-group>
          </li>
        </ul>
      </template>
      <!-- 强制缓存 -->
      <template v-if="card === 'cache_rule'">
        <ants-switch
          v-model="form.default_location_cache_rule_switch"
          active-text="ON"
          inactive-text="OFF"
        />
        <div v-if="form.default_location_cache_rule_switch == 1" class="mt-lg">
          <span class="mr-lg text-ants-text-4">{{ antsT('缓存时间') }}</span>
          <ants-input-number
            v-model="form.default_location_cache_rule"
            :precision="0"
            :step="1"
            :min="1"
            :max="604800"
            size="small"
          />
          <span class="ml-xs"> 秒</span>
          <span class="text-sm text-ants-text-4 mr-lg">（1 - 604800）</span>
        </div>
      </template>

      <!-- 自定义缓存KEY前缀 -->
      <template v-if="card === 'custom_cache_key_prefix'">
        <ants-radio-group v-model="form.custom_cache_key_prefix">
          <ants-radio label="'$site_id'" text="默认" />
          <ants-radio label="'$site_id''$http_host'" text="区分Host" />
          <ants-radio label="'$site_id''$server_port'" text="区分端口" />
        </ants-radio-group>
      </template>

      <!-- 回源限制 -->
      <template v-if="card === 'aw_u_limit_mode'">
        <ants-radio-group v-model="form.aw_u_limit_mode">
          <!-- <ants-radio
            v-for="(item, key) in {
              0: '关闭',
              1: '开启'
            }"
            :key="key"
            :label="key"
            :text="item"
          /> -->

          <ants-radio
            v-for="(item, key) in isAdmin
              ? {
                  0: '关闭限制',
                  1: '重试回源',
                  4: '限制回源'
                }
              : {
                  0: '关闭限制',
                  4: '限制回源'
                }"
            :key="key"
            :label="key"
            :text="item"
          />

          <div
            v-if="form.aw_u_limit_mode == 1 || form.aw_u_limit_mode == 4"
            class="mt-lg"
          >
            <span class="mr-lg text-ants-text-4">{{ antsT('上限值') }}</span>
            <ants-input-number
              v-model="form.aw_u_max_count"
              :precision="0"
              :step="1"
              :min="10"
              :max="1000"
              size="small"
            />
            <span class="text-sm text-ants-text-4 mr-lg"
              >（10 - 1000）每秒</span
            >
          </div>
        </ants-radio-group>
      </template>

      <!-- 页面压缩 -->
      <template v-if="card === 'gzip'">
        <Gzip ref="GzipRef" />
      </template>

      <!-- 最大数据长度 -->
      <template v-if="card === 'client_max_body_size'">
        <span class="mr-lg text-ants-text-4">{{ antsT('最大数据长度') }}</span>
        <ants-input-number
          v-model="form.client_max_body_size"
          :precision="0"
          :step="1"
          :min="5"
          :max="1000"
          size="small"
        />
        <span class="ml-xs mr-xl"> M</span>
      </template>

      <!-- 是否缓冲响应数据 -->
      <template v-if="card === 'proxy_buffering'">
        <ants-switch
          v-model="form.proxy_buffering"
          active-text="ON"
          inactive-text="OFF"
          active-value="1"
          inactive-value="0"
        />
      </template>

      <!-- 下行限速配置 -->
      <template v-if="card === 'limit_rate'">
        <ants-switch
          v-model="form.limit_rate_switch"
          active-text="ON"
          inactive-text="OFF"
        />
        <div v-if="form.limit_rate_switch == 1" class="mt-lg">
          <span class="mr-lg text-ants-text-4">{{
            antsT('下行速度设置')
          }}</span>
          <ants-input-number
            v-model="form.limit_rate"
            :precision="0"
            :step="1"
            :min="1"
            :max="10240"
            size="small"
          />
          <span class="ml-xs"> KB/S</span>
          <span class="text-sm text-ants-text-4 mr-lg">（1 - 10240）</span>
        </div>
      </template>

      <!-- 移动端跳转 -->
      <template v-if="card === 'mobile_jump'">
        <ants-switch
          v-model="form.mobile_jump_switch"
          active-text="ON"
          inactive-text="OFF" />
        <div v-if="form.mobile_jump_switch == 1">
          <div class="text-sm text-ants-text-4 mt-lg">
            {{ antsT('输入跳转后的URL，以http(https)开头') }}
          </div>
          <div class="flex items-center mt-df">
            <ants-input
              v-model="form.mobile_jump"
              class="mr-sm max-w-md"
              size="small"
              placeholder="http://www.demo.com"
              style="width: 300px"
            />
          </div></div
      ></template>
    </template>
  </CheckCards>
</template>

<script>
import CheckCards from '../CheckCards'
import AdvancedCache from './AdvancedCache'
import Gzip from './Gzip'

const PROCESS_NAME = process.env.VUE_APP_NAME

const cards = {
  cache_config: {
    title: '高级缓存',
    info: '优质节点网络，智能缓存网站内容极大提高网站访问速度',
    tips: {
      list: [
        '1. 若您需配置的缓存类型不在我们的列表中，可以手动添加，以“|”分割；',
        '2. 缓存类型为目录或者精确匹配时以“／”开头；',
        '3. 支持自行调控优先级，不缓存记录优先级高于缓存记录；',
        '4. 开启缓存功能后，系统默认忽略请求头中 Cache-Control 和 Pragma 两个头部不走缓存信息，只要节点有缓存就不会到源取数据，仍然返回缓存内容；',
        '5. 缓存时间最长一年，缓存/不缓存分别能添加 200 条；',
        '6. 游客缓存可以提升未登录用户的访问速度，若您的业务登录后用Cookie标识访客的，可对此Cookie键配置游客缓存，不包含此Cookie键的内容将被缓存。'
      ]
    }
  },
  proxy_next_upstream: {
    title: '缓存响应',
    info: '当后端源出现异常时,允许Nginx返回缓存作为响应内容。'
  },
  cache_rule: {
    title: '强制缓存',
    info: '开启后，除高级缓存以外的其他所有文件或接口，将被缓存指定时间。'
  },
  custom_cache_key_prefix: {
    title: '自定义缓存KEY前缀',
    info: '自定义缓存KEY前缀，如无特殊需求，请勿修改！'
  },
  aw_u_limit_mode: {
    title: '回源限制',
    info: '关闭过滤后可提高回源速度，开启过滤可减少回源并发。'
  },
  gzip: {
    title: '页面压缩',
    info: 'Gzip压缩网页资源，节约传输内容，提高访问速度，有效改善动态页面的优化支持'
  },
  client_max_body_size: {
    title: '最大文件上传大小',
    info: '节点支持上传文件的最大数据长度'
  },
  proxy_buffering: {
    title: '是否缓冲响应数据',
    info: '开启可以提高性能、节省网络带宽并减少上游服务器的负载压力；当需要实时推送数据或通过长连接传输数据可禁用。'
  },
  limit_rate: {
    title: '下行限速配置',
    info: '通过对单链接下行速度的设置，一定程度上控制 CDN 访问带宽。'
  },
  mobile_jump: {
    title: '移动端跳转',
    info: '将来自移动终端的请求自动重定向到指定的URL'
  }
}

const defaultForm = {
  // [int] 通用缓存时间, 0 为关闭缓存，
  default_location_cache_rule_switch: 0,
  default_location_cache_rule: 60,

  // [text] 自定义缓存KEY前缀
  custom_cache_key_prefix: "'$site_id'",

  // [int] 回源过滤：UL优化方式
  aw_u_limit_mode: '0',
  // [int] 优化上限值
  aw_u_max_count: 500,

  // [int] 最大上传文件大小 ，
  client_max_body_size: 100,

  // [bool] proxy_buffering 是否开启代理缓存
  proxy_buffering: '1',

  // [int] 下行限速（0为不限速），
  limit_rate_switch: 0,
  limit_rate: 2048,

  // [text] 移动端跳转，为空表示关闭，
  mobile_jump_switch: 0,
  mobile_jump: '',
  // [text] 遇错指定应将请求传递到下一个服务器
  proxy_next_upstream: [],
  // [int] 遇错重试次数,0表示不限制
  proxy_next_upstream_tries: 0
}

export default {
  components: {
    CheckCards,
    AdvancedCache,
    Gzip
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'cdn_admin',
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

      const valid = checkFormKeys.every((key) => {
        switch (key) {
          // 高级缓存
          case 'cache_config':
            var cacheData = this.$refs.AdvancedCacheRef.submit()
            if (!cacheData) return false
            Object.assign(form, cacheData)
            break

          // 缓存响应
          case 'proxy_next_upstream':
            form.proxy_next_upstream = this.form.proxy_next_upstream.join(' ')
            break

          // 回源限制
          case 'aw_u_limit_mode':
            form.aw_u_limit_mode = this.form.aw_u_limit_mode
            form.aw_u_max_count = this.form.aw_u_max_count
            break

          // 强制缓存
          case 'cache_rule':
            form.default_location_cache_rule = this.form
              .default_location_cache_rule_switch
              ? this.form.default_location_cache_rule
              : 0
            break

          // 页面压缩
          case 'gzip':
            var gzipData = this.$refs.GzipRef.submit()
            if (!gzipData) return false
            Object.assign(form, gzipData)
            break

          // 下行限速配置
          case 'limit_rate':
            form.limit_rate = this.form.limit_rate_switch
              ? this.form.limit_rate
              : 0
            break

          // 移动端跳转
          case 'mobile_jump':
            form.mobile_jump = this.form.mobile_jump_switch
              ? this.form.mobile_jump
              : ''
            break

          // // 自定义缓存KEY前缀
          // case 'custom_cache_key_prefix':
          //   break

          // // 回源过滤
          // case 'aw_u_limit_mode':
          //   break
          // // 最大文件上传大小
          // case 'client_max_body_size':
          //   break

          // // 是否缓冲响应数据
          // case 'proxy_buffering':
          //   break

          default:
            this.createForm(key, form)
            break
        }

        return true
      })

      if (!valid) return false

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
