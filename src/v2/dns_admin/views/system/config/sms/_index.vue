<template>
  <horizontal-menu
    parent-path="/system/config/sms/"
    :menu-list="menuList"
    :params="params"
    title="腾讯短信配置"
  />
</template>

<script>
export default {
  data() {
    return {
      params: {
        id: 3,
        key: 'SMS_CONFIG_KEY',
        remark: '腾讯云短信配置'
      },

      menuList: [
        {
          title: '腾讯短信配置',
          path: 'config'
        },
        {
          title: '短信模板配置',
          path: 'template'
        }
      ]
    }
  }
}
</script>
