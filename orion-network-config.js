/* Optional own relay. Empty relayUrl keeps existing PeerJS rooms compatible.
   Configure the SAME wss:// endpoint for all players after deploying server/. */
window.ORION_NETWORK=Object.assign({relayUrl:'',connectionTimeout:25000,disconnectGrace:45000},window.ORION_NETWORK||{});
