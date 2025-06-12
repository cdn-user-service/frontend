<template>
  <div>
    <span class="text-primary cursor-pointer ml-sm underline" @click="show()">
      <i class="el-icon-info" />
      A监控切换规则
    </span>

    <ants-dialog
      title="A监控切换规则说明"
      v-model="dialogVisible"
      ref="dialogRef"
      width="1000px"
      top="5vh"
      :footer="false"
    >
      <div class="-mt-sm" style="line-height: 2">
        <div class="mb-lg">
          本文档大约会花费您5分钟时间，但对您的网站很重要，如果您要启用宕机切换功能，请务必阅读明白。
        </div>
        <TitleBorder title="宕机切换介绍" />
        <div class="mt-df mb-lg pl-df">
          目前A监控只对在{{ $root.webName }}解析的域名提供监控。
          当监控节点探测到用户添加监控的某域名指向的IP或CNAME无法正常访问时，
          A监控将依据用户设置的切换规则来修改相关的域名记录，以避免用户访问到宕机的服务器。
        </div>

        <TitleBorder title="名词解释" />
        <div class="mt-df mb-lg pl-df">
          a.
          暂停：停止解析当前宕机的域名记录，用户将不会访问到该记录指向的IP。<br />
          b. 切换：修改当前宕机的域名记录的记录值，用户将访问到修改后的新IP。
          <br />
          c. 可用记录：该域名记录的记录值（IP或CNAME）可以正常访问。
        </div>

        <TitleBorder title="切换规则说明" />
        <div class="mt-df mb-lg pl-df">
          <div class="mb-df">
            为了适应不同用户的需求，A监控提供了以下4种切换规则：
          </div>
          <div class="font-bold">1. 不切换</div>
          <div class="my-df">不对宕机的域名记录进行任何操作。</div>

          <div class="font-bold">2. 智能暂停</div>
          <div class="my-df">
            a. 如果非默认线路宕机，则暂停该记录的解析；<br />

            b. 如果默认线路宕机，且默认线路还存在其他可用记录，则暂停该记录的解析；<br />

            c. 如果默认线路宕机，且默认线路无其他可用记录，则把该宕机IP随机切换为其他可用线路IP；<br />

            d. 如果默认线路宕机，且所有线路记录均不可用，则无操作；<br />
            <div>参考下图：</div>
            <img src="@/assets/img/dns-amonitor-1.jpg" alt="amonitor" />

            <div class="font-bold my-df">
              注意：可能会出现类似情况，电信线路设置了2个IP，一个IP宕机后，电信的所有用户都访问另一个IP，该服务器负载会翻倍。
            </div>
          </div>

          <div class="font-bold">3. 智能切换（请谨慎启用）</div>
          <div class="my-df">
            a. 如果默认线路宕机，则随机切换到非默认线路的可用IP；<br />

            b. 如果非默认线路宕机，则优先切换到默认线路的可用IP；<br />

            c.
            如果非默认线路宕机，但默认线路无可用记录，则切换到其他可用线路记录；<br />

            d. 如果所有线路记录均不可用，则无操作。<br />

            <div>参考下图：</div>
            <img src="@/assets/img/dns-amonitor-2.jpg" alt="amonitor" />
            <div class="font-bold my-df">
              注意：会出现跨线路跨运营商切换的情况！
            </div>
          </div>

          <div class="font-bold">4. 自定义切换</div>
          <div class="my-df">
            用户可以对一条域名记录设置一个或多个备用IP，当宕机时，则切换到可用的备用IP。
          </div>
        </div>
      </div>
    </ants-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false,
      loading: false
    }
  },
  methods: {
    show() {
      this.dialogVisible = true
    }
  }
}
</script>

<style lang="scss"></style>
