export type Cleanup = (...args: any[]) => void

export type AddCleanup = (f: Cleanup) => void

export interface Cleanups {
  addCleanup: AddCleanup
  cleanUp(): void
}

export const makeCleanups = () => {
  const cleanups: Cleanup[] = []
  function addCleanup(f: Cleanup): void {
    cleanups.push(f)
  }
  function cleanUp(): void {
    for (let cleanup of cleanups) {
      cleanup()
    }
  }
  return {
    addCleanup,
    cleanUp
  }
}
