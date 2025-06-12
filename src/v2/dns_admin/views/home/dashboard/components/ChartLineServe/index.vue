<template>
  <div class="bg-ants-bg-1 p-lg rounded-2xl shadow mb-lg" style="height:510px;">
    <TitleBorder title="Sever" />
    <el-row class="text-center">
      <el-col
        :span="12"
        class="mt-xl"
        v-for="(item, key) in severObj"
        :key="key"
      >
        <div class="text-sm text-ants-text-4 pb-sm">{{ item.name }}</div>
        <el-progress
          type="circle"
          :percentage="item.percentage"
          :width="90"
          :stroke-width="9"
          :color="item.percentage > 80 ? '#F52443' : '#177DFF'"
          text-color="#177DFF"
        />
        <div class="text-sm text-ants-text-4 py-sm" v-if="key !== 'cpu'">
          {{ item.used }} / {{ item.total }}
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getChartData } from '@/v2/dns_admin/api/public'

const defaultObj = {
  disk: '磁盘使用率',
  mem: '内存使用率',
  cpu: 'CPU使用率'
}

const rowObj = {
  key: '',
  name: '',
  // 百分比
  percentage: 0,
  // 总量
  total: 1,
  // 已使用
  used: 0
}
export default {
  props: {},
  data() {
    return {
      loading: false,
      severObj: {
        disk: {},
        mem: {},
        cpu: {}
      },
      timer: null
    }
  },
  computed: {},

  created() {
    Object.keys(defaultObj).forEach(key => {
      this.severObj[key] = { ...rowObj, key, name: defaultObj[key] }
    })

    this.setTimer()
  },
  mounted() {},
  beforeDestroy() {
    // 清除定时器
    this.clearTimer()
  },
  methods: {
    // 获取sever数据
    async getSeverData() {
      this.loading = true
      try {
        const { data: res } = await getChartData({
          keys: 'cpu,mem,disk'
        })
        if (res.code !== 1) return
        const obj = res.data || {}

        // 计算CPU
        const cpu = obj.cpu || {}
        this.severObj.cpu.percentage = +(
          (cpu.percentCpuLoad || '').replace('%', '') || 0
        )

        // 计算磁盘
        const disk = obj.disk || {}
        const diskObj = disk['/'] || {}
        // 磁盘总数
        const diskTotal = parseFloat(diskObj.total || 1)
        // 磁盘剩余
        const diskFree = parseFloat(diskObj.free || 0)
        this.severObj.disk.total = diskObj.total
        this.severObj.disk.used = (diskTotal - diskFree).toFixed(2)
        this.severObj.disk.percentage =
          Math.ceil((this.severObj.disk.used / diskTotal) * 100 * 100) / 100

        // 计算内存
        const mem = obj.mem || {}
        const memObj = mem.memoryUsageMap || {}
        // 内存总数
        const memTotal = parseFloat(memObj.totalMemorySize || 1)
        // 内存已使用
        const memUsed = parseFloat(memObj.usedMemory || 0)
        this.severObj.mem.total = memObj.totalMemorySize
        this.severObj.mem.used = memObj.usedMemory
        this.severObj.mem.percentage =
          Math.ceil((memUsed / memTotal) * 100 * 100) / 100
      } catch (err) {
        console.log(err)
        this.clearTimer()
      } finally {
        this.loading = false
      }
    },

    // 定时刷新sever数据
    setTimer() {
      this.clearTimer()
      this.getSeverData()
      this.timer = setTimeout(this.setTimer, 1000 * 3)
    },

    clearTimer() {
      clearTimeout(this.timer)
    }
  }
}
</script>
