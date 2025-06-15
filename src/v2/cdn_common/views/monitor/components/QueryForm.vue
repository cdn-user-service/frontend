<template>
  <div>
    <div class="flex items-center justify-between mb-lg">
      <QueryTime
        ref="QueryTimeRef"
        v-model="time"
        :step.sync="step"
        v-bind="$attrs"
        v-on="$listeners"
      />
      <ants-button
        size="mini"
        type="success"
        icon="el-icon-refresh"
        @click="refreshChart"
        :loading="$root.loading"
        text="刷新"
      />
    </div>
    <div>
      <slot name="front"></slot>
      <!-- <QueryStep
        v-if="isShowStep"
        class="mr-lg"
        v-model="step"
        :time="time"
        v-bind="$attrs"
        v-on="$listeners"
      /> -->
      <slot></slot>
    </div>
  </div>
</template>

<script>
import QueryTime from './QueryTime'
import QueryStep from './QueryStep'
export default {
  components: {
    QueryTime
    // QueryStep
  },
  props: {
    // 监控类型，节点监控 = node， 站点监控 = site， 四层转发监控 = stream
    mode: {
      type: String,
      default: 'node'
    },
    // 粒度是否显示
    isShowStep: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      // 查询时间范围，默认 近 24 小时
      time: 24,
      // 查询粒度，默认 1 分钟
      step: 60
    }
  },
  computed: {},
  watch: {
    // 监听粒度变化
    step(newStep, oldStep) {
      // 你之前箭头函数是空的，可以根据需要加逻辑
    },
    // 监听统计时间范围变化
    time(newTime, oldTime) {
      // 同上
    }
  },
  mounted() {},
  methods: {
    /**
     * @description: 返回查询数据
     */
    getQueryData() {
      const timeValue = this.$refs.QueryTimeRef.timeValue
      return {
        // 节点、域名、四层转发
        mode: this.mode,
        // 查询时间范围
        start: timeValue[0] / 1000,
        end: timeValue[1] / 1000,
        // 粒度
        step: this.step
      }
    },
    /**
     * @description: 重绘图表
     */
    getChart() {
      this.$emit('getChart')
    },
    /**
     * @description: 刷新表格
     */
    refreshChart() {
      this.$root.loading = true
      this.$emit('getChart')
      setTimeout(() => {
        this.$root.loading = false
      }, 500)
    }
  }
}
</script>