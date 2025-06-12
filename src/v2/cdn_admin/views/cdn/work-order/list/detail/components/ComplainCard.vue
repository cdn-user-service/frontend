<template>
  <el-card class="mb-lg">
    <div class="font-bold" slot="header">用户投诉</div>
    <ul>
      <li class="flex">
        <span class="mr-lg text-ants-text-4">投诉内容</span>
        <div class="flex-1">
            <el-row :gutter="20">
                <el-col :span="12" v-for="(item, idx) in suggestionContent.reason"
                :key="idx">
                    {{item}}
                </el-col>
            </el-row>
        </div>
      </li>
      <li class="flex mt-lg">
          <span class="mr-lg text-ants-text-4">补充描述</span>
          <div class="text-sm">
              {{suggestionContent.extra_reason}}
          </div>
      </li >

    </ul>
  </el-card>
</template>

<script>
export default {
  props: {
    workOrderData: {
      type: Object,
      default: () => ({
        score: null,
        solved: 1,
        feedback: ''
      })
    }
  },
  computed: {
    suggestionContent() {
        let suggestionContent = {
            reason: []
        }
        suggestionContent = this.workOrderData.suggestion_content
        if (suggestionContent) {
            suggestionContent = JSON.parse(suggestionContent)
        }
      return suggestionContent
    }
  },
  data() {
    return {}
  }
}
</script>
