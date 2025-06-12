<template>
  <div>
    <!-- <ants-form-card>
      <template slot="title">{{antsT('网站快照')}}</template>
      <template slot="info">
        当前服务不支持，您可以联系商务开通此项功能
      </template>
      <template slot="content">
        <ants-switch
          v-model="form.snapshot"
          active-value="1"
          inactive-value="0"
          active-text="ON"
          inactive-text="OFF"
          v-loading="$attrs.btnLoading"
          @change="doSave('snapshot')"
        />
      </template>
    </ants-form-card> -->

    <ants-form-card>
      <template slot="title">{{antsT('options 请求返回 200')}}</template>
      <template slot="content">
        <ants-switch
          v-model="form.options_return_200"
          active-value="1"
          inactive-value="0"
          active-text="ON"
          inactive-text="OFF"
          v-loading="$attrs.btnLoading"
          @change="doSave('options_return_200')"
        />
      </template>
    </ants-form-card>

    <UrlForwarding
      ref="UrlForwardingRef"
      v-on="$listeners"
      v-bind="$attrs"
      @refreshData="getSiteDetail"
    />

    <SubFilter
      ref="SubFilterRef"
      v-on="$listeners"
      v-bind="$attrs"
    />
  </div>
</template>

<script>
import SubFilter from './components/SubFilter'
import UrlForwarding from './components/UrlForwarding'
export default {
  components: {
    SubFilter,
    UrlForwarding
  },
  data() {
    return {
      form: {
        // 网站快照，[bool]
        snapshot: '0',
        // OPTIONS请求返回 200，[bool]
        options_return_200: '0'
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
      const { data: res } = await this.$listeners.getSiteDetail('content')
      const subFilterForm = {
        sub_filter_status: '0',
        sub_filter_once: '1',
        sub_filter_types: ['text/html'],
        sub_filter: []
      }

      // URL转发表格数据
      const urlForwardingTableData = []
      // URL转发开关
      let urlForwardingStatus = 0

      res.attr.forEach((item) => {
        // 内容替换子组件
        if (item.pkey in subFilterForm) {
          if (item.pkey === 'sub_filter_types') {
            subFilterForm.sub_filter_types = item.pvalue.split(' ')
            return
          }
          if (item.pkey === 'sub_filter') {
            const itemArr = item.pvalue.split('----')
            subFilterForm.sub_filter.push({
              id: item.id,
              str1: itemArr[0],
              str2: itemArr[1]
            })
            return
          }

          subFilterForm[item.pkey] = item.pvalue
        }

        // 如果存在值
        if (item.pkey in this.form) {
          this.form[item.pkey] = item.pvalue
        }

        // URL转发
        if (item.pkey === 'site_uri_rewrite') {
          const obj1 = item.pvalue && JSON.parse(item.pvalue)
          // id 用于编辑和删除
          obj1.id = item.id
          // 开关
          urlForwardingStatus = item.status
          urlForwardingTableData.unshift(obj1)
        }
      })

      // 内容替换子组件赋值
      this.$refs.SubFilterRef.form = {
        ...subFilterForm
      }
      console.log(subFilterForm)
      if (subFilterForm.sub_filter.length) {
        this.$refs.SubFilterRef.tableForm.tableData = subFilterForm.sub_filter
      }

      // URL转发子组件赋值
      this.$refs.UrlForwardingRef.tableData = urlForwardingTableData
      this.$refs.UrlForwardingRef.status = urlForwardingStatus
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
