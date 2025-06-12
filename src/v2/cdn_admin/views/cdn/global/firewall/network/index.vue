<template>
  <div class="animated fadeIn">
    <div class="mb-sm">
      <!-- <span class="mr-sm text-sm">{{ antsT('启用禁ping') }}</span>
      <ants-switch
        v-model="icmpStatus"
        active-color="#13CE66"
        active-value="1"
        inactive-value="0"
        @change="changeIcmp"
        v-loading="icmpSwitchLoading"
      /> -->

      <!-- <span class="mr-sm text-sm">{{ antsT('畸形包过滤') }}</span>
      <ants-switch
        v-model="ants_bad_request_400_forbid"
        active-color="#13CE66"
        active-value="1"
        inactive-value="0"
        @change="changeBadRequest"
        v-loading="badSwitchLoading"
      /> -->
    </div>
    <div class="">
      <ants-input
        v-model="form.ip"
        placeholder="目标地址 0/0"
        size="small"
        style="width: 220px;"
        class="mr-sm mt-sm"
      />
      <ants-select
        v-model="form.protocol"
        placeholder="选择协议"
        size="small"
        style="width:100px;"
        class="mr-sm mt-sm"
      >
        <ants-option label="ALL" value="all" />
        <ants-option label="TCP" value="tcp" />
        <ants-option label="UDP" value="udp" />
      </ants-select>
      <ants-input
        v-model="form.port"
        placeholder="端口或端口范围（1-65535）"
        size="small"
        class="mr-sm mt-sm input-with-select"
        style="width: 220px;"
      />
        <!-- <ants-select v-model="form.portType" slot="prepend" placeholder="请选择">
          <ants-option label="本地" value="d_port" />
          <ants-option label="远程" value="s_port" />
        </ants-select> -->
      <ants-select
        v-model="form.rule"
        placeholder="选择行为"
        size="small"
        style="width:100px;"
        class="mr-sm mt-sm"
      >
        <ants-option label="放行" value="accept" />
        <ants-option label="拒绝" value="drop" />
      </ants-select>
      <ants-input
        v-model="form.remark"
        placeholder="备注信息"
        size="small"
        class="mr-sm mt-sm"
        style="width: 220px;"
      />
      <ants-button
        size="small"
        type="primary"
        icon="el-icon-edit"
        text="提 交"
        :disabled="$root.loading"
        :loading="btnLoading"
        @click="submitForm"
      />
    </div>

    <ants-table
      :data="tableData"
      @getTableData="getTableData"
      :total="total"
      :queryInfo="queryInfo"
    >
      <ants-table-column label="ID" prop="id" width="80"></ants-table-column>
      <ants-table-column label="目标地址" min-width="140" prop="ip">
      </ants-table-column>

      <ants-table-column label="协议" min-width="100" prop="protocol">
        <template #default="{ row }">
          <el-tag size="mini" type="primary">{{
            row.protocol.toUpperCase()
          }}</el-tag>
        </template>
      </ants-table-column>
      <ants-table-column label="端口" min-width="120" prop="port">
        <!-- <template #default="{ row }">
          {{`【${row.portType == 'd_port' ? '本地' : '远程'}】`}}
          {{row.port}}
        </template> -->
      </ants-table-column>

      <ants-table-column label="行为" prop="rule" min-width="100">
        <template #default="{ row }">
          <el-tag size="mini" type="success" v-if="row.rule === 'accept'"
            >放行</el-tag
          >
          <el-tag size="mini" type="danger" v-else>拒绝</el-tag>
        </template>
      </ants-table-column>

      <ants-table-column label="备注信息" prop="remark" min-width="140">
      </ants-table-column>
      <ants-table-column
        label="更新时间"
        sortable
        prop="updateTime"
        min-width="140"
      >
      </ants-table-column>
      <ants-table-column prop="status" label="状态" min-width="60">
        <template #default="{ row, $index }">
          <ants-table-switch
            v-model="row.status"
            :ref="`tableSwitchRef${$index}`"
            @change="changeStatus(row, `tableSwitchRef${$index}`)"
          />
        </template>
      </ants-table-column>

      <ants-table-column label="操作" width="100">
        <template #default="{ row }">
          <ants-button
            size="mini"
            type="danger"
            :disabled="btnLoading"
            @click="singleDelete(row)"
            text="删除"
          />
        </template>
      </ants-table-column>
    </ants-table>
  </div>
</template>

<script>
import mixins from '../../mixins'

const defaultForm = {
  ip: '',
  // 端口类型， d_port = 本地端口， s_port = 远程端口
  // portType: 'd_port',
  port: '',
  protocol: '',
  // accept = 放行， drop = 屏蔽
  rule: 'accept',
  remark: ''
}
export default {
  mixins: [mixins],
  data() {
    return {
      // 畸形包过滤开关
      ants_bad_request_400_forbid: '0',
      badSwitchLoading: false,

      keyStr: 'net_waf',
      icmpStatus: '0',
      icmpSwitchLoading: false,
      total: 0,
      queryInfo: {
        username: '', // 搜索框内容
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      form: {
        ...defaultForm
      }
    }
  },
  created() {
    this.getTableData()
    // this.getBadDetail()
  },
  methods: {
    /**
     * @description: 获取表格数据
     */

    async getTableData() {
      const { data: res } = await this.getGlobalAttr(this.keyStr)
      if (!res) return
      // 表格数据
      if (res.net_waf) {
        const arr = res.net_waf.map(item => {
          const obj = JSON.parse(item.pvalue)
          return {
            ...item,
            ...obj
          }
        })
        // this.tableData = arr.reverse()
        this.tableData = arr.sort(this.sortTableData)
        this.total = arr.length
      }

      // 启用禁 ping 开关状态
      if (res.net_waf_ping) {
        this.icmpStatus = res.net_waf_ping.pvalue || '0'
      }
    },

    /**
     * @description: 排序，放行的放在前面，拒绝的放在后面
     */

    sortTableData(x, y) {
      let val = x.id - y.id
      if (y.rule == 'accept') val = 1
      if (x.rule == 'accept') val = -1
      return val
    },

    /**
     * @description: 获取畸形包过滤
     */    
    async getBadDetail() {
      this.badSwitchLoading = true
      const { data: res } = await this.getGlobalKeyDetail('ants_bad_request_400_forbid')
      this.badSwitchLoading = false
      if (res) {
        this.ants_bad_request_400_forbid = res.pvalue
      }
    },

    /**
     * @description: 畸形包过滤开关
     */    
    async changeBadRequest(val) {
      this.badSwitchLoading = true
      const data = await this.saveGlobalAttr({
        ants_bad_request_400_forbid: val
      })
      this.badSwitchLoading = false

      if (!data) {
        this.ants_bad_request_400_forbid = val ? '0' : '1'
      }
    },

    /**
     * @description: 表单提交
     * @return {*}
     */

    async submitForm() {
      const obj = {
        ip: '请输入目标地址',
        protocol: '请选择协议',
        // portType: '请选择端口类型',
        port: '请输入端口',
        rule: '请选择行为',
        remark: '请输入备注信息'
      }
      let flag = true
      Object.keys(obj).some(key => {
        if (this.form[key] === '') {
          this.$msg.error(obj[key])
          flag = false
          return true
        }
      })
      if (!flag) return

      const data = await this.saveGlobalAttr({
        [this.keyStr]: [
          {
            id: 0, // id 用于构造结构，设置为 0
            value: JSON.stringify({
              ...this.form
            })
          }
        ]
      })

      if (!data) return
      this.getTableData()
      // 清空数据
      this.form = {
        ...defaultForm
      }
    },

    /**
     * @description: 启用禁ping
     * @param {*} val
     */

    async changeIcmp(val) {
      this.icmpSwitchLoading = true
      const data = await this.saveGlobalAttr({
        net_waf_ping: val
      })
      this.icmpSwitchLoading = false

      if (!data) {
        this.icmpStatus = val ? '0' : '1'
      }
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async singleDelete(row) {
      const data = await this.deleteGlobalAttr(row.id, '防火墙')
      if (!data) return
      this.getTableData()
    },

    /**
     * @description: 切换状态
     * @param {*} row
     * @param {*} switchRef
     */

    async changeStatus(row, switchRef) {
      if (row.status === 0) {
        const result = await this.$doDelete({
          title: '禁用防火墙',
          content: '此操作将禁用该防火墙，是否继续？'
        })
        if (!result) {
          row.status = 1
          return
        }
      }
      this.$refs[switchRef].loading = true
      const data = await this.changeGlobalAttrStatus(
        row.status,
        this.keyStr,
        row.id
      )
      this.$refs[switchRef].loading = false
      if (!data) {
        row.status = row.status ? 0 : 1
      }
    }
  }
}
</script>

<style lang="scss">
.input-with-select {
  .el-input-group__prepend {
    background-color: #fff;
    color: theme('colors.ants-text-1');
    border-right: none;
  }
  .el-select .el-input {
    width: 80px;
  }
}
</style>
