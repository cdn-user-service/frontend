<template>
  <el-popover placement="top" width="400" trigger="click">
    <div>
      <strong>{{ antsT('增值业务') + antsT('订单详情') }}</strong>
    </div>
    <el-table :data="orderRowExtraInfo" style="margin:0;" max-height="500">
      <ants-table-column prop="name" label="商品名称" width="120">
      </ants-table-column>
      <ants-table-column prop="value" label="规格" width="120">
        <template #default="{ row }"> {{ row.value }} {{ row.unit }} </template>
      </ants-table-column>
      <ants-table-column prop="price" label="价格" width="120">
        <template #default="{ row }">
          <span class="text-price">
            {{ row.price | priceFormat }}
          </span>
        </template>
      </ants-table-column>
    </el-table>
    <span slot="reference">
      <span class="cursor"
        >{{ antsT('增值业务') }}（{{ buySum }} {{ antsT('年') }}）</span
      >
      <span class="cursor-color el-icon-info"></span>
    </span>
  </el-popover>
</template>

<script>
export default {
  props: {
    // 增值业务详情数据
    orderRowExtraInfo: {
      type: Array,
      default: () => []
    },
    // 购买数量
    buySum: {
      type: Number,
      default: 0
    }
    // 
  },
  data() {
    return {}
  }
}
</script>
