<template>
  <el-card class="mb-lg">
    <TitleBorder title="计费方式">
      <span
        class="text-primary cursor-pointer absolute text-sm"
        style="right:20px;"
        @click="showTipsDialog"
        >计费说明
        <span class="el-icon-s-promotion"></span>
      </span>
    </TitleBorder>
    <div class="my-lg">
      当前计费方式：
      <strong>
        按流量计费
      </strong>
    </div>
    <div>
      <ants-button
        size="mini"
        type="primary"
        text="变更计费方式"
        @click="changeType"
      />
      <ants-button
        size="mini"
        type="primary"
        plain
        text="用量查询"
        @click="goSearchPage"
      />
      <ants-button
        size="mini"
        type="primary"
        plain
        text="账单明细"
        @click="goOrderPage"
      />
    </div>
    <!-- <ants-radio-group size="small" v-model="activeBill">
      <ants-radio-button
        v-for="item in billTypeList"
        :key="item.id"
        :label="item.id"
        :text="item.name"
      />
    </ants-radio-group> -->
    <TipsDialog ref="TipsDialogRef" />
    <ChangeDialog ref="ChangeDialogRef"/>
  </el-card>
</template>

<script>
import TipsDialog from './TipsDialog'
import ChangeDialog from './ChangeDialog'
export default {
  components: {
    TipsDialog,
    ChangeDialog
  },
  data() {
    return {
      activeBill: 1,
      billTypeList: [
        {
          id: 1,
          name: '流量小时结'
        },
        {
          id: 2,
          name: '平均日峰带宽'
        },
        {
          id: 3,
          name: '月95带宽'
        }
      ]
    }
  },
  created() {},
  methods: {
    showTipsDialog() {
      this.$refs.TipsDialogRef.showDialog()
    },

    changeType() {
      this.$refs.ChangeDialogRef.showDialog()
    },

    goSearchPage() {
      this.$router.push('/cdn/plan/usage/query')
    },

    goOrderPage() {
      this.$router.push('/cdn/finance/order')
    }
  }
}
</script>
