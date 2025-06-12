<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
      >
        <ants-form-card style="margin: 0;">
          <template slot="title">{{ antsT('站点信息') }}</template>
          <template slot="content">
            <div style="min-height:240px;">
              <el-skeleton :rows="4" :loading="$root.loading" animated>
                <template>
                  <ul class="space-y-lg">
                    <li
                      v-for="(item, key) in {
                        domainId: '站点ID',
                        domain: '域名',
                        status: '状态',
                        cname: 'CNAME',
                        createtime: '创建时间',
                        plan: '绑定套餐',
                        planTime: '套餐有效期'
                      }"
                      :key="key"
                      class="flex items-center"
                    >
                      <span
                        class="inline-block text-ants-text-4"
                        style="min-width: 100px"
                      >
                        {{ item }}
                      </span>

                      <div class="flex-1 pl-sm">
                        <span v-html="siteInfo[key]"></span>

                        <router-link
                          v-if="key === 'cname'"
                          class="ml-sm inline-block px-xs py-2 text-primary underline hover:bg-ants-bg-1 rounded-lg"
                          to="./line"
                        >
                          {{ antsT('自定义') }}
                        </router-link>
                      </div>
                    </li>
                  </ul>

                  <!-- <ul class="space-y-10">
                    <li class="">
                      <span
                        class="text-ants-text-4 inline-block"
                        style="width:100px;"
                      >
                        Domain ID
                      </span>
                      <span>{{ $route.query.id }}</span>
                    </li>
                    <li class="">
                      <span
                        class="text-ants-text-4 inline-block"
                        style="width:100px;"
                      >
                        {{ antsT('域名') }}
                      </span>
                      <span>{{ $route.query.domain }}</span>
                    </li>
                    <li class="">
                      <span
                        class="text-ants-text-4 inline-block"
                        style="width:100px;"
                      >
                        CNAME
                      </span>
                      <span>{{ (cname || '').split(',')[0] || '-' }}</span>
                      <router-link
                        class="ml-sm inline-block px-sm py-2 bg-primary text-ants-bg-1 rounded-lg"
                        to="./line"
                      >
                        {{ antsT('自定义') }}
                      </router-link>
                    </li>
                    <li class="">
                      <span
                        class="text-ants-text-4 inline-block"
                        style="width:100px;"
                      >
                        {{ antsT('状态') }}
                      </span>
                      <span class="el-icon-success text-success">
                        {{ antsT('正常') }}</span
                      >
                    </li>
                  </ul> -->
                </template>
              </el-skeleton>
            </div>
          </template>
        </ants-form-card>
      </el-col>

      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
      >
        <!-- 别名管理 -->
        <Alias
          ref="AliasRef"
          v-on="$listeners"
          v-bind="$attrs"
          @refresh="getSiteDetail"
          :sslDomains="sslDomains"
        />
      </el-col>
    </el-row>

    <LogMode
      ref="LogModeRef"
      v-on="$listeners"
      v-bind="$attrs"
      v-if="isAdmin"
    />

    <FlowRatio
      ref="FlowRatioRef"
      v-on="$listeners"
      v-bind="$attrs"
      v-if="$mode[176] && isAdmin"
    />

    <!-- 证书管理 -->
    <Ssl
      ref="SslRef"
      v-on="$listeners"
      v-bind="$attrs"
      @updateSslDomains="updateSslDomains"
    />
  </el-form>
</template>

<script>
import LogMode from './components/LogMode'
import Alias from './components/Alias'
import Ssl from './components/Ssl'
import FlowRatio from './components/FlowRatio'

const PROCESS_NAME = process.env.VUE_APP_NAME

export default {
  components: {
    LogMode,
    Alias,
    Ssl,
    FlowRatio
  },
  data() {
    return {
      // 前台不显示流量采集选项
      isAdmin: PROCESS_NAME === 'cdn_admin',

      cname: '',
      form: {
        // [m_text]
      },
      rules: {},

      // 站点信息
      siteInfo: {
        domainId: '',
        domain: '',
        cname: '',
        status: '',
        createtime: '',
        plan: '',
        planTime: ''
      },

      // 证书验证域名
      sslDomains: []
    }
  },
  created() {
    this.getSiteDetail()
  },
  methods: {
    // 获取站点配置数据
    async getSiteDetail() {
      const { data: res } = await this.$listeners.getSiteDetail('base')
      this.$refs.AliasRef.tableData = []
      this.cname = res.cname

      const { suit = {} } = res
      
      this.siteInfo = {
        domainId: res.id,
        domain: res.mainServerName,
        cname: (res.cname || '').split(',')[0] || '-',
        status: res.status
          ? '<span class="text-success el-icon-success"> 启用</span>'
          : '<span class="text-error el-icon-error"> 禁用</span>',
        createtime: res.createtime,
        plan: suit.suitName,
        planTime: `${suit.startTime} ~ ${suit.endTime}`
      }

      res.attr.forEach(item => {
        const { pkey, pvalue } = item
        // 流量采集选项，管理端才有
        // if (this.isAdmin && pkey === 'site_vhost_filter_mode') {
        //   this.$refs.FlowRef.form.site_vhost_filter_mode = +pvalue
        // }

        // 日志模式，管理端才有
        if (this.isAdmin && pkey === 'access_log_mode') {
          this.$refs.LogModeRef.form.access_log_mode = +pvalue
        }

        // 站点流量统计系数
        if (this.isAdmin && pkey === 'flow_ratio') {
          this.$refs.FlowRatioRef.form.flow_ratio = +pvalue
        }

        // 给别名管理子组件赋值
        if (pkey === 'alias') {
          const obj = {
            // id 用于编辑和删除
            id: item.id,
            // 别名
            value: pvalue
          }
          this.$refs.AliasRef.tableData.unshift(obj)
        }

        // 如果存在值
        if (pkey in this.form) {
          this.form[pkey] = pvalue
        }
      })
    },

    // 更新证书验证域名
    updateSslDomains(domains = []) {
      this.sslDomains = domains
    },

    // 单个保存
    doSave(key = '') {
      this.saveSiteAttr({
        [key]: this.form[key]
      })
    },

    // 保存配置数据
    async saveSiteAttr(dataObj) {
      const res = await this.$listeners.saveSiteAttr(dataObj)
    }
  }
}
</script>
