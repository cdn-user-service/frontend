<template>
  <div>
    <el-card class="content-box animated fadeIn">
      <div slot="header">
        <TitleBorder title="流量采集配置"></TitleBorder>
      </div>

      <ants-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="100px"
        style="max-width: 500px"
      >
        <ants-form-item prop="host" label="主机地址">
          <ants-input v-model.trim="form.host" placeholder="请输入主机地址" />
        </ants-form-item>

        <ants-form-item prop="port" label="端口号">
          <ants-input v-model.trim="form.port" placeholder="请输入端口号" />
        </ants-form-item>

        <ants-form-item prop="pwd" label="授权密码">
          <ants-input
            v-model="form.pwd"
            show-password
            placeholder="请输入授权密码"
          />
        </ants-form-item>

        <ants-form-item prop="method" label="选择协议">
          <el-radio-group v-model="form.method">
            <!-- 只启用http协议 v-for="item in ['http', 'https']" -->
            <el-radio v-for="item in ['http']" :key="item" :label="item">{{
              item.toLocaleUpperCase()
            }}</el-radio>
          </el-radio-group>
        </ants-form-item>

        <ants-form-item
          prop="caPath"
          label="证书路径"
          v-if="form.method == 'https'"
        >
          <ants-input v-model="form.caPath" placeholder="请输入证书路径" />
        </ants-form-item>

        <ants-form-item prop="minAge" label="日志保留">
          <ants-input-number
            v-model="form.minAge"
            size="small"
            :precision="0"
            :min="1"
            :max="7"
            placeholder="时长"
          />
          <span class="text-sm text-ants-text-4"> 天（1 ~ 7） </span>
        </ants-form-item>

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
            icon="el-icon-check"
            :loading="btnLoading || esLoading"
            @click="submitForm"
            text="保存配置"
          />
        </ants-form-item>
      </ants-form>
    </el-card>

    <el-card class="content-box animated fadeIn" v-if="debug">
      <div slot="header">
        <TitleBorder title="推送采集配置">
          <span class="text-sm text-ants-text-4 ml-df">
            若无特殊情况，请勿随意推送采集配置
          </span>
        </TitleBorder>
      </div>
      <div class="flex items-center">
        <el-radio-group v-model="putForm.uri" @change="changePut">
          <el-radio label="_ingest/pipeline/block_log_pipeline">
            block_log_pipeline
          </el-radio>
          <el-radio label="_ingest/pipeline/log_pipeline">
            log_pipeline
          </el-radio>
          <!-- <el-radio label="other">
              手动输入
            </el-radio> -->
        </el-radio-group>

        <ants-input
          style="width: 300px; margin-left: 10px"
          v-model="putForm.uri"
          placeholder="请输入索引地址"
        />
      </div>

      <div class="my-lg">
        <ants-input
          type="textarea"
          :autosize="{ minRows: 15, maxRows: 15 }"
          v-model="putForm.patterns"
          placeholder="请输入Patterns"
        />
      </div>
      <ants-button
        type="primary"
        icon="el-icon-edit"
        :loading="btnLoading"
        @click="doPut"
        text="推送配置"
      />
      <ants-button
        type="info"
        icon="el-icon-refresh"
        :loading="btnLoading"
        @click="reset"
        text="恢复默认"
      />
    </el-card>
  </div>
</template>

<script>
import mixins from '../../mixins'
import { getElastic } from '@/v2/cdn_admin/api/cdn/monitor'

const defaultForm = {
  // 主机地址
  host: '',
  // 端口
  port: '',
  // 密码
  pwd: '',
  // 协议
  method: 'http',
  // 证书
  caPath: '',
  // 日志保留时长，默认 3 天
  minAge: 3
}

const putParams = {
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
                  "patterns": ["%{DATESTAMP:log_time} %{DATA:log_level} %{DATA:code1}#%{DATA:code_2}: k00=%{DATA:k_ip}&k01=%{DATA:k_host}&k02=%{DATA:k_uri}&k03=%{DATA:k_exten}&k04=%{DATA:k_arg}&k05=%{DATA:k_user_agent}&k06=%{DATA:k_request_length}&k07=%{DATA:k_geoip}&k08=%{DATA:k_referer}&k09=%{DATA:k_scheme}&k10=%{DATA:k_method}&k11=%{DATA:k_herd_cookies_success_sum}&k12=%{DATA:k_verify_fail_sum}&k13=%{DATA:k_ip_join_time}&k14=%{DATA:k_ip_total}&k15=%{DATA:k_ip_1_sum}&k16=%{DATA:k_ip_5_sum}&k17=%{DATA:k_ip_404_sum}&k18=%{DATA:k_ip_cache_hit_sum}&k19=%{DATA:k_ip_content_type_info}&k20=%{DATA:k_ip_method_type_info}&k21=%{DATA:k_server_sum}&k22=%{DATA:k_server_1_sum}&k23=%{DATA:k_server_5_sum}&k24=%{DATA:k_ip_url_type_info}&k25=%{DATA:l_return_code}&k26=%{DATA:l_out_size}&k27=%{DATA:l_server_in_byte}&k28=%{DATA:l_server_out_byte}&k29=%{DATA:l_upstream_status}&k30=%{DATA:k_ip_400_sum}&k31=%{DATA:ip_timeout_sum}&k32=%{DATA:ip_uri_n_sum}&k33=%{DATA:ip_cookie_names}&k34=%{DATA:ip_referer_verify}&k35=%{DATA:s_port}&k36=%{DATA:k_x_forwarded_for}&k37=%{DATA:k_server_5s_sum}&k38=%{DATA:k_upstream_ip}&k39=%{DATA:http_host}&k40=%{DATA:k_cname_type_info}&k41=%{DATA:k_body_length}&"]
              }
          },
          {
              "script": {
                  "source": "for (def field: ['k_request_length', 'k_herd_cookies_success_sum', 'k_verify_fail_sum', 'k_ip_total', 'k_ip_1_sum', 'k_ip_5_sum', 'k_ip_404_sum', 'k_ip_cache_hit_sum', 'k_ip_content_type_info', 'k_ip_method_type_info', 'k_server_sum', 'k_server_1_sum', 'k_server_5_sum', 'k_ip_url_type_info', 'l_out_size', 'l_server_in_byte', 'l_server_out_byte', 'k_ip_400_sum', 'ip_timeout_sum', 'ip_uri_n_sum', 'k_x_forwarded_for', 'k_server_5s_sum']) {if (ctx.containsKey(field)) {ctx[field] = Long.parseLong(ctx[field])}}"
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
  `,

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

export default {
  mixins: [mixins],
  data() {
    const { isIp, isPort } = this.$validator
    return {
      // 标识， [text]
      keyStr: 'elk_config',
      btnLoading: false,
      esLoading: false,
      form: {
        ...defaultForm
      },
      rules: {
        host: [
          {
            required: true,
            message: '请输入主机地址',
            trigger: ['change', 'blur']
          },
          {
            validator: isIp(),
            trigger: ['change', 'blur']
          }
        ],
        port: [
          {
            required: true,
            message: '请输入端口号',
            trigger: ['change', 'blur']
          },
          {
            validator: isPort(),
            trigger: ['change', 'blur']
          }
        ],
        pwd: [
          {
            required: true,
            message: '请输入授权密码',
            trigger: ['change', 'blur']
          }
        ],
        method: [
          {
            required: true,
            message: '请选择协议',
            trigger: 'change'
          }
        ],
        caPath: [
          {
            required: true,
            message: '请输入证书路径',
            trigger: ['change', 'blur']
          }
        ],
        patterns: [
          {
            required: true,
            message: '请输入Patterns',
            trigger: ['change', 'blur']
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

      // 需要手动PUT到ES的数据
      putParams,
      putForm: {
        // 需要推送的参数
        patterns: putParams['_ingest/pipeline/block_log_pipeline'],
        uri: '_ingest/pipeline/block_log_pipeline'
      }
    }
  },
  created() {
    this.getDetailByKey()
  },
  methods: {
    // 获取配置数据
    async getDetailByKey() {
      const { data: res } = await this.getGlobalKeyDetail('elk_config')
      if (!res) return
      const pvalue = JSON.parse(res.pvalue || '{}')
      console.log('pvalue', pvalue)
      this.form = {
        ...this.form,
        ...pvalue
      }
    },

    // 获取日志保留时长，获取不了
    async _getMinAge() {
      const { data: res } = await getElastic({
        uri: '_ilm/policy/filebeat',
        method: 'GET',
        postData: JSON.stringify({})
      })
      console.log('getMinAge', res)
    },

    // 表单提交
    submitForm() {
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
                  await this.saveGlobalAttr({
                    elk_config: JSON.stringify(postData)
                  })

                  // 手动推送到ES
                  this.handleEs()

                  // TODO:下个版本删除
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
        console.log(Object.keys(this.putParams))
        await Promise.all(
          Object.keys(this.putParams).map(async (key) => {
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
      } catch (error) {
        console.log('error：', error)
      } finally {
        this.esLoading = false
      }
    },

    changePut(val) {
      this.putForm.patterns = this.putParams[val]
    },

    reset() {
      this.putForm.patterns = this.putParams[this.putForm.uri] || ''
    },

    // 主动推动配置到ES
    async doPut() {
      if (!this.debug) return
      const { uri, patterns } = this.putForm
      if (!patterns) return this.$msg.error('内容不能为空')
      this.btnLoading = true
      try {
        const { data: res } = await getElastic({
          uri,
          method: 'PUT',
          // 将 """ 替换为 "
          // postData: patterns.replace(/"""/g, '"')
          postData: patterns
        })
        if (res.code !== 1) return
        this.$msg.success(res.data)
      } finally {
        this.btnLoading = false
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
      await getElastic({
        uri: '_data_stream/metricbeat-8.9.1',
        method: 'DELETE',
        postData: ''
      })

      setTimeout(async () => {
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
          "http": {
            "properties": {
              "server_io_p": {
                "properties": {
                  "v": {
                    "type": "nested",
                    "properties": {
                      "s": {
                        "type": "keyword"
                      },
                      "i": {
                        "type": "long"
                      },
                      "o": {
                        "type": "long"
                      },
                      "p": {
                        "type": "long"
                      }
                    }
                  }
                }
              },
              "waf_server_status": {
                "properties": {
                  "v": {
                    "type": "nested",
                    "properties": {
                      "i3": {
                        "type": "long"
                      }
                    }
                  }
                }
              },
              "server_io_p_r2": {
                "properties": {
                  "v": {
                    "type": "nested",
                    "properties": {
                      "s": {
                        "type": "keyword"
                      },
                      "p": {
                        "type": "keyword"
                      }
                    }
                  }
                }
              }
            }
          },
  
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
      }, 2000)
    }
  }
}
</script>
