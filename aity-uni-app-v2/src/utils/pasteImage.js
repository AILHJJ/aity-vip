// H5 端剪贴板图片粘贴上传工具
// 仅 H5 编译（#ifdef H5），小程序/App 完全不受影响

// #ifdef H5

/**
 * 从 paste 事件中提取图片 File 列表
 * @param {ClipboardEvent} event
 * @returns {File[]}
 */
export function extractPasteImages(event) {
  const items = event.clipboardData && event.clipboardData.items;
  if (!items) return [];

  const files = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'file' && item.type && item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) files.push(file);
    }
  }
  return files;
}

/**
 * 注册全局 paste 监听，剪贴板含图片时回调 handler(files)
 * @param {(files: File[]) => void} handler
 * @returns {() => void} 清理函数
 */
export function setupPasteUpload(handler) {
  const onPaste = (event) => {
    const files = extractPasteImages(event);
    if (files.length > 0) {
      event.preventDefault();
      handler(files);
    }
  };
  document.addEventListener('paste', onPaste);
  return () => document.removeEventListener('paste', onPaste);
}

/**
 * 将 File 转 blob URL 并上传，返回上传结果
 * @param {File} file
 * @param {(filePath: string) => Promise<any>} uploadFn
 * @returns {Promise<any>}
 */
export async function uploadPasteFile(file, uploadFn) {
  const blobUrl = URL.createObjectURL(file);
  try {
    return await uploadFn(blobUrl);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

// #endif

export default {};
