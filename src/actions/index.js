export const changeScreenSize = size => ({
  type: 'CHANGE_SCREEN_SIZE',
  size,
})

export const addPageInfo = payload => ({
  type: 'ADD_PAGE_INFO',
  payload,
})

export const showProgressBar = payload => ({
  type: 'SHOW_PROGRESSBAR',
  payload,
})