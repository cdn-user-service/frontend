
<template>
  <div>
    <el-card class="ants-bread-box">
      <div class="ants-bread-main animated fadeIn">
        <div class="ants-bread-title">
          <el-button
            icon="el-icon-back"
            plain
            circle
            size="mini"
            @click="$router.push(backUrl)"
            v-if="backUrl"
          ></el-button>
          <span>{{ antsT(title) }}</span>
        </div>

        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item to="/console"
            ><span class="aicon icon-shouye"></span
          ></el-breadcrumb-item>

          <transition-group name="breadcrumb">
            <el-breadcrumb-item
              v-for="item in breadcrumbs"
              :key="item.path"
              >{{ antsT(item.meta.title) }}</el-breadcrumb-item
            >
          </transition-group>
        </el-breadcrumb>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Breadcrumb',
  props: {},
  data() {
    return {
      title: '',
      backUrl: false,
      breadcrumbs: []
    }
  },
  watch: {
    $route() {
      this.generatorBreadcrumb()
    }
  },
  mounted() {
    this.generatorBreadcrumb()
  },
  methods: {
    generatorBreadcrumb() {
      this.title = this.$route.meta.title
      this.backUrl = this.$route.meta.backUrl
      this.breadcrumbs = this.$route.matched.filter(it => {
        return it.meta && it.meta.title
      })
    }
  }
}
</script>

<style lang="scss">
.ants-bread-box {
  .el-card__body {
    padding: 15px 20px;
  }
}
</style>

<style lang="scss" scoped>
/* 面板屑样式 */
.ants-bread-main {
  display: flex;
  align-items: center;
  .el-breadcrumb {
    font-size: 13px;
    line-height: 26px;
    margin: 0;
    .aicon {
      font-weight: 500;
      font-size: 19px;
    }
  }
  .ants-bread-title {
    font-weight: 600;
    font-size: 15px;
    display: inline-block;
    padding-right: 20px;
    border-right: 1px solid theme('colors.ants-border-1');
    color: theme('colors.ants-text-1');
    line-height: 26px;
    margin-right: 20px;
    .el-button {
      margin-right: 10px;
      vertical-align: middle;
      margin-top: -1px;
    }
  }

  @media screen and (max-width:767px) {
    .ants-bread-title {
      font-size: 14px;
    }
    .el-breadcrumb {
      font-size: 12px;
      .aicon {
        font-size: 16px;
      }
    }
  }
}
</style>
