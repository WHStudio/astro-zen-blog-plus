---
title: Markdown渲染测试
description: 支持的Markdown语法
created: 2025-06-15T17:30:00.000Z
updated: 2025-06-16T17:00:00.000Z
tags: [测试]
image: ""
hidden: false
---

## Markdown语法手册

---

### 1. 斜体和粗体

这是*斜体*，这是**粗体**。

### 2. 分级标题

# H1

## H2

### H3

#### H4

##### H5

### 3. 链接

这是去往本博客[主页](/)的链接。

这是去往[GitHub](https://github.com "GitHub")的链接，悬浮可见标题。

### 4. 无序列表

- 无序列表项 一
- 无序列表项 二
- 无序列表项 三

### 5. 有序列表

1. 有序列表项 一
2. 有序列表项 二
3. 有序列表项 三

### 6. 文字引用

> 离离原上草，一岁一枯荣。
>> 野火烧不尽，春风吹又生。
>>> 远芳侵古道，晴翠接荒城。
>>>>又送王孙去，萋萋满别情。

### 7. 行内代码块

让我们聊聊 `html`。

### 8. 代码块

    这是一个代码块，利用此行左侧的4个空格。

### 9. 插入图像

一张外部图片，悬浮可见标题。

![img](https://www.todaybing.com/api/today/cn "必应壁纸")

### 10. 删除线

~~这是一段错误的文本。~~

### 11. 注脚

这是第一个注脚[^1]的样例。

这是第二个注脚[^2]的样例。

### 12. LaTeX公式

质能守恒方程： $E=mc^2$

$$\sum_{i=1}^n a_i=0$$

$$f(x_1,x_x,\ldots,x_n) = x_1^2 + x_2^2 + \cdots + x_n^2 $$

$$\sum^{j-1}_{k=0}{\widehat{\gamma}_{kj} z_k}$$

### 13. 代码块

```bash
$ sudo apt-get install vim-gnome
```

```python
@requires_authorization
def somefunc(param1='', param2=0):
    '''A docstring'''
    if param1 > param2: # interesting
        print 'Greater'
    return (param2 - param1 + 1) or None

class SomeClass:
    pass

>>> message = '''interpreter
... prompt'''
```

```javascript
/**
* nth element in the fibonacci series.
* @param n >= 0
* @return the nth element, >= 0.
*/
function fib(n) {
  var a = 1, b = 1;
  var tmp;
  while (--n >= 0) {
    tmp = a;
    a += b;
    b = tmp;
  }
  return a;
}

document.write(fib(10));
```

### 14. 表格

支持左、中、右对齐。

|项目 |价格 |数量|
|----:|:---|:--:|
|商品1|\$16|1   |
|商品2|\$4 |4   |
|商品3|\$1 |16  |

### 15. Todo List

- [ ] **Cmd Markdown开发**
  - [ ] 改进Cmd渲染算法，使用局部渲染技术提高渲染效率
  - [ ] 支持以PDF格式导出文稿
  - [x] 新增Todo列表功能
  - [x] 改进LaTex功能
    - [x] 修复LaTex公式渲染问题
    - [x] 新增LaTex公式编号功能
- [ ] **七月旅行准备**
  - [ ] 准备邮轮上需要携带的物品
  - [ ] 浏览日本免税店的物品
  - [x] 购买蓝宝石公主号七月一日的船票

### 16. 高亮文本

通过html \<mark\>标签实现。

<mark>这是高亮文本</mark>

### 17. 键盘按键

通过html \<kbd\>标签实现。

按<kbd>Ctrl</kbd>+<kbd>C</kbd>复制

### 18. 定义列表

苹果

: 红色的水果

橘子

: 橙色的水果

### 19. HTML实体

&copy; &reg; &trade; &nbsp; &amp; &lt; &gt;

[^1]: 这是第一个注脚的文本。

[^2]: 这是第二个注脚的文本。
