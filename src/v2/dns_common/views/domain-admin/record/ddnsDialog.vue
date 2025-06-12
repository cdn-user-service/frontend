<template>
  <ants-dialog
    title="动态DNS"
    v-model="dialogVisible"
    @closed="resetForm"
    @submit="submitForm"
    ref="dialogRef"
    width="700px"
    :footer="false"
  >
    <div class="text">
      <div>
        <span class="lable">DDNS API</span>
        <el-tooltip class="item" effect="dark" placement="right">
          <template #content>
            <div style="line-height: 30px">
              <div>
                1.get 请求API
                ，根据请求的ip及ip类型，自动更新当前记录A或AAAA记录值
              </div>
              <div>2.频率限制为每分钟最多提交更新一次</div>
            </div>
          </template>
          <span class="el-icon-info ants-icon_info"></span>
        </el-tooltip>
        <span class="tips"
          >格式：站点根路径 +
          /app/capi/ddns/v1?domain=${domain}&key=${key}</span
        >
      </div>
      <div class="copyText">
        <ants-copy :text="form.url + form.apiUrl" />
      </div>
    </div>
  </ants-dialog>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      dialogVisible: false,
      form: {
        url: '',
        apiUrl: ''
      }
    }
  },
  methods: {
    showDialog(val = {}) {
      this.form = val
      this.dialogVisible = true
    }
  }
}
</script>

<style lang="scss">
.text {
  line-height: 26px;
  .lable {
    font-weight: bold;
  }
  .tips {
    color: #f52544;
    margin-left: 10px;
  }
  .copyText {
    margin-top: 10px;
    border: 1px solid #ccc;
    padding: 10px;
    background-color: #f2f2f2;
  }
}
</style>
