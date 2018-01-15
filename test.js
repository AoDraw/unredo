import test from 'ava'
import { Command, CommandManager, SynthetiseCommand } from './index'

test('Commands can be executed and rollbacked by CommandManager', () =>  {
  const manager = new CommandManager()
  let counter = 0

  class Add1 extends Command {
    exec () {
      counter += 1
    }
    rollback () {
      counter -= 1
    }
  }

  class Mul2 extends Command {
    exec () {
      counter *= 1
    }
    rollback () {
      counter /= 1
    }
  }
})
