<template>
  <div>
    <el-form
      :disabled="$root.disabledCrud"
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="top"
    >
      <ants-form-card>
        <template slot="title">{{ antsT('开启IPv6') }}</template>
        <template slot="content">
          <ants-switch
            v-model="form.ipv6"
            active-value="1"
            inactive-value="0"
            active-text="ON"
            inactive-text="OFF"
            v-loading="$attrs.btnLoading"
            @change="(val) => changeStatus(val, 'ipv6')"
          />
        </template>
      </ants-form-card>

      <ants-form-card>
        <template slot="title">{{ antsT('搜索引擎回源') }}</template>
        <template slot="content">
          <ants-switch
            v-model="form.search_engines_dns_source"
            active-value="1"
            inactive-value="0"
            active-text="ON"
            inactive-text="OFF"
            v-loading="$attrs.btnLoading"
            @change="(val) => changeStatus(val, 'search_engines_dns_source')"
          />
        </template>
      </ants-form-card>

      <CustomDns ref="CustomDnsRef" v-on="$listeners" v-bind="$attrs" />

      <resolutionDNS
        ref="resolutionDNSRef"
        v-on="$listeners"
        v-bind="$attrs"
        v-if="!isAdmin"
      />

      <ants-form-card>
        <template slot="title">{{ antsT('最大文件上传大小') }}</template>
        <template slot="info">
          {{ antsT('CDN 节点支持上传文件的最大数据长度') }}
        </template>
        <template slot="content">
          <span class="mr-lg text-ants-text-4">{{
            antsT('最大数据长度')
          }}</span>
          <ants-input-number
            v-model="form.client_max_body_size"
            :precision="0"
            :step="1"
            :min="5"
            :max="1000"
            size="small"
          />
          <span class="ml-xs mr-xl"> M</span>
          <ants-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            :loading="$attrs.btnLoading"
            @click="doSave('client_max_body_size')"
            text="提 交"
          />
        </template>
      </ants-form-card>

      <ants-form-card>
        <template slot="title">{{ antsT('下行限速配置') }}</template>
        <template slot="info">
          {{
            antsT('通过对单链接下行速度的设置，一定程度上控制 CDN 访问带宽。')
          }}
        </template>
        <template slot="content">
          <ants-switch
            v-model="form.limit_rate_switch"
            active-text="ON"
            inactive-text="OFF"
            v-loading="$attrs.btnLoading"
            @change="(val) => changeLimitSpeed(val, 'limit_rate')"
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
            <ants-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              :loading="$attrs.btnLoading"
              @click="changeLimitSpeed('update', 'limit_rate')"
              text="提 交"
            />
          </div>
        </template>
      </ants-form-card>

      <ants-form-card>
        <template slot="title">{{ antsT('移动端跳转') }}</template>
        <template slot="info">
          {{ antsT('将来自移动终端的请求自动重定向到指定的URL') }}
        </template>
        <template slot="content">
          <ants-switch
            v-model="form.mobile_jump_switch"
            active-text="ON"
            inactive-text="OFF"
            v-loading="$attrs.btnLoading"
            @change="(val) => changeMobileJump(val, 'mobile_jump')"
          />
          <div v-if="form.mobile_jump_switch == 1">
            <div class="text-sm text-ants-text-4 mt-lg">
              {{ antsT('输入跳转后的URL，以http(https)开头') }}
            </div>
            <div class="flex items-center mt-df">
              <ants-form-item prop="mobile_jump" style="margin: 0">
                <ants-input
                  v-model="form.mobile_jump"
                  class="mr-sm max-w-md"
                  size="small"
                  placeholder="http://www.demo.com"
                  style="width: 300px"
                />
              </ants-form-item>
              <ants-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                :loading="$attrs.btnLoading"
                @click="changeMobileJump('update', 'mobile_jump')"
                text="提 交"
              />
            </div>
          </div>
        </template>
      </ants-form-card>
    </el-form>
  </div>
</template>

<script>
import CustomDns from './components/CustomDns'
import resolutionDNS from './components/resolutionDNS'

export default {
  components: {
    CustomDns,
    resolutionDNS
  },
  data() {
    return {
      isAdmin: process.env.VUE_APP_NAME == 'cdn_admin',
      form: {
        // [bool] IPv6开关
        ipv6: '0',
        search_engines_dns_source: '0',
        // [bool] 线路优化开关,
        route_optimization: '0',
        // [text] 遇错指定应将请求传递到下一个服务器
        proxy_next_upstream: [],
        non_idempotent: 0,

        // [int] 遇错重试次数,0表示不限制
        proxy_next_upstream_tries: 0,
        // [int] 最大上传文件大小 ，
        client_max_body_size: 200,
        // [int] 下行限速（0为不限速），
        limit_rate_switch: 0,
        limit_rate: 2048,
        // [text] 移动端跳转，为空表示关闭，
        mobile_jump_switch: 0,
        mobile_jump: '',
        formRules: {
          mobile_jump: [
            {
              required: true,
              message: '请输入跳转后的URL',
              trigger: ['change', 'blur']
            }
          ]
        }
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
      const { data: res } = await this.$listeners.getSiteDetail('network')
      // 判断下行显示是否开启
      let isLimitRate = 0
      res.attr.forEach((item) => {
        // 如果为 proxy_next_upstream
        if (item.pkey === 'proxy_next_upstream') {
          const PVALUE = item.pvalue || ''
          this.form.proxy_next_upstream = PVALUE.split(' ')
          this.form.non_idempotent =
            PVALUE.indexOf('non_idempotent') != -1 ? 1 : 0
          return
        }

        if (item.key === 'ipv6') {
        }

        // 如果存在值
        if (item.pkey in this.form) {
          this.form[item.pkey] = item.pvalue
        }
        if (item.pkey === 'limit_rate' && item.pvalue != 0) {
          isLimitRate = 1
        }
      })

      // 下行限速是否开启
      this.form.limit_rate_switch = isLimitRate
      // 移动端跳转是否开启
      this.form.mobile_jump_switch = this.form.mobile_jump ? 1 : 0
    },

    /**
     * @description: nginx的重试机制提交
     */

    async submitForm() {
      const arr = [...this.form.proxy_next_upstream]
      console.log(arr)

      const idx = arr.indexOf('non_idempotent')
      if (idx != -1) {
        arr.splice(idx, 1)
      }
      // 如果开启强制，要放到最后
      if (this.form.non_idempotent == 1) {
        arr.push('non_idempotent')
      }

      this.saveSiteAttr({
        proxy_next_upstream: arr.join(' '),
        proxy_next_upstream_tries: this.form.proxy_next_upstream_tries
      })
    },
    /**
     * @description: 修改下行限速
     * @param {*} val
     * @param {*} key
     */
    changeLimitSpeed(val, key) {
      // 关闭
      if (!val) {
        this.form[key] = 0
      }
      // 开启，没有值则返回，有值则提交
      if (val) {
        if (!this.form[key]) return

        // 默认为 2048
        if (this.form[key] == '0') {
          this.form[key] = 2048
        }
      }

      this.doSave(key)
    },

    /**
     * @description: 修改 移动端跳转
     * @param {*} val
     */

    changeMobileJump(val, key) {
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
     * @description: 线路优化开关
     * @param {*} val
     * @param {*} key
     */

    async changeStatus(val, key) {
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
      this.saveSiteAttr({
        [key]: this.form[key]
      })
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
