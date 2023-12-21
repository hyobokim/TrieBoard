import React, {Component, useEffect, useRef, useState} from "react";
import * as d3 from "d3";

const BarChart = () => {
    var margin = {top: 10, right: 5, bottom: 10, left: 100},
        width = 1400 - margin.left - margin.right,
        height = 900-margin.top - margin.bottom;

    const [counter, setCounter] = useState(4);
    const [data, setData] = useState(
        {
            "nodes": [{"id": 1, "group": 1}, {"id": 2, "group": 1}, {"id": 3, "group": 1}],
            "links": [{"source": 2, "target": 1}, {"source": 3, "target": 1}]
        }
        );

    const ref = useRef();
    

    useEffect(() => {
        const svg = d3.select(ref.current).attr("width", width).attr("height", height);

        const nodes = data.nodes;
        const links = data.links;

        let node = svg.selectAll("circle")
        .data(nodes);
        
        node.exit()
        .remove();

        node = node.enter()
        .append("circle")
        .attr("r", 20)
        .style("fill", "#69b3a2")
        .merge(node);

        node.append("title").text(d => d.id);

        let link = svg.selectAll("line")
        .data(links)
        
        link.exit()
        .remove();

        link = link
        .enter()
        .append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .merge(link);

        node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

        const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide(50))
        .on("tick", ticked);


        function ticked() {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        };

        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.fx = event.subject.x;
            event.fy = event.subject.y;
        };
        // // Update the subject (dragged node) position during drag.
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        };
    
        // // Restore the target alpha so the simulation cools after dragging ends.
        // // Unfix the subject position now that it’s no longer being dragged.
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        };
        
    }, [data]);
    

    return <div>
        <svg ref={ref}/>
        <input type="text" onKeyUp={(e) => {setData({"nodes": [...data.nodes, {"id": e.key, "group": 1}], "links": [...data.links, {"source": e.key, "target": 1}]}); setCounter(counter + 1)}}/>
        </div>
}

export default BarChart