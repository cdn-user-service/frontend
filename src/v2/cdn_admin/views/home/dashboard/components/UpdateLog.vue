
<template>
  <el-card
    class="mt-lg update-log-box"
    style="min-height:350px;"
  >
    <div
      slot="header"
      class="flex items-center justify-between"
    >
      <strong>{{ antsT('更新日志') }}</strong>
      <a
        :href="`${$root.antsWebSite}/update-log`"
        target="blank"
        class="el-icon-more text-ants-text-1"
      ></a>
    </div>
    <el-skeleton
      :rows="4"
      :loading="loading"
      animated
    >
      <template>
        <el-timeline>
          <el-timeline-item
            v-for="item in updateLogList"
            :key="item.id"
            :timestamp="item.addtime | dateFormat"
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
      </template>
    </el-skeleton>
  </el-card>
</template>

<script>
import { marked } from 'marked'
// import hljs from 'highlight.js'
import '@/plugins/mavon-editor/css/index1.css'
import '@/plugins/mavon-editor/css/github-dark-dimmed.css'

// API
import { getChartData } from '@/v2/cdn_admin/api/public'

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

    async getUpdateLogData(arr = []) {
      this.loading = true
      try {
        const { data: res } = await getChartData({
          keys: 'update_log'
        })
        this.loading = false
        if (res.code !== 1) return
        
        const obj = res.data || {}
        const updateLog = ((obj.update_log || {}).list || {}).data || []

        const newLogArr = updateLog.map((item, idx) => {
          return {
            id: item.id,
            title: item.title,
            addtime: item.addtime * 1000,
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
    max-height: 285px;
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
