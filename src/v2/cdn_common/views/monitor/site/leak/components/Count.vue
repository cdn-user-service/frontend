<template>
  <el-row :gutter="20">
    <el-col
      :xs="{ span: 24 }"
      :sm="{ span: 8 }"
      :md="{ span: 8 }"
      :lg="{ span: 8 }"
      :xl="{ span: 8 }"
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
        sum: {
          name: '攻击总数',
          value: 9999,
          unit: '次',
          color: '#F52443'
        },
        type: {
          name: '攻击类型',
          value: 8686,
          unit: '种',
          color: '#02B340'
        },
        ip: {
          name: '攻击IP数',
          value: 520,
          unit: '个',
          color: '#FF9D00'
        }
      }
    }
  },
  created() {},
  methods: {}
}
</script>
