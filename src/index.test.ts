import { modify } from '.'

describe('modify', () => {
  const obj1 = {
    a: 1,
    b: {
      b1: [1, 2, 3],
      b2: false,
    },
    c: [
      { x: 9, y: 3 },
      { x: 78, y: 0 },
    ],
  }
  const array1 = ['a', 'bb', 'ccc']
  const array2 = [
    { x: 9, y: 8 },
    { x: -3, y: 11 },
  ]

  test('set()', () => {
    expect(modify(obj1, (m) => m.set('a', 2))).toEqual({ ...obj1, a: 2 })

    expect(modify(obj1, (m) => m.set('b', (m) => m.set('b2', true)))).toEqual({
      ...obj1,
      b: { ...obj1.b, b2: true },
    })

    expect(modify(obj1, (m) => m.set('a', (m) => m.value + 10))).toEqual({
      ...obj1,
      a: 11,
    })

    expect(modify(array1, (m) => m.set(0, 'AAA'))).toEqual(['AAA', 'bb', 'ccc'])
    expect(modify(array1, (m) => m.set(1, (m) => `${m.value}!!`))).toEqual([
      'a',
      'bb!!',
      'ccc',
    ])
  })

  test('replace()', () => {
    expect(modify(obj1, (m) => m.replace('a', 'hello'))).toEqual({
      ...obj1,
      a: 'hello',
    })

    expect(
      modify(obj1, (m) => m.replace('a', (m) => `hello${m.value}`))
    ).toEqual({ ...obj1, a: 'hello1' })
  })

  test('setDeep()', () => {
    expect(modify(obj1, (m) => m.setDeep(['c', 1, 'x'], 99))).toEqual({
      ...obj1,
      c: [
        { x: 9, y: 3 },
        { x: 99, y: 0 },
      ],
    })

    expect(
      modify(obj1, (m) => m.setDeep(['b', 'b1', 1], (m) => m.value * 10))
    ).toEqual({
      ...obj1,
      b: {
        ...obj1.b,
        b1: [1, 20, 3],
      },
    })

    expect(modify(array2, (m) => m.setDeep([1, 'x'], 99))).toEqual([
      array2[0],
      { ...array2[1], x: 99 },
    ])
  })

  test('remove()', () => {
    expect(modify(obj1, (m) => m.remove('b'))).toEqual({ a: obj1.a, c: obj1.c })
  })

  test('add()', () => {
    expect(modify(obj1, (m) => m.add('x', 'this is X'))).toEqual({
      ...obj1,
      x: 'this is X',
    })

    expect(modify(obj1, (m) => m.add('y', (m) => `a is ${m.value.a}`))).toEqual(
      { ...obj1, y: 'a is 1' }
    )
  })
})
