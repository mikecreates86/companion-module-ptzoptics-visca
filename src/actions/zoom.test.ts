import { describe, expect, test, vi } from 'vitest'
import { ZoomActionId, zoomActions } from './zoom.js'
import { ZoomIn, ZoomInVariable, ZoomOut, ZoomOutVariable } from '../camera/zoom.js'
import type { PtzOpticsInstance } from '../instance.js'

function run(actionId: typeof ZoomActionId.StartZoomIn | typeof ZoomActionId.StartZoomOut, speed: unknown) {
	const sendCommand = vi.fn()
	const actions = zoomActions({ sendCommand } as unknown as PtzOpticsInstance)
	void actions[actionId].callback({ options: { speed } } as never, {} as never)
	return sendCommand
}

describe('zoom speed', () => {
	test('standard (and missing/old configs) keep the original fixed-speed commands', () => {
		expect(run(ZoomActionId.StartZoomIn, 'standard')).toHaveBeenCalledWith(ZoomIn)
		expect(run(ZoomActionId.StartZoomOut, undefined)).toHaveBeenCalledWith(ZoomOut)
	})

	test('a chosen speed uses the variable-speed commands', () => {
		expect(run(ZoomActionId.StartZoomIn, 7)).toHaveBeenCalledWith(ZoomInVariable, { speed: 7 })
		expect(run(ZoomActionId.StartZoomOut, 0)).toHaveBeenCalledWith(ZoomOutVariable, { speed: 0 })
	})

	test('variable commands encode 2p / 3p', () => {
		expect(ZoomInVariable.toBytes({ speed: 5 })).toEqual([0x81, 0x01, 0x04, 0x07, 0x25, 0xff])
		expect(ZoomOutVariable.toBytes({ speed: 3 })).toEqual([0x81, 0x01, 0x04, 0x07, 0x33, 0xff])
	})
})
