<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    title="计费方式【流量/带宽月结】"
    width="1000px"
    top="5vh"
    @close="resetForm"
    @submit="submitForm"
  >
    <ul class="ants-tips_box space-y-2 -mt-sm mb-lg">
      <li class="font-bold"><span class="el-icon-info"></span> 名词解释：</li>
      <li>
        1、合同价：{{$root.priceUnit}}P /Mbps/月 或 {{$root.priceUnit}}P /GB/月（非固定值，为您商议的合同价）。
      </li>
      <li>
        2、月度有效天：自然月某一天用量 ＞ 1000bps，则记为一天有效天。
      </li>
    </ul>
    <el-table :data="tableData" style="margin:0;" border>
      <ants-table-column prop="type" label="计费方式" min-width="100">
      </ants-table-column>
      <ants-table-column prop="info" label="描述" min-width="200">
      </ants-table-column>
      <ants-table-column prop="bill" label="计算方式" min-width="200">
      </ants-table-column>
    </el-table>

    <ul class="text-sm text-ants-text-4 space-y-2 mt-lg" style="line-height:18px;">
      <li class="font-bold"><span class="el-icon-info"></span> 特别说明：</li>
      <li>
        1、各 CDN
        节点会实时记录流量数据，上报至计算中心，汇总为域名总流量数据。带宽计费时，使用每5分钟粒度数据进行结算，即相应的带宽值
        = 5分钟粒度总流量 /
        300秒。例如：5分钟内产生的总流量为30MB，根据换算规则：1MB =
        8Mb，即相应的带宽为（30 * 8）/ 300 = 0.8Mbps。
      </li>
      <li>
        2、进制换算规则：1GB = 1000MB、1 MB= 1000 KB; 1Gbps = 1000Mbps、1Mbps =
        1000Kbps。
      </li>
      <li>
        3、月度结算的月为自然月。
      </li>
    </ul>
    <template slot="footer">
      <ants-button
        size="small"
        type="info"
        text="关 闭"
        @click="dialogVisible = false"
      />
    </template>
  </ants-dialog>
</template>

<script>
// API
import { doCreateOrder } from '@/v2/cdn_users/api/payment'

export default {
  data() {
    return {
      dialogVisible: false,

      tableData: [
        {
          type: '流量月结',
          info: '月度累计使用的所有流量和，根据合同价格计算费用。',
          bill: '假设客户1月份产生了 n GB流量，则1月份的费用为：n * P。'
        },
        {
          type: '平均日峰带宽',
          info: 'CDN 每日带宽统计点共288个，对所有有效天的峰值取平均，得到计费带宽，再根据商务签订的合同价格计算费用。',
          bill: '假设客户1月份有14天有效天，这14天有效天每一天的288个统计点最大值为：Max_1、Max_2、Max_3... Max_14，计费带宽为 Average(Max_1, Max_2, ..., Max_14)，1月的费用为：Average(Max_1, Max_2, ..., Max_14) * P * 14 / 31。'
        },
        {
          type: '月95带宽',
          info: 'CDN 每日带宽统计点共288个，从当月1号起，每一个有效日（产生消耗）的所有统计点进行排序，去掉前5%的统计点，剩下的最大的统计点，即为计费带宽，再根据合同价格计算费用。',
          bill: '假设客户1月份有14天有效天，则计费带宽为这14天有效天的所有统计点14 * 288个，去掉最高的5%的点，剩余统计点中最高的为 Max95，Max95 即为计费带宽，1月的费用为：Max95 * P * 14 / 31。'
        }
      ]
    }
  },
  created() {},
  methods: {
    /**
     * @description: 对话框显示
     */

    showDialog(row = {}) {
      this.dialogVisible = true
    },

    /**
     * @description: 提交
     */

    async submitForm() {},

    resetForm() {}
  }
}
</script>
