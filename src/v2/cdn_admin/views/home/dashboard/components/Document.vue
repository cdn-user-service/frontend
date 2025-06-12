<template>
  <el-card>
    <div slot="header" class="flex items-center justify-between">
      <strong>CDN 技术文档</strong>
      <span class="el-icon-more"></span>
    </div>

    <div class="text-ants-text-4 text-sm text-center" v-if="!docArr.length">
      {{ antsT('暂无数据') }}
    </div>
    <el-row :gutter="20" v-else>
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 8 }"
        :lg="{ span: 8 }"
        :xl="{ span: 8 }"
        v-for="(item, idx) in docArr"
        :key="idx"
      >
        <div class="my-sm text-sm">
          <a :href="item.url" target="blank">{{ item.name }}</a>
        </div>
      </el-col>
    </el-row>
    <!-- <ul style="margin-top: -10px;" v-else >
      <li v-for="(item, idx) in docArr" :key="idx" class="margin-tb-xs text-sm">
        <a :href="item.url" target="blank">{{ item.name }}</a>
      </li>
    </ul> -->
  </el-card>
</template>

<script>
export default {
  props: {
    // 文档列表JSON字符串
    docStr: {
      type: String,
      default: ''
    }
  },
  data() {
    return {}
  },
  computed: {
    docArr() {
      let obj = {}
      let arr = []
      if (this.docStr) {
        obj = JSON.parse(this.docStr)
        arr = obj.data || []
      }
      return arr
    }
  },
  created() {},
  methods: {}
}
</script>
