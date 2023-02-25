import './App.css';
import 'katex/dist/katex.min.css';

import { useState } from 'react';

import {
  BlockMath,
  InlineMath,
} from 'react-katex';

import { ParentSize } from '@visx/responsive';

import Heatmap from './Heatmap';
import LargeHeatmap from './LargeHeatmap';
import Network from './Network';

function App() {
  const [isRunning, setIsRunning] = useState(false)
  return (
    <div>
      <h1>Self-organized Criticality in Neural Networks</h1>
      <h2>What is self-organized criticality?</h2>
      <div>
        <p>
          Self-organized criticality describes dynamical systems that have an
          attractor as a critical point. This means that over time, the dynamics
          of the system tend to operate in the vicinity of a phase-transition.
          The simplest example of self-organized criticality is found in the
          slope of a sandpile. As grains of sand are added to the sandpile, the
          slope builds up to a critical point, after which an avalanche is
          triggered and the system relaxes the slope back down.
        </p>
        <h2>How does this apply to neural networks?</h2>
        <p>
          There are two competing demands in a functional neural network:
          <ol>
            <li>Optimize information transmission</li>
            <li>Maintain stability of the system</li>
          </ol>
          The first requires that the network is excitable enough that an input
          signal can propagate through the system. The second requires that the
          network is inhibited enough that a weak signal does not grow
          exponentially as it propagates. The point of balance between these two
          requirements is called the <b>critical point</b>.
        </p>
        <p>
          To make this a little less abstract, we can set up a toy network with
          nodes that have a binary value and propagate the value to the next
          layer randomly. Here's an example network operating below the critical
          point (sub-critical):
        </p>
        <Network sigma={0.5} />
        <p>
          We can see that the message dies out after a few transmissions on
          average. This network does not function well as a message transmitter!
        </p>
        <p>
          A network that is operating at a supercritical level doesn't do much
          better
        </p>
        <Network sigma={3} />
        <p>
          In almost every case, the message "blows up" by the final
          transmission. While this network transmits the message, it ends up as
          the <i>wrong</i> message.{" "}
        </p>
        <p>
          Here's a network that operates at the <b>critical point</b>
        </p>
        <Network sigma={1.5} />
        <p>
          For a network operating at a critical point, most messages don't die
          out, and they don't blow up. Great!
        </p>
        <p>
          "But" -- you might say -- "the message at the output is different from
          the input!"
        </p>
        <p>
          You're right, however, this is an unavoidable result of the stochastic
          (random) nature of neural firing. Nevertheless, we can show that, on
          average, the network at the critical point maximizes the information
          transmitted. We can measure this with a quantity called the{" "}
          <b>mutual information</b>:
          <BlockMath>
            {
              "I(X;Y) = \\sum_{x,y} P(x,y) \\log\\left(\\frac{P(x,y)}{P(x)P(y)}\\right)"
            }
          </BlockMath>
          If we treat the inputs and outputs as random variables{" "}
          <InlineMath>{"X, Y"}</InlineMath>, then <InlineMath>{"P(x,y)"}</InlineMath> 
          is the probability of sending the input message <InlineMath>{"X"}</InlineMath> 
          and getting the output message <InlineMath>{"Y"}</InlineMath>.
          It's a measure of dependence between the input and the output.
          </p>
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <LargeHeatmap height={500} width={500} label={<InlineMath>{'P(x,y)'}</InlineMath>}/>
          </div>
          <p>
          On the other hand, <InlineMath>{"P(x)P(y)"}</InlineMath> is the probability that the output
          message is independent of the input message. From the formula, it
          follows that if the input and output messages are independent, then
          the mutual information is zero, but if they are dependent, then the
          mutual information is greater than zero. This means that a network that does not transmit information well
          would have <InlineMath>{"I(X;Y) \\approx 0"}</InlineMath>
        </p>
        <p>
            If we send every possible input message through the network, we can count the frequency
            of seeing each output message. This allows us to compute the mutual information for a network.
            Here's what that looks like for the three networks introduced above:
        </p>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          flexDirection: "row",
          width: "100%",
        }}
      >
      <button onClick={() => setIsRunning(isRunning => !isRunning)}>{isRunning ? 'Stop' : 'Start'}</button>
      </div>
      <ParentSize
        style={{
          display: "flex",
          justifyContent: "space-around",
          flexDirection: "row",
          flexWrap: "nowrap",
          margin: "auto",
          marginTop: 40
        }}
      >
        {({ width }) => (
          <>
            <Heatmap isRunning={isRunning} sigma={0.5} width={width / 4} height={width / 4} label={"Sub-critical"}/>
            <Heatmap isRunning={isRunning} sigma={1.3} width={width / 4} height={width / 4} label={"Critical"}/>
            <Heatmap isRunning={isRunning} sigma={3} width={width / 4} height={width / 4} label={"Super-critical"}/>
          </>
        )}
      </ParentSize>
      <p>
        So it looks like the network operating at a critical point is optimal for transmitting information, given 
        the random nature of message propagation. Neat!
      </p>
      <h2>So what?</h2>
      <p>
        While these are toy models of how neural networks work, the idea of self-organized criticality is starting to gain 
        traction in research groups. If true, it might help explain certain disorders in biological neural networks. 
        For example, it is known that epilepsy can result from run-away neural excitations. This sounds a lot like a
        network operating in the supercritical regime. If we can treat epilepsy by tuning the brain closer to the critical point,
        what can we hope to achieve with other mental disorders? These and other questions are being investigated by 
        research groups, and while the theory may be incomplete, the understanding generated from the research is certainly 
        valuable.
      </p>
      <hr/>
      <h2>References</h2>
      <ul>
        <li><a href="https://www.quantamagazine.org/a-physical-theory-for-when-the-brain-performs-best-20230131/">Quanta - a physical theory for when the brain performs best</a></li>
        <li><a href="https://www.frontiersin.org/articles/10.3389/fphy.2021.639389/full">FrontiersIn - Self-organized criticality in the brain</a></li>
        <li><a href="https://www.jneurosci.org/content/23/35/11167">JNeurosci - Neuronal avalanches in neocortical circuits</a></li>
        <li><a href="https://www.youtube.com/watch?v=bE9IKMAr-wg&t=3848s">YouTube - Neuronal avalanches and criticality</a></li>
      </ul>
    </div>
  );
}

export default App;
