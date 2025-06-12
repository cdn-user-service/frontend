<template>
  <el-select
    v-model="value"
    :multiple="multiple"
    filterable
    remote
    reserve-keyword
    :placeholder="antsT('检索域名')"
    :remote-method="domainRemoteMethod"
    :loading="loading"
    :size="size"
    @change="changeDomain"
    class="query-domain-select"
  >
    <el-option
      v-for="item in domainList"
      :key="item.id"
      :label="item.domain"
      :value="item[valueStr]"
    >
    </el-option>
  </el-select>
</template>

<script>
// API
import { getList } from '@/v2/dns_users/api/dns/domain'

export default {
  name: 'QueryDomainSelect',
  props: {
    // 所期望的输出值，可为 domain 或者 domain ID
    valueStr: {
      type: String,
      default: 'domain'
    },

    // 是否为多选
    multiple: {
      type: Boolean,
      default: false
    },

    // 大小
    size: {
      type: String,
      default: 'medium'
    }
  },
  data() {
    return {
      loading: false,
      domainList: [],
      value: '' // 输入框的值
    }
  },
  methods: {
    /**
     * @description: 远程搜索域名
     * @param {*} queryString
     */

    async domainRemoteMethod(queryString) {
      console.log(queryString)
      this.loading = true

      const { data: res } = await getList({
        domain: queryString.trim(),
        pagenum: 1,
        pagesize: 50
      })
      this.loading = false

      if (res.code !== 1) return
      this.domainList = res.data.list || []
    },

    /**
     * @description: 值改变
     * @param {*} val
     */

    changeDomain(val) {
      console.log(val)
      console.log(this.value)
      this.$emit('changeValue', val)
    }
  }
}
</script>
<style lang="scss">
.query-domain-select {
  .el-input {
    width: 100% !important;
  }
}
</style>
