import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { BlockMath } from 'react-katex';

import {
  AxisBottom,
  AxisRight,
} from '@visx/axis';
import { HeatmapRect } from '@visx/heatmap';
import { scaleLinear } from '@visx/scale';

import {
  binaryStringToInt,
  genMessages,
  useNetworkState,
} from './propagate';

export default function Heatmap({ sigma, width, height, label, isRunning }) {
  const x = (d) => d.input;
  const y = (d) => d.output;
  const f = (d) => d.frequency;

  const nodes = 4;

  const messages = genMessages(nodes);
  const loopId = useRef(null)
  const [results, setResults] = useState(() => {
    return messages.reduce(
      (acc, input) => ({
        ...acc,
        [binaryStringToInt(input)]: messages.reduce(
          (oacc, output) => ({
            ...oacc,
            [binaryStringToInt(output)]: 0,
          }),
          {}
        ),
      }),
      {}
    );
  });

  const { run } = useNetworkState(nodes, 6);

  const margin = {
    top: 20,
    left: 20,
    bottom: 40,
    right: 40,
  };

  const xMax = width - margin.right;
  const yMax = height - margin.bottom;

  const data = Object.entries(results).map(([input, value]) => {
    return {
      input: Number.parseInt(input),
      bins: Object.entries(value).map(([output, frequency]) => ({
        output: Number.parseInt(output),
        frequency: frequency || 0,
      })),
    };
  });

  useEffect(() => {
    function simulate() {
      const result = run(
        messages.at(Math.floor(Math.random() * messages.length)),
        3,
        sigma
      );
      const input = binaryStringToInt(result.at(0).join(""));
      const output = binaryStringToInt(result.at(-1).join(""));
      setResults((results) => {
        const newResults = { ...results };
        newResults[input][output] += 1;
        return newResults;
      });
      loopId.current = setTimeout(simulate, 100)
    }
    console.log(isRunning)
    if (isRunning) loopId.current = setTimeout(simulate, 100)
    if (!isRunning) {
      clearTimeout(loopId.current)
    }
  }, [isRunning]);

  const xScale = scaleLinear({
    domain: [0, Math.max(...data.map(x))],
    range: [margin.left, xMax],
  });

  const yScale = xScale;
  yScale.range([yMax, margin.top]);

  const cool2 = "#646cff";
  const cool1 = "#242424";

  const colorScale = scaleLinear({
    range: [cool1, cool2],
    domain: [0, Math.max(...data.flatMap((d) => d.bins.map(f)))],
  });

  const bWidth = 10;

  const mutualInformation = useMemo(() => {
    let norm = 0;
    for (let input of messages) {
      for (let output of messages) {
        norm += results[binaryStringToInt(input)][binaryStringToInt(output)];
      }
    }
    const probXY = (x, y) => results[x][y] / norm;
    const probX = (x) =>
      messages.reduce(
        (acc, curr) => acc + probXY(x, binaryStringToInt(curr)),
        0
      );
    const probY = (y) =>
      messages.reduce(
        (acc, curr) => acc + probXY(binaryStringToInt(curr), y),
        0
      );
    let p = 0;
    let m = 0;
    for (let input of messages) {
      const x = binaryStringToInt(input);
      if (probX(x) > 0) {
        for (let output of messages) {
          const y = binaryStringToInt(output);
          if (probXY(x, y) > 0) {
            m +=
              -1 * probY(y) * Math.log2(probY(y)) +
              probXY(x, y) * Math.log2(probXY(x, y) / probX(x));
          }
        }
      }
    }
    return m / Math.pow(2, nodes);
  }, [results]);

  return (
    <div>
      <center>{label}</center>
      <svg height={height} width={width}>
        <HeatmapRect
          data={data}
          xScale={xScale}
          yScale={yScale}
          colorScale={colorScale}
          opacity={1}
          binWidth={bWidth}
          binHeight={bWidth}
          gap={3}
          count={f}
          stroke="black"
          strokeWidth={0.5}
        />
        <AxisBottom
          scale={xScale}
          orientation="bottom"
          fill="white"
          top={height - margin.top}
          label="input"
          labelProps={{ fill: "white", fontSize: 12, textAnchor: "middle" }}
          labelOffset={-20}
          tickValues={[]}
          hideAxisLine
          hideTicks
        />
        <AxisRight
          scale={yScale}
          orientation="right"
          left={width - margin.left}
          fill="white"
          label="output"
          labelProps={{ fill: "white", fontSize: 12, textAnchor: "middle" }}
          labelOffset={0}
          hideTicks
          hideAxisLine
          tickValues={[]}
        />
      </svg>
      <BlockMath>{`I(X;Y) = ${Math.max(mutualInformation, 0).toFixed(
        2
      )} ~ \\text{bits}`}</BlockMath>
    </div>
  );
}
