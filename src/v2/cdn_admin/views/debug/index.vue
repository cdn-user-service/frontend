<template>
  <div class="py-lg px-xl bg-ants-bg-5 min-h-full">
    <div class="flex items-center justify-between mb-df">
      <el-breadcrumb style="margin:0;">
        <el-breadcrumb-item
          :to="{
            path: '/debug',
            query: {
              key: ''
            }
          }"
          >首页</el-breadcrumb-item
        >
        <el-breadcrumb-item
          v-for="(item, idx) in pageArr"
          :key="idx"
          :to="{
            path: '/debug',
            query: {
              key: item
            }
          }"
          >{{ item }}</el-breadcrumb-item
        >
      </el-breadcrumb>
      <div>
        <el-input
          size="small"
          v-model="token"
          placeholder="Enter the Token"
          style="width:250px;margin-right:10px;"
        />
        <el-button
          type="success"
          icon="el-icon-refresh"
          size="mini"
          :loading="loading"
          @click="doRefresh()"
        >
          刷新</el-button
        >
      </div>
    </div>
    <el-table
      :data="tableData"
      v-loading="loading"
      size="mini"
      style="margin:0;"
    >
      <div slot="empty">
        <el-empty description="暂无数据"> </el-empty>
      </div>
      <el-table-column label="#" type="index" width="80" />
      <el-table-column label="Key" prop="key" align="left" min-width="300">
        <template #default="{ row }">
          <ants-copy
            :text="row.key"
            class="cursor-color"
            @click="checkDetail(row.key)"
          />
        </template>
      </el-table-column>

      <el-table-column label="操作" width="100" align="center">
        <template #default="{ row }">
          <span
            class="text-primary cursor-pointer"
            @click="checkDetail(row.key)"
          >
            <i class="el-icon-s-promotion"></i>
            详情
          </span>
        </template>
      </el-table-column>
    </el-table>

    <ants-dialog
      v-model="dialogVisible"
      ref="dialogRef"
      title="详情"
      width="1000px"
      top="5vh"
    >
      <div
        v-loading="loading"
        v-html="content"
        class="p-lg rounded-2xl"
        style="min-height: 300px;line-height: 2;white-space: pre-wrap;background-color: #292B30;color: #B7D986;"
      ></div>
      <template slot="footer">
        <el-button
          size="small"
          type="info"
          @click="dialogVisible = false"
          icon="el-icon-close"
          >关 闭</el-button
        >
      </template>
    </ants-dialog>
  </div>
</template>

<script>
import { getRedisData } from '@/v2/cdn_admin/api/public'
import { getToken, setToken } from '@/utils/auth'

export default {
  data() {
    return {
      tableData: [],
      loading: false,
      curKey: '',

      // 对话框
      dialogVisible: false,
      content: '',

      token: '',
      pageArr: []
    }
  },
  watch: {
    // 监听路由参数 key变化，重新查询数据
    '$route.query.key': {
      handler(newVal) {
        console.log(newVal)
        this.getTableData(newVal)
      },
      immediate: true
    }
  },
  created() {
    // 获取token
    this.token = getToken() || ''
  },
  methods: {
    // 查看详情
    checkDetail(key) {
      // 最后一级，打开对话框
      this.getTableData(key)
    },

    // 显示对话框
    showDialog(data = '') {
      this.dialogVisible = true
      this.content = data
    },

    // 点击刷新，传递token
    doRefresh() {
      if (!this.token) return this.$msg.error('请输入Token')
      setToken(this.token)
      this.getTableData(this.curKey)
    },

    // 获取redis数据，一共有三级
    getTableData(key = '') {
      this.loading = true
      if (!key) {
        this.pageArr = []
      }

      getRedisData({
        key
      })
        .then(res => {
          this.loading = false
          const obj = res.data || {}
          // 如果为列表
          if (obj.list instanceof Array) {
            this.curKey = key
            this.tableData = obj.list.map(item => {
              return {
                key: item
              }
            })
            const pageIndex = this.pageArr.indexOf(key)
            if (key && pageIndex === -1) {
              this.$router.push({
                path: '/debug',
                query: {
                  key
                }
              })
              this.pageArr.push(key)
            }
            // 点击面包屑，删除后面的
            if (pageIndex != -1 && pageIndex < this.pageArr.length - 1) {
              this.pageArr.splice(pageIndex + 1)
            }
            console.log('this.pageArr', this.pageArr)
            return
          }

          // 如果为字符串
          if (typeof obj.data === 'string') {
            this.showDialog(obj.data)
          }
        })
        .catch(err => {
          this.loading = false
          throw err
        })
    }
  }
}
</script>
