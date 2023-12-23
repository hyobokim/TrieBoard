import React, {Component, useEffect, useRef, useState} from "react";
import TypeInput from "../TypeInput";
import Trie from "../prefixTree";
import * as d3 from "d3";

const ForceGraph = () => {
    var margin = {top: 0, right: 5, bottom: 40, left: 100},
        width = window.innerWidth - margin.left - margin.right,
        height = window.innerHeight -margin.top - margin.bottom,
        node_radius = 40,
        text_size = "1em";


    const prefixTree = new Trie();
    const [data, setData] = useState(
        {
            "nodes": [{"id": "", "text": "TrieBoard", "group": ""}],
            "links": []
        }
        );

    const [trie, setTrie] = useState(new Trie());

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
        
        // add the text
        const nodeText = nodeTextGroup
        .append("text")
        .text(d => d.text)
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
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide(100))
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
        };

        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.1).restart();
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

    function addCurrentWordToGraph(word) {
        const lastLetter = word.slice(-1);
        const nodeCreated = trie.insert(word);
        
        if (nodeCreated) {
            // If a new node was created, means this didn't exist originally in the tree. 
            // Add a node to the data set so it shows up on the Force Graph 
            setData(
                {
                    "nodes": [...data.nodes, {"id": word, "text": lastLetter, "group": word}], 
                    "links": [...data.links, {"source": word, "target": word.slice(0, -1)}]}
                ); 
        }

        setTrie(new Trie(trie.root));
    }

    function handleInput(e) {
        const letters = /^[A-Za-z]+$/;

        const lastLetter = e.target.value.slice(-1);

        if (lastLetter.match(letters)) {
            addCurrentWordToGraph(e.target.value);
        } else {
            return;
        }
    }

    return <div>
        <svg ref={ref}/>
        <TypeInput handler={handleInput}></TypeInput>
    </div>
}

export default ForceGraph