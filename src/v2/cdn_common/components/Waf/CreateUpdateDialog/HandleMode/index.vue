<template>
  <div>
    <ants-radio-group v-model="handle" size="small" @change="changeHandle">
      <ants-radio-button
        v-for="(item, key) in handleObj"
        :key="key"
        :label="key"
        :text="item.name"
      />
    </ants-radio-group>

    <div
      class="type-change-box px-lg py-sm bg-ants-bg-3 rounded-2xl"
      style="margin-top: 20px"
    >
      <ants-radio-group v-model="activeKey" @change="changeChild">
        <el-radio
          v-for="(item, key) in currentChild"
          :key="key"
          :label="key"
          :text="item.name"
          class="my-sm"
        >
          {{ antsT(item.name) }}

          <!-- 目前就 API鉴权需要 -->
          <!-- <router-link class="text-sm" v-if="item.router" :to="item.router">
            还未设置{{ item.name }}?</router-link
          > -->
        </el-radio>
      </ants-radio-group>

      <div
        class="my-df text-sm text-ants-text-4"
        v-if="handleValue.type === 'text' || handleValue.type === 'int'"
      >
        <span class="mr-df">{{
          antsT(handleValue.tips || handleValue.name)
        }}</span>

        <ants-input-number
          v-if="handleValue.type === 'int'"
          size="small"
          v-model="activeParam"
          :min="handleValue.min || 0"
          :max="handleValue.max || 999999"
        />

        <ants-input
          v-else
          v-model.trim="activeParam"
          size="small"
          :style="{ width: handleValue.width || '200px' }"
          :placeholder="`请输入${handleValue.tips || handleValue.name}`"
        />

        <span class="ml-sm">{{ antsT(handleValue.unit) }}</span>
      </div>

      <div
        class="flex items-center pt-xs mt-sm border-t border-ants-border-2"
        v-if="
          ($attrs.showReqSum || $attrs.showBotCheckHttpStatusCode) &&
          handle === 'suspicious'
        "
      >
        <span class="text-sm text-ants-text-4 pr-sm">人机验证页面返回码：</span>
        <ants-input
          size="small"
          v-model="bchsc"
          :style="{ width: handleValue.width || '200px' }"
          placeholder="请输入自定义页面返回码"
          @input="validateInput"
          @blur="validateInputOnBlur"
        />
        <div v-if="errorMessage" style="color: red; font-size: 12px">
          {{ errorMessage }}
        </div>
        <!-- <ants-radio-group v-model="bchsc" @change="changeBchsc">
          <ants-radio
            v-for="item in $attrs.showReqSum
              ? ['200', '401', '403', '404', '409']
              : ['200', '400', '401', '403']"
            :key="item"
            :label="item"
            :text="item"
          />
        </ants-radio-group> -->
      </div>
    </div>
  </div>
</template>

<script>
import { isUrl, isObject } from '@/utils/validate'
import { $mode, debug } from '@/utils/env'

const handleObj = {
  forbid: {
    name: '拦截',
    default: 'forbid_return_code',
    child: {
      forbid_return_code: {
        name: '自定义错误码',
        // text = 自定义，fixed = 固定值 400|403|404|500|502|503|504
        type: 'text',
        mode: 301,
        param: '444',
        remark: '拦截，返回自定义错误码|参数为错误返回码'
      },
      // forbid_forbid_request: {
      //   name: '禁封时长',
      //   // text = 自定义，fixed = 固定值， int = 数值
      //   type: 'int',
      //   mode: 302,
      //   // 默认值
      //   param: 1440,
      //   unit: '分钟（默认24小时）',
      //   remark: '拦截，限制访问|参数为限制时长(秒)'
      // },
      forbid_nfx_block_one: {
        name: '单节点拉黑',
        mode: 303,
        param: 1440,
        type: 'int',
        tips: '拉黑时长：',
        unit: '分钟（默认24小时）',
        remark: '拦截，单节点拉黑|定参3600',
        min: 1,
        max: 10000
      },
      forbid_nfx_block_all: {
        name: '全节点拉黑',
        mode: 304,
        param: 3600,
        remark: '拦截，全节点拉黑|定参3600'
      },
      rewrite_url: {
        name: '302重定向',
        type: 'text',
        width: '300px',
        mode: 302,
        param: '',
        tips: '重定向地址',
        unit: '不能包含 * " \' [ ] {} ()',
        remark: '拦截，302重定向地址，仅站点WAF有，需单独获取'
      },
      forbid_pass_log: {
        name: '记录日志后放行',
        mode: 300,
        param: 0,
        remark: '拦截，记录日志后放行|定参0'
      }
    }
  },
  suspicious: {
    name: '可疑',
    default: 'verify_auto_reload_v2',
    child: {
      // verify_auto_reload: {
      //   name: '无感验证',
      //   mode: 201,
      //   param: 0,
      //   remark: '可疑，无感验证|定参0'
      // },
      verify_auto_reload_v2: {
        name: '无感验证',
        mode: 212,
        param: 0,
        remark: '可疑，无感验证|定参0'
      },
      // verify_click: {
      //   name: '点击验证',
      //   mode: 205,
      //   param: 0,
      //   remark: '可疑，点击验证|定参0'
      // },
      verify_click_v2: {
        name: '点击验证',
        mode: 210,
        param: 0,
        remark: '可疑，点击验证|定参0'
      },
      verify_click_v2_style2: {
        name: '点击验证V2',
        mode: 211,
        param: 0,
        remark: '可疑，点击验证v2|定参0'
      },

      verify_slide: {
        name: '滑动验证',
        mode: 206,
        param: 0,
        remark: '可疑，滑动验证|定参0'
      },
      verify_click_num: {
        name: '数字验证',
        mode: 202,
        param: 0,
        remark: '可疑，数字验证|定参0',
        type: 'int',
        tips: '过期时间：',
        unit: '分钟（0 表示不过期）',
        min: 0,
        max: 9999
      },
      verify_9grid: {
        name: '字母验证',
        mode: 207,
        param: 0,
        remark: '可疑，字母验证|定参0'
      },
      verify_wait5s: {
        name: '5秒验证',
        mode: 208,
        param: 0,
        remark: '可疑，5秒验证|定参0'
      },
      verify_code: {
        name: '验证码验证',
        mode: 209,
        param: 0,
        remark: '可疑，验证码验证|定参0'
      },
      direct: {
        name: '重试',
        mode: 203,
        param: 0,
        remark: '可疑，307重试|定参0'
      },
      verify_check_token: {
        name: 'API鉴权',
        mode: 204,
        param: 0,
        remark: '可疑，API鉴权|定参0',
        router: './application-secure'
      },
      suspicious_pass_log: {
        name: '记录日志后放行',
        mode: 200,
        param: 0,
        remark: '可疑，记录日志后放行|定参0'
      }
    }
  },
  ignore: {
    name: '忽略',
    default: 'ignore',
    child: {
      ignore: {
        name: '指向下一个规则',
        mode: 1,
        param: 0,
        remark: '忽略（指向下一个规则）'
      }
    }
  },
  pass: {
    name: '放行',
    default: 'pass',
    child: {
      pass: {
        name: '直接放行',
        mode: 100,
        param: 0,
        remark: '放行，将直接放行'
      }
    }
  }
}

// 删除 verify_click_v2_style2 属性
if (!$mode['179']) {
  delete handleObj.suspicious.child.verify_click_v2_style2
}

const defaultBchsc = '200'

export default {
  props: {
    // 仅站点WAF有302重定向
    rewriteUrl: {
      type: String,
      default: ''
    },
    showRewriteUrl: Boolean
  },
  data() {
    return {
      // 当前选中的处置方式
      handle: 'forbid',

      // 当前绑定的值，需要输出的
      activeKey: 'forbid_return_code',
      activeParam: '444',

      // 原始数据
      oldData: {
        handle: '',
        key: '',
        param: ''
      },

      bchsc: defaultBchsc,
      errorMessage: ''
    }
  },
  watch: {
    handleValue: function (newVal, oldVal) {
      console.log(newVal)
      //   this.activeParam = newVal.param
    }
  },
  computed: {
    handleObj() {
      // 过滤掉 rewrite_url
      if (!this.showRewriteUrl) {
        delete handleObj.forbid.child.rewrite_url
      } else {
        handleObj.forbid.child.rewrite_url.param = this.rewriteUrl
      }
      console.log('----', this.showRewriteUrl, this.rewriteUrl, handleObj)
      return handleObj
    },
    // 当前选中处置方式 子操作项
    currentChild() {
      return (this.handleObj[this.handle] || {}).child || {}
    },
    handleValue() {
      return this.currentChild[this.activeKey] || {}
    }
  },
  created() {
    this.getBchsc()
  },
  methods: {
    init({ handle, key, param, botCheckHttpStatusCode }) {
      console.log(handle, key, param)
      this.handle = handle
      this.activeKey = key
      this.activeParam = key === 'rewrite_url' ? this.rewriteUrl : param

      this.oldData.handle = handle
      this.oldData.key = key
      this.oldData.param = this.activeParam
      if (this.$attrs.showBotCheckHttpStatusCode) {
        this.bchsc = botCheckHttpStatusCode || defaultBchsc
      }
    },

    // 获取站点302重定向地址

    changeHandle(val) {
      let newKey = this.handleObj[val].default
      let newParam = this.handleValue.param
      if (val === this.oldData.handle) {
        newKey = this.oldData.key || newKey
        newParam = this.oldData.param || newParam
      }
      this.activeKey = newKey
      this.activeParam = newParam
    },

    changeChild(val) {
      console.log(val)
      let newParam = this.handleValue.param
      if (val === this.oldData.key) {
        newParam = this.oldData.param || newParam
      }
      this.activeParam = newParam
    },

    // 输出数据
    submitForm() {
      const { type, name, tips } = this.handleValue

      if (this.activeParam === '' && (type === 'text' || type === 'int')) {
        this.$msg.error(`请输入${tips || name}`)
        return false
      }
      if (!this.activeKey || !this.handle) {
        this.$msg.error('请选择处置方式')
        return false
      }

      // 自定义错误返回码时，不允许填 400 ，否则会直接拉黑
      if (this.activeKey === 'forbid_return_code') {
        if (this.activeParam == '400') {
          this.$msg.error('自定义错误码不能为 400')
          return false
        }
        if (!this.activeParam) {
          this.$msg.error('请输入自定义错误码')
          return false
        }
      }

      let param = this.activeParam == undefined ? '' : this.activeParam + ''
      // 302重定向地址校验
      if (this.activeKey === 'rewrite_url') {
        if (!this.submitRewriteUrl()) return false
        param = '302'
      }

      this.changeBchsc(this.bchsc)
      return {
        key: this.activeKey,
        param,
        handle: this.handle,
        botCheckHttpStatusCode: this.$attrs.showBotCheckHttpStatusCode
          ? this.bchsc
          : undefined
      }
    },

    // 302重定向地址校验，单独提交
    submitRewriteUrl() {
      const urlVal = (this.activeParam || '').trim()
      if (!urlVal) {
        this.$msg.error('请输入重定向地址')
        return false
      }
      // 不能包含 * " ' () [] {}
      const checkUrl = (val = '') => {
        const reg = /[*"'()[\]{}]/
        return !reg.test(val) && isUrl(val)
      }

      if (!checkUrl(urlVal)) {
        this.$msg.error('URL格式错误，不能包含字符 * " \' [ ] {} ()')
        return false
      }

      this.$listeners.saveSiteAttr(
        {
          rewrite_url: urlVal
        },
        true
      )

      return true
    },

    // 获取数据
    async getBchsc() {
      if (!this.$attrs.showReqSum) return
      const { data: res } = await this.$listeners.getSiteDetail('', 'bchsc')
      const obj = (res.attr || [])[0] || {}
      this.bchsc = obj.pvalue || defaultBchsc
    },

    changeBchsc(val) {
      if (this.$attrs.showReqSum) {
        this.$listeners.saveSiteAttr({
          bchsc: val
        })
      }
    },

    validateInput(value) {
      // 清除之前的错误信息
      this.errorMessage = ''

      // 确保输入的是数字
      if (!/^\d+$/.test(value)) {
        this.errorMessage = '请输入有效的数字'
        this.bchsc = ''
      }
    },
    validateInputOnBlur(event) {
      // 清除之前的错误信息
      this.errorMessage = ''

      const value = event.target.value

      // 确保输入的是数字
      if (!/^\d+$/.test(value)) {
        this.errorMessage = '请输入有效的数字'
        this.bchsc = ''
        return
      }

      // 将输入值转换为数字
      const numValue = parseInt(value, 10)

      // 检查数字是否在 200 到 600 之间
      if (numValue < 200 || numValue > 600) {
        this.errorMessage = '请输入 200 到 600 之间的数字'
        this.bchsc = ''
      }
    }
  }
}
</script>
