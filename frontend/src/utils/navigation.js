let router = null

export const setRouter = (routerInstance) => {
  router = routerInstance
}

export const navigateTo = (url) => {
  if (typeof uni !== 'undefined') {
    uni.navigateTo({
      url: url,
      fail: (err) => {
        console.error('Navigation error:', err)
      }
    })
  } else if (router) {
    const path = url.replace('/pages', '').replace('.vue', '')
    router.push(path)
  }
}

export const redirectTo = (url) => {
  if (typeof uni !== 'undefined') {
    uni.redirectTo({
      url: url,
      fail: (err) => {
        console.error('Redirect error:', err)
      }
    })
  } else if (router) {
    const path = url.replace('/pages', '').replace('.vue', '')
    router.replace(path)
  }
}

export const navigateBack = (delta = 1) => {
  if (typeof uni !== 'undefined') {
    uni.navigateBack({
      delta: delta
    })
  } else if (router) {
    router.go(-delta)
  }
}

export const switchTab = (url) => {
  if (typeof uni !== 'undefined') {
    uni.switchTab({
      url: url
    })
  } else if (router) {
    const path = url.replace('/pages', '').replace('.vue', '')
    router.push(path)
  }
}