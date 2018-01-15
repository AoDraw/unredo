# Unredo
Undo & Redo Action in JavaScript

```
npm i unredo2 --save
```

撤销/重做模块。主要包含三个类，`Command`、`CommandManager`、`SynthetiseCommand`。

## Command

我们把用户的操作行为都抽象为一种类：`Command`，一个 `Command` 包含用户操作的两个方面：执行和撤销。

`Command` 是一个抽象的类，不要直接实例化它，没什么卵用。你只能继承它来定义需要的 `Command`；继承 `Command` 的时候你必须重写它的两个方法，`exec`（执行）和 `rollback`（撤销），两者为一一对应的正反操作。

e.g.

```javascript
import { Command } from 'unredo'

class InsertImageCommand extends Command {
  constructor (img) {
    this.img = img
  }

  exec () {
    document.body.appendChild(this.img)
  }

  rollback () {
    document.body.removeChild(this.img)
  }
}

const img = document.createElement('img')
img.src = "http://baidu.com"
const insertBaiduImgCommand = new InsertImageCommand(img)


/* 插入删除同一张照片 */
insertBaiduImgCommand.exec() // 插入
insertBaiduImgCommand.roolback() // 删除
insertBaiduImgCommand.exec() // 插入
insertBaiduImgCommand.roolback() // 删除
...
```

Command 就是一个用户操作的执行和回滚的基本单元。对于一个用户操作复杂的应用，你可能需要自定义很多 Command。但有时候我们不是像上面那样直接执行 `exec` 和 `rollback` 函数，因为有可能用户的实际操作和程序上的撤销重做不是完全一样的（例如用户操作的时候有动画，而程序回滚和撤销没有动画），这时候可能就是额外写一些逻辑，这些逻辑和 `exec` 的结果一样，但是过程不一样。实际上对于用户交互丰富的程序来说，`exec` 和 `rollback` 你可能不需要调用，它们是提供给 `CommandManager` 内部调用的。

## CommandManager

用户的一系列操作可能由不同的 Command 组合而成，`CommandManager` 就是帮助你维护用户在这一系列操作当中的的撤销、重做。一个用户场景一般来说你只需要实例化一个 `CommandManager` 就够了。`CommandManager` 有几个方法 `add`、`backwards`、`forwards`。用法就是：只要用户进行操作了，你就用 CommandManager 往里面 `add()` Command，用户撤销就 `backwards()`，用户重做就 `forwards()`

```javascript
import { Command, CommandManager } from 'unredo'

class InsertImageCommand extends Command {...}
class DeleteImageCommand extends Command {...}
class InsertDivCommand extends Command {...}
class DeleteDivCommand extends Command {...}

const commandManager = new CommandManager()

// 事件监听都是伪代码
$(window).on('ctrl + i', () => {
  const insertImage = new InsertImageCommand(...)
  // 插入图片逻辑
  // ...
  
  commandManager.add(insertImage)
})

$(window).on('ctrl + k', () => {
  const deleteImage = new DeleteImageCommand(...)
  // ...
  commandManager.add(deleteImage)
})

$(window).on('ctrl + j', () => {
  const insertDiv = new InsertDivCommand(...)
  // ...
  commandManager.add(insertDiv)
})

$(window).on('ctrl + z', () => {
  commandManager.backwards() // 撤销，内部调用 rollback
})

$(window).on('ctrl + shift + z', () => {
  commandManager.forwards() // 重做，内部调用 exec
})

```

`commandManager.add` 其实只会把命令 `push` 到一个队列里面，而不会执行 `Command` 的 `exec` 操作。上面的 `// ...` 就是所说的结果一样但行为不一样的额外逻辑。

## SynthetiseCommand

很经常有一些操作是由多个操作组合而成的操作，例如说把 C 节点从 A 节点移动到 B 节点，这一个 “移动” 操作其实是由 “删除” 和 “插入” 两个动作组合而成。但其实对于用户来说这一个 “移动” 操作只是一个操作（撤销和重做都是一个单元），所以就有了 `SynthetiseCommand`，它可以把多个操作的组合操作变成一个新的操作。

e.g.

```javascript
import { Command, CommandManager, SynthetiseCommand } from 'unredo'

class DeleteNodeCommand extends Command {...}
class AddNodeCommand extends Command {...}

const commandManager = new CommandManager()

const moveNodeFromTo = (node, from, to) => {
  const deleteNodeCommand = new DeleteNodeCommand(node, from)
  const addNodeCommand = new DeleteNodeCommand(node, to)

  const moveCommand = new SynthetiseCommand()
  moveCommand.add(deleteNodeCommand)
  moveCommand.add(addNodeCommand) // 这两个命令合成了一个 move 命令

  // ...额外逻辑

  commandManager.add(moveCommand)
}

```
