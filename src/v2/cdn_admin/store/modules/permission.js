import { defaultRoutes } from '../../router/default'
import { Layout } from '@/components/layouts'
import ParentView from '@/components/parent-view'

const state = () => ({
  routers: defaultRoutes,
  addRouters: [],
  sidebarRouters: []
})

const getters = {
  permission_routers: (state) => state.routers,
  // 菜单路由
  addRouters: (state) => state.addRouters,
  // 用不到
  sidebarRouters: (state) => state.sidebarRouters
}

const mutations = {
  SET_ROUTERS: (state, routers) => {
    routers.forEach((item) => {
      console.log('item', item)
      if (
        item.menuId === 175 &&
        item.children.some((child) => child.menuId === 232)
      ) {
        item.redirect = '/cdn/site/domain'
      } else {
        item.redirect = getDeepPath(item.children)
      }
    })
    state.addRouters = routers
    state.routers = defaultRoutes.concat(routers)
    // console.log('setRouters', state.routers)
  },
  SET_SIDEBAR_ROUTERS: (state, routers) => {
    state.sidebarRouters = defaultRoutes.concat(routers)
  }
}

const actions = {
  // 所有可访问路由
  GenerateRoutes({ commit }, asyncRouter) {
    // console.log('asyncRouter', asyncRouter);
    commit('SET_ROUTERS', asyncRouter)
  },
  // 侧边栏显示的菜单路由
  SetSidebarRouters({ commit }, sidebarRouter) {
    // console.log('sidebarRouter', sidebarRouter);
    commit('SET_SIDEBAR_ROUTERS', sidebarRouter)
  }
}

// 写一个方法，获取最深层数组,并且遍历到最深层数组的第一个的时候立刻终止遍历，获取第一个数组的path,然后返回path
export const getDeepPath = (arr) => {
  let path = ''
  console.log('arr===>', arr)
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].children && arr[i].children.length > 0) {
      path = getDeepPath(arr[i].children)
      break
    } else {
      path = arr[i].path
      break
    }
  }
  return path
}
// 加载路由
export const loadView = (view) => {
  return (resolve) => require([`../../views${view}`], resolve)
}

// 递归加载路由
export const loadRoutes = (children = [], parentPath = '') => {
  // console.log('children===>', children)
  return children.filter((item) => {
    item.children = item.list || []
    item.list = []
    item.meta = JSON.parse(item.meta || {})
    item.path = parentPath ? `${parentPath}/${item.url}` : item.url
    // 重定向
    if (item.meta.redirect) {
      item.redirect = item.path + '/' + item.meta.redirect
    }
    if (!item.name) {
      // 设置组件名称name
      item.name = item.path.slice(1).replace(/\//g, '-')
    }

    // 如果为顶级菜单
    if (item.type == 0) {
      item.component = Layout
      item.children = loadRoutes(item.children, item.path)
      return item
    }

    const { isSub, hSub } = item.meta

    // 如果为 sub菜单，则不需要组件
    if (isSub) {
      item.component = ParentView
      item.children = loadRoutes(item.children, item.path)
      return item
    }

    // 加载组件
    if (!item.component) {
      item.component = loadView(item.path)
    }

    // 如果没有children则直接返回
    if (item.children.length) {
      item.children = loadRoutes(item.children, item.path)
    }

    // 如果为水平菜单
    if (hSub) {
      return item
    }

    // 其他
    return item
  })
}

export default {
  state,
  getters,
  mutations,
  actions
}
