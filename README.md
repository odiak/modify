# @odiak/modify

Just immutably modify objects/arrays.

## Example

```ts
import { modify } from '@odiak/modify'

const object = {
  a: 'hello',
  b: [
    { x: 1, y: 2 },
    { x: 5, y: 3 },
  ],
}

modify(object, (m) => m.set('a', 'world')) // { a: 'world' ... }
modify(object, (m) => m.set('a', (m) => m.value + '!!')) // { a: 'hello!!' ... }
// replace() behaves same as set(), but can change type.
modify(object, (m) => m.replace('a', (m) => m.value.length)) // { a: 5 ... }
modify(object, (m) => m.setDeep(['b', 1, 'y'], 99)) // { ... b: [{ x: 1, y: 2}, {x: 5, y: 99}] }

const array = ['hey', 'ok', 'nice']
modify(array, (m) => m.set(1, 'yo')) // ['hey', 'yo', 'nice']
```
