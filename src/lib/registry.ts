const KEY = 'noteki:registry'

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function save(registry: Set<string>) {
  localStorage.setItem(KEY, JSON.stringify([...registry]))
}

export function getRegistry(): Set<string> {
  return load()
}

export function addToRegistry(points: string[]) {
  const registry = load()
  for (const p of points) registry.add(p)
  save(registry)
}

export function isInRegistry(front: string): boolean {
  return load().has(front)
}
