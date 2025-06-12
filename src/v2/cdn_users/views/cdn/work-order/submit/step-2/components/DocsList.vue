<template>
  <div>
    <div class="font-bold my-sm">{{antsT('推荐阅读')}}</div>
    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
        v-for="(item, idx) in docsList"
        :key="idx"
      >
        <div
          class="truncate cursor-color text-sm my-sm"
          >{{ idx + 1 }}、{{ item.info }}</div
        >
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      docsList: [
        {
          info: '实名认证操作指引',
          url: './'
        },
        {
          info: '管理CDN账号信息',
          url: '/home'
        },
        {
          info: '绑定登录方式',
          url: '/home'
        },
        {
          info: '修改手机和邮箱',
          url: '/home'
        },
        {
          info: '重置登录密码',
          url: '/home'
        },
        {
          info: '找回密码',
          url: '/home'
        },
        {
          info: '账号注销指引',
          url: '/home'
        },
        {
          info: '访问管理操作指引',
          url: '/home'
        }
      ]
    }
  },
  created() {},
  methods: {}
}
</script>
