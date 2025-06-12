<template>
  <!-- <el-skeleton :loading="$root.loading" animated :throttle="500"> -->
  <!-- <template> -->
  <el-form
    :disabled="$root.disabledCrud"
    :model="form"
    :rules="formRules"
    ref="formRef"
    label-position="top"
  >
    <SourceSiteSetting
      ref="SourceSiteSettingRef"
      v-on="$listeners"
      v-bind="$attrs"
      @refreshData="getSiteDetail"
    />

    <Follow30x ref="Follow30xRef" v-on="$listeners" v-bind="$attrs" />

    <ants-form-card>
      <template slot="title">{{ antsT('回源 HOST') }}</template>
      <template slot="info">
        {{ antsT('自定义性能优化节点取源站数据时所需访问的 WEB 服务器域名。') }}
      </template>
      <template slot="content">
        <ants-radio-group
          v-model="form.source_host_radio"
          :disabled="$attrs.btnLoading"
          @change="(val) => changeRadio(val, 'source_host')"
        >
          <ants-radio :label="0" text="默认（域名本身）" />
          <ants-radio :label="1" text="自定义" />
        </ants-radio-group>
        <div
          class="flex items-center mt-df"
          v-if="form.source_host_radio === 1"
        >
          <ants-form-item prop="source_host" style="margin: 0">
            <ants-input
              v-model="form.source_host"
              class="mr-3 max-w-md"
              size="small"
              placeholder="www.demo.com"
              style="width: 300px"
            />
          </ants-form-item>
          <ants-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            :loading="$attrs.btnLoading"
            @click="changeRadio('update', 'source_host')"
            text="提 交"
          />
        </div>
      </template>
    </ants-form-card>

    <ants-form-card>
      <template slot="title">{{ antsT('回源 SNI') }}</template>
      <template slot="info">
        {{
          antsT(
            '当业务源站IP绑定多个域名且CDN节点以HTTPS协议访问源站时，必须指定访问的具体域名。'
          )
        }}
      </template>
      <template slot="content">
        <ants-radio-group
          v-model="form.source_sni_radio"
          @change="(val) => changeRadio(val, 'source_sni')"
          :disabled="$attrs.btnLoading"
        >
          <ants-radio :label="0" text="默认开启" />
          <ants-radio :label="1" text="自定义" />
        </ants-radio-group>
        <div class="flex items-center mt-df" v-if="form.source_sni_radio === 1">
          <ants-form-item prop="source_sni" style="margin: 0">
            <ants-input
              v-model="form.source_sni"
              class="mr-3 max-w-md"
              size="small"
              placeholder="自定义 SNI"
              style="width: 300px"
            />
          </ants-form-item>
          <ants-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            :loading="$attrs.btnLoading"
            @click="changeRadio('update', 'source_sni')"
            text="提 交"
          />
        </div>
      </template>
    </ants-form-card>

    <ants-form-card>
      <template slot="title">{{ antsT('Location重定向') }}</template>
      <template slot="info">
        {{
          antsT(
            '修改 Location 头域中的URL协议，以确保客户端收到正确的重定向 URL。'
          )
        }}
      </template>
      <template slot="content">
        <ants-radio-group
          v-model="form.proxy_redirect"
          @change="(val) => changeRadio(val, 'proxy_redirect')"
          :disabled="$attrs.btnLoading"
        >
          <ants-radio label="http:// $scheme://" text="默认开启" />
          <ants-radio label="off" text="关闭" />
        </ants-radio-group>
      </template>
    </ants-form-card>

    <ants-form-card
      :tips-title="antsT('只对下面这些文件后缀名生效：')"
      :tips-arr="[
        `${antsT(
          '视频'
        )}：AVI、MP4、RMVB、FLV、WMV、MOV、3GP、ASF、MPG、F4V、MKV、VOB、M3U8、TS、DAT、RM；`,
        `${antsT('音频')}：MP3、OGG、M4A、WMA、AIF、AU；`,
        `${antsT(
          '安装包'
        )}：APK、ZIP、EXE、RAR、IPA、PXL、DEB、SIS、JAR、XAP；`,
        `${antsT(
          '其他'
        )}：SO、CUE、CCD、MDS、IMG、7Z、CAB、DHP、GZ、ISO、MPQ、PBCV、PXL、QNP、P00、XY、XY2。`
      ]"
    >
      <template slot="title">{{ antsT('Range 回源') }}</template>
      <template slot="info">
        {{
          antsT(
            '需要源站支持Range请求，开启后可以按块缓存，按需回源，提高缓存命中率和响应速度。'
          )
        }}
      </template>
      <template slot="content">
        <ants-switch
          v-model="form.slice"
          active-value="1"
          inactive-value="0"
          active-text="ON"
          inactive-text="OFF"
          v-loading="$attrs.btnLoading"
          @change="doSave('slice')"
        />
      </template>
    </ants-form-card>

    <ants-form-card>
      <template slot="title">{{ antsT('回源保持长连接') }}</template>
      <template slot="info">
        {{
          antsT(
            '回源使用连接保活可以复用现有的连接（需源服务器支持keepalive），避免每次请求都重新建立TCP请求，可大幅提升回源性能，减小延迟。'
          )
        }}
      </template>
      <template slot="content">
        <!-- <ants-switch
          v-model="form.source_keep_live"
          active-value="1"
          inactive-value="0"
          active-text="ON"
          inactive-text="OFF"
          v-loading="$attrs.btnLoading"
          @change="doSave('source_keep_live')"
        /> -->
        <ul class="space-y-10">
          <li>
            <span class="inline-block text-ants-text-4" style="width: 120px">{{
              antsT('缓存链接数量')
            }}</span>
            <ants-input-number
              v-model="form.keepalive"
              :precision="0"
              :step="1"
              :min="1"
              :max="100"
              size="small"
            />
            <span class="mx-xs"> {{ antsT('个') }}</span>
            <span class="text-sm text-ants-text-4 mr-lg">（1 ~ 100）</span>
            <ants-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              :loading="$attrs.btnLoading"
              @click="doSave('keepalive')"
              text="提 交"
            />
          </li>
          <li>
            <span class="inline-block text-ants-text-4" style="width: 120px">{{
              antsT('连接超时时间')
            }}</span>
            <ants-input-number
              v-model="form.keepalive_timeout"
              :precision="0"
              :step="1"
              :min="5"
              :max="720"
              size="small"
            />
            <span class="mx-xs"> {{ antsT('秒') }}</span>
            <span class="text-sm text-ants-text-4 mr-lg">（5 ~ 720）</span>
            <ants-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              :loading="$attrs.btnLoading"
              @click="doSave('keepalive_timeout')"
              text="提 交"
            />
          </li>
        </ul>
      </template>
    </ants-form-card>

    <ants-form-card>
      <template slot="title">{{ antsT('回源超时配置') }}</template>
      <template slot="info">
        {{
          antsT(
            '安全节点的回源请求TCP建连超时等待时间默认为30秒，您可以根据实际需求设置回源请求的最长等待时间，最长不超过300 秒。'
          )
        }}
      </template>
      <ul slot="content" class="space-y-10">
        <li>
          <span class="inline-block text-ants-text-4" style="width: 120px">{{
            antsT('TCP连接超时时间')
          }}</span>
          <ants-input-number
            v-model="form.proxy_connect_timeout"
            :precision="0"
            :step="1"
            :min="5"
            :max="75"
            size="small"
          />
          <span class="mx-xs"> {{ antsT('秒') }}</span>
          <span class="text-sm text-ants-text-4 mr-lg">（5 ~ 75）</span>
          <ants-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            :loading="$attrs.btnLoading"
            @click="doSave('proxy_connect_timeout')"
            text="提 交"
          />
        </li>
        <li>
          <span class="inline-block text-ants-text-4" style="width: 120px">{{
            antsT('回源加载超时时间')
          }}</span>
          <ants-input-number
            v-model="form.proxy_read_timeout"
            :precision="0"
            :step="1"
            :min="5"
            :max="300"
            size="small"
          />
          <span class="mx-xs"> {{ antsT('秒') }}</span>
          <span class="text-sm text-ants-text-4 mr-lg">（5 ~ 300）</span>
          <ants-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            :loading="$attrs.btnLoading"
            @click="doSave('proxy_read_timeout')"
            text="提 交"
          />
        </li>
        <li>
          <span class="inline-block text-ants-text-4" style="width: 120px">{{
            antsT('回源请求超时时间')
          }}</span>
          <ants-input-number
            v-model="form.proxy_send_timeout"
            :precision="0"
            :step="1"
            :min="5"
            :max="300"
            size="small"
          />
          <span class="mx-xs"> {{ antsT('秒') }}</span>
          <span class="text-sm text-ants-text-4 mr-lg">（5 ~ 300）</span>
          <ants-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            :loading="$attrs.btnLoading"
            @click="doSave('proxy_send_timeout')"
            text="提 交"
          />
        </li>
      </ul>
    </ants-form-card>

    <ants-form-card>
      <template slot="title">{{ antsT('客户端请求超时配置') }}</template>
      <template slot="info">
        {{
          antsT(
            '服务器端读取客户端请求头数据的超时时间，如果超过这个时间客户端还没有发送完整的数据，服务器端将返回408错误。'
          )
        }}
      </template>
      <ul slot="content" class="space-y-10">
        <li>
          <span class="inline-block text-ants-text-4" style="width: 120px">{{
            antsT('请求头超时时间')
          }}</span>
          <ants-input-number
            v-model="form.client_header_timeout"
            :precision="0"
            :step="1"
            :min="5"
            :max="75"
            size="small"
          />
          <span class="mx-xs"> {{ antsT('秒') }}</span>
          <span class="text-sm text-ants-text-4 mr-lg">（5 ~ 300）</span>
          <ants-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            :loading="$attrs.btnLoading"
            @click="doSave('client_header_timeout')"
            text="提 交"
          />
        </li>
        <li>
          <span class="inline-block text-ants-text-4" style="width: 120px">{{
            antsT('请求体超时时间')
          }}</span>
          <ants-input-number
            v-model="form.client_body_timeout"
            :precision="0"
            :step="1"
            :min="5"
            :max="300"
            size="small"
          />
          <span class="mx-xs"> {{ antsT('秒') }}</span>
          <span class="text-sm text-ants-text-4 mr-lg">（5 ~ 300）</span>
          <ants-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            :loading="$attrs.btnLoading"
            @click="doSave('client_body_timeout')"
            text="提 交"
          />
        </li>
      </ul>
    </ants-form-card>

    <ants-form-card>
      <template slot="title">{{
        antsT('服务端等待客户端两次请求的间隔时间')
      }}</template>
      <ul slot="content" class="space-y-10">
        <li>
          <span class="inline-block text-ants-text-4" style="width: 120px">{{
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
          <ants-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            :loading="$attrs.btnLoading"
            @click="doSave('send_timeout')"
            text="提 交"
          />
        </li>
      </ul>
    </ants-form-card>
  </el-form>
  <!-- </template> -->
  <!-- </el-skeleton> -->
</template>

<script>
import SourceSiteSetting from './components/SourceSiteSetting'
import Follow30x from './components/Follow30x'

export default {
  components: {
    SourceSiteSetting,
    Follow30x
  },
  data() {
    // 验证规则
    const { isDomain } = this.$validator

    return {
      form: {
        // 由于 bool 值传递过来时，会自动变成 '0'、'1'，所以这里用 '0' 、'1' 代替
        // [text] 回源域名， 为空时为自身，有值时为自定义
        source_host: '',
        source_host_radio: 0,
        // [text] 回源 SNI(为空表示 关闭),
        source_sni: '',
        // [text] 默认值 http:// $scheme://， off 关闭
        proxy_redirect: 'http:// $scheme://',
        source_sni_radio: 0,
        // [bool] range 分片回源 开关,
        slice: '0',

        // [bool] 回源保持长连接,
        source_keep_live: '0',
        // [int] 与源保存缓存链接数量
        keepalive: 1,
        // [int] 客户端连接在服务器端保持多久后退出
        keepalive_timeout: 360,

        // [int] TCP连接时间超时设置（0为不限制 ），与upstream server的连接超时时间（没有单位，最大不可以超过75s）
        proxy_connect_timeout: 15,
        // [text] 回源加载时间超时设置（0为不限制 ），nginx会等待多长时间来获得请求的响应15s
        proxy_read_timeout: 15,
        // [text] 发送请求给upstream服务器的超时时间15s
        proxy_send_timeout: 15,

        // [int] 服务端等待客户端两次请求的间隔时间
        send_timeout: 30,

        // [int] 设置读取客户端请求主体的超时间，
        client_body_timeout: 15,
        // [int] 设置读取客户端请求头数据的超时时间，如果超过这个时间客户端还没有发送完整的数据，服务器端将返回408错误，放置客户端利用http协议进行***， [int]
        client_header_timeout: 15
      },
      formRules: {
        source_sni: [
          {
            required: true,
            message: '请输入自定义 SNI',
            trigger: ['change', 'blur']
          }
        ],
        source_host: [
          {
            required: true,
            message: '请输入回源域名',
            trigger: ['change', 'blur']
          },
          {
            validator: isDomain(),
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  created() {
    this.getSiteDetail()
  },
  methods: {
    /**
     * @description: 获取站点配置数据
     */

    async getSiteDetail() {
      const { data: res } = await this.$listeners.getSiteDetail('source')
      this.$refs.SourceSiteSettingRef.tableData = []
      this.$refs.SourceSiteSettingRef.isHttp = false

      res.attr.forEach((item) => {
        // 如果存在值
        if (item.pkey in this.form) {
          this.form[item.pkey] = item.pvalue
        }

        // 给基础源站配置子组件赋值
        if (item.pkey == 'source_base_info') {
          const obj = item.pvalue && JSON.parse(item.pvalue)
          // id 用于编辑和删除
          obj.id = item.id
          // 判断有没有http
          if (obj.protocol === 'http') {
            this.$refs.SourceSiteSettingRef.isHttp = true
          }
          this.$refs.SourceSiteSettingRef.tableData.unshift(obj)
        }
      })

      // 回源 SNI， 回源域名是否开启
      this.form.source_host_radio = this.form.source_host ? 1 : 0
      this.form.source_sni_radio = this.form.source_sni ? 1 : 0
    },

    /**
     * @description: 修改 回源 SNI， 回源域名
     * @param {*} val
     */

    changeRadio(val, key) {
      if (key === 'proxy_redirect') {
        this.doSave(key)
        return
      }
      // 关闭
      if (!val) {
        this.form[key] = ''
        this.doSave(key)
      }
      // 提交
      if (val == 'update') {
        this.$refs.formRef.validateField(key, (valid) => {
          if (valid) return
          this.doSave(key)
        })
      }
    },

    /**
     * @description: 单个保存
     * @param {*} key
     */

    doSave(key = '') {
      this.saveSiteAttr({
        [key]: this.form[key]
      })
    },

    /**
     * @description: 多个保存
     * @param {*} arr
     */

    doSavePlus(arr = []) {
      const obj = {}
      arr.forEach((item) => {
        obj[item] = this.form[item]
      })
      this.saveSiteAttr(obj)
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
