<template>
  <ants-dialog
    v-model="dialogVisible"
    title="节点终端"
    width="1200px"
    top="0"
    ref="dialogRef"
    @closed="closed"
    class="terminal-dialog"
  >
    <div style="height: 30px" class="bg-ants-bg-5 flex terminal-tab">
      <div
        class="bg-ants-bg-5 px-lg h-full flex items-center"
        style="width: 220px"
      >
        <TitleBorder title="会话管理" />
      </div>

      <ul class="flex items-center">
        <li
          v-for="nodeId in openedNodeIds"
          :key="nodeId"
          class="terminal-tab-item h-full px-sm truncate flex items-center justify-between bg-ants-bg-1 cursor-pointer leading-none"
          style="min-width: 130px"
          :class="{ 'terminal-tab-item--active': nodeId == activeNodeId }"
          @click="changeTerm(nodeId)"
        >
          <span style="font-size: 13px">
            <span
              style="padding: 4px"
              class="inline-block rounded-full mr-2"
              :class="socketsStatus[nodeId] == 1 ? 'bg-success' : 'bg-error'"
            ></span>
            <span class="pr-lg">
              {{ allNodeObj[nodeId] || '未选择节点' }}
            </span>
          </span>

          <span
            class="terminal-tab-close text-ants-text-6"
            style="font-size: 14px"
            @click="doCloseTerm(nodeId)"
          >
            <strong class="el-icon-close"></strong>
          </span>
        </li>
      </ul>
    </div>

    <div class="flex pr-sm h-full terminal-main">
      <div
        class="terminal-node h-full overflow-y-auto terminal-height border-t-0 border-2 border-ants-bg-5"
      >
        <el-tree
          class="pt-sm"
          :data="nodeList"
          :props="{
            label: 'ip',
            children: 'childList'
          }"
          @node-click="handleNodeClick"
          node-key="id"
          :expand-on-click-node="false"
        >
          <span slot-scope="{ node }">
            <i class="el-icon-monitor mr-2 text-primary"></i>
            <span>{{ node.label }}</span>
          </span>
        </el-tree>
      </div>

      <ul class="flex-1 terminal-input h-full">
        <li
          v-for="item in openedNodeIds"
          :key="item"
          class="h-full"
          :class="item == activeNodeId ? 'block' : 'hidden'"
        >
          <div class="h-full" :id="`XtermBox${item}`"></div>
        </li>
      </ul>
    </div>

    <span slot="footer"></span>
  </ants-dialog>
</template>

<script>
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { AttachAddon } from 'xterm-addon-attach'
import { WebLinksAddon } from 'xterm-addon-web-links'
import 'xterm/css/xterm.css'
// import { debounce } from 'throttle-debounce'
import { getLocation } from '@/utils/env'

const PROCESS_NAME = process.env.VUE_APP_NAME

const { apiRoot } = require(`@/v2/${PROCESS_NAME}/config`)

// 存放已经打开的终端
var openedTerms = {}
// 存放已经建立的socket连接
var openedSockets = {}

export default {
  props: {
    // 节点树，id 为节点ID，ip为节点IP，childList为子节点列表
    nodeList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,

      // 已打开的终端ID数组
      openedNodeIds: ['default'],
      // 当前激活的终端，绑定节点ID
      activeNodeId: 'default',
      // 连接状态
      socketsStatus: {}
    }
  },
  computed: {
    // 所有的节点对象，key为节点ID，value为节点IP
    allNodeObj() {
      const obj = {}
      // 递归获取所有节点
      const getAllNode = (list = []) => {
        list.forEach((item) => {
          obj[item.id] = item.ip
          if ((item.childList || []).length) {
            getAllNode(item.childList)
          }
        })
      }
      getAllNode(this.nodeList)
      return obj
    }
  },
  methods: {
    // 对话框显示
    show(row = {}) {
      this.dialogVisible = true

      // 初始化默认打开的节点终端
      //   this.allNodeObj[row.id] = row.ip
      this.$set(this.openedNodeIds, 0, row.id)
      this.activeNodeId = row.id

      // 初始化终端
      this.termInit(row.id)
    },

    // 点击节点
    handleNodeClick({ id, ip }) {
      this.$nextTick(() => {
        this.activeNodeId = id
        console.log('切换终端1111', this.openedNodeIds, id)
        // 如果已经打开了该节点的终端，则切换到该终端
        if (this.openedNodeIds.includes(id)) {
          this.changeTerm(id)
          return
        }

        // 如果当前打开终端为默认终端 ‘default’，则关闭
        if (this.activeNodeId == 'default') {
          this.$set(this.openedNodeIds, 0, id)
        } else {
          this.openedNodeIds.push(id)
        }

        this.termInit(id)
      })
    },

    // 切换终端
    changeTerm(nodeId) {
      this.$nextTick(() => {
        this.activeNodeId = nodeId
        console.log('changeTerm', nodeId, openedTerms[nodeId])
        setTimeout(() => {
          if (!openedTerms[nodeId]) return
          openedTerms[nodeId].FitAddon.fit()
          openedTerms[nodeId].focus()
        }, 100)
      })
    },

    // terms初始化
    termInit(nodeId) {
      if (!nodeId) return
      // 判断当前节点是否已创建终端
      if (openedTerms[nodeId]) {
        openedTerms[nodeId].dispose()
      }

      this.$nextTick(() => {
        // 创建终端
        openedTerms[nodeId] = new Terminal({
          // 光标闪烁
          cursorBlink: true,
          fontSize: 14,
          screenKeys: true,
          useStyle: true,
          // 当行的滚动超过初始值时保留的行视窗，越大回滚能看的内容越多，
          scrollback: 100
        })
        openedTerms[nodeId].open(document.getElementById(`XtermBox${nodeId}`))

        openedTerms[nodeId].WebLinksAddon = new WebLinksAddon()
        openedTerms[nodeId].loadAddon(openedTerms[nodeId].WebLinksAddon)
        const fitAddon = new FitAddon()
        openedTerms[nodeId].FitAddon = fitAddon
        openedTerms[nodeId].loadAddon(fitAddon)

        setTimeout(() => {
          // 使终端尺寸自适应
          fitAddon.fit()
        }, 50)

        // 绑定resize事件
        window.addEventListener('resize', () => {
          fitAddon.fit()
        })

        if (nodeId === 'default') {
          openedTerms[nodeId].write(
            'Welcome to Ants DNS, please select a node to connect.\r\n'
          )
          return
        }
        // 建立sokect连接
        this.socketInit(nodeId)
        // 监听终端输入
        this.termOnData(nodeId)
        // focus终端输入框
        openedTerms[nodeId].focus()
        console.log('openedTerms', openedTerms)
      })
    },

    // socket初始化
    socketInit(nodeId) {
      if (!nodeId) return
      // 判断当前节点是否已经建立连接
      if (
        !openedSockets[nodeId] ||
        openedSockets[nodeId].readyState === 2 ||
        openedSockets[nodeId].readyState === 3
      ) {
        // 获取协议
        const { protocol, hostname } = getLocation()

        let rootPath = `${protocol === 'https:' ? 'wss' : 'ws'}://${hostname}`

        // 如果是本地开发环境，则使用本地IP
        if (hostname === 'localhost') {
          rootPath =
            PROCESS_NAME === 'dns_admin'
              ? 'ws://www.vedns.com'
              : `ws://${this.$root.demoWebSite}`
        }

        // 建立连接
        openedSockets[nodeId] = new WebSocket(
          `${rootPath}${apiRoot}ws_ssh?cid=${nodeId}`
        )
        // `ws://192.168.1.168:18080/api/ws_ssh?cid=${nodeId}`

        // `ws://121.62.17.153:8081/api/ws_ssh?cid=${nodeId}`

        console.log(
          'openedSockets[nodeId].readyState',
          openedSockets[nodeId].readyState
        )
        // 如果正在连接
        if (openedSockets[nodeId].readyState === 0) {
          // 终端写入连接中提示信息
          openedTerms[nodeId].write('\r\n正在连接...\r\n')
        }

        // 接收服务器消息
        openedSockets[nodeId].onmessage = (event) => {
          const { data } = event

          if (!data) return
          // 将收到的数据输出到终端，终端只显示后台返回的数据，不显示用户输入的数据，因为后台会将用户输入的数据返回
          openedTerms[nodeId].write(data)
        }

        // 连接成功
        openedSockets[nodeId].onopen = () => {
          // 终端写入连接成功提示信息
          openedTerms[nodeId].write('\r\nSuccessfully connected!\r\n')
          openedTerms[nodeId].write('\r\n')

          // AttachAddon
          // openedTerms[nodeId].AttachAddon = new AttachAddon(
          //   openedSockets[nodeId]
          // )
          // openedTerms[nodeId].loadAddon(openedTerms[nodeId].AttachAddon)

          this.setTabStatus(nodeId, 1)
        }

        // 连接关闭
        openedSockets[nodeId].onclose = (event) => {
          openedTerms[nodeId] && openedTerms[nodeId].write('\r\n连接断开！\r\n')
          this.setTabStatus(nodeId)
        }

        // 连接错误
        openedSockets[nodeId].onerror = (event) => {
          openedTerms[nodeId] &&
            openedTerms[nodeId].write('\r\nconnection failed!\r\n')
          this.setTabStatus(nodeId)
        }
      }
    },

    // 设置tab 状态
    setTabStatus(nodeId, status = 0) {
      this.$set(this.socketsStatus, nodeId, status)
    },

    // 重新连接
    reConnect(nodeId) {
      if (!nodeId) return
      if (this.socketsStatus[nodeId] === 2) return
      // 2 = 标识正在连接
      this.setTabStatus(nodeId, 2)
      openedTerms[nodeId].write('\r\n连接丢失,正在尝试重新连接...\r\n')
      // 重新连接
      this.socketInit(nodeId)
    },

    // 终端输入数据
    termOnData(nodeId) {
      if (!openedTerms[nodeId]) return
      openedTerms[nodeId].onData((data) => {
        try {
          console.log(
            'onData',
            nodeId,
            data,
            '---socket状态:',
            this.socketsStatus[nodeId]
          )
          if (data == '\r') {
            console.log('按下回车')
          }
          if (this.socketsStatus[nodeId] !== 1) {
            this.reConnect(nodeId)
            return
          }
          // 发送数据
          openedSockets[nodeId].send(data)
        } catch (e) {
          this.reConnect(nodeId)
          throw e
        }
      })
    },

    // 关闭终端
    doCloseTerm(nodeId) {
      if (this.activeNodeId === 'default') return
      // 关闭当前终端切换到前面一个终端
      if (this.openedNodeIds.length === 1) {
        this.activeNodeId = 'default'
      } else {
        // 移除当前终端
        setTimeout(() => {
          this.$nextTick(() => {
            const termIndex = this.openedNodeIds.indexOf(nodeId)
            this.openedNodeIds.splice(termIndex, 1)
            this.activeNodeId =
              this.openedNodeIds[this.openedNodeIds.length - 1]
          })
        }, 50)
      }

      // 销毁终端、socket连接
      openedTerms[nodeId].dispose()
      delete openedTerms[nodeId]
      openedSockets[nodeId].close()
      delete openedSockets[nodeId]
    },

    // 对话框关闭
    closed() {
      // 销毁所有终端、断开socket连接
      Object.keys(openedTerms).forEach((key) => {
        openedTerms[key] && openedTerms[key].dispose()
        openedSockets[key] && openedSockets[key].close()
      })
      this.openedNodeIds = ['default']
      this.activeNodeId = 'default'
    }
  }
}
</script>

<style lang="scss" scoped>
.terminal-tab {
  &-item {
    // border-radius: 6px 6px 0 0;
    position: relative;
    padding-right: 10px;
    border: 1px solid theme('colors.ants-border-1');
    border-bottom: 0;
    &--active {
      background-color: #1a1c28;
      color: #fefefe;
      border: 0;
    }
    .terminal-tab-close {
      position: absolute;
      right: 6px;
    }
  }
}

.terminal-main {
  height: calc(100vh - 150px);
}
.is-fullscreen.terminal-dialog {
  .terminal-main {
    height: calc(100vh - 100px);
  }
}
</style>

<style lang="scss">
.terminal-dialog {
  .el-dialog.ants-dialog {
    padding-bottom: 8px !important;
    .el-dialog__footer {
      padding: 0;
    }
  }
  .ants-dialog_body {
    padding: 0 !important;
    max-height: calc(100vh - 50px) !important;
  }

  .terminal-node {
    width: 220px;
  }
  .terminal-input {
    background: #000;
  }

  .xterm {
    padding: 5px;
    /*滚动条的轨道*/
    ::-webkit-scrollbar-track {
      background-color: #000;
    }

    /*边角，即两个滚动条的交汇处*/
    ::-webkit-scrollbar-corner {
      background-color: #000;
    }
  }
}
</style>
