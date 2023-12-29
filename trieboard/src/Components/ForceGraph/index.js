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

    const [data, setData] = useState(
        {
            "nodes": [{"id": "", "text": "TrieBoard", "group": "", "current": false, "endOfWord": false}],
            "links": []
        }
        );

    const [trie, setTrie] = useState(new Trie());
    const ref = useRef();

    useEffect(() => {
        const nodes = data.nodes;
        const links = data.links;

        const svg = d3.select(ref.current).attr("width", width).attr("height", height);
        const nodeTextGroup = svg.selectAll("g");

        // Keep a copy of the previous zoom state to preserve zoom level
        const prevZoom = d3.zoomTransform(svg.node());

        const enteredNodeTextGroup = nodeTextGroup.data(nodes, d => d.id).enter().append("g")
        

        // add the circle
        const node = enteredNodeTextGroup
        .append("circle")

        node
        .transition()
        .attr("r", node_radius);
        
        // add the text
        const nodeText = enteredNodeTextGroup
        .append("text")
        .text(d => d.id)
        .attr("font-size", text_size)
        .style("text-anchor", "middle");

        // Style the circles  
        svg.selectAll("g").select("circle")
        .style("fill",  d => d.current ? "#FFFF00" : !d.endOfWord ? "#69b3a2" : "#FFA500");
        node.append("title").text(d => d.id);

        let link = svg.selectAll("line")
        .data(links)

        link = link
        .enter()
        .append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .merge(link);

        const simulation = d3.forceSimulation(nodes)  // S3 simulation to apply forces between nodes in the graph 
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide(100))
        .on("tick", ticked); 

        function ticked() {
            // Allow user to move around nodes wherever they want 
            // simulation
            // .force("center", d3.forceCenter().strength(0))

            svg.selectAll("line")
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            svg.selectAll("g").select("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

            svg.selectAll("g").select("text")
            .attr("x", d => d.x)
            .attr("y", d => d.y);
        };

        nodeTextGroup.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

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
            svg.selectAll("g").attr('transform', event.transform);
            link.attr('transform', event.transform);
          });
        
        // Apply the zoom behavior to the SVG
        svg.call(zoomHandler);
        // nodeTextGroup.call(zoomHandler);
        svg.call(zoomHandler.transform, prevZoom);

    }, [data])

    function addCurrentWordToGraph(word) {
        const lastLetter = word.slice(-1);

        let lastNode = data["nodes"].slice(-1)[0];
        lastNode.current = false; // set the previous current node to false, as we are adding a new currrent

        if (!(trie.hasSequence(word))) {
            // If the letters so far dont exist in the trie, create new nodes 
            // Add a node to the data set so it shows up on the Force Graph 

            let lastNode = data["nodes"].slice(-1)[0];
            lastNode.current = false; // set the previous current node to false, as we are adding a new currrent

            const newState = [...data.nodes.slice(0, -1), lastNode, {"id": word, "text": lastLetter, "group": word, "current": true, "endOfWord": false}];
            const copiedState = [...newState];
            setData(
                {
                    "nodes": copiedState, 
                    "links": [...data.links, {"source": word, "target": word.slice(0, -1)}]}
                ); 

        } else {
            // Letters already exist in the node. We still want to highlight though, so mark the node as current

            // todo: VERY SLOW. OPTIMIZE. This is doing a list lookup every time, can be more optimal. 
            let wordNode = data.nodes.filter(n => n.id === word)[0];

            wordNode.current = true;

            setData(
                {
                    "nodes": [...data.nodes.filter(n => (n.id !== word)), wordNode], 
                    "links": data.links
                }
            )
        }
    }

    /**
     * Take the current word and finalize it in the graph if it isnt already finalized, 
     * i.e. input it into the prefixTree and set the last letter as the end of the word 
     * @param {String} word 
     */
    function finalizeWord(word) {
        const nodeCreated = trie.insert(word);

        let lastNode = data["nodes"].slice(-1)[0];
        lastNode.endOfWord = true;
        lastNode.current = false;

        setData(
            {
                "nodes": [...data.nodes.slice(0, -1), lastNode], 
                "links": data.links}
            ); 

        setTrie(new Trie(trie.root)); // update the trie 
    }

    function handleInput(e) {
        const letters = /^[A-Za-z]+$/;

        const lastLetter = e.target.value.slice(-1);

        if (lastLetter.match(letters)) {
            addCurrentWordToGraph(e.target.value);
        } else if (lastLetter === ' ' && e.target.value.slice(0, -1).length !== 0) {
            finalizeWord(e.target.value.slice(0, -1)); // remove last letter, since it is just a space
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