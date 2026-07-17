/**
 * Minimal Web Serial typings used by the scale helper.
 * Browsers without Serial support simply lack navigator.serial.
 */
type SerialPortLike = {
  open: (options: { baudRate: number }) => Promise<void>
  readable: ReadableStream<Uint8Array> | null
  close: () => Promise<void>
}

type SerialNavigator = Navigator & {
  serial?: {
    requestPort: () => Promise<SerialPortLike>
  }
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

/**
 * Prompts the user to pick a serial port, reads a short burst of data,
 * parses the first numeric weight value, then closes the port.
 *
 * Throws ScaleConnectionError when Serial is unsupported or the read fails,
 * so callers can fall back to the manual numpad.
 */
export async function requestScaleWeight(options?: {
  baudRate?: number
  readMs?: number
}): Promise<number> {
  const serial = (navigator as SerialNavigator).serial
  if (!serial) {
    throw new ScaleConnectionError('Web Serial API is not supported in this browser')
  }

  const baudRate = options?.baudRate ?? 9600
  const readMs = options?.readMs ?? 1500

  let port: SerialPortLike | null = null
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null

  try {
    port = await serial.requestPort()
    await port.open({ baudRate })

    if (!port.readable) {
      throw new ScaleConnectionError('Serial port is not readable')
    }

    reader = port.readable.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    const deadline = Date.now() + readMs

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
  } catch (error) {
    if (error instanceof ScaleConnectionError) {
      throw error
    }
    const message = error instanceof Error ? error.message : 'Failed to read from scale'
    throw new ScaleConnectionError(message)
  } finally {
    try {
      reader?.releaseLock()
    } catch {
      // ignore
    }
    try {
      await port?.close()
    } catch {
      // ignore
    }
  }
}

/** Extracts the first decimal number from a scale text stream (e.g. "ST,GS,  0.250 kg"). */
export function parseWeightFromBuffer(buffer: string): number | null {
  const match = buffer.match(/-?\d+(?:\.\d+)?/)
  if (!match) return null

  const value = Number.parseFloat(match[0])
  if (!Number.isFinite(value) || value < 0) return null
  return value
}
