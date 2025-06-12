<template>
  <div
    class="flex justify-center items-center min-h-full bg-login-bg-color text-white"
  >
    <div class="text-center space-y-12">
      <img src="@/assets/img/404.png" alt="404" />
      <h1 class="text-3xl">
        糟糕，页面走丢了!
      </h1>
      <h6>
        找不到您所请求的页面，请仔细检查您输入的网址是否正确
      </h6>
      <div>
        <el-button
          type="primary"
          icon="el-icon-back"
          size="small"
          @click="$router.go(-1)"
          >返回上一页</el-button
        >
        <el-button
          type="info"
          icon="el-icon-s-home"
          size="small"
          @click="$router.push('/console')"
          >返回首页</el-button
        >
      </div>
    </div>
  </div>
</template>
