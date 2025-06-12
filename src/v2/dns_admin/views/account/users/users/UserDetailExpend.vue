<template>
  <div class="user-expend-box">
    <el-row :gutter="30">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
      >
        <div class="expend_title">基本信息</div>
        <ul class="expend_main">
          <li>
            <span>手机号：</span
            ><span>{{ userRowData.mobile || '未绑定' }}</span>
          </li>
          <li>
            <span>邮 箱：</span
            ><span>{{ userRowData.mail || '未绑定' }}</span>
          </li>
          <li>
            <span>微信号：</span
            ><span>{{ userRowData.wechatOpenid || '未绑定' }}</span>
          </li>
          <li>
            <span>IP地址：</span><span>{{ userRowData.registIp || '--' }}</span>
          </li>
          <li>
            <span>创建时间：</span><span>{{ userRowData.createTime }}</span>
          </li>
          <li>
            <span>账户余额：</span
            ><span class="text-price"
              >{{ userRowData.propertyBalance | priceFormat }}</span
            >
          </li>
        </ul>
      </el-col>

      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
      >
        <div class="expend_title">实名信息</div>

        <ul class="expend_main">
          <li>
            <span>认证姓名：</span
            ><span
              v-if="userRowData.realnameStatus === 1"
              class="text-success"
              >{{ userRowData.realnameName || '--' }}</span
            >
            <el-tag size="mini" type="danger" v-else>未实名</el-tag>
          </li>
          <li>
            <span>身份证号：</span
            ><span
              v-if="userRowData.realnameStatus === 1"
              class="text-success"
              >{{ userRowData.realnameCertificateid || '--' }}</span
            >
            <el-tag size="mini" type="danger" v-else>未实名</el-tag>
          </li>
          <li>
            <span>认证时间：</span
            ><span
              v-if="userRowData.realnameStatus === 1"
              class="text-success"
              >{{ userRowData.realnameTime || '--' }}</span
            >
            <el-tag size="mini" type="danger" v-else>未实名</el-tag>
          </li>
          <li>
            <span>备注信息：</span
            ><span>{{ userRowData.note || '--' }}</span>
          </li>
          <li>
            <span>启用状态：</span>
            <span
              class="text-success el-icon-success"
              v-if="userRowData.status == 1"
            >
              正常</span
            >
            <span class="text-error el-icon-remove" v-else> 已冻结</span>
          </li>
        </ul>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'UserDetailExpend',
  props: {
    userRowData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {}
  },
  methods: {}
}
</script>

<style lang="scss">
.user-expend-box {
  background-color: theme('colors.ants-bg-2');
  padding: 20px 50px;
  .expend_title {
    font-weight: 700;
    margin: 10px 0;
    color: theme('colors.primary');
  }

  .expend_main {
    > li {
      line-height: 36px;
      > span:first-child {
        display: inline-block;
        width: 70px;
        margin-right: 20px;
      }
    }
  }
}
</style>
