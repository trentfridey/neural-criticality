import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  genMessages,
  useNetworkState,
} from './propagate';

export default function Network({ sigma }) {
  const nodes = 4, layers = 6
  const { run } = useNetworkState(nodes, layers);
  const initialNetwork = Array.from({ length: layers }, () =>
    Array.from({ length: nodes }, (_, i) => 0)
  );
  const [nodeValues, setNodeValues] = useState(initialNetwork);
  const [animating, setAnimating] = useState(false);
  const [animatedValues, setAnimatedValues] = useState(initialNetwork);
  const [animatedLayer, setAnimatedLayer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [passedMessage, setPassedMessage] = useState()

  
  const height = 200;
  const width = 800;
  const radius = 20;
  const hSpace = (width - 2 * radius) / (layers - 1);
  const vSpace = (height - 2 * radius) / (nodes - 1);
  const grid = useMemo(
    () =>
      Array.from({ length: nodes }, (_, i) =>
        Array.from({ length: layers }, (__, j) => ({
          x: radius + j * hSpace,
          y: radius + i * vSpace,
        }))
      ),
    []
  );

  const numConnections = 3;

  const messages = useMemo(() => genMessages(4), [])

  const simulate = (sigma) => {
    const message = messages.at(Math.floor(messages.length * Math.random()));
    setPassedMessage(message);
    setAnimatedValues(() => initialNetwork);
    const updatedNetwork = run(message, numConnections, sigma);
    setNodeValues(updatedNetwork);
    setAnimating(true);
    setIsRunning(false);
  };

  const handleClick = () => {
    setIsRunning(true);
    simulate(sigma);
  };

  // animation

  const delay = 0.5;

  const textElem = useRef(
    Array.from({ length: layers }, () =>
      Array.from({ length: nodes }, (_, i) => 0)
    )
  );
  const circleElem = useRef(
    Array.from({ length: layers }, () =>
      Array.from({ length: nodes }, (_, i) => 0)
    )
  );

  useEffect(() => {
    const updateLayer = (layer) => {
      setTimeout(() => {
        setAnimatedValues((values) => {
          values[layer] = nodeValues[layer];
          return values;
        });
        nodeValues[layer].forEach((nodeValue, node) => {
          if (nodeValue === 1) {
            circleElem.current[layer][node].beginElement();
            textElem.current[layer][node].beginElement();
          }
        });
        if (layer === layers - 1) {
          setAnimating(false);
          setAnimatedLayer(0);
        } else {
          setAnimatedLayer((layer) => layer + 1);
        }
      }, (delay / 3) * 1000);
    };
    if (animating) {
      updateLayer(animatedLayer);
    }
  }, [animating, animatedLayer]);

  return (
    <>
      <button onClick={handleClick} disabled={isRunning}>
        {"Send message"}
      </button>
      <div
        style={{
          marginTop: 20,
          display: "flex",
          flexDirection: "row",
          width: "100%",
          alignItems: "center",
        }}
      >
        <svg
          style={{ margin: "auto" }}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          {grid.flatMap((rows, n) =>
            rows.map(({ x, y }, l) => {
              return (
                <g key={`${l}-${n}`}>
                  <circle
                    cx={x}
                    stroke="#1a1a1a"
                    cy={y}
                    r={radius}
                    fill="#1a1a1a"
                  >
                    <animate
                      begin="indefinte"
                      fill="freeze"
                      ref={(el) => (circleElem.current[l][n] = el)}
                      values="#1a1a1a;#646cff;#1a1a1a"
                      attributeName="stroke"
                      dur={`${delay * 2}s`}
                      calcMode={"paced"}
                      repeatCount={1}
                    />
                  </circle>
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline={"middle"}
                    fill="white"
                  >
                    {animatedValues[l][n]}
                    <animate
                      begin="indefinte"
                      fill="freeze"
                      ref={(el) => (textElem.current[l][n] = el)}
                      values="white;#646cff;white"
                      attributeName="fill"
                      dur={`${delay * 2}s`}
                      repeatCount={1}
                    />
                  </text>
                  {l !== rows.length - 1 &&
                    Array.from({ length: nodes }).map((partner, p) => (
                      <line
                        stroke="grey"
                        x1={x + radius}
                        x2={x + hSpace - radius}
                        y1={y}
                        y2={grid[p][l].y}
                      ></line>
                    ))}
                </g>
              );
            })
          )}
        </svg>
      </div>
    </>
  );
}
