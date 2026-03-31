import React from 'react';
const { useEffect, useRef, useState, useMemo } = React;
import ForceGraph2D from 'react-force-graph-2d';
import { Activity } from 'lucide-react';

export default function NetworkGraphVisualizer({ nodes = [], edges = [], activePath = [], traceSteps = [] }) {
  const fgRef = useRef();
  const [currentStep, setCurrentStep] = useState(-1);

  const graphData = useMemo(() => {
    return {
      nodes: nodes.map(n => ({ id: n.id, name: n.name, type: n.type })),
      links: edges.map(e => ({ source: e.from, target: e.to, weight: e.distanceKm }))
    };
  }, [nodes, edges]);

  useEffect(() => {
    if (traceSteps.length > 0) {
      let step = 0;
      const interval = setInterval(() => {
        if (step < traceSteps.length) {
          setCurrentStep(step);
          step++;
        } else {
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    } else {
      setCurrentStep(-1);
    }
  }, [traceSteps]);

  const getLinkColor = (link) => {
    if (activePath.includes(link.source.id) && activePath.includes(link.target.id)) {
      // Check if they are consecutive in path
      const idx1 = activePath.indexOf(link.source.id);
      const idx2 = activePath.indexOf(link.target.id);
      if (Math.abs(idx1 - idx2) === 1) return '#06b6d4'; // Cyan for active path
    }
    return '#27272a'; // Dim border
  };

  const getNodeColor = (node) => {
    if (currentStep >= 0 && traceSteps[currentStep].nodeId === node.id) {
      return '#f59e0b'; // Amber for currently visiting node in trace
    }
    if (activePath.includes(node.id)) return '#06b6d4'; // Cyan for final path
    return node.type === 'WAREHOUSE' ? '#10b981' : '#6366f1';
  };

  return (
    <div className="relative w-full h-[500px] glass rounded-3xl overflow-hidden">
      <div className="absolute top-4 left-6 z-10 flex items-center gap-2">
        <Activity className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-slate-200">Network Topology Visualizer</h3>
      </div>
      
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={getNodeColor}
        linkColor={getLinkColor}
        linkWidth={link => getLinkColor(link) === '#06b6d4' ? 3 : 1}
        nodeRelSize={6}
        backgroundColor="#0a0a0c"
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        onNodeClick={node => {
          fgRef.current.centerAt(node.x, node.y, 1000);
          fgRef.current.zoom(2, 1000);
        }}
      />

      <div className="absolute bottom-4 right-6 glass p-3 rounded-xl border border-slate-700/50 flex flex-col gap-1 text-[10px] mono">
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Warehouse</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Hub</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-400" /> Optimal Path</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /> Visiting</div>
      </div>
    </div>
  );
}
