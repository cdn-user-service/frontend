<template>
  <horizontal-menu
    parent-path="/dns/domain/bulk/"
    :menu-list="menuList"
    title="批量管理"
  />
</template>

<script>
const PROCESS_NAME = process.env.VUE_APP_NAME

export default {
  data() {
    return {}
  },
  computed: {
    menuList() {
      return PROCESS_NAME === 'dns_users'
        ? [
            {
              title: '添加域名',
              path: 'domainsCreate'
            },
            {
              title: '取回域名',
              path: 'domainsRetrieve'
            },
            {
              title: '修改套餐',
              path: 'planUpdate'
            },
            {
              title: '添加记录',
              path: 'recordCreate'
            },
            {
              title: '修改记录',
              path: 'recordUpdate'
            },
            {
              title: '导入记录',
              path: 'recordImport'
            },
            {
              title: '导出记录',
              path: 'recordExport'
            },
            {
              title: '操作日志',
              path: 'log'
            }
          ]
        : [
            {
              title: '添加域名',
              path: 'domainsCreate'
            },
            // {
            //   title: '取回域名',
            //   path: 'domainsRetrieve'
            // },
            {
              title: '修改套餐',
              path: 'planUpdate'
            },
            {
              title: '添加记录',
              path: 'recordCreate'
            },
            {
              title: '修改记录',
              path: 'recordUpdate'
            },
            {
              title: '导入记录',
              path: 'recordImport'
            },
            {
              title: '导出记录',
              path: 'recordExport'
            },
            {
              title: '操作日志',
              path: 'log'
            }
          ]
    }
  }
}
</script>
