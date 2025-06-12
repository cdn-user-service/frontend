<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '精准规则'"
    width="1200px"
    top="20px"
    @close="resetForm"
    @submit="submitForm"
    destroy-on-close
  >
    <!-- FOCS:: 必须加上 destroy-on-close="true" 关闭时销毁内部组件，不然会造成组件数据覆盖 -->
    <ul class="ants-tips_box space-y-3 mb-lg -mt-df">
      <li>
        {{
          antsT(
            '1、同一条规则中多个匹配条件为 “与” 逻辑，即必须多个条件同时满足才算匹配中规则；'
          )
        }}
      </li>
      <li>
        {{ antsT('2、匹配目标具有多个时，用 “|” 隔开；') }}
      </li>
      <li>
        {{ antsT('3、同一条规则最多 6个 匹配条件组合；') }}
      </li>
      <li>
        {{ antsT('4、涉及字符串匹配时，字符串不区分大小写。') }}
      </li>
    </ul>
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="left"
      label-width="80px"
      :status-icon="false"
      hide-required-asterisk
    >
      <ants-form-item prop="remark" label="备注信息">
        <ants-input v-model="form.remark" placeholder="请输入备注信息" />
      </ants-form-item>

      <ants-form-item label="匹配规则">
        <WafRuleTable ref="WafRuleTableRef" />
      </ants-form-item>

      <ants-form-item label="触发模式" style="margin-top: -10px">
        <div class="w-full flex items-center">
          <ants-radio-group v-model="form.req_sum_5s_mode">
            <ants-radio :label="0" text="持久" />
            <ants-radio :label="1" text="触发条件：" />
          </ants-radio-group>

          <span class="mx-2 text-ants-text-4">5秒请求数大于</span>
          <ants-input-number
            v-model="form.req_sum_5s"
            :disabled="form.req_sum_5s_mode === 0"
            placeholder="请输入"
            style="width: 80px"
            :controls="false"
            :min="50"
            :max="99999999"
            :precision="0"
            size="small"
          />
          <span class="ml-2 text-ants-text-4" v-if="$attrs.showReqSum"
            >次 （ 最大值：<strong class="text-primary mr-sm">{{
              reqSum.max
            }}</strong>
            平均值：<strong class="text-primary mr-sm">{{ reqSum.avg }}</strong>
            最小值：<strong class="text-primary">{{ reqSum.min }}</strong>
            ）
          </span>
        </div>
      </ants-form-item>

      <ants-form-item label="处置方式">
        <HandleMode ref="HandleModeRef" v-on="$listeners" v-bind="$attrs" />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
import WafRuleTable from './RuleTable'
import HandleMode from './HandleMode'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)

const defaultForm = {
  // 添加时 id为 0
  id: 0,
  // 行为
  //   mode: 'pass',
  // 匹配规则，一行一个
  rule: '',
  // 备注信息
  remark: '',
  req_sum_5s_mode: 0,
  // 触发模式
  req_sum_5s: 50
}

export default {
  components: {
    WafRuleTable,
    HandleMode
  },
  data() {
    return {
      title: '添加',
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      formRules: {
        rule: [
          {
            required: true,
            message: '请输入匹配内容，一行一个',
            trigger: ['change', 'blur']
          }
        ],
        remark: [
          {
            required: true,
            message: '请输入备注信息',
            trigger: ['change', 'blur']
          }
        ]
      },

      // 建议触发模式次数
      reqSum: {
        min: 0,
        max: 0,
        avg: 0
      }
    }
  },
  created() {},
  methods: {
    /**
     * @description: 展示对话框
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      this.title = row.id ? '修改' : '添加'

      this.form = {
        ...defaultForm,
        ...row,
        req_sum_5s_mode: row.req_sum_5s > 0 ? 1 : 0
      }

      let arr = [
        {
          type: '',
          handle: '',
          content: ''
        }
      ]

      // 匹配规则
      if (row.rule) {
        arr = []
        row.rule.forEach((item) => {
          const { type, handle, content } = item
          arr.push({
            type,
            handle,
            content
          })
        })
      }

      this.$nextTick(() => {
        // 处置方式
        if (row.waf_op) {
          this.$refs.HandleModeRef.init({
            handle: row.waf_op.handle,
            key: row.waf_op.key,
            param: row.waf_op.param,
            botCheckHttpStatusCode: row.waf_op.botCheckHttpStatusCode
          })
        }

        this.$refs.WafRuleTableRef.tableForm.tableData = arr
      })

      if (this.$attrs.showReqSum) {
        this.getReqSum()
      }
    },

    /**
     * @description: 表单提交
     */

    submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return

        // 验证匹配规则表格表单规则
        const ruleArr = this.$refs.WafRuleTableRef.submitTabelForm()
        if (!ruleArr) return

        // 处置方式
        const handleObj = this.$refs.HandleModeRef.submitForm()
        if (!handleObj) return

        this.$refs.dialogRef.btnLoading = true
        const { id, mode, remark } = this.form

        const data = await this.$listeners.submitForm({
          // id, 添加时 = 0
          id,
          // mode,
          remark,
          // 匹配规则
          rule: ruleArr,
          // 处置方式
          wafOp: handleObj,
          // 触发模式
          reqSum5s: this.form.req_sum_5s_mode === 1 ? this.form.req_sum_5s : 0
        })

        this.$refs.dialogRef.btnLoading = false

        if (!data) return
        this.dialogVisible = false
        this.$parent.getTableData()
      })
    },

    // 表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    },

    // 获取5秒请求数推荐
    async getReqSum() {
      const { data: res } = await getElastic({
        uri: 'metricbeat-*/_search',
        postData: JSON.stringify(this.buildQueryData())
      })

      if (res.code !== 1) return
      const obj = JSON.parse(res.data || '{}')

      const buckets = ((obj.aggregations || {})[0] || {})[1] || {}
      const requestMin = (buckets['request-min'] || {}).value || 0
      const requestMax = (buckets['request-max'] || {}).value || 0
      const requestAvg = (buckets['request-avg'] || {}).value || 0

      this.reqSum.min = Math.ceil(requestMin)
      this.reqSum.max = Math.ceil(requestMax)
      this.reqSum.avg = Math.ceil(requestAvg)
    },

    // 构造查询条件，带宽|流量|请求数
    buildQueryData() {
      // const domain = this.$route.query.domain
      const domain = '_'

      const queryData = {
        size: 0,
        query: {
          bool: {
            must: [
              {
                range: {
                  '@timestamp': {
                    gte: 'now-1h',
                    lte: 'now'
                  }
                }
              },
              {
                match: {
                  'event.dataset': 'http.server_io_p'
                }
              },
              // nested嵌套查询必须要加上，不然查询速度会很慢
              {
                nested: {
                  path: 'http.server_io_p.v',
                  query: {
                    match: {
                      'http.server_io_p.v.s': domain
                    }
                  },
                  inner_hits: {} // 在Nested查询中添加inner_hits，以便返回匹配的nested成员
                }
              }
            ]
          }
        },
        aggs: {
          0: {
            nested: {
              path: 'http.server_io_p.v'
            },
            aggs: {
              1: {
                filter: {
                  match: {
                    'http.server_io_p.v.s': domain
                  }
                },
                aggs: {
                  // 请求数
                  'request-min': {
                    min: {
                      field: 'http.server_io_p.v.r'
                    }
                  },
                  'request-max': {
                    max: {
                      field: 'http.server_io_p.v.r'
                    }
                  },
                  'request-avg': {
                    avg: {
                      field: 'http.server_io_p.v.r'
                    }
                  }
                }
              }
            }
          }
        }
      }
      return queryData
    }
  }
}
</script>
