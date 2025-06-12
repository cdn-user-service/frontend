<template>
  <el-card class="animated fadeIn content-box">
    <div class="font-bold">
      <slot name="title"></slot>
      <el-popover
        v-if="tipsArr.length"
        placement="right-start"
        :title="tipsTitle"
        trigger="hover"
      >
        <ul class="text-sm space-y-df">
          <li v-for="(item, idx) in tipsArr" :key="idx">
            {{ item }}
          </li>
        </ul>
        <span
          slot="reference"
          class="el-icon-info ml-xs text-df text-primary cursor-pointer"
        ></span>
      </el-popover>
    </div>
    <div class="text-ants-text-4 text-sm mt-md">
      <slot name="info"></slot>
    </div>

    <div
      class="rounded-xl mt-df p-lg text-sm"
      v-if="!hideContent"
      :class="bgClass"
    >
      <slot name="content"></slot>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'AntsFormCard',
  props: {
    // 提示内容
    tipsArr: {
      type: Array,
      default: () => []
    },
    // 提示内容标题
    tipsTitle: {
      type: String,
      default: ''
    },
    // 自定义内容背景
    bgClass: {
      type: String,
      default: 'bg-ants-bg-5'
    },
    // 隐藏content
    hideContent: Boolean
  },
  data() {
    return {}
  },
  methods: {}
}
</script>
