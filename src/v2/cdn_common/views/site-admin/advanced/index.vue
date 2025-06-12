<template>
  <el-form
    :disabled="$root.disabledCrud"
    :model="form"
    :rules="formRules"
    ref="formRef"
    label-position="top"
  >
    <!-- <ants-form-card>
      <template slot="title">{{ antsT('搜索引擎优化') }}</template>
      <template slot="info">
        {{
          antsT(
            '指定IP让蜘蛛爬取，提高搜索引擎检索效率。直接使用源IP作为搜索引擎回源IP会存在源IP暴露的风险，请谨慎使用。'
          )
        }}
      </template>
      <template slot="content">
        <ants-switch
          v-model="form.spider_switch"
          active-text="ON"
          inactive-text="OFF"
          v-loading="$attrs.btnLoading"
          @change="val => changeSpider(val, 'spider')"
        />
        <div v-if="form.spider_switch === 1">
          <div class="mt-lg text-sm text-ants-text-4">
            {{ antsT('搜索引擎回源IP') }}：
          </div>
          <div class="flex items-center mt-df">
            <ants-form-item prop="spider" style="margin:0;">
              <ants-input
                v-model="form.spider"
                class="mr-sm max-w-md"
                size="small"
                placeholder="0.0.0.0"
                style="width: 300px;"
              />
            </ants-form-item>
            <ants-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              :loading="$attrs.btnLoading"
              @click="changeSpider('update', 'spider')"
              text="提 交"
            />
          </div>
        </div>
      </template>
    </ants-form-card> -->

    <!-- <ants-form-card
      :tips-arr="[
        '1. 共享 SSL 基于 SNI 实现，因此某些不支持 SNI 的旧式浏览器访问可能会有些问题。运行在 Windows XP 上的所有版本的 Internet Explorer 都不支持 SNI；',
        '2. HSTS 为强制客户端（如浏览器）使用 HTTPS 与服务器创建连接，启用 HSTS 前请先启用 HTTPS 协议；',
        '3. 关闭 HTTPS 协议前为防止网站无法正常访问请先关闭 HSTS, HSTS 关闭后浏览器仍有一个月配置生效时间。'
      ]"
    >
      <template slot="title">HTTPS</template>
      <template slot="info">
        提供 SSL 服务。如您需要独享 SSL 请联系我们。
      </template>
      <template slot="content">
        <ants-switch
          v-model="form.httpsSwitch"
          active-text="ON"
          inactive-text="OFF"
          v-loading="$attrs.btnLoading"
        />
        <div class="my-xl">
          <span class="mr-lg text-ants-text-4">HTTP 跳转 HTTPS</span>
          <ants-radio-group v-model="form.httpsRadio">
            <ants-radio :label="0" text="关闭" />
            <ants-radio :label="1" text="全量跳转"/>
            <ants-radio :label="2"
              >指定浏览器跳转
              <el-tooltip
                effect="dark"
                content="仅对支持SNI的浏览器进行https跳转"
                placement="right"
              >
                <span class="el-icon-info text-primary text-df"></span>
              </el-tooltip>
            
          </ants-radio-group>
        </div>
        <div>
          <span class="mr-lg text-ants-text-4">HSTS</span>
          <ants-radio-group v-model="form.httpsRadioHSTS">
            <ants-radio :label="0" text="关闭"/>
            <ants-radio :label="1" text="开启"/>
          </ants-radio-group>
        </div>
      </template>
    </ants-form-card> -->

    <ants-form-card>
      <template slot="title">OCSP Stapling</template>
      <template slot="info">
        {{
          antsT(
            '浏览器需要使用 OCSP 服务检验网站证书的合法性，这里由优化节点获取网站证书的状态，主动推送给浏览器，避免因此造成的用户访问延迟'
          )
        }}
      </template>
      <template slot="content">
        <ants-switch
          v-model="form.ocsp"
          active-value="1"
          inactive-value="0"
          active-text="ON"
          inactive-text="OFF"
          v-loading="$attrs.btnLoading"
          @change="(val) => changeOcsp(val, 'ocsp')"
        />
      </template>
    </ants-form-card>

    <ants-form-card>
      <template slot="title">WebSocket</template>
      <template slot="info">
        {{ antsT('开启后将允许服务端主动向客户端推送数据。') }}
      </template>
      <template slot="content">
        <ants-switch
          v-model="form.websocket"
          active-value="1"
          inactive-value="0"
          active-text="ON"
          inactive-text="OFF"
          v-loading="$attrs.btnLoading"
          @change="doSave('websocket')"
        />

        <div v-if="form.websocket == 1" class="mt-lg">
          <span class="mr-lg text-ants-text-4">{{ antsT('超时时间') }}</span>
          <ants-input-number
            v-model="form.ws_proxy_read_timeout"
            :precision="0"
            :step="1"
            :min="60"
            :max="86400"
            size="small"
          />
          <span class="ml-xs"> {{ antsT('秒') }}</span>
          <span class="text-sm text-ants-text-4 mr-lg">（60 ~ 86400）</span>
          <ants-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            :loading="$attrs.btnLoading"
            @click="doSave('ws_proxy_read_timeout')"
            text="提 交"
          />
        </div>
      </template>
    </ants-form-card>

    <ResponseHeaders
      ref="ResponseHeadersRef"
      v-on="$listeners"
      v-bind="$attrs"
      @refreshData="getSiteDetail"
    />

    <RequestHeaders
      ref="RequestHeadersRef"
      v-on="$listeners"
      v-bind="$attrs"
      @refreshData="getSiteDetail"
    />

    <errorCodeRewrite
      ref="errorCodeRewriteRef"
      v-on="$listeners"
      v-bind="$attrs"
      @refreshData="getSiteDetail"
    />

    <ErrorPage ref="ErrorPageRef" v-on="$listeners" v-bind="$attrs" />
  </el-form>
</template>

<script>
import ResponseHeaders from './components/ResponseHeaders'
import RequestHeaders from './components/RequestHeaders'
import errorCodeRewrite from './components/errorCodeRewrite'

import ErrorPage from './components/ErrorPage'

export default {
  components: {
    ResponseHeaders,
    RequestHeaders,
    errorCodeRewrite,
    ErrorPage
  },
  data() {
    // 验证规则
    const { isIp } = this.$validator

    return {
      form: {
        // HTTPS , TODO: 暂时没有
        httpsSwitch: 0,
        httpsRadio: 0,
        httpsRadioHSTS: 0,

        // [m_text] 搜索引擎优化, 格式 [{}]
        spider: '',
        spider_switch: 0,
        // [bool] OCSP Stapling，
        ocsp: 0,
        // [bool] WebSocket,
        websocket: '0',
        // webSocket 超时时间
        ws_proxy_read_timeout: 60
      },
      formRules: {
        spider: [
          {
            required: true,
            message: '请输入搜索引擎回源IP',
            trigger: ['change', 'blur']
          },
          {
            validator: isIp(),
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
      const { data: res } = await this.$listeners.getSiteDetail('advanced')

      const responseHeadersTable = [] // 响应头表格
      const requestHeadersTable = [] // 请求头表格
      const errorCodeRewriteTable = [] // 改写状态码表格

      let responseHeadersStatus = 0 // 响应头开关
      let requestHeadersStatus = 0 // 请求头开关
      let errorCodeRewriteStatus = 0 // 改写状态码开关

      const clearHeaderTable = [] // 多余响应头表格

      res.attr.forEach((item) => {
        // error_code_page 赋值
        if (item.pkey.indexOf('error_page') != -1) {
          this.$refs.ErrorPageRef.form[item.pkey] = {
            ...this.$refs.ErrorPageRef.form[item.pkey],
            ...JSON.parse(item.pvalue)
          }
          return
        }

        // 如果存在值
        if (item.pkey in this.form) {
          this.form[item.pkey] = item.pvalue
        }

        // 给自定义HTTP响应头子组件表格赋值
        if (item.pkey === 'add_header') {
          const obj = item.pvalue && JSON.parse(item.pvalue)
          // id 用于编辑和删除
          obj.id = item.id
          // 开关
          responseHeadersStatus = item.status
          responseHeadersTable.unshift(obj)
        }

        // 多余响应头组件表格
        if (item.pkey === 'more_clear_headers') {
          const obj2 = item.pvalue && JSON.parse(item.pvalue)
          // id 用于编辑和删除
          obj2.id = item.id
          clearHeaderTable.unshift(obj2)
        }

        // 自定义HTTP回源请求头
        if (item.pkey === 'proxy_set_header') {
          const obj1 = item.pvalue && JSON.parse(item.pvalue)
          // id 用于编辑和删除
          obj1.id = item.id
          // 开关
          requestHeadersStatus = item.status
          requestHeadersTable.unshift(obj1)
        }

        // 改写状态码
        if (item.pkey === 'error_code_rewrite') {
          const obj1 = item.pvalue && JSON.parse(item.pvalue)
          // id 用于编辑和删除
          obj1.id = item.id
          // 开关
          errorCodeRewriteStatus = item.status
          errorCodeRewriteTable.unshift(obj1)
        }
      })

      this.$refs.ResponseHeadersRef.form.add_header_swtich =
        responseHeadersStatus
      this.$refs.ResponseHeadersRef.tableData = responseHeadersTable

      this.$refs.ResponseHeadersRef.clearTable = clearHeaderTable

      this.$refs.RequestHeadersRef.form.proxy_set_header_switch =
        requestHeadersStatus
      this.$refs.RequestHeadersRef.tableData = requestHeadersTable

      // 状态码改写开关及表格
      this.$refs.errorCodeRewriteRef.form.error_code_rewrite_switch =
        errorCodeRewriteStatus
      this.$refs.errorCodeRewriteRef.tableData = errorCodeRewriteTable

      // 回源 搜索引擎优化是否开启
      this.form.spider_switch = this.form.spider ? 1 : 0
    },

    /**
     * @description: 修改 搜索引擎优化
     * @param {*} val
     */

    changeSpider(val, key) {
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
     * @description: ocsp 开关
     * @param {*} val
     * @param {*} key
     */

    async changeOcsp(val, key) {
      const res = await this.$listeners.saveSiteAttr({
        [key]: this.form[key]
      })
      // 开关复位
      if (!res) {
        this.form[key] = val == '1' ? '0' : '1'
      }
    },

    /**
     * @description: 单个保存
     * @param {*} key
     */

    doSave(key = '') {
      this.$listeners.saveSiteAttr({
        [key]: this.form[key]
      })
    }
  }
}
</script>
