export function useNetworkState(numNodes, numLayers) {
  
  const initializeMessage = (message) => {
    const nodes = Array.from({ length: numNodes });
    const layers = Array.from({ length: numLayers }, (_) => nodes);
    const initialNetwork = layers.map((nodes) => nodes.map((node) => 0));
    return [message.split("").map((v) => Number.parseInt(v)), ...initialNetwork.slice(1)]
  };

  const transmit = (node, layer, network, numConnections, sigma) => {
    let updatedNetwork = network
    if (network[layer][node] === 0) return updatedNetwork;
    const possibleConnections = Array.from({ length: numNodes }, (_, i) => i);
    let c = 0,
      connectedNodes = [];
    while (c < numConnections) {
      const sampleIndex = Math.floor(Math.random() * (possibleConnections.length))
      const sampledNode = possibleConnections.splice(sampleIndex, 1)[0]
      connectedNodes.push(sampledNode);
      c++;
    }
    let transmissionProb = Array.from({ length: numConnections }, (_) =>
      Math.random()
    );
    const magnitude = transmissionProb.reduce((acc, curr) => acc + curr, 0);
    transmissionProb = transmissionProb.map((p) => sigma*p / magnitude);
    connectedNodes.forEach((connectedNode, idx) => {
        if (Math.random() < transmissionProb[idx]) {
            network[layer+1][connectedNode] = 1
        }
    })
    return updatedNetwork
  };

  const propagate = (layer, network, numConnections, sigma) => {
    let updatedNetwork = [...network]
    Array.from({ length: numNodes }, (_, i) => i).forEach(node => {
      updatedNetwork = transmit(node, layer, network, numConnections, sigma)
    })
    if (layer < numLayers-2) {
      if (updatedNetwork.at(layer+1).every(v => v === 0)) return updatedNetwork
      return propagate(layer+1, updatedNetwork, numConnections, sigma)
    } else return updatedNetwork
  }

  const run = (message, numConnections, sigma) => {
    const initialized = initializeMessage(message)
    const network = propagate(0, initialized, numConnections, sigma)
    return network
  }

  return {
      propagate,
      run
  }
}

export const binaryStringToInt = (str) => {
  return Number.parseInt(str, 2);
};

export const genMessages = (nodes) => Array.from({ length: 2 ** nodes }, (x, i) =>
        (i).toString(2).padStart(4, "0")
      )