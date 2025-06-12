<template>
  <el-card
    class="mt-lg update-log-box"
    style="min-height:350px;"
  >
    <div
      slot="header"
      class="flex items-center justify-between"
    >
      <TitleBorder title="更新日志" />
      <a
        class="text-primary text-sm"
        :href="`${$root.antsWebSite}/update-log`"
        target="blank"
      >更多</a>
    </div>
    <el-skeleton
      :rows="4"
      :loading="loading"
      animated
    >
      <el-empty
        description="暂无数据"
        v-if="!updateLogList.length"
      />

      <el-timeline v-else>
        <el-timeline-item
          v-for="item in updateLogList"
          :key="item.id"
          :timestamp="(item.addtime * 1000) | dateFormat"
          placement="top"
          type="success"
        >
          <div class="update_log_main bg-ants-bg-2 rounded-lg p-sm text-sm">
            <div class="time_line_title">
              <strong>{{ item.title }}</strong>
            </div>
            <div
              v-html="item.info"
              class=""
            ></div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-skeleton>
  </el-card>
</template>

<script>
import { marked } from 'marked'
// import hljs from 'highlight.js'
import '@/plugins/mavon-editor/css/index1.css'
import '@/plugins/mavon-editor/css/github-dark-dimmed.css'

// API
import { getUpdateLog } from '@/v2/dns_admin/api/public'

export default {
  data() {
    return {
      loading: false,
      queryInfo: {
        pagenum: 1, // 当前的页数
        pagesize: 10 // 当前每页显示多少条数据
      },
      updateLogList: []
    }
  },
  created() {},
  mounted() {
    // 设置代码高亮与mark解析
    const rendererMD = new marked.Renderer()
    marked.setOptions({
      renderer: rendererMD,
      // highlight: function(code) {
      //   return hljs.highlightAuto(code).value
      // },
      pedantic: false,
      gfm: true,
      tables: true,
      breaks: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
      xhtml: false
    })
    this.getUpdateLogData()
  },
  methods: {
    /**
     * @description: 获取更新日志列表
     */
    async getUpdateLogData() {
      this.loading = true
      try {
        const { data: res } = await getUpdateLog({
          pagenum: 1,
          pagesize: 10
        })
        this.loading = false
        if (res.code !== 1) return
        if (!res.data) return

        const logObj = JSON.parse(res.data) || {}
        const logArr = (logObj.list && logObj.list.data) || []
        const newLogArr = logArr.map((item, idx) => {
          return {
            id: item.id,
            title: item.title,
            addtime: item.addtime,
            info: marked
              .parse(item.info || '')
              .replace(/<pre>/g, "<pre class='hljs'>")
          }
        })
        this.updateLogList = newLogArr
      } catch (error) {
        this.loading = false
        throw error
      }
    }
  }
}
</script>

<style lang="scss">
.update-log-box {
  .el-card__body {
    max-height: 348px;
    overflow-y: auto;
  }
  .update_log_main {
    line-height: 22px;
    padding-bottom: 1px;
    code {
      padding: 2px 4px;
      color: #fefefe;
      font-size: 12px;
      border-radius: 4px;
    }
    .ants-code-new {
      background-color: theme('colors.success');
    }
    .ants-code-bug {
      background-color: theme('colors.error');
    }
    .ants-code-db {
      background-color: #ffcd42;
    }
  }

  .el-timeline {
    .el-timeline-item {
      &:last-child {
        padding: 0;
      }
    }
  }
}
</style>
