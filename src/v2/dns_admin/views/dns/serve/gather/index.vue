<template>
  <el-card class="content-box animated fadeIn">
    <template slot="header">
      <TitleBorder title="ElkServer" />
    </template>

    <el-skeleton :rows="8" animated :loading="loading">
      <ants-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="100px"
        size="medium"
        style="max-width: 450px"
        class="mt-df"
      >
        <!-- <ants-form-item label="Ca Path" prop="ca_path">
          <ants-input
            size="small"
            v-model="form.ca_path"
            placeholder="请输入Ca Path"
            style="max-width:350px;"
          />
        </ants-form-item> -->
        <ants-form-item label="主机地址" prop="host">
          <ants-input v-model.trim="form.host" placeholder="请输入主机地址" />
        </ants-form-item>
        <ants-form-item label="端口号" prop="port">
          <ants-input v-model.trim="form.port" placeholder="请输入端口号" />
        </ants-form-item>
        <ants-form-item label="授权密码" prop="pwd">
          <ants-input
            v-model="form.pwd"
            placeholder="请输入授权密码"
            type="password"
            show-password
          />
        </ants-form-item>
        <ants-form-item label="选择协议" prop="method">
          <el-radio-group v-model="form.method">
            <el-radio label="http"> HTTP </el-radio>
            <!-- <el-radio label="https">
              HTTPS
            </el-radio> -->
          </el-radio-group>
        </ants-form-item>

        <!-- <ants-form-item prop="minAge" label="日志保留">
          <ants-input-number
            v-model="form.minAge"
            :precision="0"
            :min="1"
            :max="365"
            placeholder="时长"
          />
          <span class="text-sm text-ants-text-4">
            天（1 ~ 365）
          </span>
        </ants-form-item> -->

        <ants-form-item>
          <el-alert
            title="注意：每次保存配置后，都将会清空和重置流量采集数据！"
            type="error"
            :closable="false"
            :show-icon="false"
            style="line-height: 1.5; margin-bottom: 20px"
          />

          <ants-button
            type="primary"
            text="保存配置"
            icon="el-icon-check"
            :loading="btnLoading || esLoading"
            @click="doSaveAll()"
          />
        </ants-form-item>
      </ants-form>
    </el-skeleton>
  </el-card>
</template>

<script>
// API
import {
  getGlobalConfig,
  saveAllGlobalConfig
} from '@/v2/dns_admin/api/dns/serve'
import { getElastic } from '@/v2/dns_admin/api/dns/monitor'

const _putParams = {
  '_all/_settings': `
  {
    "index.max_result_window": 100000
  }
  `,
  '_ingest/pipeline/block_log_pipeline': `
{
    "description": "Pipeline for parsing log data",
    "processors": [
      {
        "grok": {
            "field": "message",
            "patterns": [
                "%{DATESTAMP:log_time} %{DATA:log_level} %{DATA:code1}#%{DATA:code_2}: ip=%{IP:ip}&mode=%{DATA:mode}&param=%{DATA:param}&index=%{DATA:index}&server_name=%{DATA:server_name}&"
            ]
        }
      },
      {
        "geoip": {
            "field": "ip"
        }
      },
      {
        "geoip": {
            "field": "host.name",
            "target_field": "geohost"
        }
      }
  ]
}
 `,
  '_ingest/pipeline/log_pipeline': `
{
    "description": "Pipeline for parsing log data",
    "processors": [{
            "grok": {
                "field": "message",
                "patterns": ["%{DATESTAMP:log_time} %{DATA:log_level} %{DATA:code1}#%{DATA:code_2}: k00=%{DATA:k_ip}&k01=%{DATA:k_host}&k02=%{DATA:k_uri}&k03=%{DATA:k_exten}&k04=%{DATA:k_arg}&k05=%{DATA:k_user_agent}&k06=%{DATA:k_request_length}&k07=%{DATA:k_geoip}&k08=%{DATA:k_referer}&k09=%{DATA:k_scheme}&k10=%{DATA:k_method}&k11=%{DATA:k_herd_cookies_success_sum}&k12=%{DATA:k_verify_fail_sum}&k13=%{DATA:k_ip_join_time}&k14=%{DATA:k_ip_total}&k15=%{DATA:k_ip_1_sum}&k16=%{DATA:k_ip_5_sum}&k17=%{DATA:k_ip_404_sum}&k18=%{DATA:k_ip_cache_hit_sum}&k19=%{DATA:k_ip_content_type_info}&k20=%{DATA:k_ip_method_type_info}&k21=%{DATA:k_server_sum}&k22=%{DATA:k_server_1_sum}&k23=%{DATA:k_server_5_sum}&k24=%{DATA:k_ip_url_type_info}&k25=%{DATA:l_return_code}&k26=%{DATA:l_out_size}&k27=%{DATA:l_server_in_byte}&k28=%{DATA:l_server_out_byte}&k29=%{DATA:l_upstream_status}&k30=%{DATA:k_ip_400_sum}&k31=%{DATA:ip_timeout_sum}&k32=%{DATA:ip_uri_n_sum}&"]
            }
        },
        {
            "script": {
                "source": "for (def field: ['k_request_length', 'k_herd_cookies_success_sum', 'k_verify_fail_sum', 'k_ip_total', 'k_ip_1_sum', 'k_ip_5_sum', 'k_ip_404_sum', 'k_ip_cache_hit_sum', 'k_ip_content_type_info', 'k_ip_method_type_info', 'k_server_sum', 'k_server_1_sum', 'k_server_5_sum', 'k_ip_url_type_info', 'l_out_size', 'l_server_in_byte', 'l_server_out_byte', 'k_ip_400_sum', 'ip_timeout_sum', 'ip_uri_n_sum']) {if (ctx.containsKey(field)) {ctx[field] = Long.parseLong(ctx[field])}}"
            }
        },
        {
            "script": {
                "source": "ctx.k_url = ctx.k_host + ctx.k_uri",
                "lang": "painless"
            }
        },
        {
            "geoip": {
              "field": "k_ip"
            }
        },
        {
            "geoip": {
              "field": "host.name",
              "target_field": "geohost"
            }
        }
    ]
}
  `,
  '_ingest/pipeline/stream_pipeline': `
{
  "description": "Pipeline for upstream log data",
  "processors": [
      {
        "grok": {
          "field": "message",
          "patterns": [
            "stream_log:%{DATA:remote_addr}&%{TIMESTAMP_ISO8601:time}&%{DATA:s_uid}&%{DATA:s_sn}&%{DATA:s_id}&%{DATA:server_port}&%{DATA:protocol}&%{DATA:status}&%{NUMBER:bytes_sent}&%{NUMBER:bytes_received}&%{DATA:session_time}&%{NUMBER:upstream_connect_time}&"
          ]
        }
      },{
      "script": {
        "source": "for (def field : ['bytes_sent', 'bytes_received']) {if (ctx.containsKey(field)) {ctx[field] = Long.parseLong(ctx[field])}}"
      }
    }
    ]
}  
`
}

const putParams = {
  // 日志保留时长
  '_ilm/policy/metricbeat': `
  {
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_age": "30d",
            "max_primary_shard_size": "50gb"
          }
        }
      },
      "delete": {
        "min_age": "_minAge_d",
        "actions": {
          "delete": {
            "delete_searchable_snapshot": true
          }
        }
      }
    }
  }
}
  `,
  '_ilm/policy/filebeat': `
  {
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_age": "30d",
            "max_primary_shard_size": "50gb"
          }
        }
      },
      "delete": {
        "min_age": "_minAge_d",
        "actions": {
          "delete": {
            "delete_searchable_snapshot": true
          }
        }
      }
    }
  }
}
  `
}

const defaultForm = {
  // elasticsearch
  ca_path: '',
  host: '',
  method: 'http',
  port: '',
  pwd: '',
  // 日志保留时长，默认 3 天
  minAge: 3
}

export default {
  data() {
    return {
      loading: false,
      btnLoading: false,
      esLoading: false,
      // 全局配置数据
      form: {
        ...defaultForm
      },
      rules: {
        ca_path: [
          {
            required: true,
            message: '请输入Ca Path',
            trigger: ['change', 'blur']
          }
        ],
        host: [
          {
            required: true,
            message: '请输入Host',
            trigger: ['change', 'blur']
          }
        ],
        port: [
          {
            required: true,
            message: '请输入Port',
            trigger: ['change', 'blur']
          }
        ],
        pwd: [
          {
            required: true,
            message: '请输入Password',
            trigger: ['change', 'blur']
          }
        ],
        method: [
          {
            required: true,
            message: '请选择Method',
            trigger: 'change'
          }
        ],
        minAge: [
          {
            required: true,
            message: '请输入日志保留时长',
            trigger: ['change', 'blur']
          }
        ]
      },
      putParams
    }
  },
  created() {
    this.getConfigData()
    // this.getMinAge()
  },
  mounted() {},
  methods: {
    // 获取全局配置数据
    async getConfigData() {
      this.loading = true
      try {
        const { data: res } = await getGlobalConfig()
        if (res.code !== 1) return
        const obj = res.data || {}

        /// 递归构造form数据
        Object.keys(this.form).forEach((key) => {
          this.buildFormData(obj, key)
        })

        console.log('this.form', this.form)
      } finally {
        this.loading = false
      }
    },

    // 获取日志保留时长
    async getMinAge() {
      const { data: res } = await getElastic({
        uri: '_ilm/policy/filebeat',
        method: 'GET',
        postData: JSON.stringify({})
      })
      console.log('getMinAge', res)
      if (res.code !== 1) return
      if (!res.data) return
      const obj = JSON.parse(res.data || '{}')
      console.log(obj)
      // this.form.minAge = obj.filebeat.policy.delete.min_age.replace('d', '')
    },

    // 递归构造 form 数据
    buildFormData(obj = {}, formKey = '') {
      Object.keys(obj).forEach((key) => {
        // 如果找到了对应的key
        if (key === formKey) {
          this.form[key] = (obj[key] || {}).configValue
          return
        }

        // 如果没有找到对应的key，并且是对象
        if (typeof obj[key] === 'object') {
          this.buildFormData(obj[key], formKey)
        }
      })
    },

    // 保存所有配置
    doSaveAll() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$confirm(
          '保存配置后，将会清空和重置流量采集数据，是否继续？',
          '重要提示',
          {
            dangerouslyUseHTMLString: true,
            center: true,
            type: 'info',
            confirmButtonText: '保存配置',
            beforeClose: async (action, instance, done) => {
              if (action === 'confirm') {
                this.btnLoading = true
                instance.confirmButtonLoading = true
                instance.confirmButtonText = '加载中...'

                try {
                  // 去除空格
                  const postData = {}
                  Object.keys(this.form).forEach((key) => {
                    postData[key] = (this.form[key] + '').trim()
                  })
                  const { data: res } = await saveAllGlobalConfig({
                    elasticsearch: postData
                  })
                  if (res.code !== 1) return
                  this.$msg.success('保存成功')

                  // 手动推送到ES
                  // this.handleEs()
                  this.putEsConfig()

                  instance.confirmButtonText = '保存成功'
                  this.$msg.success('保存成功')
                  done()
                } finally {
                  this.btnLoading = false
                  instance.confirmButtonLoading = false
                }
              } else {
                this.btnLoading = false
                done()
              }
            }
          }
        ).catch((err) => err)
      })
    },

    // 手动推送到ES
    async handleEs() {
      this.esLoading = true
      try {
        await Promise.all(
          Object.keys(this.putParams).forEach(async (key) => {
            let postData = this.putParams[key]
            if (
              ['_ilm/policy/metricbeat', '_ilm/policy/filebeat'].includes(key)
            ) {
              postData = postData.replace('_minAge_', this.form.minAge)
            }
            await getElastic({
              uri: key,
              method: 'PUT',
              postData
            })
          })
        )
      } finally {
        this.esLoading = false
      }
    },

    // TODO：手动更新ES配置，下一个版本删除
    async putEsConfig() {
      // const TYPE_RESET = window.localStorage.getItem('TYPE_RESET')
      // if (TYPE_RESET) {
      //   return
      // }
      // window.localStorage.setItem('TYPE_RESET', 1)

      // 先删除
      // await getElastic({
      //   uri: '_data_stream/metricbeat-8.9.1',
      //   method: 'DELETE',
      //   postData: ''
      // })

      await getElastic({
        uri: '_index_template/metricbeat-8.9.1',
        method: 'PUT',
        postData: `
{
  "priority": 140,
  "index_patterns": [
    "metricbeat-8.9.1",
    "metricbeat-8.9.1-*"
  ],
  "data_stream": {},
  "template": {
    "settings": {
      "number_of_shards": 1
    },
    "mappings": {
      "properties": {
        "agent": {
          "properties": {
            "name": {
              "type": "keyword"
            }
          }
        },
        "system": {
          "properties": {
            "filesystem": {
              "properties": {
                "device_name": {
                  "type": "keyword"
                }
              }
            }
          }
        }
  
      }
    }
  }
}
        `
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
