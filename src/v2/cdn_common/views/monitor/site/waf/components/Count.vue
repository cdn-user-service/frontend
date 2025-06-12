<template>
  <el-row :gutter="20">
    <el-col
      :xs="{ span: 12 }"
      :sm="{ span: 8 }"
      :md="{ span: 4 }"
      :lg="{ span: 4 }"
      :xl="{ span: 4 }"
      v-for="(item, key) in countObj"
      :key="key"
    >
      <el-card class="mb-lg">
        <TitleBorder :title="item.name" :color="item.color" />
        <div class="mt-lg">
          <strong class="text-4xl mr-sm" :style="{ color: item.color }">{{
            item.value
          }}</strong>
          <span>{{ item.unit }}</span>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getPrometheus } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)

export default {
  data() {
    return {
      countObj: {
        total: {
          name: '命中规则总数',
          value: 9999,
          color: '#02B340'
        },
        forbid: {
          name: '命中拦截次数',
          value: 8686,
          color: '#177DFF'
        },
        verify: {
          name: '命中可疑次数',
          value: 96,
          color: '#177DFF'
        },
        ignore: {
          name: '命中忽略次数',
          value: 2,
          color: '#177DFF'
        },
        pass: {
          name: '命中放行次数',
          value: 100,
          color: '#177DFF'
        },
        other: {
          name: '其他',
          value: 0,
          color: '#FF9D00'
        }
      }
    }
  },
  created() {},
  methods: {}
}
</script>
