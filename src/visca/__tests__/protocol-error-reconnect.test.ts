import { InstanceStatus } from '@companion-module/base'
import net from 'node:net'
import { afterEach, expect, test } from 'vitest'
import { isValidHost } from '../../config.js'
import { VISCAPort } from '../port.js'

let server: net.Server | undefined
let port: VISCAPort | undefined

afterEach(async () => {
	port?.close('test over', InstanceStatus.Disconnected)
	await new Promise<void>((resolve) => (server ? server.close(() => resolve()) : resolve()))
})

test('after a garbled camera reply, the port reconnects by itself', async () => {
	const statuses: InstanceStatus[] = []
	const instance = {
		log: () => {},
		updateStatus: (status: InstanceStatus) => void statuses.push(status),
		debugLogging: false,
	}

	// A "camera" that sends garbage (doesn't start with 0x90) to the first
	// connection and behaves quietly with the next.
	let connections = 0
	server = net.createServer((socket) => {
		connections++
		socket.on('error', () => {})
		if (connections === 1) {
			socket.write(Buffer.from([0x12, 0x34, 0xff]))
		}
	})
	await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve))
	const { port: serverPort } = server.address() as net.AddressInfo

	const host = '127.0.0.1'
	if (!isValidHost(host)) throw new Error('bad host')

	port = new VISCAPort(instance, 50)
	port.open(host, serverPort)

	for (let i = 0; i < 100 && connections < 2; i++) {
		await new Promise((resolve) => setTimeout(resolve, 50))
	}
	await new Promise((resolve) => setTimeout(resolve, 100))

	expect(connections).toBe(2)
	expect(statuses).toContain(InstanceStatus.ConnectionFailure)
	expect(statuses.at(-1)).toBe(InstanceStatus.Ok)
})
