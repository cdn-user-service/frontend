<template>
  <div class="work-order-submit">
    <div class="steps-box content-box">
      <el-steps :active="+activeStep" align-center simple>
        <el-step
          :icon="`aicon ${item.icon}`"
          v-for="(item, idx) in stepList"
          :key="idx"
          :title="antsT(item.title)"
        ></el-step>
      </el-steps>
    </div>

    <div class="content-box">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeStep: this.$route.meta.step || 0, // 步骤开始
      stepList: Object.freeze([
        {
          title: '选择问题所属分类',
          icon: 'icon-xuhao_11'
        },
        {
          title: '选择问题类型',
          icon: 'icon-xuhao_2'
        },
        {
          title: '创建工单',
          icon: 'icon-xuhao_31'
        }
      ])
    }
  },
  watch: {
    '$route.meta.step': function(newVal, oldVal) {
      this.activeStep = newVal
    }
  }
}
</script>

<style lang="scss">
.work-order-submit {
  .steps-box {
    .aicon {
      font-weight: normal;
      font-size: 30px;
      margin-bottom: -6px;
      margin-right: 10px;
    }

    .el-steps--simple {
      background-color: theme('colors.primary-light');
      border-radius: 10px;
    }

    @media screen and (max-width:992px) {
      .el-steps--simple {
        padding: 10px;
      }

      .el-step.is-simple .el-step__title {
        font-size: 14px;
      }

      .aicon {
        font-size: 20px;
        margin-bottom: 0;
      }
    }
  }
}
</style>
