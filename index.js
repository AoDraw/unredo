export class Command {
  exec () {
    console.warn(`\`exec\` method is not implemented in command class ${this.constructor.name}.`)
  }
  rollback () {
    console.warn(`\`rollback\` method is not implemented in command class ${this.constructor.name}.`)
  }
}

export class SynthetiseCommand extends Command {
  constructor (...args) {
    super()
    this.commands = args
  }

  get size () {
    return this.commands.length
  }

  add (command) {
    this.commands.push(command)
  }

  exec () {
    this.commands.forEach(command => command.exec())
  }

  rollback () {
    [...this.commands]
      .reverse()
      .forEach(command => command.rollback())
  }
}

export class CommandManager {
  constructor () {
    this.commands = []
    /* 0 ~ this.cursor - 1 are not recovered states */
    this.cursor = 0
  }

  reset () {
    this.cursor = 0
  }

  clear() {
    this.commands = []
    this.cursor = 0
  }

  add (command) {
    const { cursor, commands } = this
    if (command instanceof SynthetiseCommand && command.size === 0) return
    if (cursor !== commands.length) {
      let newCommands = commands.slice(0, this.cursor)
      newCommands.push(command)
      this.commands = newCommands
    } else {
      this.commands.push(command)
    }
    this.cursor++
  }

  backwards () {
    if (this.cursor === 0 || state.isAnimating) return
    const command = this.commands[--this.cursor]
    command.rollback()
  }

  forwards () {
    if (this.cursor === this.commands.length || state.isAnimating) return
    const command = this.commands[this.cursor++]
    command.exec()
  }
}
