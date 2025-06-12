<template>
  <div class="animated fadeIn">
    <el-card class="content-box">
      <TitleBorder title="您已完成实名认证" />

      <div class="flex p-lg">
        <span
          class="aicon icon-zhifuchenggong hidden-xs-only mt-df inline-block"
          style="font-size:60px;width:120px"
        ></span>

        <el-row :gutter="20" class="flex-1">
          <el-col
            :xs="{ span: 24 }"
            :sm="{ span: 12 }"
            :md="{ span: 12 }"
            :lg="{ span: 12 }"
            :xl="{ span: 12 }"
            v-for="(value, key) in detailObj"
            :key="key"
            class="my-df"
          >
            <div>
              <span class="mr-lg text-ants-text-4">{{ antsT(value) }}</span>
              <span v-if="key == 'realnameMode'">{{
                antsT(verifiedDetail[key] == 2
                  ? '微信人身核验认证'
                  : '支付宝人身核验认证')
              }}</span>

              <span v-else>{{ verifiedDetail[key] || '--' }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-card class="content-box">
      <div class="font-bold">
        {{ antsT('您现在可以') }}
      </div>

      <ul class="space-y-10 mt-lg text-ants-text-4">
        <li>
          {{ antsT('正常使用') }} {{ $root.webName }}
          {{ antsT('功能及购买服务；') }}
        </li>
        <li>{{ antsT('使用实名信息保障您的账号安全；') }}</li>
        <li>{{ antsT('您可以提供相关证明材料修改认证主体。') }}</li>
      </ul>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 用户实名认证数据
      verifiedDetail: {
        realnameName: 'name',
        realnameCertificateid: '565656568989898989',
        realnameMode: 2,
        realnameTime: '2020-10-10 10:00:00'
      },

      detailObj: {
        realnameName: '认证姓名',
        Area: '认证地区',
        realnameCertificateid: '身份证号',
        realnameMode: '认证方式',
        realnameTime: '认证时间'
      }
    }
  },
  created() {},
  methods: {}
}
</script>
