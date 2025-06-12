<template>
  <horizontal-menu
    parent-path="/system/config/email/"
    :menu-list="menuList"
    :params="params"
    title="邮件配置"
  />
</template>

<script>
export default {
  data() {
    return {
      params: {
        id: 31,
        key: 'MAIL_CONFIG_KEY',
        remark: '腾讯云邮件配置'
      },
      menuList: [
        {
          title: '发送服务器配置',
          path: 'config'
        },
        {
          title: '邮件模板配置',
          path: 'template'
        }
      ]
    }
  }
}
</script>
