import { ModuleDefinedCommand } from '../visca/command.js'

export const ZoomIn = new ModuleDefinedCommand([0x81, 0x01, 0x04, 0x07, 0x02, 0xff])
export const ZoomOut = new ModuleDefinedCommand([0x81, 0x01, 0x04, 0x07, 0x03, 0xff])
export const ZoomStop = new ModuleDefinedCommand([0x81, 0x01, 0x04, 0x07, 0x00, 0xff])

/** Zoom in (tele) at a variable speed `p` (0 = slowest, 7 = fastest): `81 01 04 07 2p FF`. */
export const ZoomInVariable = new ModuleDefinedCommand([0x81, 0x01, 0x04, 0x07, 0x20, 0xff], {
	speed: { nibbles: [9] },
})

/** Zoom out (wide) at a variable speed `p` (0 = slowest, 7 = fastest): `81 01 04 07 3p FF`. */
export const ZoomOutVariable = new ModuleDefinedCommand([0x81, 0x01, 0x04, 0x07, 0x30, 0xff], {
	speed: { nibbles: [9] },
})
