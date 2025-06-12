<template>
  <div class="news_detail_box">
    <div class="content-box">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
        <el-breadcrumb-item to="/news">站内消息</el-breadcrumb-item>
        <el-breadcrumb-item>消息详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="content-box btn_box">
      <div>
        <el-button
          type="primary"
          size="small"
          plain
          :disabled="preDisabled"
          @click="goPre(prdId)"
          v-if="infoHtml"
          ><i class="el-icon-arrow-left el-icon--left"></i> 上一封</el-button
        >
        <el-button
          type="primary"
          size="small"
          plain
          :disabled="nextDisabled"
          @click="goPre(nextId)"
          v-if="infoHtml"
          >下一封<i class="el-icon-arrow-right el-icon--right"></i
        ></el-button>
      </div>
      <el-button
        icon="el-icon-delete"
        size="small"
        plain
        @click="deleteInfo"
        v-if="infoHtml"
        >删除</el-button
      >
    </div>
    <el-card class="card_main animated fadeIn">
      <div class="page_header_box">
        <el-page-header
          @back="goBack"
          :content="
            infoHtml
              ? '您购买的antsCDN软件可以更新，前往立即更新'
              : '该站内信不存在'
          "
        >
        </el-page-header>
        <span v-if="infoHtml">2020-01-01 10:10:00</span>
      </div>
      <el-row>
        <el-col
          :xs="{ span: 24, offset: 0 }"
          :sm="{ span: 20, offset: 2 }"
          :md="{ span: 18, offset: 3 }"
          :lg="{ span: 16, offset: 4 }"
          :xl="{ span: 14, offset: 5 }"
        >
          <div class="new_item">
            <!-- 渲染消息 -->
            <!-- <div class="new_info" v-if="infoHtml" v-html="infoHtml"></div> -->
            <div class="new_info" v-if="infoHtml">
              <p class="nf_title">
                您购买的antsCDN软件可以更新，前往立即更新！
              </p>
              <p style="margin-top:30px;">尊敬的antsCDN用户，您好！</p>
              <p style="line-height:28px;">
                您够买的antsCDN软件已推出新版本
                1.1.2，增加了流量实时监控、节点监控、
                WAF高防护、防爬虫等功能，修复了部分页面操作不流畅BUG。您现在可以直接去下载软件，轻松部署到您的系统。
              </p>
              <p style="margin:30px 0;">
                <el-button type="primary" style="width:100%;"
                  >立即前往下载</el-button
                >
              </p>
              <el-divider></el-divider>
              <div>
                <p>温馨提醒：</p>
                <p style="font-size:12px;margin-bottom:40px;">
                  若您在使用过程中遇到任何问题，欢迎拨打 15907289088 或者通过
                  <router-link to="/workorderDo">工单系统</router-link>
                  进行反馈，我们将竭诚为您服务！
                </p>
                <p>此致</p>
                <p style="font-weight:700;">antsCDN团队</p>
              </div>
            </div>

            <!-- 当站内信不存在时显示 -->
            <div v-else class="none_info_box">
              <el-avatar icon="el-icon-document-delete" :size="80"></el-avatar>
              <p>该站内信不存在</p>
            </div>

            <!-- 公众号 -->
            <ul class="code_box">
              <!-- <li>
                <el-image :src="code" fit="cover"></el-image>
              </li> -->
              <li style="font-size:13px;">
                关注antsCDN公众号，掌握最新动态
              </li>
              <li>
                Copyright © 2020 antsCDN All Rights Reserved
              </li>
            </ul>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id: '',
      prdId: '',
      nextId: '',
      // code: require('@/assets/img/code.jpg'),
      infoHtml: '',
      preDisabled: false,
      nextDisabled: false
    }
  },
  created() {
    this.id = this.$route.params.id
    this.getGoodsList()
  },
  mounted() {},
  methods: {
    goBack() {
      this.$router.push('/messagelist')
    },
    // 发起请求获取消息数据
    async getGoodsList(id) {
      // const { data:res } = await this.$http.post('', this.$qs.stringify({ id: this.id }))
      // console.log(res)
      // 模拟数据
      const res = {
        prdId: 1,
        nextId: 3,
        html: '<div></div>'
      }
      // 请求到的数据为 html，可直接渲染
      this.infoHtml = res.html || ''
      // 上一封的 id
      this.prdId = res.prdId
      // 下一封的 id
      this.nextId = res.nextId
      // 判断是否禁用上一封、下一封按钮
      if (!res.prdId) {
        this.preDisabled = true
      }
      if (!res.nextId) {
        this.nextDisabled = true
      }
    },

    // 点击上一封、下一封 ;  当为第一封时 上一封按钮禁用，当为最后一封时，下一封按钮禁用
    goPre(id) {
      console.log(id)
      this.id = id
      this.$router.push('/messagelist/detail/' + id)
      this.getGoodsList()
    },

    // 点击删除
    async deleteInfo() {
      const { data: res } = await this.$http.post(
        '',
        this.$qs.stringify({ id: this.id })
      )
      console.log(res)
      if (res.out != 'ok') {
        return this.$msg.error('删除失败，请重试')
      }
      // 删除成功，若有下一封则当前路由跳转到下一封的路由，
      // 若没有则跳转上一封的路由，
      this.$msg.success('删除成功')
      if (!this.nextDisabled) {
        this.goPre(this.nextId)
      }

      if (this.nextDisabled && !this.preDisabled) {
        this.goPre(this.prdId)
      }

      // 若都没有则跳转到消息列表路由
      if (this.nextDisabled && this.preDisabled) {
        this.$router.replace('/messagelist')
      }
    }
  },
  destroyed() {}
}
</script>

<style lang="scss" scoped>
.btn_box,
.page_header_box {
  display: flex;
  justify-content: space-between;
}
.page_header_box {
  color: #777;
}
.new_item {
  background-color: #f5f8fa;
  padding: 30px;
  margin: 40px 0;
  .new_info {
    background-color: #fff;
    border-top: 2px solid #419eff;
    padding: 30px;
    box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);
    .nf_title {
      font-weight: 700;
      font-size: 17px;
      margin-top: 0;
    }
  }

  .none_info_box {
    text-align: center;
    padding-top: 30px;
    .el-avatar--icon {
      font-size: 28px;
    }
    p {
      font-weight: 700;
    }
  }
}

.code_box {
  padding: 20px;
  > li {
    text-align: center;
    color: #999;
    font-size: 12px;
    margin-top: 15px;
    .el-image {
      width: 100px;
      height: 100px;
      box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
<style lang="scss">
.news_detail_box {
  .el-page-header__left {
    color: #419eff;
  }
  .el-page-header__content {
    font-size: 15px;
    font-weight: 700;
  }
}
</style>
