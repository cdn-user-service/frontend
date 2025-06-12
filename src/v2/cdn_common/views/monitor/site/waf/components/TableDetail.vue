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
        placeholder="检索规则ID"
        clearable
        v-model="queryInfo.id"
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
      <ants-table-column prop="id" label="规则ID" min-width="100">
      </ants-table-column>
      <ants-table-column label="触发对象" prop="mode" min-width="150">
      </ants-table-column>
      <ants-table-column label="触发次数" prop="sum" min-width="100">
      </ants-table-column>
      <ants-table-column label="处置方式" prop="mode" min-width="150">
      </ants-table-column>
      <ants-table-column label="触发规则" prop="mode" min-width="150">
      </ants-table-column>

      <ants-table-column label="操作" width="100">
        <template #default="{ row }">
          <ants-button
            size="mini"
            type="primary"
            :disabled="btnLoading"
            @click="showCreateUpdateDialog(row)"
            text="操作"
          />
        </template>
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
        id: '',
        handle: 'all',
        page: 1,
        limit: 20
      },
      handleObj: {
        all: '全部',
        forbid: '拦截',
        verify: '可疑',
        ignore: '忽略',
        pass: '放行',
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
