<template>
  <el-card class="mb-lg">
    <div slot="header" class="flex items-center justify-between">
      <strong>{{ antsT('我的套餐') }}</strong>
      <router-link to="/dns/plan/own">{{ antsT('查看') }}</router-link>
    </div>
    <el-row :gutter="15" class="-mt-df">
      <el-col :span="12" v-for="(item, idx) in list" :key="idx">
        <div
          class="relative rounded-2xl p-lg mt-df bg-ants-bg-4 flex items-center justify-between "
        >
          <span
            class="absolute left-0"
            style="height:15px;width:5px;"
            :style="{ 'background-color': item.color }"
          ></span>
          <span>{{ antsT(item.name) }}</span>
          <strong :style="{ color: item.color }">{{ item.num }}</strong>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      list: [
        {
          name: '总数',
          num: 0,
          color: '#177DFF'
        },
        {
          name: '使用中',
          num: 0,
          color: '#FAC85A'
        },
        {
          name: '未使用',
          num: 0,
          color: '#02B340'
        },
        {
          name: '已过期',
          num: 0,
          color: '#F52443'
        }
      ]
    }
  }
}
</script>
