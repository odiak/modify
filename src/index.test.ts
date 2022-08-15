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

  test('set()', () => {
    expect(modify(obj1, (m) => m.set('a', 2))).toEqual({ ...obj1, a: 2 })

    expect(modify(obj1, (m) => m.set('b', (m) => m.set('b2', true)))).toEqual({
      ...obj1,
      b: { ...obj1.b, b2: true },
    })
  })

  test('replace()', () => {
    expect(modify(obj1, (m) => m.replace('a', 'hello'))).toEqual({
      ...obj1,
      a: 'hello',
    })
  })

  test('setDeep()', () => {
    expect(
      modify(obj1, (m) => m.setDeep(['b', 'b1', 1], (m) => m.value * 10))
    ).toEqual({
      ...obj1,
      b: {
        ...obj1.b,
        b1: [1, 20, 3],
      },
    })

    expect(modify(obj1, (m) => m.setDeep(['c', 1, 'x'], 99))).toEqual({
      ...obj1,
      c: [
        { x: 9, y: 3 },
        { x: 99, y: 0 },
      ],
    })
  })
})
