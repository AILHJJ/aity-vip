/**
 * Markdown渲染器 - 增强版
 * 参考问小达3.0版本实现优化
 * 支持主题内联样式，解决rich-text组件样式隔离问题
 */

/**
 * 主题样式配置 - 内联样式版本
 * 用于rich-text组件，样式需要内联到HTML中
 */
export const ThemeStyles = {
	default: {
		container: 'font-size: 30rpx; line-height: 1.8; color: #333333; word-wrap: break-word;',
		h1: 'font-size: 40rpx; font-weight: 700; color: #1a1a1a; margin: 40rpx 0 20rpx; padding-bottom: 12rpx; border-bottom: 3rpx solid #e0e0e0;',
		h2: 'font-size: 36rpx; font-weight: 600; color: #2c3e50; margin: 32rpx 0 16rpx; padding-bottom: 10rpx; border-bottom: 1rpx solid #e8e8e8;',
		h3: 'font-size: 32rpx; font-weight: 600; color: #34495e; margin: 28rpx 0 14rpx;',
		h4: 'font-size: 30rpx; font-weight: 600; color: #5a6c7d; margin: 24rpx 0 12rpx;',
		h5: 'font-size: 28rpx; font-weight: 500; color: #6a7c8d; margin: 20rpx 0 10rpx;',
		h6: 'font-size: 26rpx; font-weight: 500; color: #7a8c9d; margin: 16rpx 0 8rpx;',
		strong: 'font-weight: 600; color: #1a1a1a;',
		em: 'font-style: italic; color: #555555;',
		del: 'text-decoration: line-through; color: #999999;',
		inlineCode: 'background: #f6f8fa; color: #e83e8c; padding: 4rpx 8rpx; border-radius: 4rpx; font-family: Consolas, Monaco, monospace; font-size: 26rpx;',
		codeBlock: 'background: #282c34; color: #abb2bf; padding: 20rpx; border-radius: 8rpx; overflow-x: auto; margin: 20rpx 0; font-family: Consolas, Monaco, monospace; font-size: 26rpx; line-height: 1.6; white-space: pre-wrap;',
		blockquote: 'margin: 16rpx 0; padding: 16rpx 20rpx; background: #f0f2ff; border-left: 4rpx solid #667eea; color: #555555; font-style: italic; border-radius: 0 8rpx 8rpx 0;',
		link: 'color: #667eea; text-decoration: none; border-bottom: 1rpx dashed #667eea;',
		listItem: 'margin: 8rpx 0; line-height: 1.8; padding-left: 20rpx;',
		orderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		unorderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		divider: 'border: none; border-top: 2rpx solid #e0e0e0; margin: 32rpx 0;',
		table: 'width: 100%; border-collapse: collapse; border: 1rpx solid #e0e0e0; border-radius: 8rpx; overflow: hidden; margin: 24rpx 0; font-size: 28rpx;',
		th: 'font-weight: 600; padding: 12rpx 16rpx; text-align: left; color: #333333; border-bottom: 2rpx solid #e0e0e0; background: #f8f9fa;',
		td: 'padding: 12rpx 16rpx; border-bottom: 1rpx solid #f0f0f0;',
		textUp: 'color: #ff4d4f; font-weight: 500;',
		textDown: 'color: #52c41a; font-weight: 500;',
		textNeutral: 'color: #666666;'
	},
	github: {
		container: 'font-size: 30rpx; line-height: 1.8; color: #24292e; word-wrap: break-word; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;',
		h1: 'font-size: 40rpx; font-weight: 600; color: #1b1f23; margin: 40rpx 0 20rpx; padding-bottom: 16rpx; border-bottom: 2rpx solid #eaecef;',
		h2: 'font-size: 36rpx; font-weight: 600; color: #1b1f23; margin: 32rpx 0 16rpx; padding-bottom: 8rpx; border-bottom: 1rpx solid #eaecef;',
		h3: 'font-size: 32rpx; font-weight: 600; color: #1b1f23; margin: 28rpx 0 14rpx;',
		h4: 'font-size: 30rpx; font-weight: 600; color: #1b1f23; margin: 24rpx 0 12rpx;',
		h5: 'font-size: 28rpx; font-weight: 600; color: #1b1f23; margin: 20rpx 0 10rpx;',
		h6: 'font-size: 26rpx; font-weight: 600; color: #6a737d; margin: 16rpx 0 8rpx;',
		strong: 'font-weight: 600; color: #24292e;',
		em: 'font-style: italic; color: #24292e;',
		del: 'text-decoration: line-through; color: #6a737d;',
		inlineCode: 'background: rgba(27, 31, 35, 0.05); color: #d73a49; padding: 4rpx 8rpx; border-radius: 6rpx; font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace; font-size: 26rpx;',
		codeBlock: 'background: #f6f8fa; color: #24292e; padding: 20rpx; border-radius: 6rpx; overflow-x: auto; margin: 20rpx 0; font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace; font-size: 26rpx; line-height: 1.6; border: 1rpx solid #e1e4e8; white-space: pre-wrap;',
		blockquote: 'margin: 16rpx 0; padding: 0 20rpx; background: #fffef8; border-left: 4rpx solid #dfe2e5; color: #6a737d;',
		link: 'color: #0366d6; text-decoration: none; font-weight: 500;',
		listItem: 'margin: 8rpx 0; line-height: 1.8; padding-left: 20rpx;',
		orderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		unorderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		divider: 'border: none; border-top: 2rpx solid #e1e4e8; margin: 32rpx 0;',
		table: 'width: 100%; border-collapse: collapse; border: 1rpx solid #dfe2e5; border-radius: 6rpx; overflow: hidden; margin: 24rpx 0; font-size: 28rpx;',
		th: 'font-weight: 600; padding: 12rpx 16rpx; text-align: left; color: #24292e; border-bottom: 2rpx solid #dfe2e5; background: #f6f8fa;',
		td: 'padding: 12rpx 16rpx; border-bottom: 1rpx solid #e1e4e8;',
		textUp: 'color: #cb2431; font-weight: 500;',
		textDown: 'color: #28a745; font-weight: 500;',
		textNeutral: 'color: #6a737d;'
	},
	emerald: {
		container: 'font-size: 30rpx; line-height: 1.8; color: #2d3748; word-wrap: break-word;',
		h1: 'font-size: 40rpx; font-weight: 700; color: #065f46; margin: 40rpx 0 20rpx; padding-bottom: 12rpx; border-bottom: 3rpx solid #10b981;',
		h2: 'font-size: 36rpx; font-weight: 600; color: #047857; margin: 32rpx 0 16rpx; padding-bottom: 10rpx; border-bottom: 1rpx solid #a7f3d0;',
		h3: 'font-size: 32rpx; font-weight: 600; color: #059669; margin: 28rpx 0 14rpx;',
		h4: 'font-size: 30rpx; font-weight: 600; color: #10b981; margin: 24rpx 0 12rpx;',
		h5: 'font-size: 28rpx; font-weight: 500; color: #34d399; margin: 20rpx 0 10rpx;',
		h6: 'font-size: 28rpx; font-weight: 500; color: #34d399; margin: 16rpx 0 8rpx;',
		strong: 'font-weight: 600; color: #065f46;',
		em: 'font-style: italic; color: #047857;',
		del: 'text-decoration: line-through; color: #6b7280;',
		inlineCode: 'background: #ecfdf5; color: #059669; padding: 4rpx 8rpx; border-radius: 4rpx; font-family: Consolas, Monaco, monospace; font-size: 26rpx; border: 1rpx solid #a7f3d0;',
		codeBlock: 'background: #064e3b; color: #d1fae5; padding: 20rpx; border-radius: 8rpx; overflow-x: auto; margin: 20rpx 0; font-family: Consolas, Monaco, monospace; font-size: 26rpx; line-height: 1.6; white-space: pre-wrap;',
		blockquote: 'margin: 16rpx 0; padding: 16rpx 20rpx; background: #ecfdf5; border-left: 4rpx solid #10b981; color: #065f46; border-radius: 0 8rpx 8rpx 0;',
		link: 'color: #059669; text-decoration: none; border-bottom: 1rpx dashed #10b981;',
		listItem: 'margin: 8rpx 0; line-height: 1.8; padding-left: 20rpx;',
		orderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		unorderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		divider: 'border: none; border-top: 2rpx solid #a7f3d0; margin: 32rpx 0;',
		table: 'width: 100%; border-collapse: collapse; border: 1rpx solid #a7f3d0; border-radius: 8rpx; overflow: hidden; margin: 24rpx 0; font-size: 28rpx;',
		th: 'font-weight: 600; padding: 12rpx 16rpx; text-align: left; color: #065f46; border-bottom: 2rpx solid #10b981; background: #ecfdf5;',
		td: 'padding: 12rpx 16rpx; border-bottom: 1rpx solid #d1fae5;',
		textUp: 'color: #ef4444; font-weight: 500;',
		textDown: 'color: #10b981; font-weight: 500;',
		textNeutral: 'color: #6b7280;'
	},
	ocean: {
		container: 'font-size: 30rpx; line-height: 1.8; color: #1e293b; word-wrap: break-word;',
		h1: 'font-size: 40rpx; font-weight: 700; color: #0c4a6e; margin: 40rpx 0 20rpx; padding-bottom: 12rpx; border-bottom: 3rpx solid #0ea5e9;',
		h2: 'font-size: 36rpx; font-weight: 600; color: #075985; margin: 32rpx 0 16rpx; padding-bottom: 10rpx; border-bottom: 1rpx solid #bae6fd;',
		h3: 'font-size: 32rpx; font-weight: 600; color: #0369a1; margin: 28rpx 0 14rpx;',
		h4: 'font-size: 30rpx; font-weight: 600; color: #0284c7; margin: 24rpx 0 12rpx;',
		h5: 'font-size: 28rpx; font-weight: 500; color: #0ea5e9; margin: 20rpx 0 10rpx;',
		h6: 'font-size: 28rpx; font-weight: 500; color: #0ea5e9; margin: 16rpx 0 8rpx;',
		strong: 'font-weight: 600; color: #0c4a6e;',
		em: 'font-style: italic; color: #075985;',
		del: 'text-decoration: line-through; color: #64748b;',
		inlineCode: 'background: #f0f9ff; color: #0369a1; padding: 4rpx 8rpx; border-radius: 4rpx; font-family: Consolas, Monaco, monospace; font-size: 26rpx; border: 1rpx solid #bae6fd;',
		codeBlock: 'background: #0c4a6e; color: #f0f9ff; padding: 20rpx; border-radius: 8rpx; overflow-x: auto; margin: 20rpx 0; font-family: Consolas, Monaco, monospace; font-size: 26rpx; line-height: 1.6; white-space: pre-wrap;',
		blockquote: 'margin: 16rpx 0; padding: 16rpx 20rpx; background: #f0f9ff; border-left: 4rpx solid #0ea5e9; color: #075985; border-radius: 0 8rpx 8rpx 0;',
		link: 'color: #0369a1; text-decoration: none; border-bottom: 1rpx dashed #0ea5e9;',
		listItem: 'margin: 8rpx 0; line-height: 1.8; padding-left: 20rpx;',
		orderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		unorderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		divider: 'border: none; border-top: 2rpx solid #bae6fd; margin: 32rpx 0;',
		table: 'width: 100%; border-collapse: collapse; border: 1rpx solid #bae6fd; border-radius: 8rpx; overflow: hidden; margin: 24rpx 0; font-size: 28rpx;',
		th: 'font-weight: 600; padding: 12rpx 16rpx; text-align: left; color: #0c4a6e; border-bottom: 2rpx solid #0ea5e9; background: #f0f9ff;',
		td: 'padding: 12rpx 16rpx; border-bottom: 1rpx solid #e0f2fe;',
		textUp: 'color: #ef4444; font-weight: 500;',
		textDown: 'color: #22c55e; font-weight: 500;',
		textNeutral: 'color: #64748b;'
	},
	warm: {
		container: 'font-size: 30rpx; line-height: 1.8; color: #292524; word-wrap: break-word;',
		h1: 'font-size: 40rpx; font-weight: 700; color: #7c2d12; margin: 40rpx 0 20rpx; padding-bottom: 12rpx; border-bottom: 3rpx solid #f97316;',
		h2: 'font-size: 36rpx; font-weight: 600; color: #9a3412; margin: 32rpx 0 16rpx; padding-bottom: 10rpx; border-bottom: 1rpx solid #fed7aa;',
		h3: 'font-size: 32rpx; font-weight: 600; color: #c2410c; margin: 28rpx 0 14rpx;',
		h4: 'font-size: 30rpx; font-weight: 600; color: #ea580c; margin: 24rpx 0 12rpx;',
		h5: 'font-size: 28rpx; font-weight: 500; color: #f97316; margin: 20rpx 0 10rpx;',
		h6: 'font-size: 28rpx; font-weight: 500; color: #f97316; margin: 16rpx 0 8rpx;',
		strong: 'font-weight: 600; color: #7c2d12;',
		em: 'font-style: italic; color: #9a3412;',
		del: 'text-decoration: line-through; color: #78716c;',
		inlineCode: 'background: #fff7ed; color: #c2410c; padding: 4rpx 8rpx; border-radius: 4rpx; font-family: Consolas, Monaco, monospace; font-size: 26rpx; border: 1rpx solid #fed7aa;',
		codeBlock: 'background: #7c2d12; color: #fff7ed; padding: 20rpx; border-radius: 8rpx; overflow-x: auto; margin: 20rpx 0; font-family: Consolas, Monaco, monospace; font-size: 26rpx; line-height: 1.6; white-space: pre-wrap;',
		blockquote: 'margin: 16rpx 0; padding: 16rpx 20rpx; background: #fff7ed; border-left: 4rpx solid #f97316; color: #9a3412; border-radius: 0 8rpx 8rpx 0;',
		link: 'color: #c2410c; text-decoration: none; border-bottom: 1rpx dashed #f97316;',
		listItem: 'margin: 8rpx 0; line-height: 1.8; padding-left: 20rpx;',
		orderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		unorderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		divider: 'border: none; border-top: 2rpx solid #fed7aa; margin: 32rpx 0;',
		table: 'width: 100%; border-collapse: collapse; border: 1rpx solid #fed7aa; border-radius: 8rpx; overflow: hidden; margin: 24rpx 0; font-size: 28rpx;',
		th: 'font-weight: 600; padding: 12rpx 16rpx; text-align: left; color: #7c2d12; border-bottom: 2rpx solid #f97316; background: #fff7ed;',
		td: 'padding: 12rpx 16rpx; border-bottom: 1rpx solid #ffedd5;',
		textUp: 'color: #dc2626; font-weight: 500;',
		textDown: 'color: #16a34a; font-weight: 500;',
		textNeutral: 'color: #78716c;'
	},
	dark: {
		container: 'font-size: 30rpx; line-height: 1.8; color: #e4e6eb; word-wrap: break-word; background: #18191a; padding: 20rpx; border-radius: 12rpx;',
		h1: 'font-size: 40rpx; font-weight: 700; color: #ffffff; margin: 40rpx 0 20rpx; padding-bottom: 12rpx; border-bottom: 3rpx solid #3a3b3c;',
		h2: 'font-size: 36rpx; font-weight: 600; color: #f0f2f5; margin: 32rpx 0 16rpx; padding-bottom: 10rpx; border-bottom: 1rpx solid #3a3b3c;',
		h3: 'font-size: 32rpx; font-weight: 600; color: #e4e6eb; margin: 28rpx 0 14rpx;',
		h4: 'font-size: 30rpx; font-weight: 600; color: #b0b3b8; margin: 24rpx 0 12rpx;',
		h5: 'font-size: 28rpx; font-weight: 500; color: #e4e6eb; margin: 20rpx 0 10rpx;',
		h6: 'font-size: 28rpx; font-weight: 500; color: #e4e6eb; margin: 16rpx 0 8rpx;',
		strong: 'font-weight: 600; color: #ffffff;',
		em: 'font-style: italic; color: #b0b3b8;',
		del: 'text-decoration: line-through; color: #8b949e;',
		inlineCode: 'background: #3a3b3c; color: #61dafb; padding: 4rpx 8rpx; border-radius: 4rpx; font-family: Consolas, Monaco, monospace; font-size: 26rpx;',
		codeBlock: 'background: #242526; color: #e4e6eb; padding: 20rpx; border-radius: 8rpx; overflow-x: auto; margin: 20rpx 0; font-family: Consolas, Monaco, monospace; font-size: 26rpx; line-height: 1.6; border: 1rpx solid #3a3b3c; white-space: pre-wrap;',
		blockquote: 'margin: 16rpx 0; padding: 16rpx 20rpx; background: #3a3b3c; border-left: 4rpx solid #8a2be2; color: #b0b3b8; border-radius: 0 8rpx 8rpx 0;',
		link: 'color: #61dafb; text-decoration: none; border-bottom: 1rpx dashed #61dafb;',
		listItem: 'margin: 8rpx 0; line-height: 1.8; padding-left: 20rpx; color: #e4e6eb;',
		orderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		unorderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		divider: 'border: none; border-top: 2rpx solid #3a3b3c; margin: 32rpx 0;',
		table: 'width: 100%; border-collapse: collapse; border: 1rpx solid #3a3b3c; border-radius: 8rpx; overflow: hidden; margin: 24rpx 0; font-size: 28rpx;',
		th: 'font-weight: 600; padding: 12rpx 16rpx; text-align: left; color: #e4e6eb; border-bottom: 2rpx solid #3a3b3c; background: #242526;',
		td: 'padding: 12rpx 16rpx; border-bottom: 1rpx solid #3a3b3c; color: #b0b3b8;',
		textUp: 'color: #ff6b6b; font-weight: 500;',
		textDown: 'color: #51cf66; font-weight: 500;',
		textNeutral: 'color: #8b949e;'
	},
	violet: {
		container: 'font-size: 30rpx; line-height: 1.8; color: #2d3748; word-wrap: break-word;',
		h1: 'font-size: 40rpx; font-weight: 700; color: #5b21b6; margin: 40rpx 0 20rpx; padding-bottom: 12rpx; border-bottom: 3rpx solid #a78bfa;',
		h2: 'font-size: 36rpx; font-weight: 600; color: #6d28d9; margin: 32rpx 0 16rpx; padding-bottom: 10rpx; border-bottom: 1rpx solid #ddd6fe;',
		h3: 'font-size: 32rpx; font-weight: 600; color: #7c3aed; margin: 28rpx 0 14rpx;',
		h4: 'font-size: 30rpx; font-weight: 600; color: #8b5cf6; margin: 24rpx 0 12rpx;',
		h5: 'font-size: 28rpx; font-weight: 500; color: #a78bfa; margin: 20rpx 0 10rpx;',
		h6: 'font-size: 28rpx; font-weight: 500; color: #a78bfa; margin: 16rpx 0 8rpx;',
		strong: 'font-weight: 600; color: #5b21b6;',
		em: 'font-style: italic; color: #6d28d9;',
		del: 'text-decoration: line-through; color: #9ca3af;',
		inlineCode: 'background: #f5f3ff; color: #7c3aed; padding: 4rpx 8rpx; border-radius: 4rpx; font-family: Consolas, Monaco, monospace; font-size: 26rpx; border: 1rpx solid #ddd6fe;',
		codeBlock: 'background: #5b21b6; color: #f5f3ff; padding: 20rpx; border-radius: 8rpx; overflow-x: auto; margin: 20rpx 0; font-family: Consolas, Monaco, monospace; font-size: 26rpx; line-height: 1.6; white-space: pre-wrap;',
		blockquote: 'margin: 16rpx 0; padding: 16rpx 20rpx; background: #f5f3ff; border-left: 4rpx solid #a78bfa; color: #6d28d9; border-radius: 0 8rpx 8rpx 0;',
		link: 'color: #7c3aed; text-decoration: none; border-bottom: 1rpx dashed #a78bfa;',
		listItem: 'margin: 8rpx 0; line-height: 1.8; padding-left: 20rpx;',
		orderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		unorderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		divider: 'border: none; border-top: 2rpx solid #ddd6fe; margin: 32rpx 0;',
		table: 'width: 100%; border-collapse: collapse; border: 1rpx solid #ddd6fe; border-radius: 8rpx; overflow: hidden; margin: 24rpx 0; font-size: 28rpx;',
		th: 'font-weight: 600; padding: 12rpx 16rpx; text-align: left; color: #5b21b6; border-bottom: 2rpx solid #a78bfa; background: #f5f3ff;',
		td: 'padding: 12rpx 16rpx; border-bottom: 1rpx solid #ede9fe;',
		textUp: 'color: #ef4444; font-weight: 500;',
		textDown: 'color: #10b981; font-weight: 500;',
		textNeutral: 'color: #9ca3af;'
	},
	rose: {
		container: 'font-size: 30rpx; line-height: 1.8; color: #2d3748; word-wrap: break-word;',
		h1: 'font-size: 40rpx; font-weight: 700; color: #be123c; margin: 40rpx 0 20rpx; padding-bottom: 12rpx; border-bottom: 3rpx solid #fb7185;',
		h2: 'font-size: 36rpx; font-weight: 600; color: #e11d48; margin: 32rpx 0 16rpx; padding-bottom: 10rpx; border-bottom: 1rpx solid #fecdd3;',
		h3: 'font-size: 32rpx; font-weight: 600; color: #f43f5e; margin: 28rpx 0 14rpx;',
		h4: 'font-size: 30rpx; font-weight: 600; color: #fb7185; margin: 24rpx 0 12rpx;',
		h5: 'font-size: 28rpx; font-weight: 500; color: #fda4af; margin: 20rpx 0 10rpx;',
		h6: 'font-size: 28rpx; font-weight: 500; color: #fda4af; margin: 16rpx 0 8rpx;',
		strong: 'font-weight: 600; color: #be123c;',
		em: 'font-style: italic; color: #e11d48;',
		del: 'text-decoration: line-through; color: #9ca3af;',
		inlineCode: 'background: #fff1f2; color: #f43f5e; padding: 4rpx 8rpx; border-radius: 4rpx; font-family: Consolas, Monaco, monospace; font-size: 26rpx; border: 1rpx solid #fecdd3;',
		codeBlock: 'background: #be123c; color: #fff1f2; padding: 20rpx; border-radius: 8rpx; overflow-x: auto; margin: 20rpx 0; font-family: Consolas, Monaco, monospace; font-size: 26rpx; line-height: 1.6; white-space: pre-wrap;',
		blockquote: 'margin: 16rpx 0; padding: 16rpx 20rpx; background: #fff1f2; border-left: 4rpx solid #fb7185; color: #e11d48; border-radius: 0 8rpx 8rpx 0;',
		link: 'color: #f43f5e; text-decoration: none; border-bottom: 1rpx dashed #fb7185;',
		listItem: 'margin: 8rpx 0; line-height: 1.8; padding-left: 20rpx;',
		orderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		unorderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		divider: 'border: none; border-top: 2rpx solid #fecdd3; margin: 32rpx 0;',
		table: 'width: 100%; border-collapse: collapse; border: 1rpx solid #fecdd3; border-radius: 8rpx; overflow: hidden; margin: 24rpx 0; font-size: 28rpx;',
		th: 'font-weight: 600; padding: 12rpx 16rpx; text-align: left; color: #be123c; border-bottom: 2rpx solid #fb7185; background: #fff1f2;',
		td: 'padding: 12rpx 16rpx; border-bottom: 1rpx solid #ffe4e6;',
		textUp: 'color: #ef4444; font-weight: 500;',
		textDown: 'color: #10b981; font-weight: 500;',
		textNeutral: 'color: #9ca3af;'
	},
	lime: {
		container: 'font-size: 30rpx; line-height: 1.8; color: #1f2937; word-wrap: break-word;',
		h1: 'font-size: 40rpx; font-weight: 700; color: #365314; margin: 40rpx 0 20rpx; padding-bottom: 12rpx; border-bottom: 3rpx solid #84cc16;',
		h2: 'font-size: 36rpx; font-weight: 600; color: #3f6212; margin: 32rpx 0 16rpx; padding-bottom: 10rpx; border-bottom: 1rpx solid #d9f99d;',
		h3: 'font-size: 32rpx; font-weight: 600; color: #4d7c0f; margin: 28rpx 0 14rpx;',
		h4: 'font-size: 30rpx; font-weight: 600; color: #65a30d; margin: 24rpx 0 12rpx;',
		h5: 'font-size: 28rpx; font-weight: 500; color: #84cc16; margin: 20rpx 0 10rpx;',
		h6: 'font-size: 28rpx; font-weight: 500; color: #84cc16; margin: 16rpx 0 8rpx;',
		strong: 'font-weight: 600; color: #365314;',
		em: 'font-style: italic; color: #3f6212;',
		del: 'text-decoration: line-through; color: #6b7280;',
		inlineCode: 'background: #f7fee7; color: #4d7c0f; padding: 4rpx 8rpx; border-radius: 4rpx; font-family: Consolas, Monaco, monospace; font-size: 26rpx; border: 1rpx solid #d9f99d;',
		codeBlock: 'background: #365314; color: #f7fee7; padding: 20rpx; border-radius: 8rpx; overflow-x: auto; margin: 20rpx 0; font-family: Consolas, Monaco, monospace; font-size: 26rpx; line-height: 1.6; white-space: pre-wrap;',
		blockquote: 'margin: 16rpx 0; padding: 16rpx 20rpx; background: #f7fee7; border-left: 4rpx solid #84cc16; color: #3f6212; border-radius: 0 8rpx 8rpx 0;',
		link: 'color: #4d7c0f; text-decoration: none; border-bottom: 1rpx dashed #84cc16;',
		listItem: 'margin: 8rpx 0; line-height: 1.8; padding-left: 20rpx;',
		orderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		unorderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		divider: 'border: none; border-top: 2rpx solid #d9f99d; margin: 32rpx 0;',
		table: 'width: 100%; border-collapse: collapse; border: 1rpx solid #d9f99d; border-radius: 8rpx; overflow: hidden; margin: 24rpx 0; font-size: 28rpx;',
		th: 'font-weight: 600; padding: 12rpx 16rpx; text-align: left; color: #365314; border-bottom: 2rpx solid #84cc16; background: #f7fee7;',
		td: 'padding: 12rpx 16rpx; border-bottom: 1rpx solid #ecfccb;',
		textUp: 'color: #ef4444; font-weight: 500;',
		textDown: 'color: #16a34a; font-weight: 500;',
		textNeutral: 'color: #6b7280;'
	},
	tech: {
		container: 'font-size: 30rpx; line-height: 1.8; color: #1e293b; word-wrap: break-word;',
		h1: 'font-size: 40rpx; font-weight: 700; color: #1e3a8a; margin: 40rpx 0 20rpx; padding-bottom: 12rpx; border-bottom: 3rpx solid #60a5fa;',
		h2: 'font-size: 36rpx; font-weight: 600; color: #1e40af; margin: 32rpx 0 16rpx; padding-bottom: 10rpx; border-bottom: 1rpx solid #bfdbfe;',
		h3: 'font-size: 32rpx; font-weight: 600; color: #2563eb; margin: 28rpx 0 14rpx;',
		h4: 'font-size: 30rpx; font-weight: 600; color: #3b82f6; margin: 24rpx 0 12rpx;',
		h5: 'font-size: 28rpx; font-weight: 500; color: #60a5fa; margin: 20rpx 0 10rpx;',
		h6: 'font-size: 28rpx; font-weight: 500; color: #60a5fa; margin: 16rpx 0 8rpx;',
		strong: 'font-weight: 600; color: #1e3a8a;',
		em: 'font-style: italic; color: #1e40af;',
		del: 'text-decoration: line-through; color: #64748b;',
		inlineCode: 'background: #eff6ff; color: #2563eb; padding: 4rpx 8rpx; border-radius: 4rpx; font-family: Consolas, Monaco, monospace; font-size: 26rpx; border: 1rpx solid #bfdbfe;',
		codeBlock: 'background: #1e3a8a; color: #eff6ff; padding: 20rpx; border-radius: 8rpx; overflow-x: auto; margin: 20rpx 0; font-family: Consolas, Monaco, monospace; font-size: 26rpx; line-height: 1.6; white-space: pre-wrap;',
		blockquote: 'margin: 16rpx 0; padding: 16rpx 20rpx; background: #eff6ff; border-left: 4rpx solid #60a5fa; color: #1e40af; border-radius: 0 8rpx 8rpx 0;',
		link: 'color: #2563eb; text-decoration: none; border-bottom: 1rpx dashed #60a5fa;',
		listItem: 'margin: 8rpx 0; line-height: 1.8; padding-left: 20rpx;',
		orderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		unorderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		divider: 'border: none; border-top: 2rpx solid #bfdbfe; margin: 32rpx 0;',
		table: 'width: 100%; border-collapse: collapse; border: 1rpx solid #bfdbfe; border-radius: 8rpx; overflow: hidden; margin: 24rpx 0; font-size: 28rpx;',
		th: 'font-weight: 600; padding: 12rpx 16rpx; text-align: left; color: #1e3a8a; border-bottom: 2rpx solid #60a5fa; background: #eff6ff;',
		td: 'padding: 12rpx 16rpx; border-bottom: 1rpx solid #dbeafe;',
		textUp: 'color: #ef4444; font-weight: 500;',
		textDown: 'color: #22c55e; font-weight: 500;',
		textNeutral: 'color: #64748b;'
	},
	slate: {
		container: 'font-size: 30rpx; line-height: 1.8; color: #1e293b; word-wrap: break-word;',
		h1: 'font-size: 40rpx; font-weight: 700; color: #334155; margin: 40rpx 0 20rpx; padding-bottom: 12rpx; border-bottom: 3rpx solid #94a3b8;',
		h2: 'font-size: 36rpx; font-weight: 600; color: #475569; margin: 32rpx 0 16rpx; padding-bottom: 10rpx; border-bottom: 1rpx solid #cbd5e1;',
		h3: 'font-size: 32rpx; font-weight: 600; color: #64748b; margin: 28rpx 0 14rpx;',
		h4: 'font-size: 30rpx; font-weight: 600; color: #64748b; margin: 24rpx 0 12rpx;',
		h5: 'font-size: 28rpx; font-weight: 500; color: #94a3b8; margin: 20rpx 0 10rpx;',
		h6: 'font-size: 28rpx; font-weight: 500; color: #94a3b8; margin: 16rpx 0 8rpx;',
		strong: 'font-weight: 600; color: #334155;',
		em: 'font-style: italic; color: #475569;',
		del: 'text-decoration: line-through; color: #94a3b8;',
		inlineCode: 'background: #f1f5f9; color: #475569; padding: 4rpx 8rpx; border-radius: 4rpx; font-family: Consolas, Monaco, monospace; font-size: 26rpx; border: 1rpx solid #cbd5e1;',
		codeBlock: 'background: #334155; color: #f1f5f9; padding: 20rpx; border-radius: 8rpx; overflow-x: auto; margin: 20rpx 0; font-family: Consolas, Monaco, monospace; font-size: 26rpx; line-height: 1.6; white-space: pre-wrap;',
		blockquote: 'margin: 16rpx 0; padding: 16rpx 20rpx; background: #f1f5f9; border-left: 4rpx solid #94a3b8; color: #475569; border-radius: 0 8rpx 8rpx 0;',
		link: 'color: #475569; text-decoration: none; border-bottom: 1rpx dashed #94a3b8;',
		listItem: 'margin: 8rpx 0; line-height: 1.8; padding-left: 20rpx;',
		orderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		unorderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		divider: 'border: none; border-top: 2rpx solid #cbd5e1; margin: 32rpx 0;',
		table: 'width: 100%; border-collapse: collapse; border: 1rpx solid #cbd5e1; border-radius: 8rpx; overflow: hidden; margin: 24rpx 0; font-size: 28rpx;',
		th: 'font-weight: 600; padding: 12rpx 16rpx; text-align: left; color: #334155; border-bottom: 2rpx solid #94a3b8; background: #f1f5f9;',
		td: 'padding: 12rpx 16rpx; border-bottom: 1rpx solid #e2e8f0;',
		textUp: 'color: #ef4444; font-weight: 500;',
		textDown: 'color: #22c55e; font-weight: 500;',
		textNeutral: 'color: #94a3b8;'
	},
	sunset: {
		container: 'font-size: 30rpx; line-height: 1.8; color: #292524; word-wrap: break-word;',
		h1: 'font-size: 40rpx; font-weight: 700; color: #92400e; margin: 40rpx 0 20rpx; padding-bottom: 12rpx; border-bottom: 3rpx solid #fbbf24;',
		h2: 'font-size: 36rpx; font-weight: 600; color: #a16207; margin: 32rpx 0 16rpx; padding-bottom: 10rpx; border-bottom: 1rpx solid #fde68a;',
		h3: 'font-size: 32rpx; font-weight: 600; color: #ca8a04; margin: 28rpx 0 14rpx;',
		h4: 'font-size: 30rpx; font-weight: 600; color: #eab308; margin: 24rpx 0 12rpx;',
		h5: 'font-size: 28rpx; font-weight: 500; color: #fbbf24; margin: 20rpx 0 10rpx;',
		h6: 'font-size: 28rpx; font-weight: 500; color: #fbbf24; margin: 16rpx 0 8rpx;',
		strong: 'font-weight: 600; color: #92400e;',
		em: 'font-style: italic; color: #a16207;',
		del: 'text-decoration: line-through; color: #a8a29e;',
		inlineCode: 'background: #fefce8; color: #a16207; padding: 4rpx 8rpx; border-radius: 4rpx; font-family: Consolas, Monaco, monospace; font-size: 26rpx; border: 1rpx solid #fde68a;',
		codeBlock: 'background: #92400e; color: #fefce8; padding: 20rpx; border-radius: 8rpx; overflow-x: auto; margin: 20rpx 0; font-family: Consolas, Monaco, monospace; font-size: 26rpx; line-height: 1.6; white-space: pre-wrap;',
		blockquote: 'margin: 16rpx 0; padding: 16rpx 20rpx; background: #fefce8; border-left: 4rpx solid #fbbf24; color: #a16207; border-radius: 0 8rpx 8rpx 0;',
		link: 'color: #a16207; text-decoration: none; border-bottom: 1rpx dashed #fbbf24;',
		listItem: 'margin: 8rpx 0; line-height: 1.8; padding-left: 20rpx;',
		orderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		unorderedList: 'padding-left: 40rpx; margin: 16rpx 0;',
		divider: 'border: none; border-top: 2rpx solid #fde68a; margin: 32rpx 0;',
		table: 'width: 100%; border-collapse: collapse; border: 1rpx solid #fde68a; border-radius: 8rpx; overflow: hidden; margin: 24rpx 0; font-size: 28rpx;',
		th: 'font-weight: 600; padding: 12rpx 16rpx; text-align: left; color: #92400e; border-bottom: 2rpx solid #fbbf24; background: #fefce8;',
		td: 'padding: 12rpx 16rpx; border-bottom: 1rpx solid #fef9c3;',
		textUp: 'color: #ef4444; font-weight: 500;',
		textDown: 'color: #16a34a; font-weight: 500;',
		textNeutral: 'color: #a8a29e;'
	}
}

/**
 * 数据格式化工具集 - 用于金融数据展示
 */
export const DataFormatter = {
	/**
	 * 格式化涨跌幅数据（添加颜色）
	 * @param {string|number} value 数值
	 * @param {number} compareValue 比较基准（可选）
	 * @param {string} unit 单位（如%）
	 * @returns {string} HTML字符串
	 */
	formatChange(value, compareValue = null, unit = '') {
		const num = parseFloat(value)
		if (isNaN(num)) return `<span class="text-neutral">${value}</span>`

		const compareNum = compareValue !== null ? parseFloat(compareValue) : num

		let colorClass = 'text-neutral'
		if (compareNum > 0) colorClass = 'text-up'
		else if (compareNum < 0) colorClass = 'text-down'

		const formattedValue = num.toFixed(2)
		return `<span class="${colorClass}">${formattedValue}${unit}</span>`
	},

	/**
	 * 格式化大数字（万、亿）
	 * @param {number} value 数值
	 * @param {number} precision 精度
	 * @returns {string} 格式化后的字符串
	 */
	formatBigNumber(value, precision = 2) {
		const num = parseFloat(value)
		if (isNaN(num)) return '--'

		const absNum = Math.abs(num)

		if (absNum >= 100000000) {
			return (num / 100000000).toFixed(precision) + '亿'
		} else if (absNum >= 10000) {
			return (num / 10000).toFixed(precision) + '万'
		}

		return num.toFixed(precision)
	},

	/**
	 * 格式化百分比
	 * @param {number} value 数值
	 * @param {number} precision 精度
	 * @returns {string} 格式化后的字符串
	 */
	formatPercent(value, precision = 2) {
		const num = parseFloat(value)
		if (isNaN(num)) return '--'

		const colorClass = num > 0 ? 'text-up' : num < 0 ? 'text-down' : 'text-neutral'
		const formattedValue = num.toFixed(precision)

		return `<span class="${colorClass}">${formattedValue}%</span>`
	},

	/**
	 * 格式化日期
	 * @param {string} dateStr 日期字符串
	 * @param {string} format 格式（1=YYYY-MM-DD, 2=MM-DD, 3=YYYY）
	 * @returns {string} 格式化后的日期
	 */
	formatDate(dateStr, format = 1) {
		if (!dateStr) return '--'

		// 处理YYYYMMDD格式
		if (dateStr.length === 8 && /^\d+$/.test(dateStr)) {
			const year = dateStr.substring(0, 4)
			const month = dateStr.substring(4, 6)
			const day = dateStr.substring(6, 8)

			if (format === 1) return `${year}-${month}-${day}`
			if (format === 2) return `${month}-${day}`
			if (format === 3) return year
		}

		// 已经包含分隔符
		if (dateStr.includes('-')) {
			const parts = dateStr.split('-')
			if (parts.length === 3) {
				const [year, month, day] = parts
				if (format === 1) return `${year}-${month}-${day}`
				if (format === 2) return `${month}-${day}`
				if (format === 3) return year
			}
		}

		return dateStr
	}
}

/**
 * Markdown渲染器类
 */
export class MarkdownRenderer {
	/**
	 * 渲染Markdown为HTML（带主题内联样式，用于rich-text组件）
	 * @param {string} content Markdown内容
	 * @param {string} theme 主题名称 (default, github, emerald, ocean, warm, dark)
	 * @returns {string} HTML内容（带内联样式）
	 */
	static renderWithTheme(content, theme = 'default') {
		if (!content) return ''

		const styles = ThemeStyles[theme] || ThemeStyles.default

		// 过滤替换串
		content = content.replace(/@@.+?@@/g, '')

		// 转义HTML（但保留我们需要的标签）
		let html = this._escapeHtml(content)

		// 按顺序处理各种Markdown语法（带内联样式）
		html = this._processCodeBlocksWithTheme(html, styles)
		html = this._processInlineCodeWithTheme(html, styles)
		html = this._processHeadingsWithTheme(html, styles)
		html = this._processBoldAndItalicWithTheme(html, styles)
		html = this._processStrikethroughWithTheme(html, styles)
		html = this._processTablesWithTheme(html, styles)
		html = this._processListsWithTheme(html, styles)
		html = this._processBlockquotesWithTheme(html, styles)
		html = this._processLinksWithTheme(html, styles)
		html = this._processImagesWithTheme(html, styles)
		html = this._processHorizontalRulesWithTheme(html, styles)
		html = this._processLineBreaks(html)

		// 修复特定标签内的换行
		html = this._fixBreaksInSpecialTags(html)

		return html
	}

	/**
	 * 渲染Markdown为HTML（不带样式，用于列表预览等）
	 * @param {string} content Markdown内容
	 * @returns {string} HTML内容
	 */
	static render(content) {
		if (!content) return ''

		// 过滤替换串
		content = content.replace(/@@.+?@@/g, '')

		// 转义HTML（但保留我们需要的标签）
		let html = this._escapeHtml(content)

		// 按顺序处理各种Markdown语法
		html = this._processCodeBlocks(html)
		html = this._processInlineCode(html)
		html = this._processHeadings(html)
		html = this._processBoldAndItalic(html)
		html = this._processStrikethrough(html)
		html = this._processTables(html)
		html = this._processLists(html)
		html = this._processBlockquotes(html)
		html = this._processLinks(html)
		html = this._processImages(html)
		html = this._processHorizontalRules(html)
		html = this._processLineBreaks(html)

		// 修复特定标签内的换行
		html = this._fixBreaksInSpecialTags(html)

		return html
	}

	/**
	 * 渲染消息列表预览内容（简化版，带简单内联样式）
	 * @param {string} content Markdown内容
	 * @param {number} maxLength 最大字符数
	 * @returns {string} HTML内容
	 */
	static renderPreview(content, maxLength = 100) {
		if (!content) return ''

		// 截取前N个字符作为预览
		let preview = content.length > maxLength ? content.substring(0, maxLength) + '...' : content

		// 转义HTML
		preview = this._escapeHtml(preview)

		// 简单的Markdown渲染（只处理粗体和斜体，用于列表预览）
		preview = preview
			.replace(/\*\*\*(.+?)\*\*\*/g, '<strong style="font-weight: 600; color: #1a1a1a;"><em style="font-style: italic;">$1</em></strong>')
			.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: 600; color: #1a1a1a;">$1</strong>')
			.replace(/\*(.+?)\*/g, '<em style="font-style: italic; color: #555555;">$1</em>')
			.replace(/`([^`]+)`/g, '<code style="background: #f6f8fa; color: #e83e8c; padding: 2px 6px; border-radius: 4px; font-size: 24rpx;">$1</code>')
			.replace(/\n/g, ' ')

		return preview
	}

	// ==================== 带主题样式的方法 ====================

	/**
	 * 处理代码块（带主题样式）
	 * @private
	 */
	static _processCodeBlocksWithTheme(html, styles) {
		return html.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
			const language = lang || ''
			const trimmedCode = code.trim()
			return `<pre style="${styles.codeBlock}"><code>${trimmedCode}</code></pre>\n`
		})
	}

	/**
	 * 处理行内代码（带主题样式）
	 * @private
	 */
	static _processInlineCodeWithTheme(html, styles) {
		return html.replace(/`([^`\n]+)`/g, `<code style="${styles.inlineCode}">$1</code>`)
	}

	/**
	 * 处理标题（带主题样式）
	 * @private
	 */
	static _processHeadingsWithTheme(html, styles) {
		html = html.replace(/^######\s+(.+)$/gm, `<h6 style="${styles.h6}">$1</h6>`)
		html = html.replace(/^#####\s+(.+)$/gm, `<h5 style="${styles.h5}">$1</h5>`)
		html = html.replace(/^####\s+(.+)$/gm, `<h4 style="${styles.h4}">$1</h4>`)
		html = html.replace(/^###\s+(.+)$/gm, `<h3 style="${styles.h3}">$1</h3>`)
		html = html.replace(/^##\s+(.+)$/gm, `<h2 style="${styles.h2}">$1</h2>`)
		html = html.replace(/^#\s+(.+)$/gm, `<h1 style="${styles.h1}">$1</h1>`)
		return html
	}

	/**
	 * 处理粗体和斜体（带主题样式）
	 * @private
	 */
	static _processBoldAndItalicWithTheme(html, styles) {
		html = html.replace(/\*\*([^*\n]+)\*\*/g, `<strong style="${styles.strong}">$1</strong>`)
		html = html.replace(/__([^_\n]+)__/g, `<strong style="${styles.strong}">$1</strong>`)
		html = html.replace(/\*([^*\n]+)\*/g, `<em style="${styles.em}">$1</em>`)
		html = html.replace(/_([^_\n]+)_/g, `<em style="${styles.em}">$1</em>`)
		return html
	}

	/**
	 * 处理删除线（带主题样式）
	 * @private
	 */
	static _processStrikethroughWithTheme(html, styles) {
		return html.replace(/~~([^~\n]+)~~/g, `<del style="${styles.del}">$1</del>`)
	}

	/**
	 * 处理表格（带主题样式）
	 * @private
	 */
	static _processTablesWithTheme(html, styles) {
		const lines = html.split('\n')
		let inTable = false
		let tableRows = []
		let headerProcessed = false
		const processedLines = []

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim()

			if (line.startsWith('|') && line.endsWith('|')) {
				const cells = line.substring(1, line.length - 1)
					.split('|')
					.map(cell => cell.trim())

				const isSeparator = cells.some(cell =>
					/^-+:?$|^:-+:?$|^:-+$/.test(cell)
				)

				if (!isSeparator) {
					if (!inTable) {
						inTable = true
						tableRows = []
						headerProcessed = false
					}

					const isHeader = !headerProcessed
					if (isHeader) {
						headerProcessed = true
					}

					const cellStyle = isHeader ? styles.th : styles.td
					const tag = isHeader ? 'th' : 'td'
					const rowHtml = cells.map(cell => `<${tag} style="${cellStyle}">${cell}</${tag}>`).join('')
					tableRows.push(`<tr>${rowHtml}</tr>`)
				}
				continue
			}

			if (inTable) {
				if (tableRows.length > 0) {
					const tableHtml = `<table style="${styles.table}">${tableRows.join('')}</table>`
					processedLines.push(tableHtml)
				}
				inTable = false
				tableRows = []
				headerProcessed = false
			}

			processedLines.push(line)
		}

		if (inTable && tableRows.length > 0) {
			const tableHtml = `<table style="${styles.table}">${tableRows.join('')}</table>`
			processedLines.push(tableHtml)
		}

		return processedLines.join('\n')
	}

	/**
	 * 处理列表（带主题样式）
	 * @private
	 */
	static _processListsWithTheme(html, styles) {
		// 无序列表
		html = html.replace(/^[\s]*[-*]\s+(.+)$/gm, `<li style="${styles.listItem}">• $1</li>`)

		// 合并连续的li为ul
		html = html.replace(/(<li style="[^"]*">.*<\/li>\n?)+/g, (match) => {
			return `<ul style="${styles.unorderedList}">${match}</ul>`
		})

		// 有序列表
		html = html.replace(/^[\s]*(\d+)\.\s+(.+)$/gm, `<li style="${styles.listItem}" value="$1">$2</li>`)

		// 合并连续的有序列表
		html = html.replace(/(<li style="[^"]*"[^>]*>.*<\/li>\n?)+/g, (match) => {
			// 如果已经包裹在ul中，跳过
			if (match.includes('<ul')) return match
			return `<ol style="${styles.orderedList}">${match}</ol>`
		})

		return html
	}

	/**
	 * 处理引用（带主题样式）
	 * @private
	 */
	static _processBlockquotesWithTheme(html, styles) {
		return html.replace(/^>\s+(.+)$/gm, `<blockquote style="${styles.blockquote}">$1</blockquote>`)
	}

	/**
	 * 处理链接（带主题样式）
	 * @private
	 */
	static _processLinksWithTheme(html, styles) {
		return html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
			`<a href="$2" style="${styles.link}" target="_blank">$1</a>`)
	}

	/**
	 * 处理图片（带主题样式）
	 * @private
	 */
	static _processImagesWithTheme(html, styles) {
		return html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
			'<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8rpx; margin: 16rpx 0;">')
	}

	/**
	 * 处理水平分割线（带主题样式）
	 * @private
	 */
	static _processHorizontalRulesWithTheme(html, styles) {
		return html.replace(/^[-*]{3,}$/gm, `<hr style="${styles.divider}">`)
	}

	/**
	 * 转义HTML特殊字符（但保留基本结构）
	 * @private
	 */
	static _escapeHtml(content) {
		return content
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
	}

	/**
	 * 处理代码块
	 * @private
	 */
	static _processCodeBlocks(html) {
		// 支持语言标识 ```language
		return html.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
			const language = lang || ''
			const trimmedCode = code.trim()
			return `<pre class="code-block" data-language="${language}"><code class="language-${language}">${trimmedCode}</code></pre>\n`
		})
	}

	/**
	 * 处理行内代码
	 * @private
	 */
	static _processInlineCode(html) {
		return html.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>')
	}

	/**
	 * 处理标题
	 * @private
	 */
	static _processHeadings(html) {
		html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
		html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
		html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
		html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
		html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
		html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
		return html
	}

	/**
	 * 处理粗体和斜体
	 * @private
	 */
	static _processBoldAndItalic(html) {
		// 粗体 **text** 或 __text__
		html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
		html = html.replace(/__([^_\n]+)__/g, '<strong>$1</strong>')

		// 斜体 *text* 或 _text_
		html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
		html = html.replace(/_([^_\n]+)_/g, '<em>$1</em>')

		return html
	}

	/**
	 * 处理删除线
	 * @private
	 */
	static _processStrikethrough(html) {
		return html.replace(/~~([^~\n]+)~~/g, '<del>$1</del>')
	}

	/**
	 * 处理表格
	 * @private
	 */
	static _processTables(html) {
		const lines = html.split('\n')
		let inTable = false
		let tableRows = []
		let headerProcessed = false
		const processedLines = []

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim()

			// 检测表格行
			if (line.startsWith('|') && line.endsWith('|')) {
				const cells = line.substring(1, line.length - 1)
					.split('|')
					.map(cell => cell.trim())

				// 检查是否是分隔行
				const isSeparator = cells.some(cell =>
					/^-+:?$|^:-+:?$|^:-+$/.test(cell)
				)

				if (!isSeparator) {
					if (!inTable) {
						inTable = true
						tableRows = []
						headerProcessed = false
					}

					const isHeader = !headerProcessed
					if (isHeader) {
						headerProcessed = true
					}

					const tag = isHeader ? 'th' : 'td'
					const rowHtml = cells.map(cell => `<${tag}>${cell}</${tag}>`).join('')
					tableRows.push(`<tr>${rowHtml}</tr>`)
				}
				continue
			}

			// 输出表格
			if (inTable) {
				if (tableRows.length > 0) {
					const tableHtml = `<table class="markdown-table">${tableRows.join('')}</table>`
					processedLines.push(tableHtml)
				}
				inTable = false
				tableRows = []
				headerProcessed = false
			}

			processedLines.push(line)
		}

		// 处理最后的表格
		if (inTable && tableRows.length > 0) {
			const tableHtml = `<table class="markdown-table">${tableRows.join('')}</table>`
			processedLines.push(tableHtml)
		}

		return processedLines.join('\n')
	}

	/**
	 * 处理列表
	 * @private
	 */
	static _processLists(html) {
		// 无序列表
		html = html.replace(/^[\s]*[-*]\s+(.+)$/gm, '<li class="list-item">$1</li>')

		// 合并连续的li为ul
		html = html.replace(/(<li class="list-item">.*<\/li>\n?)+/g, (match) => {
			return `<ul class="list-unstyled">${match}</ul>`
		})

		// 有序列表
		html = html.replace(/^[\s]*(\d+)\.\s+(.+)$/gm, '<li class="list-item-ordered" value="$1">$2</li>')

		// 合并连续的有序列表
		html = html.replace(/(<li class="list-item-ordered".*<\/li>\n?)+/g, (match) => {
			return `<ol class="list-ordered">${match}</ol>`
		})

		return html
	}

	/**
	 * 处理引用
	 * @private
	 */
	static _processBlockquotes(html) {
		return html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
	}

	/**
	 * 处理链接
	 * @private
	 */
	static _processLinks(html) {
		return html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
			'<a href="$2" class="link" target="_blank">$1</a>')
	}

	/**
	 * 处理图片
	 * @private
	 */
	static _processImages(html) {
		return html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
			'<img src="$2" alt="$1" class="markdown-image">')
	}

	/**
	 * 处理水平分割线
	 * @private
	 */
	static _processHorizontalRules(html) {
		return html.replace(/^[-*]{3,}$/gm, '<hr class="divider">')
	}

	/**
	 * 处理换行
	 * @private
	 */
	static _processLineBreaks(html) {
		return html.replace(/\n/g, '<br>')
	}

	/**
	 * 修复特定标签内的换行符
	 * @private
	 */
	static _fixBreaksInSpecialTags(html) {
		// 修复pre标签
		html = html.replace(/<pre(?:\s[^>]*)?>(.*?)<\/pre>/gis, (match, content) => {
			return `<pre>${content.replace(/<br>/g, '\n')}</pre>`
		})

		// 修复table标签
		html = html.replace(/<table(?:\s[^>]*)?>(.*?)<\/table>/gis, (match, content) => {
			return `<table>${content.replace(/<br>/g, '')}</table>`
		})

		// 修复ul和ol标签
		html = html.replace(/<(ul|ol)([^>]*)>(.*?)<\/\1>/gis, (match, tag, attrs, content) => {
			return `<${tag}${attrs}>${content.replace(/<\/li><br>/g, '</li>')}</${tag}>`
		})

		return html
	}
}

/**
 * 金融表格解析器
 */
export class FinancialTableParser {
	/**
	 * 解析金融选股工具返回的JSON表格数据
	 * @param {string} content JSON字符串
	 * @returns {object|null} 解析后的表格数据
	 */
	static parse(content) {
		try {
			const data = JSON.parse(content)

			if (!Array.isArray(data) || data.length === 0) {
				return null
			}

			let headers = []
			let rows = []
			let total = 0

			// 提取总数（最后一行）
			if (data.length > 1) {
				const lastRow = data[data.length - 1]
				if (Array.isArray(lastRow) && lastRow.length >= 2) {
					total = parseInt(lastRow[1]) || 0
				}
			}

			// 解析表头和数据行（最多7行）
			const endIndex = data.length > 7 ? 7 : data.length - 1
			const tableData = data.slice(0, endIndex)

			tableData.forEach((row, index) => {
				if (index === 0) {
					// 第一行是表头
					headers = row.map(cell => {
						if (typeof cell === 'string') {
							// 移除HTML标签和日期
							return cell.replace(/<br>.*$/, '').trim()
						}
						return String(cell).trim()
					})
				} else {
					// 数据行
					rows.push(row)
				}
			})

			return { headers, rows, total }
		} catch (e) {
			return null
		}
	}

	/**
	 * 渲染金融表格HTML
	 * @param {object} tableData 表格数据
	 * @returns {string} HTML字符串
	 */
	static render(tableData) {
		if (!tableData || !tableData.headers || !tableData.rows) {
			return ''
		}

		const { headers, rows, total } = tableData

		let html = '<div class="financial-table-container">'

		// 总数提示
		if (total > 0) {
			html += `<div class="table-info">共找到 ${total} 条结果，显示前 ${rows.length} 条</div>`
		}

		html += '<table class="financial-table">'

		// 表头
		html += '<thead><tr>'
		headers.forEach(header => {
			html += `<th>${header}</th>`
		})
		html += '</tr></thead>'

		// 数据行
		html += '<tbody>'
		rows.forEach(row => {
			html += '<tr>'
			row.forEach((cell, index) => {
				// 判断是否需要特殊格式化
				const formattedCell = this._formatCell(cell, headers[index])
				html += `<td>${formattedCell}</td>`
			})
			html += '</tr>'
		})
		html += '</tbody>'

		html += '</table></div>'

		return html
	}

	/**
	 * 格式化单元格数据
	 * @private
	 */
	static _formatCell(cell, header) {
		// 检查是否是涨跌幅列
		if (header && (header.includes('涨跌幅') || header.includes('涨幅'))) {
			return DataFormatter.formatChange(cell, null, '%')
		}

		// 检查是否是价格列
		if (header && (header.includes('现价') || header.includes('价格'))) {
			const num = parseFloat(cell)
			if (!isNaN(num)) {
				return num.toFixed(2)
			}
		}

		// 检查是否是大数值列
		if (header && (header.includes('成交额') || header.includes('市值') || header.includes('资金'))) {
			return DataFormatter.formatBigNumber(cell)
		}

		return cell
	}
}

/**
 * 打字机效果工具类 - 用于流式输出
 */
export class TypewriterEffect {
	/**
	 * 启动打字机效果
	 * @param {object} options 配置选项
	 */
	static start(options) {
		const {
			fullText = '',
			id = '',
			speed = 20,
			currentState = null,
			onUpdate = null,
			onComplete = null
		} = options

		// 初始化状态
		let state = currentState || {
			displayedText: '',
			currentIndex: 0
		}

		// 如果已经完成，直接调用完成回调
		if (state.currentIndex >= fullText.length) {
			if (onComplete) onComplete(id)
			return
		}

		const processNext = () => {
			if (state.currentIndex < fullText.length) {
				// 检查是否是HTML标签的开始
				const nextChar = fullText.charAt(state.currentIndex)

				if (nextChar === '<') {
					// 找到标签的结束位置
					const tagEndIndex = fullText.indexOf('>', state.currentIndex)
					if (tagEndIndex !== -1) {
						// 一次性添加整个标签
						const tag = fullText.substring(state.currentIndex, tagEndIndex + 1)
						state.displayedText += tag
						state.currentIndex = tagEndIndex + 1
					} else {
						// 如果没有找到结束标签，按单个字符处理
						state.displayedText += nextChar
						state.currentIndex++
					}
				} else {
					// 普通字符逐个添加
					state.displayedText += nextChar
					state.currentIndex++
				}

				// 调用更新回调
				if (onUpdate) onUpdate(id, state)

				// 继续下一个字符
				setTimeout(processNext, speed)
			} else {
				// 完成回调
				if (onComplete) onComplete(id)
			}
		}

		// 开始处理
		processNext()

		// 返回当前状态
		return state
	}
}
