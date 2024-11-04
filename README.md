# JsonBrook

![演示视频](assets/showcase.gif)

> 流式解析Json数据  
> 实现上参考了[json-to-ast](https://github.com/vtrushin/json-to-ast)

## 快速入门

```typescript
import { createJsonBrook } from "json-brook";

const jsonBrook = createJsonBrook();

const sample = `{
  "string": "welcome to json brook",
  "number": 20241102,
  "boolean": true,
  "array": ["a", "b", "c"],
  "null": null
}`;

for (const char of sample) {
  jsonBrook.write(char);
  console.log(jsonBrook.getCurrent());
}

jsonBrook.end();
console.log(jsonBrook.getCurrent());
```

## API
`createJsonBrook` 返回一个JsonBrook实例，JsonBrook实例具有以下方法：
* `write` 接受字符串并解析，如果解析失败会抛错
* `end` 结束输入并解析Json数据(针对比较极端的纯数字形式解析，需要知道当前输入已结束)，如果解析失败会抛错
* `getCurrent` 获取当前解析结果

## 在线尝试
[codesandbox](https://codesandbox.io/p/sandbox/4v5slw)

