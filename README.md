# JsonBrook

> 流式解析Json数据  
> 由[json-to-ast](https://github.com/vtrushin/json-to-ast)的实现启发而来

## 快速入门

```typescript
import { createJsonBrook } from "json-brook";

const jsonBrook = createJsonBrook();

const sample = JSON.stringify(
	{
		a: 1001,
		b: "hello",
		c: [1, 2, 3],
		d: null,
	},
	null,
	4,
);

for (const char of sample) {
  jsonBrook.parse(char);
  console.log(jsonBrook.generate());
}

jsonBrook.end();
console.log(jsonBrook.generate());
```

## API

### 根导出
`createJsonBrook` 返回一个JsonBrook实例，JsonBrook实例具有以下方法：
* `parse` 接受单个字符，去解析Json数据
* `end` 代表流结束，仅针对某些特殊场景，如纯数字形式的Json字符串
* `getRoot`: 获取当前解析出的ast根节点
* `getCurrent` 获取当前正在解析的ast节点
* `generate` 生成当前解析结果，其中字符串和数字尽可能解析合法内容，对于true/false/null,只要识别开头就返回

### tokenize导出
该模块主要是token解析相关方法

### parse导出
该模块主要是ast解析相关方法

### generate导出
该模块主要是默认生成方法

## 在线尝试
[Playground](https://asurance.github.io/json-brook/)

## 技术栈
本身库为0依赖库，以下列出为Playground使用的技术栈
* [lucide](https://lucide.dev/): 图标库
* [shiki](https://shiki.matsu.io/): 代码高亮库
* [tailwindcss](https://tailwindcss.com/): 样式库
* [solid-js](https://www.solidjs.com/): 前端框架
* [vite](https://vitejs.dev/): 构建工具
* [biome](https://biomejs.dev/): 代码格式化工具

## 在线文档
[飞书文档](https://my.feishu.cn/wiki/M89bw6mCgiCAzJkjomwcAPJkntW)

