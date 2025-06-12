<template>
  <div class="dns_doset_box">
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索线路名称',
            key: 'name',
            value: queryInfo.name
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            :disabled="$root.loading"
            @click="showAddDialog('添加')"
            text="添加自定义线路"
          />
          <ants-button
            type="info"
            icon="el-icon-delete"
            size="small"
            @click="batchDelete"
            :loading="btnLoading"
            :disabled="$root.loading"
            text="批量删除"
          />
        </template>
      </table-query-form>

      <ants-table
        :data="goodsList"
        :total="total"
        :queryInfo="queryInfo"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
      >
        <ants-table-column
          type="selection"
          width="50"
          align="center"
        ></ants-table-column>
        <ants-table-column
          label="线路名称"
          prop="name"
          width="200"
        ></ants-table-column>
        <ants-table-column label="线路编号" prop="code" width="200">
        </ants-table-column>
        <ants-table-column label="包含IP段" min-width="200">
          <template #default="{ row }">
            <!-- <span v-for="(item, i) in row.ip.slice(0, 3)" :key="i">
                {{ item.start_end }}
              </span> -->
            <span>{{ row.ipSegmentS }}</span>
            <!-- <el-link
                v-if="addExpendRow[0] !== row.id"
                type="primary"
                :underline="false"
                @click="openMore(row)"
                >更多<i class="el-icon-caret-bottom el-icon--right"></i
              ></el-link>
              <el-link
                v-else-if="addExpendRow[0] === row.id"
                type="primary"
                :underline="false"
                @click="closeMore(row)"
                >收起<i class="el-icon-caret-top el-icon--right"></i
              ></el-link> -->
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="160">
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              :disabled="btnLoading"
              @click="showAddDialog('修改', row)"
              text="修改"
            />
            <ants-button
              type="danger"
              size="mini"
              :disabled="btnLoading"
              @click="deleteGroup(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加自定义线路对话框 -->
    <ants-dialog
      :title="dialogText + '自定义线路'"
      v-model="dialogVisible"
      width="600px"
      @closed="resetForm"
      ref="dialogRef"
      @submit="submitForm"
    >
      <div class="ants-tips_box" style="margin: -10px 0 20px;">
        <span class="el-icon-info"></span>
        注意：填写IP段为用户递归DNS的IP，并非客户端上网的IP。
      </div>
      <ants-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-width="60px"
        status-icon
      >
        <ants-form-item label="线路" prop="name">
          <ants-input
            v-model="form.name"
            placeholder="请输入线路名称(字母、数字、_、汉字)，不超过17个字符"
            maxlength="17"
          ></ants-input>
        </ants-form-item>
        <ants-form-item label="IP段" prop="content">
          <ants-input
            type="textarea"
            :autosize="{ minRows: 8, maxRows: 20 }"
            v-model="form.content"
            placeholder="请填写IP段，一行一个IP段，不能有空格，最多支持100个IP段。
  例如：1.1.1.1-2.2.2.2"
          ></ants-input>
        </ants-form-item>
      </ants-form>
    </ants-dialog>
  </div>
</template>

<script>
// api
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getUserDefindLineList,
  doCreateUserDefindLine,
  doDeleteUserDefindLine
} = require(`@/v2/${PROCESS_NAME}/api/dns/record`)

const defaultForm = {
  id: null,
  name: '',
  content: ''
}
export default {
  data() {
    // 验证规则多个 IP段，一行一个IP段
    const checkIpsArr = (rule, value, callback) => {
      const checkIps = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)[-]((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/
      const ipsArr = value.trim().split(/[\r\n]+/) // 以空格或换行分割输入框的值
      let isOk = false

      let ipStart = 4294967295 // 总的起止IP,初始值为最大
      let ipEnd = 0 // 总的截止IP，初始值为最小

      // 1、验证IP格式
      // 2、比较起始IP大小
      // 3、比较重复
      ipsArr.every((item, idx) => {
        // 1、验证IP格式
        isOk = checkIps.test(item.trim())
        if (!isOk) {
          callback(new Error('IP段格式错误：' + item))
          return false // 终止循环
        }

        // 2、比较起始IP大小
        if (item && this.compareIp(item)) {
          isOk = false
          callback(new Error('起始IP不能大于截止IP：' + item))
          return false // 终止循环
        }

        /* 3、比较重复
         * 3.1 首先判断是否重复
         *      A: 如果起始ip或截止ip 在已有区间内，则表示重复。
         *      B: 起始ip和截止ip都不在已有区间内，但包含已有区间，也表示重复
         * 3.2 如果没有重复则追加到已有区间，方便下一次计算
         */
        // 计算已有区间
        const itemIpStart = this.ipGetInt(item.trim().split('-')[0])
        const itemIpEnd = this.ipGetInt(item.trim().split('-')[1])

        // 判断是否重复
        if (!(itemIpStart > ipEnd || itemIpEnd < ipStart)) {
          // 如果重复
          isOk = false
          callback(new Error('IP区间重复：' + item))
          return false // 终止循环
        }

        // 如果没有重复，追加到已有区间
        if (itemIpStart < ipStart) {
          ipStart = itemIpStart
        }
        if (itemIpEnd > ipEnd) {
          ipEnd = itemIpEnd
        }

        // 最后返回 isOK, 为false时终止循环
        return isOk
      })

      if (isOk) {
        callback()
      }
    }

    return {
      total: 0,
      queryInfo: {
        name: '', // 检索线路名称
        sidx: 'id', // 排序字段，根据ID排序
        order: 'desc', // asc-正序， desc-倒叙
        domain_id: this.$route.params.id,
        userId: this.$route.params.userId, // 用户ID
        pagenum: 1, // 当前的页数
        pagesize: 50, // 当前每页显示多少条数据
        page: 1, // 当前的页数
        limit: 50 // 当前每页显示多少条数据
      },
      goodsList: [],
      selectArr: [], // 批量选择数组

      // 添加线路对话框数据
      btnLoading: false,
      dialogText: '添加',
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      formRules: {
        name: [
          {
            required: true,
            message: '线路名称不能为空',
            trigger: ['change', 'blur']
          }
        ],
        content: [
          {
            required: true,
            message: 'IP段不能为空',
            trigger: ['change', 'blur']
          },
          {
            validator: checkIpsArr,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getTableData()
  },
  mounted() {},
  methods: {
    /**
     * @description: 获取自定义线路列表数据
     * @param {*}
     * @return {*}
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getUserDefindLineList(this.queryInfo)

      this.$root.loading = false

      if (res.code !== 1) return

      /**
       *  0 - 本地和远程都不存在，列表不显示
       *  1 - 本地和远程都存在，正常显示
       *  2 - 本地存在，远程不存在，显示推送按钮，用户需要重新推送，调用修改接口
       *  3 - 本地不存在，远程还存在，再下发财，调用删除接口
       *
       */
      this.goodsList = res.data.list.filter(item => {
        if (item.status) {
          return {
            ...item
          }
        }
      })
      console.log(this.goodsList)
      this.goodsList.forEach(async item => {
        if (item.status === 2) {
          const { data: res } = await doCreateUserDefindLine({
            userId: this.queryInfo.userId,
            id: item.id,
            ipSegmentS: item.ipSegmentS,
            name: item.name
          })
        }

        if (item.status === 3) {
          const { data: res } = await doDeleteUserDefindLine({
            ids: item.id
          })
        }
      })
      // this.goodsList = res.data.list || []
      this.total = res.data.totalCount || 0
    },

    checkStatus() {
      this.goodsList.forEach(item => {
        if (!item.status) {
        }
      })
    },

    // 比较 IP段 大小
    compareIp(ip) {
      const ipArr = ip.split('-')
      if (this.ipGetInt(ipArr[0]) > this.ipGetInt(ipArr[1])) {
        return true
      } else {
        return false
      }
    },

    // ip 转整数
    ipGetInt(ip) {
      let num = 0
      if (!ip) {
        return num
      }
      ip = ip.trim().split('.')
      num =
        Number(ip[0]) * 256 * 256 * 256 +
        Number(ip[1]) * 256 * 256 +
        Number(ip[2]) * 256 +
        Number(ip[3])
      num = num >>> 0 // 这个很关键，不然可能会出现负数的情况
      return num
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    /**
     *  添加、修改、删除、批量删除 自定义线路模块 =======================================================
     */
    showAddDialog(txt, row) {
      this.dialogText = txt

      // 如果为修改
      if (row) {
        this.form = {
          id: row.id,
          name: row.name,
          content: row.ipSegmentS.replace(/,/g, '\n')
        }
      }

      this.dialogVisible = true
    },

    /**
     * @description: 添加、修改提交多个自定义线路，表单提交
     * @param {*}
     * @return {*}
     */
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { data: res } = await doCreateUserDefindLine({
          domainId: this.$route.params.id,
          userId: this.queryInfo.userId,
          id: this.form.id,
          ipSegmentS: this.form.content.trim().replace(/[\r\n]+/g, ','), // ip段格式以逗号分隔
          name: this.form.name
        })

        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success(this.dialogText + '自定义线路添加成功')
        this.dialogVisible = false
      })
    },

    // 添加线路表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    },

    /**
     * @description: 单个删除线路
     */

    async deleteGroup(row) {
      const result = await this.$doDelete({
        name: row.name,
        tag: '自定义线路'
      })
      if (!result) return

      const { data: res } = await doDeleteUserDefindLine({
        ids: row.id
      })

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除线路成功')
    },

    /**
     * @description: 批量删除线路
     */

    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '自定义线路'
      })
      if (!result) return

      const ids = this.selectArr.map(e => {
        return e.id
      })
      const { data: res } = await doDeleteUserDefindLine({
        ids: ids.toString()
      })

      if (res.code !== 1) return
      this.getTableData()

      // 如果有正在使用中的线路，则不会删除，提示正在使用
      let txt = '已成功删除 ' + res.data.success_count + ' 条自定义线路。'
      if (res.data.success_count != res.data.data_count) {
        txt +=
          res.data.data_count -
          res.data.success_count +
          ' 条线路正在使用，不能删除。'
      }
      this.$alert(txt, '友情提示', {
        confirmButtonText: '确定',
        type:
          res.data.success_count != res.data.data_count ? 'warning' : 'success',
        center: true
      })
      this.selectArr = []
    }
  }
}
</script>
