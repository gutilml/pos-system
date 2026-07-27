/**
 * Minimal Web Serial typings used by the scale helper.
 * Browsers without Serial support simply lack navigator.serial.
 */
type SerialPortLike = {
  open: (options: { baudRate: number }) => Promise<void>
  readable: ReadableStream<Uint8Array> | null
  close: () => Promise<void>
}

type SerialApi = {
  requestPort: () => Promise<SerialPortLike>
  getPorts: () => Promise<SerialPortLike[]>
}

type SerialNavigator = Navigator & {
  serial?: SerialApi
}

export class ScaleConnectionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ScaleConnectionError'
  }
}

export function isWebSerialSupported(): boolean {
  if (typeof navigator === 'undefined') return false
  return Boolean((navigator as SerialNavigator).serial)
}

function getSerial(): SerialApi {
  const serial = (navigator as SerialNavigator).serial
  if (!serial) {
    throw new ScaleConnectionError('Web Serial API is not supported in this browser')
  }
  return serial
}

/** Previously granted ports (no user gesture required). */
export async function listGrantedScalePorts(): Promise<SerialPortLike[]> {
  if (!isWebSerialSupported()) return []
  try {
    return await getSerial().getPorts()
  } catch {
    return []
  }
}

export async function hasGrantedScalePort(): Promise<boolean> {
  const ports = await listGrantedScalePorts()
  return ports.length > 0
}

/**
 * Prompt the user to grant a serial port (requires a user gesture).
 * Used for early Connect scale / reconnect.
 */
export async function pairScalePort(): Promise<void> {
  const serial = getSerial()
  const port = await serial.requestPort()
  // Open+close once so Chrome remembers a usable grant and we verify access.
  await port.open({ baudRate: 9600 })
  try {
    await port.close()
  } catch {
    // ignore
  }
}

async function readWeightFromPort(
  port: SerialPortLike,
  options: { baudRate: number; readMs: number },
): Promise<number> {
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null
  try {
    await port.open({ baudRate: options.baudRate })
    if (!port.readable) {
      throw new ScaleConnectionError('Serial port is not readable')
    }

    reader = port.readable.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    const deadline = Date.now() + options.readMs

    while (Date.now() < deadline) {
      const remaining = deadline - Date.now()
      const result = await Promise.race([
        reader.read(),
        new Promise<{ value?: Uint8Array; done: boolean }>((resolve) =>
          setTimeout(() => resolve({ done: false, value: undefined }), remaining),
        ),
      ])

      if (result.value) {
        buffer += decoder.decode(result.value, { stream: true })
        const parsed = parseWeightFromBuffer(buffer)
        if (parsed !== null) {
          return parsed
        }
      }

      if (result.done) {
        break
      }
    }

    const parsed = parseWeightFromBuffer(buffer)
    if (parsed !== null) {
      return parsed
    }

    throw new ScaleConnectionError('No numeric weight value received from scale')
  } finally {
    try {
      reader?.releaseLock()
    } catch {
      // ignore
    }
    try {
      await port.close()
    } catch {
      // ignore
    }
  }
}

export type ReadScaleWeightOptions = {
  baudRate?: number
  readMs?: number
  /** When true and no granted port exists, call requestPort (needs user gesture). */
  allowPrompt?: boolean
}

/**
 * Read a weight from a previously granted port, or optionally prompt for a port.
 */
export async function readScaleWeight(options?: ReadScaleWeightOptions): Promise<number> {
  const baudRate = options?.baudRate ?? 9600
  const readMs = options?.readMs ?? 1500
  const allowPrompt = options?.allowPrompt === true
  const serial = getSerial()

  try {
    const granted = await serial.getPorts()
    if (granted.length > 0) {
      let lastError: unknown
      for (const port of granted) {
        try {
          return await readWeightFromPort(port, { baudRate, readMs })
        } catch (error) {
          lastError = error
        }
      }
      if (lastError instanceof ScaleConnectionError) {
        throw lastError
      }
      throw new ScaleConnectionError(
        lastError instanceof Error ? lastError.message : 'Failed to read from scale',
      )
    }

    if (!allowPrompt) {
      throw new ScaleConnectionError('No scale paired. Connect a scale in Settings.')
    }

    const port = await serial.requestPort()
    return await readWeightFromPort(port, { baudRate, readMs })
  } catch (error) {
    if (error instanceof ScaleConnectionError) {
      throw error
    }
    const message = error instanceof Error ? error.message : 'Failed to read from scale'
    throw new ScaleConnectionError(message)
  }
}

/** Prefer readScaleWeight({ allowPrompt: true }); kept for existing call sites. */
export async function requestScaleWeight(options?: {
  baudRate?: number
  readMs?: number
}): Promise<number> {
  return readScaleWeight({ ...options, allowPrompt: true })
}

/** Extracts the first decimal number from a scale text stream (e.g. "ST,GS,  0.250 kg"). */
export function parseWeightFromBuffer(buffer: string): number | null {
  const match = buffer.match(/-?\d+(?:\.\d+)?/)
  if (!match) return null

  const value = Number.parseFloat(match[0])
  if (!Number.isFinite(value) || value < 0) return null
  return value
}

export const SCALE_BANNER_DISMISS_KEY = 'pos-scale-banner-dismissed'

/** Client-local mock scale (Feature 100) — no Web Serial when enabled. */
export const MOCK_SCALE_STORAGE_KEY = 'pos-mock-scale-enabled'
/** Fixed fake weight (kg/unit of measure) filled when mock scale is on. */
export const MOCK_SCALE_WEIGHT = 1
export const MOCK_SCALE_CHANGE_EVENT = 'pos-mock-scale-change'

export function isMockScaleEnabled(): boolean {
  if (typeof localStorage === 'undefined') return false
  try {
    return localStorage.getItem(MOCK_SCALE_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function setMockScaleEnabled(enabled: boolean): void {
  if (typeof localStorage === 'undefined') return
  try {
    if (enabled) {
      localStorage.setItem(MOCK_SCALE_STORAGE_KEY, '1')
    } else {
      localStorage.removeItem(MOCK_SCALE_STORAGE_KEY)
    }
  } catch {
    // ignore quota / private mode
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(MOCK_SCALE_CHANGE_EVENT))
  }
}
