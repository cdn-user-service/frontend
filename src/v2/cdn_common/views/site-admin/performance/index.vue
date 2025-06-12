<template>
  <el-form
    :disabled="$root.disabledCrud"
    :model="form"
    :rules="formRules"
    ref="formRef"
    label-position="top"
  >
    <AdvancedCache
      ref="AdvancedCacheRef"
      v-on="$listeners"
      v-bind="$attrs"
      @refreshData="getSiteDetail"
    />

    <ants-form-card>
      <template slot="title">{{ antsT('缓存响应') }}</template>
      <template slot="info">
        {{ antsT('当后端源出现异常时,允许Nginx返回缓存作为响应内容。') }}
      </template>
      <template slot="content">
        <ul class="space-y-12">
          <li class="flex items-center">
            <!-- <TitleBorder class="mb-lg text-df">
              <span class="text-xl"
                >返回状态码</span
              >
            </TitleBorder> -->
            <span class="mr-lg inline-block" style="width: 100px">{{
              antsT('故障状态码')
            }}</span>
            <ants-checkbox-group
              v-model="form.proxy_next_upstream"
              @change="submitForm"
            >
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
          <!-- <li class="flex items-center">
            <span class="mr-lg inline-block" style="width: 100px">{{
              antsT('是否强制重试')
            }}</span>
            <ants-switch
              v-model="form.non_idempotent"
              active-text="ON"
              inactive-text="OFF"
            />
          </li>

          <li class="flex items-center">
            <span class="mr-lg inline-block" style="width: 100px">{{
              antsT('回源重试次数')
            }}</span>

            <ants-input-number
              v-model="form.proxy_next_upstream_tries"
              :step="1"
              :min="0"
              :max="9"
              size="small"
              class="mr-sm"
            />
            <span class="ml-xs mr-xl text-sm text-ants-text-4">
              （0~9）{{ antsT('设置为 0 表示不限制次数') }}
            </span>
          </li> -->

          <!-- <li v-if="!$root.disabledCrud">
            <ants-button
              size="small"
              type="primary"
              icon="el-icon-edit"
              :loading="$attrs.btnLoading"
              @click="submitForm"
              text="提 交"
            />
          </li> -->
        </ul>
      </template>
    </ants-form-card>
    <!-- 同一资源请求合并 -->
    <ants-form-card>
      <template slot="title">{{ antsT('同一资源请求合并') }}</template>
      <template slot="info">
        {{
          antsT(
            '支持同一资源请求合并，仅需向源站请求一次即可，减少回源通信消耗，优化访问'
          )
        }}
      </template>
      <template slot="content">
        <ants-switch
          v-model="form.proxy_cache_lock"
          active-text="ON"
          inactive-text="OFF"
          active-value="1"
          inactive-value="0"
          v-loading="$attrs.btnLoading"
          @change="doSave('proxy_cache_lock')"
        />
      </template>
    </ants-form-card>

    <ants-form-card>
      <template slot="title">{{ antsT('强制缓存') }}</template>
      <template slot="info">
        {{
          antsT(
            '开启后，除高级缓存以外的其他所有文件或接口，将被缓存指定时间。'
          )
        }}
      </template>
      <template slot="content">
        <ants-switch
          v-model="form.default_location_cache_rule_switch"
          active-text="ON"
          inactive-text="OFF"
          v-loading="$attrs.btnLoading"
          @change="changeDefaultCache"
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
          <ants-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            :loading="$attrs.btnLoading"
            @click="doSave('default_location_cache_rule')"
            text="提 交"
          />
        </div>
      </template>
    </ants-form-card>

    <ants-form-card>
      <template slot="title">{{ antsT('移动端独立缓存') }}</template>
      <template slot="info">
        {{ antsT('开启后，移动端独立缓存') }}
      </template>
      <template slot="content">
        <ants-switch
          v-model="form.pc_h5_cache_flag"
          active-value="1"
          inactive-value="0"
          active-text="ON"
          inactive-text="OFF"
          v-loading="$attrs.btnLoading"
          @change="doSave('pc_h5_cache_flag')"
        />
      </template>
    </ants-form-card>

    <ants-form-card>
      <template slot="title">{{ antsT('自定义缓存KEY前缀') }}</template>
      <template slot="info">
        {{ antsT('自定义缓存KEY前缀，如无特殊需求，请勿修改！') }}
      </template>
      <template slot="content">
        <div class="">
          <span class="mr-lg text-ants-text-4">
            <!-- {{ antsT('缓存KEY前缀是否区分端口') }} -->
            {{ antsT('缓存KEY前缀') }}
          </span>
          <ants-radio-group
            v-model="form.custom_cache_key_prefix"
            :disabled="$attrs.btnLoading"
            @change="doSave('custom_cache_key_prefix')"
          >
            <ants-radio label="'$site_id'" text="默认" />
            <ants-radio label="'$site_id''$http_host'" text="区分Host" />
            <ants-radio label="'$site_id''$server_port'" text="区分端口" />
          </ants-radio-group>

          <!-- <span class="mr-lg text-ants-text-4">{{ antsT('缓存KEY前缀') }}</span>
          <ants-input
            v-model="form.custom_cache_key_prefix"
            placeholder="请输入自定义缓存KEY前缀"
            class="mr-lg"
            size="small"
            style="width:250px;"
          />
          <ants-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            :loading="$attrs.btnLoading"
            @click="doKeyPrefix('custom_cache_key_prefix')"
            text="提 交"
          /> -->
        </div>
      </template>
    </ants-form-card>

    <ants-form-card>
      <template slot="title">{{ antsT('回源限制') }}</template>
      <template slot="content">
        <div>
          <ants-radio-group
            v-model="form.aw_u_limit_mode"
            @change="doSave('aw_u_limit_mode')"
          >
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
          </ants-radio-group>
        </div>

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
          <!-- <span class="ml-xs"> 秒</span> -->
          <span class="text-sm text-ants-text-4 mr-lg">（10 - 1000）每秒</span>
          <ants-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            :loading="$attrs.btnLoading"
            @click="doSave('aw_u_max_count')"
            text="提 交"
          />
        </div>
      </template>
    </ants-form-card>

    <Gzip ref="GzipRef" :form.sync="form" v-on="$listeners" v-bind="$attrs" />

    <!-- <ants-form-card>
      <template slot="title">页面压缩</template>
      <template slot="info">
        Gzip压缩网页资源，节约传输内容，提高访问速度，有效改善动态页面的优化支持
      </template>
      <template slot="content">
        <el-checkbox-group
          v-model="form.gzip"
          :disabled="$attrs.btnLoading"
          @change="changeGzip"
        >
          <el-checkbox label="js">JS</el-checkbox>
          <el-checkbox label="css">CSS</el-checkbox>
          <el-checkbox label="html">HTML</el-checkbox>
        </el-checkbox-group>
      </template>
    </ants-form-card> -->

    <!-- <ants-form-card>
      <template slot="title">{{ antsT('最大文件上传大小') }}</template>
      <template slot="info">
        {{ antsT('CDN 节点支持上传文件的最大数据长度') }}
      </template>
      <template slot="content">
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
        <ants-button
          size="mini"
          type="primary"
          icon="el-icon-edit"
          :loading="$attrs.btnLoading"
          @click="doSave('client_max_body_size')"
          text="提 交"
        />
      </template>
    </ants-form-card> -->

    <ants-form-card>
      <template slot="title">{{ antsT('是否缓冲响应数据') }}</template>
      <template slot="info">
        {{
          antsT(
            '开启可以提高性能、节省网络带宽并减少上游服务器的负载压力 ；当需要实时推送数据或通过长连接传输数据可禁用。'
          )
        }}
      </template>
      <template slot="content">
        <ants-switch
          v-model="form.proxy_buffering"
          active-text="ON"
          inactive-text="OFF"
          active-value="1"
          inactive-value="0"
          v-loading="$attrs.btnLoading"
          @change="doSave('proxy_buffering')"
        />
      </template>
    </ants-form-card>

    <!-- <ants-form-card>
      <template slot="title">{{ antsT('下行限速配置') }}</template>
      <template slot="info">
        {{ antsT('通过对单链接下行速度的设置，一定程度上控制 CDN 访问带宽。') }}
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
    </ants-form-card> -->

    <!-- <ants-form-card>
      <template slot="title">WebP自适应</template>
      <template slot="info">
        性能优化智能判断浏览器是否支持 WebP，来决定返回 WebP
        格式图片还是原图，从而减少网络传输消耗，优化图片渲染速度。此功能需要相应的资源启用了缓存。
      </template>
      <template slot="content">
        <ants-switch
          v-model="form.web_p"
          active-value="1"
          inactive-value="0"
          active-text="ON"
          inactive-text="OFF"
          v-loading="$attrs.btnLoading"
          @change="doSave('web_p')"
        />
      </template>
    </ants-form-card>

    <ants-form-card>
      <template slot="title">页面优化</template>
      <template slot="info">
        自动裁掉脚本文件中不必要的字符，动态减小网页文件尺寸的技术。优化后在保证网页显示不变的同时，节约传输内容，提高访问速度
      </template>
      <template slot="content">
        <ants-switch
          v-model="form.page_optimization"
          active-value="1"
          inactive-value="0"
          active-text="ON"
          inactive-text="OFF"
          v-loading="$attrs.btnLoading"
          @change="doSave('page_optimization')"
        />
      </template>
    </ants-form-card>

    <ants-form-card>
      <template slot="title">异步加载</template>
      <template slot="info">
        使页面的渲染不再因为加载长时间运行的脚本而被阻断
      </template>
      <template slot="content">
        <ants-switch
          v-model="form.syn_load"
          active-value="1"
          inactive-value="0"
          active-text="ON"
          inactive-text="OFF"
          v-loading="$attrs.btnLoading"
          @change="doSave('syn_load')"
        />
      </template>
    </ants-form-card>

    <ants-form-card>
      <template slot="title">全链路优化</template>
      <template slot="info">
        通过大数据网络感知智能调度、TCP优化、路由优化、保障访客--节点网络--源站最佳链路
      </template>
      <template slot="content">
        <ants-switch
          v-model="form.full_link_optimization"
          active-value="1"
          inactive-value="0"
          active-text="ON"
          inactive-text="OFF"
          v-loading="$attrs.btnLoading"
          @change="doSave('full_link_optimization')"
        />
      </template>
    </ants-form-card> -->

    <!-- <ants-form-card>
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
    </ants-form-card> -->

    <!-- <ants-form-card>
      <template slot="title">浏览器缓存优化</template>
      <template slot="info">
        通过移除响应头中 Entity Tags优化前端性能
      </template>
      <template slot="content">
        <ants-switch
          v-model="form.browser_cache_optimization"
          active-value="1"
          inactive-value="0"
          active-text="ON"
          inactive-text="OFF"
          v-loading="$attrs.btnLoading"
          @change="doSave('browser_cache_optimization')"
        />
      </template>
    </ants-form-card> -->
  </el-form>
</template>

<script>
import AdvancedCache from './components/AdvancedCache/index.vue'
import Gzip from './components/Gzip/index'

const PROCESS_NAME = process.env.VUE_APP_NAME

export default {
  components: {
    AdvancedCache,
    Gzip
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'cdn_admin',

      form: {
        // [int] UL优化方式
        aw_u_limit_mode: '0',
        // [int] 优化上限值
        aw_u_max_count: 500,
        // [int] 最大上传文件大小 ，
        client_max_body_size: 100,
        // [int] 下行限速（0为不限速），
        limit_rate_switch: 0,
        limit_rate: 2048,
        // [int] 通用缓存时间, 0 为关闭缓存，
        default_location_cache_rule_switch: 0,
        default_location_cache_rule: 60,
        // [text] 自定义缓存KEY前缀
        custom_cache_key_prefix: '',
        // [bool] WebP自适应,
        web_p: '0',
        // [bool] 页面优化，
        page_optimization: '0',
        // [bool] 异步加载，
        syn_load: '0',
        // [bool] 全链路优化，
        full_link_optimization: '0',
        // [text] 移动端跳转，为空表示关闭，
        mobile_jump_switch: 0,
        mobile_jump: '',
        // [bool] 浏览器缓存优化，
        browser_cache_optimization: '0',
        // [bool] 移动端独立缓存
        pc_h5_cache_flag: '0',
        // [text] 遇错指定应将请求传递到下一个服务器
        proxy_next_upstream: [],
        // [int] 遇错重试次数,0表示不限制
        proxy_next_upstream_tries: 0,

        // [bool] 开关,
        gzip: '0',
        // [int] 压缩级别，1-9，数字越大压缩的越好，也越占用CPU时间
        gzip_comp_level: 1,
        // [text] 压缩的最小文件，小于设置值的文件将不会压缩，值加单位
        gzip_min_length: '',
        // [bool] 否在http header中添加Vary: Accept-Encoding，建议开启
        gzip_vary: '0',
        // [l_text] 进行压缩的文件类型, 传字符串
        gzip_types: [],

        // [bool] proxy_buffering 是否开启代理缓存
        proxy_buffering: '1',
        // [bool] 同一资源请求合并
        proxy_cache_lock: '1'
      },

      formRules: {
        mobile_jump: [
          {
            required: true,
            message: '请输入跳转后的URL',
            trigger: ['change', 'blur']
          }
        ],
        gzip_min_length: [
          {
            required: true,
            message: '请输入文件名',
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
      const { data: res } = await this.$listeners.getSiteDetail('performance')

      // 高级缓存子组件
      this.$refs.AdvancedCacheRef.tableData = []
      const cacheTable = [] // 缓存
      const UnCacheTable = [] // 不缓存
      let cacheStatus = 0 // 缓存状态

      // 判断下行显示是否开启
      let isLimitRate = 0
      res.attr.forEach((item) => {
        // 给高级缓存子组件表格赋值，缓存表格
        if (item.pkey === 'cache_config' || item.pkey === 'un_cache_config') {
          const obj = item.pvalue && JSON.parse(item.pvalue)
          // id 用于编辑和删除
          obj.id = item.id
          // 开关
          cacheStatus = item.status
          // 表格
          item.pkey === 'cache_config'
            ? cacheTable.push(obj)
            : UnCacheTable.push(obj)
          return
        } else if (item.pkey === 'proxy_next_upstream') {
          const PVALUE = item.pvalue || ''
          this.form.proxy_next_upstream = PVALUE.split(' ')
          this.form.non_idempotent =
            PVALUE.indexOf('non_idempotent') != -1 ? 1 : 0
          return
        }

        // 给高级缓存子组件赋值
        if (item.pkey in this.$refs.AdvancedCacheRef.form) {
          this.$refs.AdvancedCacheRef.form[item.pkey] = item.pvalue
          return
        }

        // 拆分gzip_min_length
        if (item.pkey === 'gzip_min_length' && item.pvalue) {
          const arr = ['m', 'k', ' ']
          arr.some((it) => {
            if (item.pvalue.indexOf(it) != -1) {
              this.form.gzip_min_length = +item.pvalue.replace(it, '')
              this.$refs.GzipRef.unit = it
              return true
            }
          })
          return
        }

        // 如果存在值，给其他表单赋值
        if (item.pkey in this.form) {
          this.form[item.pkey] = item.pvalue
        }

        if (item.pkey === 'limit_rate' && item.pvalue != 0) {
          isLimitRate = 1
        }
      })

      // 高级缓存子组件赋值
      this.$refs.AdvancedCacheRef.form.cache_config_status = cacheStatus
      this.$refs.AdvancedCacheRef.tableData =
        this.$refs.AdvancedCacheRef.form.cache_config_radio === 'cache_config'
          ? cacheTable
          : UnCacheTable

      // gzip_types 字符串转数组
      if (typeof this.form.gzip_types === 'string') {
        this.form.gzip_types = this.form.gzip_types.split(',')
      }

      // 下行限速是否开启
      this.form.limit_rate_switch = isLimitRate

      // 通用缓存时间是否开启
      this.form.default_location_cache_rule_switch =
        this.form.default_location_cache_rule == 0 ? 0 : 1

      // 移动端跳转是否开启
      this.form.mobile_jump_switch = this.form.mobile_jump ? 1 : 0

      // console.log('123', res.attr)
    },

    /**
     * @description: 修改 移动端跳转
     * @param {*} val
     */

    changeMobileJump(val, key) {
      console.log('val-', val, 'key-', key)
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

    // 通用缓存时间
    changeDefaultCache(val) {
      // 关闭
      if (!val) {
        this.form.default_location_cache_rule = 0
      }
      // 开启
      if (val) {
        this.form.default_location_cache_rule = 60
      }
      this.doSave('default_location_cache_rule')
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
     * @description: 修改 gzip 页面压缩
     * @param {*} val
     */

    changeGzip(val) {
      this.saveSiteAttr({
        gzip: val + ''
      })
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

    // 自定义缓存KEY前缀
    doKeyPrefix(key) {
      if (!this.form[key]) {
        return this.$msg.error('请输入自定义缓存KEY前缀')
      }
      this.doSave(key)
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
