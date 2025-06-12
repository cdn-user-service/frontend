<template>
  <el-card class="content-box animated fadeIn">
    <div class="font-bold" slot="header">
      设置域名黑名单
    </div>
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="80px"
    >
      <ants-form-item label="处理方式" prop="type">
        <ants-radio-group v-model="form.type" size="small">
          <ants-radio :label="1" text="解析到CNAME" />
          <ants-radio :label="2" text="随机回复" />
        </ants-radio-group>
      </ants-form-item>
      <ants-form-item label="指定地址" prop="url" v-if="form.type === 1">
        <ants-input v-model="form.url" placeholder="请输入指定地址" />
      </ants-form-item>
      <ants-form-item label="响应内容" prop="content" v-if="form.type === 1">
        <ants-input
          v-model="form.content"
          placeholder="请输入响应内容"
          type="textarea"
          :autosize="{ minRows: 10, maxRows: 20 }"
        />
      </ants-form-item>
    </ants-form>
  </el-card>
</template>

<script>
const defaultForm = {
  id: null,
  type: 1,
  url: '',
  content: ''
}
export default {
  data() {
    return {
      form: {
        ...defaultForm
      },
      formRules: {}
    }
  }
}
</script>
