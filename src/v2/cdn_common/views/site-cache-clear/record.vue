<template>
  <el-card class="content-box animated fadeIn">
    <ants-radio-group v-model="form.type" size="small" @change="changeType">
      <ants-radio-button
        v-for="(item, index) in typeObj"
        :key="index"
        :label="index"
        :text="item"
      />
    </ants-radio-group>
    <div class="my-lg" v-if="form.type === 0">
      <table-query-form
        :search-arr="[
          {
            name: '检索用户',
            key: 'userName',
            value: queryInfo.userName
          },
          {
            name: '检索站点',
            key: 'serverName',
            value: queryInfo.serverName
          },
          {
            name: '检索路径',
            key: 'key',
            value: queryInfo.key
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons" v-if="!$root.disabledCrud">
          <ants-button
            type="primary"
            icon="el-icon-plus"
            size="small"
            :disabled="$root.loading || btnLoading"
            @click="toSave()"
            text="添加缓存预取"
          />

          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :disabled="$root.loading"
            :loading="btnLoading"
            @click="batchDelete()"
            text="批量删除"
          />
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
        v-loading="loading"
      >
        <ants-table-column type="selection" width="45" align="center">
        </ants-table-column>

        <ants-table-column width="60" prop="id" label="ID" />

        <ants-table-column prop="userName" label="用户" min-width="150">
        </ants-table-column>

        <ants-table-column prop="siteServerName" label="站点" min-width="200">
          <template #default="{ row }">
            <span>{{ row.siteServerName || '--' }}</span>
          </template>
        </ants-table-column>

        <ants-table-column prop="pfPath" label="路径" min-width="200">
        </ants-table-column>

        <ants-table-column prop="frequency" label="预取频率" min-width="150">
        </ants-table-column>

        <ants-table-column label="操作" width="150">
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              :disabled="btnLoading"
              @click="toSave('update', row)"
              text="修改"
            />
            <ants-button
              type="danger"
              size="mini"
              :disabled="btnLoading"
              @click="toDel(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </div>
    <div v-if="form.type === 1">
      <ul class="ants-tips_box space-y-4 mt-5">
        <li v-for="(item, idx) in tipsArr" :key="idx">
          {{ antsT(item) }}
        </li>
      </ul>
      <ants-form
        label-position="top"
        :model="form"
        :rules="rules"
        ref="formRef"
        class="my-lg"
      >
        <ants-form-item prop="content">
          <ants-input
            v-model="form.content"
            placeholder="请输入预取URL，以http(s)://开头，一行一个"
            type="textarea"
            :autosize="{ minRows: 12, maxRows: 20 }"
          />
        </ants-form-item>
      </ants-form>

      <ants-button
        :disabled="$root.disabledCrud"
        text="缓存预取"
        type="primary"
        size="small"
        icon="el-icon-brush"
        :loading="btnLoading"
        @click="doClear"
      />
    </div>

    <div v-if="form.type === 2">
      <ants-form
        label-position="top"
        :model="form"
        :rules="rules"
        ref="formRef"
        class="my-lg"
      >
        <ants-form-item prop="状态">
          <ants-switch
            v-model="form.status"
            active-value="1"
            inactive-value="0"
            active-text="ON"
            inactive-text="OFF"
            v-loading="$attrs.btnLoading"
            @change="changeStatus"
          />
        </ants-form-item>
        <ants-form-item prop="suffix">
          <!-- 后缀 -->
          <FileExtension ref="FileExtensionRef" v-model="form.suffix">
            <ants-input
              type="textarea"
              v-model.trim="form.suffix"
              :autosize="{ minRows: 5, maxRows: 10 }"
              placeholder="jpg|png|gif|css"
              @input="inputContent"
            />
          </FileExtension>
        </ants-form-item>
      </ants-form>

      <ants-button
        :disabled="$root.disabledCrud"
        text="保存"
        type="primary"
        size="small"
        icon="el-icon-edit"
        :loading="btnLoading"
        @click="doAuto"
      />
    </div>

    <FormDialog ref="FormDialogRef" @refresh="refresh" />
  </el-card>
</template>

<script>
import FileExtension from '@/v2/cdn_common/components/FileExtension'
import FormDialog from './FormDialog.vue'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  doPreheat,
  getCacheList,
  doCacheDelete
} = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

const {
  doSaveGlobalAttr,
  getGlobalAttrDetail
} = require(`@/v2/${PROCESS_NAME}/api/cdn/global`)

let getNodeListAPI = null
if (PROCESS_NAME === 'cdn_admin') {
  const { getNodeList } = require(`@/v2/${PROCESS_NAME}/api/cdn/node`)
  getNodeListAPI = getNodeList
}

const typeObj = ['定时预取', '指定URL预取', '自动预取']

const tipsArr = [
  '提前将需要缓存的资源预取到节点上，提升缓存命中率和请求速度',
  '1、请输入具体域名 URL，以 http(s):// 开始，多个 URL 请用回车分隔；',
  '2、缓存预取仅支持已审核通过域名的URL，暂不支持泛域名URL；',
  '3、缓存预取需遵循缓存配置，不匹配缓存策略的 URL 以及非本账号下的 URL 将被忽略；',
  '4、单账号每分钟仅支持添加2次URL缓存预取任务，单次最多支持200条，且重复的URL将被忽略。'
]

// const { getCacheList } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

export default {
  components: {
    FileExtension,
    FormDialog
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'cdn_admin',
      btnLoading: false,
      typeObj,
      tipsArr,
      form: {
        type: 0,
        urls: '',
        ips: [],
        number: 3600,
        content: '',
        status: '0',
        suffix: ''
      },

      // 节点列表
      loading: false,
      nodeList: [],
      TypeList: [
        { label: 'css', value: 'css' },
        { label: 'js', value: 'js' },
        { label: 'html', value: 'html' },
        { label: 'xml', value: 'xml' },
        { label: 'json', value: 'json' },
        { label: 'video', value: 'video' },
        { label: 'audio', value: 'audio' },
        { label: 'font', value: 'font' },
        { label: 'image', value: 'image' },
        { label: '其他', value: 'other' }
      ],
      tableData: [],
      total: 0,
      queryInfo: {
        serverName: '',
        key: '',
        userName: '',
        pagenum: 1,
        pagesize: 20
      },
      selectArr: []
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 刷新页面
    refresh() {
      this.getTableData()
    },
    // 添加/修改
    toSave(type, row = {}) {
      this.$refs.FormDialogRef.show(row)
    },

    // 删除
    async toDel(row = {}) {
      const result = await this.$doDelete({
        tag: '缓存预取'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const { data: res } = await doCacheDelete({ ids: row.id })
        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success(this.antsT('删除成功'))
      } finally {
        this.btnLoading = false
      }
    },

    async batchDelete() {
      const selectLength = this.selectArr.length
      const result = await this.$batchDelete(selectLength, {
        tag: '缓存预取站点'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const { data: res } = await doCacheDelete({
          ids: this.selectArr.join(',')
        })
        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success(this.antsT('删除成功'))
      } finally {
        this.btnLoading = false
      }
    },

    handleSelectionChange(val) {
      this.selectArr = val.map((item) => item.id)
      console.log('this.selectArr', this.selectArr)
    },

    // 获取表格数据
    async getTableData() {
      this.loading = true
      try {
        const { data: res } = await getCacheList({
          ...this.queryInfo
        })
        if (res.code !== 1) return
        console.log('res=>表格数据', res)
        this.tableData = res.data && res.data.list
        this.total = res.data && res.data.totalCount
      } finally {
        this.loading = false
      }
    },

    // 清理缓存提交
    doClear() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.btnLoading = true
        const content = this.form.content.trim()
        const contentArr = content.split(/[\r\n]+/)
        // 需要去掉每一行空格
        const arr = contentArr.map((item) => item.trim())
        try {
          // 推送 urls 进行刷新缓存
          const { data: res } = await doPreheat({
            // 传递一\n分割的字符串
            urls: arr.join('\n'),
            ips: ''
          })
          if (res.code !== 1) return
          this.$msg.success(this.antsT('指定URL预取成功'))
          this.form.content = ''
        } finally {
          this.btnLoading = false
        }
      })
    },
    // 自动预取
    doAuto() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return

        this.btnLoading = true
        try {
          const obj = { ...this.form }
          const { data: res } = await doSaveGlobalAttr({
            auto_pull_cache: JSON.stringify(obj)
          })

          if (res.code !== 1) {
            this.$msg.error(this.antsT('自动预取失败'))
            return
          }

          this.$msg.success(this.antsT('自动预取成功'))
          this.getAutoConfig()
        } catch (error) {
          console.error('Error during auto pull cache:', error)
          this.$msg.error(this.antsT('自动预取失败，请稍后再试'))
        } finally {
          this.btnLoading = false
        }
      })
    },
    // 获取自动预取配置
    async getAutoConfig() {
      const { data: res } = await getGlobalAttrDetail({
        key: 'auto_pull_cache'
      })
      if (res.code !== 1) return
      const obj = JSON.parse(res.data.pvalue) || {}
      console.log('obj=>自动预取配置', obj)
      this.form.status = obj.status
      this.form.suffix = obj.suffix
    },
    changeType(val) {
      if (val === 2) {
        this.getAutoConfig()
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
