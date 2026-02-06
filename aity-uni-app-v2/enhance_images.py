import re

# Read the file
with open('src/pages/message-detail/message-detail.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add image state management variables after messageId = ref(0)
state_vars = '''
// 图片加载状态管理
const imageStates = ref({})  // 存储每个图片的加载状态: 'loading' | 'success' | 'error'
const imageRetryCount = ref({})  // 存储每个图片的重试次数
const maxRetryCount = 3  // 最大重试次数
'''

# Pattern to find the location after messageId declaration
pattern1 = r"(const messageId = ref\(0\)\n)"
replacement1 = r"\1" + state_vars
content = re.sub(pattern1, replacement1, content)

# 2. Add initializeImageStates function after getMessageTypeLabel
init_func = '''
// 初始化图片加载状态
const initializeImageStates = () => {
\tif (message.value && message.value.images && message.value.images.length > 0) {
\t\tmessage.value.images.forEach((_, index) => {
\t\t\tif (!imageStates.value[index]) {
\t\t\t\timageStates.value[index] = 'loading'
\t\t\t}
\t\t\tif (!imageRetryCount.value[index]) {
\t\t\t\timageRetryCount.value[index] = 0
\t\t\t}
\t\t})
\t}
}

'''

# Pattern to find location after getMessageTypeLabel function
pattern2 = r"(const getMessageTypeLabel = \(type\) => \{\n\treturn MESSAGE_TYPE_LABELS\[type\] \|\| type\n\})"
replacement2 = r"\1" + init_func
content = re.sub(pattern2, replacement2, content)

# 3. Replace the message images template section
old_template = r"""<!-- \u6d88\u606f\u56fe\u7247 -->
\t\t\t<view v-if="message\.images && message\.images\.length > 0" class="message-images">
\t\t\t\t<view
\t\t\t\t\tv-for="\(img, index\) in message\.images"
\t\t\t\t\t:key="index"
\t\t\t\t\tclass="image-wrapper"
\t\t\t\t\t@click="previewImage\(index\)"
\t\t\t\t>
\t\t\t\t\t<image
\t\t\t\t\t\t:src="img"
\t\t\t\t\t\tclass="message-image"
\t\t\t\t\t\tmode="widthFix"
\t\t\t\t\t\t:lazy-load="true"
\t\t\t\t\t\t@error="handleImageError\(index\)"
\t\t\t\t\t\t@load="handleImageLoad\(index\)"
\t\t\t\t\t\t:show-loading="true"
\t\t\t\t\t\t:show-error="true"
\t\t\t\t\t/>
\t\t\t\t\t<view class="image-mask">
\t\t\t\t\t\t<text class="image-hint">\u70b9\u51fb\u9884\u89c8</text>
\t\t\t\t\t</view>
\t\t\t\t</view>
\t\t\t</view>"""

new_template = r"""<!-- \u6d88\u606f\u56fe\u7247 -->
\t\t\t<view v-if="message.images && message.images.length > 0" class="message-images">
\t\t\t\t<view
\t\t\t\t\tv-for="(img, index) in message.images"
\t\t\t\t\t:key="index"
\t\t\t\t\tclass="image-wrapper"
\t\t\t\t\t@click="handleImageWrapperClick(index)"
\t\t\t\t>
\t\t\t\t\t<!-- \u6b63\u5e38\u52a0\u8f7d\u6216\u52a0\u8f7d\u4e2d\u7684\u56fe\u7247 -->
\t\t\t\t\t<image
\t\t\t\t\t\tv-if="imageStates[index] !== 'error'"
\t\t\t\t\t\t:src="img"
\t\t\t\t\t\tclass="message-image"
\t\t\t\t\t\tmode="widthFix"
\t\t\t\t\t\t:lazy-load="true"
\t\t\t\t\t\t@error="handleImageError(index)"
\t\t\t\t\t\t@load="handleImageLoad(index)"
\t\t\t\t\t\t:show-loading="true"
\t\t\t\t\t\t:show-error="false"
\t\t\t\t\t/>
\t\t\t\t\t<!-- \u52a0\u8f7d\u5931\u8d25\u7684\u5360\u4f4d\u7b26 -->
\t\t\t\t\t<view v-else class="image-error-placeholder">
\t\t\t\t\t\t<text class="error-icon">\u274c</text>
\t\t\t\t\t\t<text class="error-text">\u56fe\u7247\u52a0\u8f7d\u5931\u8d25</text>
\t\t\t\t\t\t<button class="retry-btn" @click.stop="retryLoadImage(index)">
\t\t\t\t\t\t\t<text class="retry-icon">\ud83d\udd04</text>
\t\t\t\t\t\t\t<text>\u91cd\u65b0\u52a0\u8f7d</text>
\t\t\t\t\t\t</button>
\t\t\t\t\t</view>
\t\t\t\t\t<!-- \u52a0\u8f7d\u4e2d\u7684\u906e\u7f69 -->
\t\t\t\t\t<view v-if="imageStates[index] === 'loading'" class="image-loading-mask">
\t\t\t\t\t\t<view class="loading-spinner-small"></view>
\t\t\t\t\t</view>
\t\t\t\t\t<!-- \u6b63\u5e38\u56fe\u7247\u7684\u9884\u89c8\u63d0\u793a\u906e\u7f69 -->
\t\t\t\t\t<view v-if="imageStates[index] === 'success'" class="image-mask">
\t\t\t\t\t\t<text class="image-hint">\u70b9\u51fb\u9884\u89c8</text>
\t\t\t\t\t</view>
\t\t\t\t</view>
\t\t\t</view>"""

content = re.sub(old_template, new_template, content)

# 4. Add initialization call in loadMessageDetail after message.value = messageData
pattern3 = r"(message\.value = messageData\n\s+isFavorited\.value = messageData\.isFavorited \|\| false)"
replacement3 = r"\1\n\n\t\t\t// \u521d\u59cb\u5316\u56fe\u7247\u52a0\u8f7d\u72b6\u6001\n\t\t\tinitializeImageStates()"
content = re.sub(pattern3, replacement3, content)

# 5. Replace handleImageError function
old_error_func = r"// \u5904\u7406\u56fe\u7247\u52a0\u8f7d\u9519\u8bef\nconst handleImageError = \(index\) => \{\n\tconsole\.error\(`\u56fe\u7247 \$\{index\} \u52a0\u8f7d\u5931\u8d25`\)\n\tuni\.showToast\(\{\n\t\ttitle: '\u56fe\u7247\u52a0\u8f7d\u5931\u8d25',\n\t\ticon: 'none'\n\t\}\)\n\}"

new_error_func = r"""// \u5904\u7406\u56fe\u7247\u52a0\u8f7d\u9519\u8bef
const handleImageError = (index) => {
\tconsole.error(`\u56fe\u7247 ${index} \u52a0\u8f7d\u5931\u8d25`, message.value.images[index])
\timageStates.value[index] = 'error'
\t
\t// \u53ea\u5728\u7b2c\u4e00\u6b21\u5931\u8d25\u65f6\u663e\u793atoast
\tif (imageRetryCount.value[index] === 0) {
\t\tuni.showToast({
\t\t\ttitle: '\u56fe\u7247\u52a0\u8f7d\u5931\u8d25',
\t\t\ticon: 'none',
\t\t\tduration: 2000
\t\t})
\t}
}"""

content = re.sub(old_error_func, new_error_func, content)

# 6. Replace handleImageLoad function
old_load_func = r"// \u5904\u7406\u56fe\u7247\u52a0\u8f7d\u6210\u529f\nconst handleImageLoad = \(index\) => \{\n\tconsole\.log\(`\u56fe\u7247 \$\{index\} \u52a0\u8f7d\u6210\u529f`\)\n\}"

new_load_func = r"""// \u5904\u7406\u56fe\u7247\u52a0\u8f7d\u6210\u529f
const handleImageLoad = (index) => {
\tconsole.log(`\u56fe\u7247 ${index} \u52a0\u8f7d\u6210\u529f`)
\timageStates.value[index] = 'success'
\timageRetryCount.value[index] = 0  // \u91cd\u7f6e\u91cd\u8bd5\u8ba1\u6570
}"""

content = re.sub(old_load_func, new_load_func, content)

# 7. Replace previewImage function with handleImageWrapperClick
old_preview = r"// \u9884\u89c8\u56fe\u7247\nconst previewImage = \(index\) => \{\n\tuni\.previewImage\(\{\n\t\turls: message\.value\.images,\n\t\tcurrent: index,\n\t\tfail: \(err\) => \{\n\t\t\tconsole\.error\('\u9884\u89c8\u56fe\u7247\u5931\u8d25:', err\)\n\t\t\tuni\.showToast\(\{\n\t\t\t\ttitle: '\u9884\u89c8\u5931\u8d25',\n\t\t\t\ticon: 'none'\n\t\t\t\}\)\n\t\t\}\n\t\}\)\n\}"

new_functions = r"""// \u5904\u7406\u56fe\u7247\u5bb9\u5668\u70b9\u51fb
const handleImageWrapperClick = (index) => {
\t// \u53ea\u6709\u52a0\u8f7d\u6210\u529f\u7684\u56fe\u7249\u624d\u80fd\u9884\u89c8
\tif (imageStates.value[index] === 'success') {
\t\tpreviewImage(index)
\t}
}

// \u9884\u89c8\u56fe\u7247
const previewImage = (index) => {
\t// \u8fc7\u6ee4\u51fa\u52a0\u8f7d\u6210\u529f\u7684\u56fe\u7249
\tconst validImages = message.value.images.filter((_, idx) => imageStates.value[idx] === 'success')
\tconst validIndex = validImages.indexOf(message.value.images[index])
\t
\tif (validIndex === -1) {
\t\tuni.showToast({
\t\t\ttitle: '\u56fe\u7247\u65e0\u6cd5\u9884\u89c8',
\t\t\ticon: 'none'
\t\t})
\t\treturn
\t}
\t
\tuni.previewImage({
\t\turls: validImages,
\t\tcurrent: validIndex,
\t\tfail: (err) => {
\t\t\tconsole.error('\u9884\u89c8\u56fe\u7247\u5931\u8d25:', err)
\t\t\tuni.showToast({
\t\t\t\ttitle: '\u9884\u89c8\u5931\u8d25',
\t\t\t\ticon: 'none'
\t\t\t})
\t\t}
\t})
}

// \u91cd\u65b0\u52a0\u8f7d\u56fe\u7247
const retryLoadImage = (index) => {
\t// \u68c0\u67e5\u91cd\u8bd5\u6b21\u6570
\tif (imageRetryCount.value[index] >= maxRetryCount) {
\t\tuni.showModal({
\t\t\ttitle: '\u91cd\u8bd5\u5931\u8d25',
\t\t\tcontent: '\u56fe\u7247\u591a\u6b21\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u7f51\u7edc\u8fde\u63a5\u6216\u7a0d\u540e\u518d\u8bd5',
\t\t\tshowCancel: false,
\t\t\tconfirmText: '\u6211\u77e5\u9053\u4e86'
\t\t})
\t\treturn
\t}
\t
\t// \u589e\u52a0\u91cd\u8bd5\u8ba1\u6570
\timageRetryCount.value[index]++
\t
\t// \u91cd\u7f6e\u72b6\u6001\u4e3aloading
\timageStates.value[index] = 'loading'
\t
\t// \u663e\u793a\u91cd\u8bd5\u63d0\u793a
\tuni.showToast({
\t\ttitle: `\u6b63\u5728\u91cd\u65b0\u52a0\u8f7d (${imageRetryCount.value[index]}/${maxRetryCount})`,
\t\ticon: 'loading',
\t\tduration: 1000
\t})
\t
\t// \u5f3a\u5236\u89e6\u53d1\u91cd\u65b0\u6e32\u67d3\uff08Vue\u4f1a\u5728\u4e0b\u4e00\u4e2atick\u66f4\u65b0\u7ec4\u4ef6\uff09
\tsetTimeout(() => {
\t\t// \u72b6\u6001\u5df2\u91cd\u7f6e\uff0c\u56fe\u7247\u7ec4\u4ef6\u4f1a\u81ea\u52a8\u91cd\u65b0\u52a0\u8f7d
\t}, 100)
}"""

content = re.sub(old_preview, new_functions, content)

# 8. Add new CSS styles for image error handling
css_styles = r"""

// \u56fe\u7247\u52a0\u8f7d\u5931\u8d25\u5360\u4f4d\u7b26\u6837\u5f0f
.image-error-placeholder {
\tdisplay: flex;
\tflex-direction: column;
\talign-items: center;
\tjustify-content: center;
\tmin-height: 300rpx;
\tpadding: 60rpx 30rpx;
\tbackground: #fafafa;
\tborder: 2rpx dashed #e0e0e0;
\tborder-radius: 12rpx;
}

.error-icon {
\tfont-size: 80rpx;
\tmargin-bottom: 20rpx;
}

.error-text {
\tfont-size: 28rpx;
\tcolor: #999999;
\tmargin-bottom: 30rpx;
}

.retry-btn {
\tdisplay: flex;
\talign-items: center;
\tjustify-content: center;
\tgap: 10rpx;
\tpadding: 16rpx 32rpx;
\tbackground: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
\tcolor: #ffffff;
\tfont-size: 28rpx;
\tborder: none;
\tborder-radius: 8rpx;
\tbox-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
\ttransition: all 0.3s ease;

\t&:active {
\t\ttransform: scale(0.95);
\t\tbox-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
\t}
}

.retry-icon {
\tfont-size: 32rpx;
}

// \u56fe\u7249\u52a0\u8f7d\u4e2d\u906e\u7f69
.image-loading-mask {
\tposition: absolute;
\ttop: 0;
\tleft: 0;
\tright: 0;
\tbottom: 0;
\tdisplay: flex;
\talign-items: center;
\tjustify-content: center;
\tbackground: rgba(245, 245, 245, 0.9);
\tz-index: 1;
}

.loading-spinner-small {
\twidth: 50rpx;
\theight: 50rpx;
\tborder: 3rpx solid #e0e0e0;
\tborder-top-color: #667eea;
\tborder-radius: 50%;
\tanimation: spin 0.8s linear infinite;
}

// Add min-height to .image-wrapper
"""

# Find the .image-wrapper CSS rule and add min-height
pattern4 = r"(\.image-wrapper \{\n\tposition: relative;\n\twidth: 100%;)"
replacement4 = r"\1\n\tmin-height: 200rpx;"
content = re.sub(pattern4, replacement4, content)

# Insert CSS styles before the closing </style> tag
content = content.replace('</style>', css_styles + '\n</style>')

# Write back
with open('src/pages/message-detail/message-detail.vue', 'w', encoding='utf-8') as f:
    f.write(content)

print("Image loading enhancement applied successfully!")
