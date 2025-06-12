<template>
  <el-card class="mb-lg">
    <TitleBorder title="使用统计" />
    <ul class="space-y-5 mt-df">
      <li
        class="count-item flex justify-between items-center text-sm rounded-2xl p-lg bg-ants-bg-4 cursor-pointer"
        v-for="(item, idx) in totalList"
        :key="idx"
        @click="$router.push(item.url)"
      >
        <div class="flex items-center text-ants-text-3">
          <span
            class="mr-xs"
            :class="item.icon"
            :style="{ color: item.color }"
            style="font-size:18px;"
          ></span>
          <span class="font-semibold">
            {{ antsT(item.name) }}
          </span>
        </div>
        <div>
          <strong>{{ count[item.flag] || 0 }}</strong> 个
        </div>
      </li>
    </ul>
  </el-card>
</template>

<script>
export default {
  props: {
    count: Object
  },
  data() {
    return {
      totalList: [
        {
          name: '接入域名数',
          flag: 'site',
          icon: 'el-icon-monitor',
          color: '#177DFF',
          errorNum: 10,
          url: '/cdn/site/domain'
        },
        {
          name: '转发端口数',
          flag: 'stream',
          icon: 'aicon icon-zhuanfa1',
          color: '#FF7A22',
          url: '/cdn/stream/list'
        },
        {
          name: '证书总数',
          flag: 'cert',
          icon: 'el-icon-document-checked',
          color: '#02B340',
          errorNum: 2,
          url: '/cdn/site/certificate'
        }
      ]
    }
  },
  created() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.count-item {
  transition: all 0.3s;
  &:hover {
    box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.1);
  }
}
</style>
