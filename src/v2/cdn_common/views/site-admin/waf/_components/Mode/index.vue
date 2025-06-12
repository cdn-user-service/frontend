<template>
  <div>
    <ants-form-card>
      <template slot="title">精准访问控制模式</template>
      <template slot="content">
        <div v-loading="$root.loading">
          <ants-form
            :model="form"
            :rules="formRules"
            ref="formRef"
            label-position="top"
          >
            <ants-form-item prop="mode_radio">
              <ants-radio-group
                v-model="form.mode_radio"
                size="small"
                @change="changeModeRadio"
              >
                <ants-radio-button
                  v-for="item in modeList"
                  :key="item.value"
                  :label="item.value"
                  :text="item.key"
                />
              </ants-radio-group>
            </ants-form-item>
            <!-- <ants-form-item
              label="匹配规则"
            >
              <ants-input
                type="textarea"
                v-model="form[`waf_rule_${form.mode_radio}`]"
                :autosize="{ minRows: 6, maxRows: 20 }"
                placeholder="请输入匹配规则，一行一条"
              ></ants-input>
            </ants-form-item> -->

            <ants-form-item
              label="处置方式"
              v-if="form.mode_radio === 'forbid'"
            >
              <ants-radio-group
                v-model="form.ants_waf_rule_forbid_mode_handle"
                @change="form.ants_waf_rule_forbid_mode_content = ''"
              >
                <ants-radio
                  v-for="item in forbidHandleList"
                  :key="item.value"
                  :label="item.value"
                  :text="item.key"
                />
              </ants-radio-group>

              <div
                class="mt-lg"
                v-if="form.ants_waf_rule_forbid_mode_handle === 3"
              >
                <span class="mr-lg">错误码</span>
                <ants-input
                  v-model="form.ants_waf_rule_forbid_mode_content"
                  style="max-width:250px;"
                  placeholder="444"
                />
                <div
                  class="text-sm text-ants-text-4"
                >
                  默认为444（断开连接），可自定义其他状态码，如： 403、404
                </div>
              </div>
            </ants-form-item>

            <ants-form-item
              label="处置方式"
              v-if="form.mode_radio === 'suspicious'"
            >
              <ants-radio-group
                v-model="form.ants_waf_rule_suspicious_mode_handle"
                @change="form.ants_waf_rule_suspicious_mode_content = ''"
              >
                <ants-radio
                  v-for="item in suspiciousHandleList"
                  :key="item.value"
                  :label="item.value"
                  :text="item.key"
                />
              </ants-radio-group>
            </ants-form-item>

            <ants-form-item v-if="form.mode_radio != 'pass'">
              <ants-button
                size="small"
                type="primary"
                icon="el-icon-edit"
                :loading="$attrs.btnLoading"
                text="提交配置"
                @click="submitForm"
              />
            </ants-form-item>
          </ants-form>
        </div>
      </template>
    </ants-form-card>
  </div>
</template>

<script>
export default {
  props: {
    form: Object
  },
  data() {
    return {
      form1: {
        // [bool], waf 总开关
        ants_waf: '0',
        // 选择方式
        mode_radio: 'pass',

        // [text], 封禁模式, 1 0|3 444|4 3600|5 3600
        ants_waf_rule_forbid_mode: '',
        ants_waf_rule_forbid_mode_handle: 1,
        ants_waf_rule_forbid_mode_content: '',

        // [text], 可疑模式， 1 0|2 1
        ants_waf_rule_suspicious_mode: '',
        ants_waf_rule_suspicious_mode_handle: 1,
        ants_waf_rule_suspicious_mode_content: '',

        // [mm_text], waf 规则（pass、forbid、suspicious正则） [{id: 0, type: 'pass', value: ''}]
        waf_rule_pass_id: 0,
        waf_rule_pass: '',

        waf_rule_forbid_id: 0,
        waf_rule_forbid: '',

        waf_rule_suspicious_id: 0,
        waf_rule_suspicious: ''
      },
      formRules: {
        waf_rule_pass: [
          {
            required: true,
            message: '请输入匹配规则，一行一条',
            trigger: ['change', 'blur']
          }
        ],
        waf_rule_forbid: [
          {
            required: true,
            message: '请输入匹配规则，一行一条',
            trigger: ['change', 'blur']
          }
        ],
        waf_rule_suspicious: [
          {
            required: true,
            message: '请输入匹配规则，一行一条',
            trigger: ['change', 'blur']
          }
        ]
      },

      /** 处置方式：
       *  1 = 记录观察模式
       *  2 = 验证模式
       *  3 = 错误码自定义返回模式
       *  4 = 单节点 IPset 拉黑模式
       *  5 = 全节点 IPset 拉黑模式
       */
      forbidHandleList: [
        {
          key: '记录观察',
          value: 1
        },
        {
          key: '错误码自定义返回',
          value: 3
        },
        {
          key: '单节点拉黑',
          value: 4
        },
        {
          key: '全节点拉黑',
          value: 5
        }
      ],

      // 处置方式
      suspiciousHandleList: [
        {
          key: '记录观察',
          value: 1
        },
        // 无感 = 1， 数字点击 = 2，传数据的时候要减去 1
        {
          key: '无感验证',
          value: '2 1'
        },
        {
          key: '数字点击',
          value: '2 2'
        }
      ],

      modeList: [
        {
          key: '放行',
          value: 'pass'
        },
        {
          key: '可疑',
          value: 'suspicious'
        },
        {
          key: '封禁', // 默认444(断开)、403、404
          value: 'forbid'
        }
      ]
    }
  },
  created() {
    // this.getSiteDetail()
  },
  methods: {
    /**
     * @description: 获取配置数据
     */

    async getSiteDetail() {
      const { data: res } = await this.$listeners.getSiteDetail('waf')
      res.attr.forEach(item => {
        if (
          item.pkey == 'waf_rule_pass' ||
          item.pkey == 'waf_rule_forbid' ||
          item.pkey == 'waf_rule_suspicious'
        ) {
          this.form[item.pkey] = item.pvalue && JSON.parse(item.pvalue).value
          this.form[`${item.pkey}_id`] = item.id
          return
        }

        // 封禁模式
        if (item.pkey == 'ants_waf_rule_forbid_mode') {
          const VALUE = item.pvalue.split(' ')
          this.form[item.pkey] = VALUE

          this.form[`${item.pkey}_handle`] = +VALUE[0]
          this.form[`${item.pkey}_content`] = VALUE[1]
          return
        }

        // 可疑模式
        if (item.pkey == 'ants_waf_rule_suspicious_mode') {
          const VALUE = item.pvalue.split(' ')
          this.form[item.pkey] = VALUE
          if (VALUE[0] == 1) {
            this.form[`${item.pkey}_handle`] = +VALUE[0]
            this.form[`${item.pkey}_content`] = VALUE[1]
          } else {
            this.form[`${item.pkey}_handle`] = item.pvalue
          }
          console.log(this.form[`${item.pkey}_handle`])
          return
        }

        // 如果存在值
        if (item.pkey in this.form) {
          this.form[item.pkey] = item.pvalue
        }
      })
    },

    /**
     * @description: 选择方式
     * @param {*} val
     */

    changeModeRadio(val) {
      // 选择放行
      if (val === 'pass') {
        this.saveSiteAttr({
          waf_rule_pass: [
            {
              id: this.form.waf_rule_pass_id,
              // value: this.form.waf_rule_pass.trim().replace(/[\r\n\s]+/g, '|')
              value: this.form.waf_rule_pass.trim()
            }
          ]
        })
      }
    },

    /**
     * @description: 表单提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        const MODE = this.form.mode_radio
        if (MODE === 'pass') {
          // 放行模式
          this.saveSiteAttr({
            waf_rule_pass: [
              {
                id: this.form.waf_rule_pass_id,
                // value: this.form.waf_rule_pass.trim().replace(/[\r\n\s]+/g, '|')
                value: this.form.waf_rule_pass.trim()
              }
            ]
          })
        } else if (MODE === 'forbid') {
          // 封禁模式
          const handle = this.form[`ants_waf_rule_${MODE}_mode_handle`]
          let handleContent = this.form[`ants_waf_rule_${MODE}_mode_content`]
          if (handle == 1) {
            handleContent = 1
          }
          if (handle == 4 || handle == 5) {
            handleContent = 3600
          }
          if (handleContent === '') return this.$msg.error('请输入返回错误码')
          this.saveSiteAttr({
            [`ants_waf_rule_${MODE}_mode`]: `${handle} ${handleContent}`
          })
        } else if (MODE === 'suspicious') {
          // 可疑模式
          const handle = this.form.ants_waf_rule_suspicious_mode_handle
          let postData = handle
          if (handle == 1) {
            postData = '1 1'
          }
          this.saveSiteAttr({
            [`ants_waf_rule_${MODE}_mode`]: postData
          })
        }
      })
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
    },

    changeStatus(val) {},

    getTableData() {},

    deleteItem(row) {}
  }
}
</script>
