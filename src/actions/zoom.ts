import type { CompanionActionEvent, CompanionInputFieldDropdown } from '@companion-module/base'
import type { ActionDefinitions } from './actionid.js'
import { ZoomIn, ZoomInVariable, ZoomOut, ZoomOutVariable, ZoomStop } from '../camera/zoom.js'
import type { PtzOpticsInstance } from '../instance.js'
import { speedChoices } from './speeds.js'

/** The id of the zoom speed option on the Zoom In and Zoom Out actions. */
const ZoomSpeedOptionId = 'speed'

/** The zoom speed option value meaning "the camera's standard zoom speed". */
const StandardZoomSpeed = 'standard'

const zoomSpeedOption: CompanionInputFieldDropdown = {
	type: 'dropdown',
	id: ZoomSpeedOptionId,
	label: 'Zoom speed',
	default: StandardZoomSpeed,
	choices: [{ id: StandardZoomSpeed, label: 'Standard' }, ...speedChoices(0, 7)],
}

/** Read the zoom speed from an action's options: a number 0-7, or null for standard. */
function zoomSpeed(event: CompanionActionEvent): number | null {
	const speed = Number(event.options[ZoomSpeedOptionId])
	if (event.options[ZoomSpeedOptionId] === StandardZoomSpeed || !Number.isInteger(speed) || speed < 0 || speed > 7) {
		return null
	}
	return speed
}

export const ZoomActionId = {
	StartZoomIn: 'zoomI',
	StartZoomOut: 'zoomO',
	StopZoom: 'zoomS',
} as const

export type ZoomActionId = (typeof ZoomActionId)[keyof typeof ZoomActionId]

export function zoomActions(instance: PtzOpticsInstance): ActionDefinitions<ZoomActionId> {
	return {
		[ZoomActionId.StartZoomIn]: {
			name: 'Zoom In',
			options: [zoomSpeedOption],
			callback: async (event: CompanionActionEvent) => {
				const speed = zoomSpeed(event)
				if (speed === null) {
					instance.sendCommand(ZoomIn)
				} else {
					instance.sendCommand(ZoomInVariable, { speed })
				}
			},
		},
		[ZoomActionId.StartZoomOut]: {
			name: 'Zoom Out',
			options: [zoomSpeedOption],
			callback: async (event: CompanionActionEvent) => {
				const speed = zoomSpeed(event)
				if (speed === null) {
					instance.sendCommand(ZoomOut)
				} else {
					instance.sendCommand(ZoomOutVariable, { speed })
				}
			},
		},
		[ZoomActionId.StopZoom]: {
			name: 'Zoom Stop',
			options: [],
			callback: async (_event: CompanionActionEvent) => {
				instance.sendCommand(ZoomStop)
			},
		},
	}
}
