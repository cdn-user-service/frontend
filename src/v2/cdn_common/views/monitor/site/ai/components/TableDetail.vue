<template>
  <div>
    <div class="flex items-center">
      <ants-select
        size="small"
        style="width: 100px;"
        class="mr-lg"
        @change="getTableData"
        v-model="queryInfo.handle"
      >
        <ants-option
          v-for="(item, key) in handleObj"
          :key="key"
          :value="key"
          :label="item"
        />
      </ants-select>
      <ants-input
        class="ants-search_input"
        placeholder="检索IP地址"
        clearable
        v-model="queryInfo.ip"
        size="small"
        @change="getTableData"
      >
        <i
          slot="prefix"
          class="el-input__icon aicon icon-sousuo"
          @click="getTableData"
        ></i>
      </ants-input>
    </div>

    <ants-table
      :data="tableData"
      @getTableData="getTableData"
      :total="total"
      :queryInfo="queryInfo"
    >
      <ants-table-column prop="ip" label="IP地址" min-width="150">
      </ants-table-column>
      <ants-table-column label="HOST" prop="mode" min-width="150">
      </ants-table-column>
      <ants-table-column label="请求方法" prop="methods" min-width="100">
      </ants-table-column>
      <ants-table-column label="返回状态码" prop="mode" min-width="150">
      </ants-table-column>
      <ants-table-column label="来源地域" prop="mode" min-width="150">
      </ants-table-column>
    </ants-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      total: 0,
      queryInfo: {
        ip: '',
        handle: 'all',
        page: 1,
        limit: 20
      },
      handleObj: {
        all: '全部',
        post: '拦截',
        get: '可疑',
        other: '其他'
      },

      tableData: [],
      btnLoading: false
    }
  },
  created() {},
  methods: {
    getTableData() {},
    showCreateUpdateDialog() {}
  }
}
</script>
