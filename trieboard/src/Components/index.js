import React, {Component, useEffect, useRef, useState} from "react";
import * as d3 from "d3";

const ForceGraph = () => {
    var margin = {top: 0, right: 5, bottom: 40, left: 100},
        width = window.innerWidth - margin.left - margin.right,
        height = window.innerHeight -margin.top - margin.bottom,
        node_radius = 40,
        text_size = "1em";


    const [counter, setCounter] = useState(4);
    const [data, setData] = useState(
        {
            "nodes": [{"id": "TrieBoard", "group": 1}],
            "links": []
        }
        );

    const ref = useRef();
    

    useEffect(() => {
        const svg = d3.select(ref.current).attr("width", width).attr("height", height);

        const nodes = data.nodes;
        const links = data.links;

        svg.selectAll("g").remove()

        let nodeTextGroup = svg.selectAll("g")
        .data(nodes);
        
        nodeTextGroup.exit()
        .remove();

        nodeTextGroup = nodeTextGroup.enter()
        .append("g");

        // nodeTextGroup = enteredNodeTextGroup.merge(nodeTextGroup);

        // add the circle
        const node = nodeTextGroup
        .append("circle")
        .attr("r", node_radius)
        .style("fill", "#69b3a2");
        // .attr("transform", d => 'translate("+[width/2,height/2]+")');
        
        // add the text
        const nodeText = nodeTextGroup
        .append("text")
        .text(d => d.id)
        .attr("font-size", text_size)
        .style("text-anchor", "middle");

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

        nodeTextGroup.call(d3.drag()
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
            // Allow user to move around nodes wherever they want 
            // simulation
            // .force("center", d3.forceCenter().strength(0))

            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        
            // nodeTextGroup
            // .attr("transform", d => 'translate("+[d.x,d.y]+")');

            node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

            nodeText
            .attr("x", d => d.x)
            .attr("y", d => d.y);
                // .attr("cx", d => d.x)
                // .attr("cy", d => d.y);

            // nodeTextGroup.attr('transform', (d) => `translate(${d.x},${d.y})`);
            // link.attr('x1', (d) => d.source.x).attr('y1', (d) => d.source.y).attr('x2', (d) => d.target.x).attr('y2', (d) => d.target.y)
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
        simulation.alpha(0.05).restart();


        const zoomHandler = d3.zoom().on('zoom', (event) => {
            // Apply transformations to the entire graph (nodes, links, etc.)
            nodeTextGroup.attr('transform', event.transform);
            link.attr('transform', event.transform);
          });
        
        // Apply the zoom behavior to the SVG
        svg.call(zoomHandler);
    
        // Initial zoom level (optional)
        svg.call(zoomHandler.transform, d3.zoomIdentity.scale(1));

        
    }, [data]);

    function addNode(e) {
        const letters = /^[A-Za-z]+$/;
        if (e.key.match(letters)) {
            setData(
                {
                    "nodes": [...data.nodes, {"id": e.key, "group": 1}], 
                    "links": [...data.links, {"source": e.key, "target": "TrieBoard"}]}
                ); 
            setCounter(counter + 1);
        } else {
            return;
        }
    }
    

    return <div>
        <svg ref={ref}/>
        <span>
        <input type="text" onKeyUp={(e) => addNode(e)}/>
        </span>
    </div>
}

export default ForceGraph