type Dispatch<T, R = T> = (modifier: Modifier<T>) => R | Modifier<R>
type ValueOrDispatch<T, R = T> = Dispatch<T, R> | R

type Replace<T, K extends keyof T, V> = any[] extends T
  ? ReplaceArray<T, V>
  : ReplaceObject<T, K, V>
type ReplaceArray<T, V> = T extends (infer E)[]
  ? (E | V)[]
  : T extends readonly (infer E)[]
  ? readonly (E | V)[]
  : never
type ReplaceObject<T, K extends keyof T, V> = {
  [Key in keyof T]: Key extends K ? V : T[Key]
}

type IfNotKeyOf<T, K> = K extends keyof T ? never : K
type Add<T, K extends string | number, V> = K extends keyof T
  ? T
  : T & { [k in K]: V }

function validate(value: unknown, noArray: boolean = false) {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'number' ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (noArray && Array.isArray(value))
  ) {
    throw new Error(`Cannot perform operation for value: ${value}`)
  }
}

class Modifier<T> {
  constructor(public value: T) {}

  replace<K extends keyof T, R>(
    key: K,
    valueOrDispatch: ValueOrDispatch<T[K], R>
  ): Modifier<Replace<T, K, R>> {
    const whole = this.value
    validate(whole)
    const value = whole[key]
    const newValue =
      typeof valueOrDispatch === 'function'
        ? unwrap((valueOrDispatch as Dispatch<T[K], R>)(new Modifier(value)))
        : valueOrDispatch
    const newWhole = copyObject(whole) as Replace<T, K, R>
    ;(newWhole as any)[key] = newValue
    return new Modifier(newWhole)
  }

  set<K extends keyof T>(
    key: K,
    valueOrDispatch: ValueOrDispatch<T[K]>
  ): Modifier<T> {
    return this.replace<K, T[K]>(key, valueOrDispatch) as unknown as Modifier<T>
  }

  setDeep<K extends keyof T>(
    key: [K],
    valueOrDispatch: ValueOrDispatch<T[K]>
  ): Modifier<T>
  setDeep<K1 extends keyof T, K2 extends keyof T[K1]>(
    keys: [K1, K2],
    valueOrDispatch: ValueOrDispatch<T[K1][K2]>
  ): Modifier<T>
  setDeep<
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2]
  >(
    keys: [K1, K2, K3],
    valueOrDispatch: ValueOrDispatch<T[K1][K2][K3]>
  ): Modifier<T>
  setDeep(
    keys: Array<string | number>,
    valueOrDispatch: ValueOrDispatch<unknown>
  ): Modifier<T> {
    if (keys.length === 0) throw new Error('keys must not be empty')

    const whole = this.value
    validate(whole)
    const newWhole = copyObject(whole)
    let obj: any = whole
    let copy: any = newWhole
    for (const [i, key] of keys.entries()) {
      obj = obj[key]
      if (i !== keys.length - 1) {
        if (obj === null || obj === undefined)
          throw new Error(`Cannot read '${key}' of ${obj}`)
        copy[key] = copyObject(copy[key])
        copy = copy[key]
      }
    }
    const value = obj
    const newValue =
      typeof valueOrDispatch === 'function'
        ? unwrap(valueOrDispatch(new Modifier(value)))
        : valueOrDispatch
    copy[keys[keys.length - 1]] = newValue
    return new Modifier(newWhole)
  }

  remove<K extends keyof T>(key: K): Modifier<Omit<T, K>> {
    const whole = this.value
    validate(whole, true)
    const newWhole = copyObject(whole)
    delete newWhole[key]
    return new Modifier(newWhole as Omit<T, K>)
  }

  add<K extends string | number, V>(
    key: IfNotKeyOf<T, K>,
    valueOrDispatch: ValueOrDispatch<T, V>
  ): Modifier<Add<T, K, V>> {
    const whole = this.value
    validate(whole, true)
    const value =
      typeof valueOrDispatch === 'function'
        ? unwrap((valueOrDispatch as Dispatch<T, V>)(new Modifier(whole)))
        : valueOrDispatch
    return new Modifier({ ...whole, [key]: value } as Add<T, K, V>)
  }
}
export type { Modifier }

function copyObject<T>(value: T): T {
  if (Array.isArray(value)) {
    return [...value] as unknown as T
  }
  return { ...value }
}

function unwrap<T>(value: T | Modifier<T>): T {
  if (value instanceof Modifier) return value.value
  return value
}

export function modify<T, R>(
  value: T,
  f: (modifier: Modifier<T>) => R | Modifier<R>
): R {
  return unwrap(f(new Modifier(value)))
}
