<template>
  <div>
    <ants-form-card
      :tips-arr="[
        `1. ${antsT(
          'http 协议默认开 80、8080 端口，https 协议默认开 443、8443 端口，不可更改使用，开通TCP安全加速可支持其他端口；'
        )}`,
        `2. ${antsT(
          '回源到 IP 请填写服务器 IP 地址，回源到域名请填写对应域名；'
        )}`,
        `3. ${antsT(
          '使用HTTPS协议请上传 SSL&TLS 并开启 HTTPS，否则将影响站点正常访问；'
        )}`,
        `4. ${antsT(
          '不支持端口'
        )}：21, 22, 23, 25, 68, 135, 139, 445, 593, 873, 1068, 1111, 1434, 1871, 2121, 3208, 4331, 4334, 4444, 4510, 4557, 5152, 5153, 5154, 5554, 5800, 5900, 9995, 9996, 45050, 45060, 65432, 65050, 64150, 64151, 61081, 10050, 32767, 10022。`
      ]"
    >
      <template slot="title">{{ antsT('源站设置') }}</template>
      <template slot="info">
        {{ antsT('指定回源地址和监听端口，支持回源到IP及域名。') }}
      </template>
      <template slot="content">
        <div class="mb-df" v-if="!$root.disabledCrud">
          <ants-button
            size="mini"
            type="primary"
            icon="el-icon-plus"
            @click="showCreateUpdateDialog('create')"
            text="添加源站"
          />
          <!-- <ants-button
            size="mini"
            type="success"
            icon="el-icon-tickets"
            @click="showCreateUpdateDialog('bulk')"
            text="批量添加"
          /> -->
        </div>
        <el-table :data="tableData" v-loading="$root.loading" border>
          <ants-table-column
            min-width="100"
            prop="protocol"
            label="协议类型"
            align="center"
          >
          </ants-table-column>
          <ants-table-column
            min-width="100"
            prop="port"
            label="监听端口"
            align="center"
          >
          </ants-table-column>
          <ants-table-column
            min-width="100"
            prop="s_protocol"
            label="取源协议"
            align="center"
          >
            <template #default="{ row }">
              {{ row.s_protocol === '$scheme' ? '协议跟随' : row.s_protocol }}
            </template>
          </ants-table-column>
          <ants-table-column
            min-width="200"
            prop="ip"
            label="源站地址"
            align="center"
          >
            <template #default="{ row, $index }">
              <ul>
                <li v-for="(item, idx) in row.line" :key="idx + '_' + $index">
                  <el-tag
                    size="mini"
                    :type="item.line == 1 ? 'primary' : 'info'"
                    plain
                  >
                    {{ antsT(item.line == 1 ? '主' : '备') }}
                  </el-tag>
                  {{ row.source_set === 'ip' ? item.ip : item.domain }} :
                  {{ item.port }}
                </li>
              </ul>
            </template>
          </ants-table-column>
          <ants-table-column
            prop="domain"
            label="操作"
            width="160"
            align="center"
            v-if="!$root.disabledCrud"
          >
            <template #default="{ row }">
              <ants-button
                size="mini"
                type="primary"
                @click="showCreateUpdateDialog('update', row)"
                text="编辑"
              />
              <ants-button
                size="mini"
                type="danger"
                @click="deleteSingle(row)"
                text="删除"
              />
            </template>
          </ants-table-column>
        </el-table>
      </template>
    </ants-form-card>

    <CreateUpdateDialog
      ref="UpdateDialogRef"
      v-on="$listeners"
      v-bind="$attrs"
      :is-http="isHttp"
    />

    <CreateUpdateDialog
      ref="CreateDialogRef"
      v-on="$listeners"
      v-bind="$attrs"
      :is-http="isHttp"
    />
  </div>
</template>

<script>
import CreateUpdateDialog from './createUpdate'
export default {
  components: {
    CreateUpdateDialog
  },
  data() {
    return {
      form: {
        // 源站基本设置, [mm_text]
        source_base_info: ''
      },
      tableData: [],
      total: 0,
      queryInfo: {
        page: 1,
        limit: 20
      },

      // 是否没有 http 的源站
      isHttp: false
    }
  },
  created() {},
  methods: {
    /**
     * @description: 显示添加源站对话框
     */

    showCreateUpdateDialog(type, row = {}) {
      if (type === 'create') {
        this.$refs.CreateDialogRef.showDialog(type, row)
      }

      if (type === 'update') {
        this.$refs.UpdateDialogRef.showDialog(type, row)
      }
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async deleteSingle({ id }) {
      const res = await this.$listeners.deleteSiteAttr('source_base_info', id)
      if (res) this.$emit('refreshData')
    }
  }
}
</script>
