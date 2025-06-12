export default function useMessage({
  // 获取消息列表的API
  getApi,
  readApi,
  url = '',
  pageKey = 'pagenum',
  limitKey = 'pagesize',
  // 是否为管理端
  admin = false,
  // 重置返回的数据
  reset
}) {
  const state = () => ({
    // 更多消息路由地址
    url,
    loading: false,
    readLoading: false,
    // 消息列表
    messageList: [],
    // 未读条数
    unreadCount: 0
  })

  // 计算属性
  const getters = {
    url: state => state.url,
    loading: state => state.loading,
    readLoading: state => state.readLoading,
    // 消息列表
    messageList: state => state.messageList,
    // 未读条数
    unreadCount: state => state.unreadCount
  }

  // 设置 state 的值
  const mutations = {
    // 获取消息列表
    GET_MESSAGE_LIST: async state => {
      state.loading = true
      try {
        // 调用 API
        const { data: res } = await getApi({
          sidx: 'id', // 排序字段
          order: 'desc', // 排序方式，如：asc、desc
          [pageKey]: 1,
          [limitKey]: 100
        })
        if (res.code !== 1) return

        // 重置返回的数据
        if (reset) {
          reset(state, res)
          return
        }

        const obj = res.data || {}
        // 设置消息列表，如果为管理端则返回已开启的公告
        if (admin) {
          state.messageList = (obj.list || []).filter(
            item => item.status && item.type == 2
          )
        } else {
          state.messageList = obj.list || []
        }

        // 设置未读条数，
        let unreadCount = 0
        state.messageList.forEach(item => {
          if (!item.readStatus) {
            unreadCount++
          }
        })
        state.unreadCount = unreadCount
      } finally {
        state.loading = false
      }
    },
    // 消息已读|根据ID获取消息详情
    READ_MESSAGE: async (state, id) => {
      if (!readApi) return
      state.readLoading = true
      try {
        const { data: res } = await readApi({
          id
        })

        if (res.code !== 1) return
        if (state.unreadCount > 0) {
          state.unreadCount--
        }
      } finally {
        state.readLoading = false
      }
    }
  }

  // 调用 mutations 的方法
  const actions = {
    // 获取消息列表
    getMessageList({ commit }) {
      commit('GET_MESSAGE_LIST')
    },
    // 消息已读
    readMessage({ commit }, id) {
      commit('READ_MESSAGE', id)
    }
  }

  return {
    state,
    getters,
    mutations,
    actions
  }
}
