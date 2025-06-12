<template>
  <div class="user-detail-expend">
    <el-row :gutter="30">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
      >
        <div class="expend-title">{{ antsT('基本信息') }}</div>
        <ul class="expend-main">
          <li>
            <span>{{ antsT('手机号') }}：</span
            ><strong>{{ userRowData.mobile || antsT('未绑定') }}</strong>
          </li>
          <li>
            <span>{{ antsT('邮箱') }}：</span
            ><strong>{{ userRowData.mail || antsT('未绑定') }}</strong>
          </li>
          <li>
            <span>{{ antsT('微信号') }}：</span
            ><strong>{{ userRowData.wechatOpenid || antsT('未绑定') }}</strong>
          </li>
          <li>
            <span>{{ antsT('注册 IP') }}：</span
            ><strong>{{ userRowData.registIp || '--' }}</strong>
          </li>
          <li>
            <span>{{ antsT('创建时间') }}：</span
            ><strong>{{ userRowData.createTime }}</strong>
          </li>
          <li>
            <span>{{ antsT('账户余额') }}：</span
            ><strong class="text-price"
              >{{ userRowData.propertyBalance | priceFormat }}
            </strong>
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
        <div class="expend-title">{{ antsT('实名信息') }}</div>

        <ul class="expend-main">
          <li>
            <span>{{ antsT('认证姓名') }}：</span
            ><strong
              v-if="userRowData.realnameStatus === 1"
              class="text-success"
              >{{ userRowData.realnameName || '--' }}</strong
            >
            <el-tag size="mini" type="danger" v-else>{{
              antsT('未实名')
            }}</el-tag>
          </li>
          <li>
            <span>{{ antsT('身份证号') }}：</span
            ><strong
              v-if="userRowData.realnameStatus === 1"
              class="text-success"
              >{{ userRowData.realnameCertificateid || '--' }}</strong
            >
            <el-tag size="mini" type="danger" v-else>{{
              antsT('未实名')
            }}</el-tag>
          </li>
          <li>
            <span>{{ antsT('认证时间') }}：</span
            ><strong
              v-if="userRowData.realnameStatus === 1"
              class="text-success"
              >{{ userRowData.realnameTime }}</strong
            >
            <el-tag size="mini" type="danger" v-else>{{
              antsT('未实名')
            }}</el-tag>
          </li>
          <li>
            <span>{{ antsT('备注信息') }}：</span
            ><strong>{{ userRowData.note || '--' }}</strong>
          </li>
          <li>
            <span>{{ antsT('启用状态') }}：</span>
            <strong
              class="text-success el-icon-success"
              v-if="userRowData.status == 1"
            >
              {{ antsT('正常') }}</strong
            >
            <strong class="text-error el-icon-remove" v-else>
              {{ antsT('已冻结') }}</strong
            >
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
    userRowData: Object
  },
  data() {
    return {}
  },
  methods: {}
}
</script>

<style lang="scss">
.user-detail-expend {
  background-color: theme('colors.ants-bg-2');
  padding: 20px 50px;
  .expend-title {
    font-weight: 700;
    margin: 10px 0;
    color: theme('colors.primary');
  }

  .expend-main {
    > li {
      line-height: 36px;
      > span:first-child {
        display: inline-block;
        width: 100px;
        white-space: nowrap;
      }
    }
  }
}

.lang-en {
  .user-detail-expend {
    .expend-main {
      > li {
        > span:first-child {
          width: 140px;
        }
      }
    }
  }
}
</style>
