<template>
  <el-row :gutter="20">
    <el-col
      :xs="{ span: 24 }"
      :sm="{ span: 12 }"
      :md="{ span: 6 }"
      :lg="{ span: 6 }"
      :xl="{ span: 6 }"
      v-for="(item, idx) in totalList"
      :key="idx"
    >
      <el-card class="mb-lg">
        <div class="flex items-center" @click="$router.push(item.url)">
          <span
            :class="item.icon"
            class="inline-block text-center text-6xl"
            style="width: 80px;"
            :style="{ color: item.color }"
          >
          </span>
          <div class="flex-1">
            <div class="my-xs text-ants-text-3">{{ antsT(item.name) }}</div>
            <div class="my-df">
              <strong class="text-3xl mr-xs">{{ item.num }}</strong>
              <span v-if="item.errorNum >= 0"
                >（{{ antsT('异常') }}
                <strong class="text-error">{{ item.errorNum }}</strong>
                {{ antsT('个') }}）</span
              >
            </div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      totalList: [
        {
          name: '接入域名数',
          num: 0,
          icon: 'el-icon-s-shop',
          color: '#00C878',
          errorNum: 0,
          url: '/cdn/site/domain/list'
        },
        {
          name: '转发端口数',
          num: 0,
          icon: 'el-icon-s-shop',
          color: '#FAC858',
          url: '/cdn/site/domain/list'
        },
        {
          name: '证书总数',
          num: 6,
          icon: 'el-icon-s-shop',
          color: '#5F3AFC',
          errorNum: 2,
          url: '/cdn/dashboard/index'
        },
        {
          name: '账户余额',
          num: 999.00,
          icon: 'el-icon-s-shop',
          color: '#FB9679',
          url: '/cdn/dashboard/index'
        }
      ]
    }
  },
  methods: {}
}
</script>
