<template>
  <el-card>
    <TitleBorder title="产品流量使用TOP6" />

    <ul>
      <li class="my-lg" v-for="(item, idx) in topList" :key="idx">
        <div class="text-sm text-ants-text-4 mb-xs flex items-center justify-between">
          <span>{{item.name}}</span>
          <span>{{item.used}}{{item.unit}}/{{item.total}}{{item.unit}}</span>
        </div>
        <el-progress
          :text-inside="true"
          :stroke-width="15"
          :color="item.color"
          :percentage="item.used/item.total*100"
        />
      </li>
    </ul>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      topList: [
        {
          name: '普通CDN套餐',
          color: '#00C878',
          used: 88,
          total: 100,
          unit: 'G'
        },
        {
          name: '个人套餐',
          color: '#5470C6',
          used: 76,
          total: 100,
          unit: 'G'
        },
        {
          name: '企业套餐',
          color: '#FAC858',
          used: 6.4,
          total: 10,
          unit: 'T'
        },
        {
          name: '尊享版套餐',
          color: '#FB9679',
          used: 260,
          total: 500,
          unit: 'G'
        },
        {
          name: '至尊版套餐',
          color: '#177DFF',
          used: 0.42,
          total: 1,
          unit: 'G'
        },
        {
          name: '定制版套餐',
          color: '#F52443',
          used: 22,
          total: 100,
          unit: 'G'
        }
      ]
    }
  }
}
</script>
